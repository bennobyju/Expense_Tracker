import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function ExpenseTable({ transactions = [], onEditClick, onDeleteClick }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
        No records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Date</th>
            <th className="py-3.5 px-6">Category</th>
            <th className="py-3.5 px-6">Description</th>
            <th className="py-3.5 px-6 text-right">Amount</th>
            <th className="py-3.5 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3.5 px-6 font-medium text-slate-900">{tx.transactionDate}</td>
              <td className="py-3.5 px-6">{tx.categoryName || 'General'}</td>
              <td className="py-3.5 px-6 text-slate-600">{tx.description || '—'}</td>
              <td
                className={`py-3.5 px-6 text-right font-semibold ${
                  tx.type === 'INCOME' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
              </td>
              <td className="py-3.5 px-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEditClick && onEditClick(tx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDeleteClick && onDeleteClick(tx.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}