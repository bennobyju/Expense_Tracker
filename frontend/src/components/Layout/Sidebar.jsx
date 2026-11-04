import React from 'react';
import { LayoutDashboard, ReceiptText, ArrowDownToLine, ChartNoAxesCombined, LogOut, Wallet } from 'lucide-react';

export default function Sidebar({ activeTab, onTabSelect, onLogout }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', name: 'Expenses', icon: ReceiptText },
    { id: 'income', name: 'Income', icon: ArrowDownToLine },
    { id: 'reports', name: 'Reports', icon: ChartNoAxesCombined },
  ];
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { user = {}; }
  const displayName = user.name || user.fullName || 'Your account';
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';

  return (
    <aside className="app-sidebar">
      <div>
        <div className="brand-lockup">
          <div className="brand-mark"><Wallet size={20} strokeWidth={2.3} /></div>
          <div className="brand-copy">
            <div className="brand-name">Expense360</div>
            <div className="brand-caption">Money, in focus</div>
          </div>
        </div>
        <div className="nav-caption">Workspace</div>
        <nav className="app-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} type="button" onClick={() => onTabSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`app-nav-item${isActive ? ' active' : ''}`} title={item.name}>
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                <span className="app-nav-label">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="sidebar-user-copy">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-sub">Personal account</div>
          </div>
          {onLogout && <button type="button" onClick={onLogout} title="Sign out" aria-label="Sign out" className="logout-button"><LogOut size={15} /></button>}
        </div>
      </div>
    </aside>
  );
}
