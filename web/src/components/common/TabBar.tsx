'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabBar } from 'antd-mobile';
import {
  MessageOutline,
  PieOutline,
  BillOutline,
  SetOutline,
} from 'antd-mobile-icons';

const tabs = [
  { key: '/chat', title: '对话', icon: <MessageOutline /> },
  { key: '/budget', title: '预算', icon: <PieOutline /> },
  { key: '/bills', title: '账单', icon: <BillOutline /> },
  { key: '/settings', title: '设置', icon: <SetOutline /> },
];

export default function AppTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = tabs.find((t) => pathname?.startsWith(t.key))?.key || '/chat';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--card-bg)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        zIndex: 100,
      }}
    >
      <TabBar
        activeKey={activeKey}
        onChange={(key) => router.push(key)}
        style={{ '--adm-color-primary': 'var(--primary)' } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </TabBar>
    </div>
  );
}
