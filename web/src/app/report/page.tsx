'use client';

import { Suspense, useEffect, useState } from 'react';
import NavBar from '@/components/ui/NavBar';
import { showToast } from '@/lib/toast';
import { IconBack, IconChevronRight } from '@/components/ui/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategoryIcon } from '@hezhang/shared';
import { apiFetch } from '@/lib/api';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import CategoryPieChart from '@/components/report/CategoryPieChart';
import DailyTrendChart from '@/components/report/DailyTrendChart';
import CategoryBarChart from '@/components/report/CategoryBarChart';

interface DailyTotal {
  date: string;
  amount: number;
}

interface UserTotal {
  user_id: string;
  nickname: string;
  amount: number;
  count: number;
}

interface ReportData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  dailyAvg: number;
  highestDay: { date: string; amount: number } | null;
  categoryTotals: Record<string, number>;
  dailyTotals: DailyTotal[];
  prevMonthDailyTotals: DailyTotal[];
  userTotals: UserTotal[];
  budget: { total: number; spent: number; rate: number } | null;
}

function getAdjacentMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string): string {
  return month.replace('-', '年') + '月';
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div className="skeleton" style={{ width: 120, height: 20, margin: '0 auto' }} />
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMonth = searchParams?.get('month') || getCurrentMonth();
  const [month, setMonth] = useState(initialMonth);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (m: string) => {
    setLoading(true);
    try {
      const res = await apiFetch<{ report: ReportData }>(`/reports?month=${m}`);
      setReport(res.report);
    } catch (e: any) {
      showToast({ message: e.message || '获取报告失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(month);
  }, [month]);

  const handlePrev = () => setMonth(getAdjacentMonth(month, -1));
  const handleNext = () => setMonth(getAdjacentMonth(month, 1));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar title="消费报告" onBack={() => router.back()} />

      {/* Month selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '12px 16px',
      }}>
        <button
          onClick={handlePrev}
          className="pressable"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}
        >
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>
          {formatMonth(month)}
        </span>
        <button
          onClick={handleNext}
          className="pressable"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}
        >
          <IconChevronRight size={18} />
        </button>
      </div>

      {loading && (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {!loading && report && (
        <div style={{ padding: '0 16px 32px' }}>
          {/* Summary card */}
          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            color: '#fff',
            marginBottom: 16,
            boxShadow: '0 4px 16px rgba(255,107,107,0.2)',
            animation: 'fadeInUp 300ms var(--ease-spring)',
          }}>
            <div style={{ fontSize: 13, opacity: 0.9 }}>本月总支出</div>
            <div style={{ fontSize: 32, fontWeight: 700, margin: '4px 0 12px' }}>
              {formatCurrency(report.totalSpent)}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 11, opacity: 0.8 }}>笔数</span>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{report.expenseCount} 笔</div>
              </div>
              <div>
                <span style={{ fontSize: 11, opacity: 0.8 }}>日均</span>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{formatCurrency(report.dailyAvg)}</div>
              </div>
              {report.highestDay && (
                <div>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>最高日</span>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {report.highestDay.date.split('-')[2]}日 {formatCurrency(report.highestDay.amount)}
                  </div>
                </div>
              )}
              {report.budget && (
                <div>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>预算使用</span>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{report.budget.rate}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Per-person spending */}
          {report.userTotals.length > 0 && (
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>人均分布</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {report.userTotals.map((u) => (
                  <div key={u.user_id} style={{
                    flex: 1,
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.nickname}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--primary)' }}>
                      {formatCurrency(u.amount)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {u.count} 笔 · {report.totalSpent > 0 ? Math.round(u.amount / report.totalSpent * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily trend chart */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>每日趋势</div>
            <DailyTrendChart
              dailyTotals={report.dailyTotals}
              prevMonthDailyTotals={report.prevMonthDailyTotals}
              month={month}
            />
          </div>

          {/* Category pie chart */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>分类占比</div>
            <CategoryPieChart categoryTotals={report.categoryTotals} />
          </div>

          {/* Category bar chart */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: 14,
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>分类排行</div>
            <CategoryBarChart categoryTotals={report.categoryTotals} />
          </div>

          {/* Category detail list */}
          {Object.keys(report.categoryTotals).length > 0 && (
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>分类明细</div>
              {Object.entries(report.categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const pct = report.totalSpent > 0 ? (amount / report.totalSpent * 100).toFixed(1) : '0';
                  return (
                    <div key={cat} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}>
                      <span style={{ fontSize: 14 }}>{getCategoryIcon(cat)} {cat}</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {formatCurrency(amount)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && report && report.expenseCount === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 14 }}>本月暂无消费记录</div>
        </div>
      )}
    </div>
  );
}
