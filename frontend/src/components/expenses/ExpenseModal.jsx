import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  initialData = null,
  type = 'EXPENSE' // <-- 1. Accept 'EXPENSE' or 'INCOME'
}) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');

  const isIncome = type === 'INCOME';

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      setCategoryId(initialData.categoryId || '');
      setTransactionDate(initialData.transactionDate || '');
      setDescription(initialData.description || '');
    } else {
      setAmount('');
      setCategoryId('');
      // Set today's date in YYYY-MM-DD
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Filter categories to only show the matching type (Income vs Expense)
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !categoryId || !transactionDate) {
      alert('Please fill out all required fields.');
      return;
    }

    onSave({
      amount: parseFloat(amount),
      categoryId: Number(categoryId),
      transactionDate,
      description: description.trim(),
      type // ensure the correct type is submitted
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Dynamic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData 
              ? (isIncome ? 'Edit Income' : 'Edit Expense') 
              : (isIncome ? 'Add New Income' : 'Add New Expense')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder={isIncome ? "Salary, Client payment, etc." : "Groceries, Uber, etc."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full py-2.5">
              {initialData 
                ? 'Save Changes' 
                : (isIncome ? 'Add Income' : 'Add Expense')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}