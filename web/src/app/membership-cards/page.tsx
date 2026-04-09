'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/ui/NavBar';
import Button from '@/components/ui/Button';
import Dialog, { DialogContainer } from '@/components/ui/Dialog';
import SwipeAction from '@/components/ui/SwipeAction';
import { showToast } from '@/lib/toast';
import { formatCurrency } from '@/lib/format';
import { apiFetch } from '@/lib/api';
import { IconPlus } from '@/components/ui/icons';
import type { MembershipCard } from '@hezhang/shared';

export default function MembershipCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    try {
      const res = await apiFetch<{ cards: MembershipCard[] }>('/membership-cards');
      setCards(res.cards);
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleAdd = async () => {
    const storeName = await Dialog.prompt({
      title: '添加会员卡',
      placeholder: '商家名称（如：星巴克）',
    });
    if (storeName === null) return;
    const trimmed = storeName.trim();
    if (!trimmed) { showToast('请输入商家名称'); return; }

    const balanceStr = await Dialog.prompt({
      title: '卡内余额',
      placeholder: '输入余额金额',
      defaultValue: '0',
    });
    if (balanceStr === null) return;
    const balance = parseFloat(balanceStr);
    if (isNaN(balance) || balance < 0) { showToast('请输入正确的余额'); return; }

    const note = await Dialog.prompt({
      title: '备注（可选）',
      placeholder: '如：2024年办的年卡',
    });

    try {
      await apiFetch('/membership-cards', {
        method: 'POST',
        body: JSON.stringify({ store_name: trimmed, balance, note: note?.trim() || '' }),
      });
      showToast({ message: '已添加', type: 'success' });
      loadCards();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const handleEdit = async (card: MembershipCard) => {
    const balanceStr = await Dialog.prompt({
      title: `${card.store_name} — 修改余额`,
      placeholder: '输入新余额',
      defaultValue: String(card.balance),
    });
    if (balanceStr === null) return;
    const balance = parseFloat(balanceStr);
    if (isNaN(balance) || balance < 0) { showToast('请输入正确的余额'); return; }

    try {
      await apiFetch(`/membership-cards/${card.id}`, {
        method: 'PUT',
        body: JSON.stringify({ balance }),
      });
      showToast({ message: '已更新', type: 'success' });
      loadCards();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await Dialog.confirm({
      title: '删除会员卡',
      content: '确定删除这张会员卡吗？',
      confirmText: '删除',
      danger: true,
    });
    if (!confirmed) return;
    try {
      await apiFetch(`/membership-cards/${id}`, { method: 'DELETE' });
      showToast({ message: '已删除', type: 'success' });
      loadCards();
    } catch (e: any) {
      showToast({ message: e.message, type: 'error' });
    }
  };

  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <DialogContainer />
      <NavBar title="会员卡管理" onBack={() => router.back()} />

      {/* Summary */}
      <div style={{
        margin: '12px 16px',
        padding: 16,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-dream)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 13, opacity: 0.9 }}>总余额</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
          {formatCurrency(totalBalance)}
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          共 {cards.length} 张卡
        </div>
      </div>

      {/* Card list */}
      {loading ? (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
          <p>还没有会员卡</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>添加会员卡，防止余额被遗忘</p>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {cards.map((card) => (
            <SwipeAction
              key={card.id}
              rightActions={[{
                key: 'delete',
                text: '删除',
                color: 'danger',
                onClick: () => handleDelete(card.id),
              }]}
            >
              <div
                onClick={() => handleEdit(card)}
                className="pressable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 8,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: card.balance > 0 ? 'var(--gradient-fresh)' : 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  💳
                </div>
                <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{card.store_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {card.user_nickname}
                    {card.note && <span style={{ marginLeft: 6 }}>{card.note}</span>}
                  </div>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: card.balance > 0 ? 'var(--success)' : 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  {formatCurrency(card.balance)}
                </div>
              </div>
            </SwipeAction>
          ))}
        </div>
      )}

      {/* Add button */}
      <div style={{ padding: '16px' }}>
        <Button
          block
          onClick={handleAdd}
          icon={<IconPlus size={16} color="#fff" />}
        >
          添加会员卡
        </Button>
      </div>
    </div>
  );
}
