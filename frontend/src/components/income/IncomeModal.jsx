import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

export default function IncomeModal({ isOpen, onClose, onSave, categories = [], initialData = null }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount || '');
      setCategoryId(initialData.categoryId || '');
      setDate(initialData.transactionDate || new Date().toISOString().split('T')[0]);
      setDescription(initialData.description || '');
    } else {
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!categoryId) {
      setError('Please select an income source category.');
      return;
    }

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      userId: 1,
      categoryId: Number(categoryId),
      amount: parseFloat(amount),
      type: 'INCOME',
      transactionDate: date,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Income Record' : 'Add Income Record'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-[#DC2626] text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              AMOUNT ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="2500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              INCOME SOURCE / CATEGORY
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Category</option>
              {categories
                .filter((c) => c.type === 'INCOME')
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              DATE
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              DESCRIPTION / NOTES
            </label>
            <input
              type="text"
              placeholder="Salary, Dividend, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full py-3 bg-[#16A34A] hover:bg-green-700">
              {initialData ? 'Update Income' : 'Save Income Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}