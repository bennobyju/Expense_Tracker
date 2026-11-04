import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import Button from '../components/ui/Button';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Safely extract active user ID from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const userId = storedUser?.id || storedUser?.userId || null;

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    expenseApi
      .getAll(userId)
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load report data:', err);
        setTransactions([]);
      });
  }, [userId]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter based on custom date range and transaction type
  const filteredRecords = safeTransactions.filter((tx) => {
    const txDate = tx.transactionDate || '';
    const matchesStart = !startDate || txDate >= startDate;
    const matchesEnd = !endDate || txDate <= endDate;
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    return matchesStart && matchesEnd && matchesType;
  });

  const totalInflow = filteredRecords
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = filteredRecords
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? ((netSavings / totalInflow) * 100).toFixed(1) : 0;

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No transactions to export for the selected filter.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredRecords.map((t) => [
      t.id,
      t.transactionDate,
      t.type,
      `"${t.categoryName || 'General'}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports & Audit</h1>
          <p className="text-sm text-slate-500 mt-1">Generate customized statements and export financial data</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download size={18} />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Date & Type Filter Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
          <Filter size={16} />
          <span>Report Parameters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Transactions</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Period Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Period Inflow</span>
          <div className="mt-2 text-2xl font-bold text-[#16A34A]">
            +${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Period Outflow</span>
          <div className="mt-2 text-2xl font-bold text-[#DC2626]">
            -${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Surplus</span>
          <div className={`mt-2 text-2xl font-bold ${netSavings >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            ${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Savings Rate</span>
          <div className="mt-2 text-2xl font-bold text-[#2563EB]">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Type</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No records match the selected parameters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-900">{tx.transactionDate}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        tx.type === 'INCOME' ? 'bg-green-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">{tx.categoryName || 'General'}</td>
                  <td className="py-3.5 px-6 text-slate-600">{tx.description || '—'}</td>
                  <td
                    className={`py-3.5 px-6 text-right font-semibold ${
                      tx.type === 'INCOME' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}