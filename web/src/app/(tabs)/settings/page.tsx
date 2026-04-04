'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { ListGroup, ListItem } from '@/components/ui/ListGroup';
import SwipeAction from '@/components/ui/SwipeAction';
import { showToast } from '@/lib/toast';
import { useAuthStore } from '@/stores/authStore';
import { useCategories } from '@/hooks/useCategories';
import { apiFetch } from '@/lib/api';
import PWAInstallBanner from '@/components/common/PWAInstallBanner';
import { IconLogout, IconPlus } from '@/components/ui/icons';
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
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(space.invite_code);
      }
      showToast({ message: '邀请码已复制', type: 'success' });
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

  const handleEditNickname = async () => {
    const val = await Dialog.prompt({
      title: '修改昵称',
      placeholder: '请输入昵称',
      defaultValue: user?.nickname || '',
    });
    if (val === null) return;
    const trimmed = val.trim();
    if (!trimmed) {
      showToast('昵称不能为空');
      return;
    }
    try {
      const res = await apiFetch<{ user: User }>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ nickname: trimmed }),
      });
      updateUser({ nickname: res.user.nickname });
      showToast({ message: '昵称已更新', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || '更新失败', type: 'error' });
    }
  };

  const isOwner = members.find((m) => m.user_id === user?.id)?.role === 'owner';

  const handleEditSpaceName = async () => {
    if (!isOwner) {
      showToast('只有创建者可以修改空间名称');
      return;
    }
    const val = await Dialog.prompt({
      title: '修改空间名称',
      placeholder: '请输入空间名称',
      defaultValue: space?.name || '',
    });
    if (val === null) return;
    const trimmed = val.trim();
    if (!trimmed) {
      showToast('空间名称不能为空');
      return;
    }
    try {
      const res = await apiFetch<{ space: Space }>('/spaces/current', {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed }),
      });
      setSpace(res.space);
      showToast({ message: '空间名称已更新', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || '更新失败', type: 'error' });
    }
  };

  const handleAddCategory = async () => {
    const name = await Dialog.prompt({
      title: '添加自定义分类',
      placeholder: '请输入分类名称（最多8字）',
    });
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('请输入分类名称');
      return;
    }
    const icon = await Dialog.prompt({
      title: '选择图标',
      placeholder: '输入一个emoji图标',
      defaultValue: '📦',
    });
    const finalIcon = icon?.trim() || '📦';
    try {
      await apiFetch<{ category: CustomCategory }>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, icon: finalIcon }),
      });
      refetchCategories();
      showToast({ message: '分类已添加', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || '添加失败', type: 'error' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      refetchCategories();
      showToast({ message: '已删除', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || '删除失败', type: 'error' });
    }
  };

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      danger: true,
    });
    if (confirmed) {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ paddingTop: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, padding: '44px 16px 16px' }}>设置</h2>

      <PWAInstallBanner />

      {/* Profile */}
      <ListGroup header="个人信息">
        <ListItem extra={user?.nickname || '未设置'} onClick={handleEditNickname}>
          昵称
        </ListItem>
        <ListItem extra={user?.phone} arrow={false}>
          手机号
        </ListItem>
      </ListGroup>

      {/* Space */}
      <ListGroup header="共同空间">
        <ListItem extra={space?.name} onClick={handleEditSpaceName} clickable={isOwner}>
          空间名称
        </ListItem>
        <ListItem
          extra={space?.invite_code}
          onClick={shareInviteCode}
          description="点击分享给伴侣"
        >
          邀请码
        </ListItem>
      </ListGroup>

      {/* Members */}
      <ListGroup header="成员">
        {members.map((m) => (
          <ListItem
            key={m.user_id}
            extra={m.role === 'owner' ? '创建者' : '成员'}
            description={m.user_id === user?.id ? '我' : '伴侣'}
            arrow={false}
          >
            {m.nickname}
          </ListItem>
        ))}
        {members.length < 2 && (
          <ListItem
            onClick={shareInviteCode}
            style={{ color: 'var(--text-secondary)' }}
          >
            伴侣还未加入，点击分享邀请码
          </ListItem>
        )}
      </ListGroup>

      {/* Custom Categories */}
      <ListGroup header="自定义分类">
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
            <ListItem extra={c.icon} arrow={false}>
              {c.name}
            </ListItem>
          </SwipeAction>
        ))}
        <ListItem
          onClick={handleAddCategory}
          style={{ color: 'var(--primary)' }}
          arrow={false}
          prefix={<IconPlus size={16} color="var(--primary)" />}
        >
          添加分类
        </ListItem>
      </ListGroup>

      {/* Actions */}
      <div style={{ padding: '24px 16px' }}>
        <Button
          block
          variant="danger"
          onClick={handleLogout}
          icon={<IconLogout size={16} />}
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
