'use client';

import { usePathname, useRouter } from 'next/navigation';
import TabBar from '@/components/ui/TabBar';
import type { TabItem } from '@/components/ui/TabBar';
import { IconChat, IconBudget, IconBills, IconSettings } from '@/components/ui/icons';

const tabs: TabItem[] = [
  {
    key: '/chat',
    label: '对话',
    icon: (active) => <IconChat size={22} color={active ? 'var(--primary)' : 'var(--text-tertiary)'} />,
  },
  {
    key: '/budget',
    label: '预算',
    icon: (active) => <IconBudget size={22} color={active ? 'var(--primary)' : 'var(--text-tertiary)'} />,
  },
  {
    key: '/bills',
    label: '账单',
    icon: (active) => <IconBills size={22} color={active ? 'var(--primary)' : 'var(--text-tertiary)'} />,
  },
  {
    key: '/settings',
    label: '设置',
    icon: (active) => <IconSettings size={22} color={active ? 'var(--primary)' : 'var(--text-tertiary)'} />,
  },
];

export default function AppTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = tabs.find((t) => pathname?.startsWith(t.key))?.key || '/chat';

  return (
    <TabBar
      items={tabs}
      activeKey={activeKey}
      onChange={(key) => router.push(key)}
    />
  );
}
