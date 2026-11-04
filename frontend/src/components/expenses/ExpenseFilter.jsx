import React from 'react';
import { Search } from 'lucide-react';

const MONTH_OPTIONS = [
  { value: 'ALL', label: 'All Months' },
  { value: '01', label: 'January 2026' },
  { value: '02', label: 'February 2026' },
  { value: '03', label: 'March 2026' },
  { value: '04', label: 'April 2026' },
  { value: '05', label: 'May 2026' },
  { value: '06', label: 'June 2026' },
  { value: '07', label: 'July 2026' },
  { value: '08', label: 'August 2026' },
  { value: '09', label: 'September 2026' },
  { value: '10', label: 'October 2026' },
  { value: '11', label: 'November 2026' },
  { value: '12', label: 'December 2026' },
];

export default function ExpenseFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  selectedMonth = 'ALL',
  onMonthChange = () => {},
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <input
          type="text"
          placeholder="Search notes or vendor..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
      </div>

      <div className="flex w-full md:w-auto items-center gap-3">
        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full md:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Month Dropdown */}
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-full md:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}