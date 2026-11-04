import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function DashboardCharts({ monthlyData = [], categoryData = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Cash Flow Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Cash Flow (Income vs Expense)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                formatter={(value) => [`$${value}`, '']}
              />
              <Bar dataKey="income" name="Income" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Donut Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Expense Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                formatter={(value) => [`$${value}`, 'Amount']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}