'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import DatePicker from '@/components/ui/DatePicker';
import { showToast } from '@/lib/toast';
import { useCategories } from '@/hooks/useCategories';
import type { Ownership } from '@hezhang/shared';

export interface ExpenseFormData {
  amount: number;
  category: string;
  note: string;
  expense_date: string;
  ownership: Ownership;
}

interface Props {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  submitText?: string;
  loading?: boolean;
}

export default function ExpenseForm({ initialData, onSubmit, submitText = '记一笔', loading }: Props) {
  const { categories } = useCategories();
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [expenseDate, setExpenseDate] = useState(initialData?.expense_date || new Date().toISOString().split('T')[0]);
  const [ownership, setOwnership] = useState<Ownership>(initialData?.ownership || 'shared');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      showToast('请输入正确的金额');
      return;
    }
    if (!category) {
      showToast('请选择分类');
      return;
    }
    await onSubmit({
      amount: num,
      category,
      note,
      expense_date: expenseDate,
      ownership,
    });
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Amount */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>金额</label>
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
            placeholder="0.00"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

      {/* Category */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>分类</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className="pressable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 4px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: category === cat.name ? 'var(--gradient-primary)' : 'var(--card-bg)',
                color: category === cat.name ? '#fff' : 'var(--text)',
                border: `1.5px solid ${category === cat.name ? 'transparent' : 'var(--border)'}`,
                boxShadow: category === cat.name ? '0 2px 8px rgba(255,107,107,0.2)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, marginTop: 2 }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>日期</label>
        <div
          onClick={() => setDatePickerVisible(true)}
          className="pressable"
          style={{
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg)',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          {expenseDate}
        </div>
        <DatePicker
          visible={datePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onChange={(val) => {
            setExpenseDate(val.toISOString().split('T')[0]);
          }}
          value={new Date(expenseDate + 'T00:00:00')}
          max={new Date()}
        />
      </div>

      {/* Note */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>备注</label>
        <textarea
          placeholder="消费简要说明（可选）"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
          rows={2}
          style={{
            width: '100%',
            fontSize: 15,
            padding: '12px 14px',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg)',
            outline: 'none',
            resize: 'none',
            lineHeight: 'var(--line-height)',
            color: 'var(--text)',
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {/* Ownership */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--card-bg)',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {ownership === 'shared' ? '共同支出' : '个人支出'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {ownership === 'shared' ? '从共同预算扣减' : '不计入共同预算'}
          </div>
        </div>
        <Switch
          checked={ownership === 'shared'}
          onChange={(v) => setOwnership(v ? 'shared' : 'personal')}
        />
      </div>

      {/* Submit */}
      <Button block size="lg" loading={loading} onClick={handleSubmit}>
        {submitText}
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
