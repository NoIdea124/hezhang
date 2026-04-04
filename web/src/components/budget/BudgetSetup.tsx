'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { showToast } from '@/lib/toast';
import { useCategories } from '@/hooks/useCategories';
import { getCurrentMonth } from '@/lib/format';
import type { BudgetCreate, BudgetCategory, Budget } from '@hezhang/shared';

interface Props {
  initialData?: Budget;
  onSubmit: (data: BudgetCreate) => Promise<void>;
  loading?: boolean;
  onClose?: () => void;
}

export default function BudgetSetup({ initialData, onSubmit, loading, onClose }: Props) {
  const { categories } = useCategories();
  const [totalAmount, setTotalAmount] = useState(initialData?.total_amount?.toString() || '');
  const [month] = useState(initialData?.month || getCurrentMonth());
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (initialData?.categories) {
      return new Set(initialData.categories.map((c) => c.name));
    }
    return new Set<string>();
  });
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    if (initialData?.categories) {
      const m: Record<string, string> = {};
      initialData.categories.forEach((c) => { m[c.name] = c.amount.toString(); });
      return m;
    }
    return {};
  });

  const toggleCategory = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
      const nextAmounts = { ...amounts };
      delete nextAmounts[name];
      setAmounts(nextAmounts);
    } else {
      next.add(name);
    }
    setSelected(next);
  };

  const splitEvenly = () => {
    const total = parseFloat(totalAmount);
    if (!total || selected.size === 0) return;
    const each = Math.floor((total / selected.size) * 100) / 100;
    const nextAmounts: Record<string, string> = {};
    selected.forEach((name) => { nextAmounts[name] = each.toString(); });
    setAmounts(nextAmounts);
  };

  const handleSubmit = async () => {
    const total = parseFloat(totalAmount);
    if (!total || total <= 0) {
      showToast('请输入正确的预算金额');
      return;
    }
    if (selected.size === 0) {
      showToast('请至少选择一个分类');
      return;
    }

    const cats: BudgetCategory[] = [];
    for (const name of selected) {
      const amt = parseFloat(amounts[name] || '0');
      cats.push({
        name,
        amount: amt,
        percentage: total > 0 ? Math.round((amt / total) * 1000) / 10 : 0,
      });
    }

    const allocated = cats.reduce((s, c) => s + c.amount, 0);
    if (Math.abs(allocated - total) > 1) {
      showToast(`已分配 ¥${allocated.toFixed(0)}，与总预算 ¥${total.toFixed(0)} 不一致`);
      return;
    }

    await onSubmit({ month, total_amount: total, categories: cats });
  };

  const allocated = Array.from(selected).reduce((s, name) => s + (parseFloat(amounts[name] || '0') || 0), 0);

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          {initialData ? '编辑预算' : '设置预算'}
        </h3>
        {onClose && (
          <span onClick={onClose} style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            关闭
          </span>
        )}
      </div>

      {/* Month */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>月份</label>
        <div style={{
          padding: '12px',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: 15,
          color: 'var(--text-secondary)',
        }}>
          {month.replace('-', '年')}月
        </div>
      </div>

      {/* Total Amount */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>总预算</label>
          {selected.size > 0 && allocated > 0 && (
            <span
              onClick={() => setTotalAmount(allocated.toString())}
              className="pressable"
              style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
            >
              由分项加和
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--card-bg)',
          padding: '8px 14px',
        }}>
          <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--primary)', marginRight: 4 }}>¥</span>
          <input
            placeholder="0"
            type="number"
            inputMode="decimal"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--text)',
              WebkitAppearance: 'none',
            }}
          />
        </div>
      </div>

      {/* Category Selection */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>选择分类</label>
          <span
            onClick={splitEvenly}
            className="pressable"
            style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
          >
            均分
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {categories.filter((c) => c.name).map((cat) => (
            <div
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              className="pressable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: selected.has(cat.name) ? 'var(--gradient-primary)' : 'var(--card-bg)',
                color: selected.has(cat.name) ? '#fff' : 'var(--text)',
                border: `1.5px solid ${selected.has(cat.name) ? 'transparent' : 'var(--border)'}`,
                boxShadow: selected.has(cat.name) ? '0 2px 8px rgba(255,107,107,0.2)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{ fontSize: 10, marginTop: 2 }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Amounts */}
      {selected.size > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>分类预算</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.filter((c) => selected.has(c.name)).map((cat) => {
              const amt = parseFloat(amounts[cat.name] || '0') || 0;
              const total = parseFloat(totalAmount) || 0;
              const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
              return (
                <div key={cat.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--card-bg)',
                }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, width: 48 }}>{cat.name}</span>
                  <div style={{ flex: 1 }}>
                    <input
                      placeholder="0"
                      type="number"
                      inputMode="decimal"
                      value={amounts[cat.name] || ''}
                      onChange={(e) => setAmounts({ ...amounts, [cat.name]: e.target.value })}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        color: 'var(--text)',
                        WebkitAppearance: 'none',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 36, textAlign: 'right' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Allocation Summary */}
      {selected.size > 0 && (
        <div style={{
          fontSize: 13,
          color: Math.abs(allocated - (parseFloat(totalAmount) || 0)) > 1 ? 'var(--warning)' : 'var(--text-secondary)',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          已分配 ¥{allocated.toFixed(0)} / ¥{parseFloat(totalAmount || '0').toFixed(0)}
        </div>
      )}

      {/* Submit */}
      <Button
        block
        size="lg"
        loading={loading}
        onClick={handleSubmit}
      >
        {initialData ? '更新预算' : '设置预算'}
      </Button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-sm)' as any,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  display: 'block',
  fontWeight: 500,
};
