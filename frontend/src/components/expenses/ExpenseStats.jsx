import React from 'react';

export default function ExpenseStats({ totalExpenses = 0, topCategory = 'None', totalRecords = 0 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {/* October Total Expenses Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          October Total Expenses
        </span>
        <div className="mt-2 text-2xl font-bold text-[#DC2626]">
          -${Number(totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Top Expense Category Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Top Expense Category
        </span>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {topCategory}
        </div>
      </div>

      {/* Total Records Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Total Records
        </span>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {totalRecords} Entries
        </div>
      </div>
    </div>
  );
}