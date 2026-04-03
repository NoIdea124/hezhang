'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, List, Toast, Dialog, Input, SwipeAction } from 'antd-mobile';
import { useAuthStore } from '@/stores/authStore';
import { useCategories } from '@/hooks/useCategories';
import { apiFetch } from '@/lib/api';
import PWAInstallBanner from '@/components/common/PWAInstallBanner';
import type { Space, SpaceMember, User, CustomCategory } from '@hezhang/shared';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const space = useAuthStore((s) => s.space);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setSpace = useAuthStore((s) => s.setSpace);
  const { custom, refetch: refetchCategories } = useCategories();
  const [members, setMembers] = useState<SpaceMember[]>([]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await apiFetch<{ space: Space; members: SpaceMember[] }>(
        '/spaces/current'
      );
      setMembers(res.members);
    } catch (e) {
      // ignore
    }
  };

  const copyInviteCode = () => {
    if (space) {
      navigator.clipboard.writeText(space.invite_code);
      Toast.show({ content: '邀请码已复制' });
    }
  };

  const shareInviteCode = async () => {
    if (!space) return;
    const text = `来和我一起用「合账」记账吧！邀请码：${space.invite_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        copyInviteCode();
      }
    } else {
      copyInviteCode();
    }
  };

  const nicknameRef = useRef(user?.nickname || '');
  const spaceNameRef = useRef(space?.name || '');

  const handleEditNickname = () => {
    nicknameRef.current = user?.nickname || '';
    Dialog.confirm({
      title: '修改昵称',
      content: (
        <Input
          placeholder="请输入昵称"
          defaultValue={user?.nickname || ''}
          maxLength={20}
          onChange={(val) => { nicknameRef.current = val; }}
          style={{ '--font-size': '16px' }}
        />
      ),
      onConfirm: async () => {
        const val = nicknameRef.current.trim();
        if (!val) {
          Toast.show({ content: '昵称不能为空' });
          return;
        }
        try {
          const res = await apiFetch<{ user: User }>('/auth/me', {
            method: 'PUT',
            body: JSON.stringify({ nickname: val }),
          });
          updateUser({ nickname: res.user.nickname });
          Toast.show({ content: '昵称已更新' });
        } catch (e: any) {
          Toast.show({ content: e.message || '更新失败' });
        }
      },
    });
  };

  const isOwner = members.find((m) => m.user_id === user?.id)?.role === 'owner';

  const handleEditSpaceName = () => {
    if (!isOwner) {
      Toast.show({ content: '只有创建者可以修改空间名称' });
      return;
    }
    spaceNameRef.current = space?.name || '';
    Dialog.confirm({
      title: '修改空间名称',
      content: (
        <Input
          placeholder="请输入空间名称"
          defaultValue={space?.name || ''}
          maxLength={20}
          onChange={(val) => { spaceNameRef.current = val; }}
          style={{ '--font-size': '16px' }}
        />
      ),
      onConfirm: async () => {
        const val = spaceNameRef.current.trim();
        if (!val) {
          Toast.show({ content: '空间名称不能为空' });
          return;
        }
        try {
          const res = await apiFetch<{ space: Space }>('/spaces/current', {
            method: 'PUT',
            body: JSON.stringify({ name: val }),
          });
          setSpace(res.space);
          Toast.show({ content: '空间名称已更新' });
        } catch (e: any) {
          Toast.show({ content: e.message || '更新失败' });
        }
      },
    });
  };

  const catNameRef = useRef('');
  const catIconRef = useRef('');

  const handleAddCategory = () => {
    catNameRef.current = '';
    catIconRef.current = '';
    Dialog.confirm({
      title: '添加自定义分类',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder="分类名称（最多8字）"
            maxLength={8}
            onChange={(val) => { catNameRef.current = val; }}
            style={{ '--font-size': '16px' }}
          />
          <Input
            placeholder="输入一个emoji图标，如 🎵"
            maxLength={4}
            onChange={(val) => { catIconRef.current = val; }}
            style={{ '--font-size': '16px' }}
          />
        </div>
      ),
      onConfirm: async () => {
        const name = catNameRef.current.trim();
        if (!name) {
          Toast.show({ content: '请输入分类名称' });
          return;
        }
        try {
          await apiFetch<{ category: CustomCategory }>('/categories', {
            method: 'POST',
            body: JSON.stringify({ name, icon: catIconRef.current.trim() || '📦' }),
          });
          refetchCategories();
          Toast.show({ content: '分类已添加' });
        } catch (e: any) {
          Toast.show({ content: e.message || '添加失败' });
        }
      },
    });
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      refetchCategories();
      Toast.show({ content: '已删除' });
    } catch (e: any) {
      Toast.show({ content: e.message || '删除失败' });
    }
  };

  const handleLogout = () => {
    Dialog.confirm({
      content: '确定要退出登录吗？',
      onConfirm: () => {
        logout();
        window.location.href = '/login';
      },
    });
  };

  return (
    <div style={{ paddingTop: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, padding: '44px 16px 16px' }}>设置</h2>

      <PWAInstallBanner />

      {/* Profile */}
      <List header="个人信息" style={{ '--border-top': 'none' } as React.CSSProperties}>
        <List.Item extra={user?.nickname || '未设置'} onClick={handleEditNickname}>
          昵称
        </List.Item>
        <List.Item extra={user?.phone}>
          手机号
        </List.Item>
      </List>

      {/* Space */}
      <List header="共同空间" style={{ marginTop: 12 }}>
        <List.Item extra={space?.name} onClick={handleEditSpaceName} clickable={isOwner}>
          空间名称
        </List.Item>
        <List.Item
          extra={space?.invite_code}
          onClick={shareInviteCode}
          description="点击分享给伴侣"
        >
          邀请码
        </List.Item>
      </List>

      {/* Members */}
      <List header="成员" style={{ marginTop: 12 }}>
        {members.map((m) => (
          <List.Item
            key={m.user_id}
            extra={m.role === 'owner' ? '创建者' : '成员'}
            description={m.user_id === user?.id ? '我' : '伴侣'}
          >
            {m.nickname}
          </List.Item>
        ))}
        {members.length < 2 && (
          <List.Item
            onClick={shareInviteCode}
            style={{ color: 'var(--text-secondary)' }}
          >
            伴侣还未加入，点击分享邀请码
          </List.Item>
        )}
      </List>

      {/* Custom Categories */}
      <List header="自定义分类" style={{ marginTop: 12 }}>
        {custom.map((c) => (
          <SwipeAction
            key={c.id}
            rightActions={[{
              key: 'delete',
              text: '删除',
              color: 'danger',
              onClick: () => handleDeleteCategory(c.id),
            }]}
          >
            <List.Item extra={c.icon}>
              {c.name}
            </List.Item>
          </SwipeAction>
        ))}
        <List.Item
          onClick={handleAddCategory}
          style={{ color: 'var(--primary)' }}
        >
          + 添加分类
        </List.Item>
      </List>

      {/* Actions */}
      <div style={{ padding: 16, marginTop: 24 }}>
        <Button
          block
          color="danger"
          fill="outline"
          onClick={handleLogout}
          style={{ borderRadius: 8 }}
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
