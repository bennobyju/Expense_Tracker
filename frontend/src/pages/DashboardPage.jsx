import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Sparkles } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import DashboardCharts from '../components/dashboard/DashboardCharts';

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      console.error('Failed to parse user session', e);
    }
    setUserName(storedUser?.name?.trim()?.split(/\s+/)[0] || storedUser?.fullName?.trim()?.split(/\s+/)[0] || 'there');
    const activeUserId = storedUser?.id || storedUser?.userId;
    if (activeUserId) {
      expenseApi.getAll(activeUserId)
        .then((data) => setTransactions(Array.isArray(data) ? data : []))
        .catch((error) => console.error('Could not load dashboard transactions', error));
    } else {
      setTransactions([]);
    }
  }, []);

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;
  const expenseCount = transactions.filter((t) => t.type === 'EXPENSE').length;
  const categoryMap = {};
  transactions.filter((t) => t.type === 'EXPENSE').forEach((t) => {
    const category = t.categoryName || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + Number(t.amount || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const monthlyData = [{ name: new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date()), income: totalIncome, expense: totalExpense }];
  const recentTransactions = [...transactions].sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || '')).slice(0, 4);

  return (
    <div>
      <div className="page-heading">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-2"><Sparkles size={14} /> YOUR MONEY AT A GLANCE</div>
          <h1>Good to see you, {userName}.</h1>
          <p>Here’s how your finances are looking. Small steps today make a big difference over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-7">
        <div className="metric-card" style={{ '--metric-tint': '#e9edff' }}>
          <div className="flex items-center justify-between gap-3"><div className="metric-label">Net balance</div><div className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><Wallet size={19} /></div></div>
          <div className="metric-value" style={{ color: netBalance >= 0 ? '#26345b' : '#d95460' }}>{money(netBalance)}</div>
          <div className="metric-footnote">Income minus expenses</div>
        </div>
        <div className="metric-card" style={{ '--metric-tint': '#e1f7ee' }}>
          <div className="flex items-center justify-between gap-3"><div className="metric-label">Total income</div><div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft size={19} /></div></div>
          <div className="metric-value" style={{ color: '#159a72' }}>{money(totalIncome)}</div>
          <div className="metric-footnote">Money coming in</div>
        </div>
        <div className="metric-card" style={{ '--metric-tint': '#ffeaec' }}>
          <div className="flex items-center justify-between gap-3"><div className="metric-label">Total expenses</div><div className="grid place-items-center w-10 h-10 rounded-xl bg-rose-50 text-rose-500"><ArrowUpRight size={19} /></div></div>
          <div className="metric-value" style={{ color: '#df5d68' }}>{money(totalExpense)}</div>
          <div className="metric-footnote">Across {expenseCount} expense {expenseCount === 1 ? 'record' : 'records'}</div>
        </div>
      </div>

      <div className="mb-7"><DashboardCharts monthlyData={monthlyData} categoryData={categoryData} /></div>

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-5 border-b border-slate-100">
          <div><h2 className="panel-heading">Recent activity</h2><p className="panel-subtitle">Your latest recorded transactions</p></div>
          <span className="text-xs font-semibold text-slate-400">{transactions.length} total</span>
        </div>
        {recentTransactions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr><th className="px-5 sm:px-6 py-3">Transaction</th><th className="px-5 py-3">Date</th><th className="px-5 sm:px-6 py-3 text-right">Amount</th></tr></thead>
              <tbody>{recentTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return <tr key={tx.id} className="hover:bg-slate-50/70">
                  <td className="px-5 sm:px-6 py-4"><div className="flex items-center gap-3"><span className={`grid place-items-center w-9 h-9 rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{isIncome ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div><div className="font-semibold text-slate-700">{tx.description || tx.categoryName || 'Transaction'}</div><div className="text-xs text-slate-400 mt-0.5">{tx.categoryName || (isIncome ? 'Income' : 'Expense')}</div></div></div></td>
                  <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{tx.transactionDate || '—'}</td>
                  <td className={`px-5 sm:px-6 py-4 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-500'}`}>{isIncome ? '+' : '−'}{money(Number(tx.amount || 0))}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center"><div className="mx-auto mb-3 grid place-items-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500"><Wallet size={21} /></div><div className="text-sm font-semibold text-slate-700">Your activity will show up here</div><p className="text-xs text-slate-400 mt-1">Add an income or expense to start building your overview.</p></div>
        )}
      </section>
    </div>
  );
}
