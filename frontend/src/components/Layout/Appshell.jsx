import React from 'react';
import { CalendarDays } from 'lucide-react';
import Sidebar from './Sidebar';

const pageTitles = {
  dashboard: 'Dashboard overview',
  expenses: 'Expense management',
  income: 'Income management',
  reports: 'Reports & insights',
};

export default function AppShell({ activeTab, onTabSelect, onLogout, children }) {
  const today = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabSelect={onTabSelect} onLogout={onLogout} />
      <main className="app-main">
        <header className="app-topbar">
          <div>
            <div className="topbar-eyebrow">PERSONAL FINANCE</div>
            <div className="topbar-title">{pageTitles[activeTab] || 'Expense360'}</div>
          </div>
          <div className="topbar-date"><CalendarDays size={15} /> {today}</div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
