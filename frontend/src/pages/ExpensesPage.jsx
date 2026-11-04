import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { expenseApi } from '../api/expenseApi';
import ExpenseFilter from '../components/expenses/ExpenseFilter';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/ui/Button';

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Safely extract active user ID from localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const userId = storedUser?.id || storedUser?.userId || null;

  const loadData = async () => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    try {
      const [txData, catData] = await Promise.all([
        expenseApi.getAll(userId),
        expenseApi.getCategories(),
      ]);

      const safeTxList = Array.isArray(txData) ? txData : [];
      setTransactions(safeTxList.filter((t) => t.type === 'EXPENSE'));
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveExpense = async (data) => {
    if (!userId) {
      alert('Active user session expired. Please sign in again.');
      return;
    }

    try {
      if (editingTransaction && editingTransaction.id) {
        await expenseApi.update(editingTransaction.id, { ...data, userId, type: 'EXPENSE' });

        const matchedCat = categories.find((c) => Number(c.id) === Number(data.categoryId));
        const updatedRow = {
          ...editingTransaction,
          ...data,
          userId,
          type: 'EXPENSE',
          categoryName: matchedCat ? matchedCat.name : editingTransaction.categoryName || 'General',
        };

        setTransactions((prev) =>
          prev.map((t) => (String(t.id) === String(editingTransaction.id) ? updatedRow : t))
        );
      } else {
        const created = await expenseApi.create({ ...data, userId, type: 'EXPENSE' });
        const matchedCat = categories.find((c) => Number(c.id) === Number(data.categoryId));
        const newRow = {
          ...created,
          userId,
          type: 'EXPENSE',
          categoryName: matchedCat ? matchedCat.name : 'General',
        };
        setTransactions((prev) => [newRow, ...prev]);
      }
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setIsModalOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteTargetId) return;
    try {
      await expenseApi.delete(deleteTargetId, userId);
      setDeleteTargetId(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Month + Category + Search Filtering
  const filtered = safeTransactions.filter((t) => {
    const matchesSearch =
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.categoryName || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || t.categoryName === selectedCategory;

    // Parses month 'MM' from format 'YYYY-MM-DD'
    const txMonth = t.transactionDate ? t.transactionDate.split('-')[1] : '';
    const matchesMonth = selectedMonth === 'ALL' || txMonth === selectedMonth;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage your daily expenditure</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>+ New Expense</span>
        </Button>
      </div>

      <ExpenseFilter
        search={search}
        onSearchChange={setSearch}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={(Array.isArray(categories) ? categories : []).filter((c) => c.type === 'EXPENSE')}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <ExpenseTable
        transactions={filtered}
        onEditClick={handleOpenEditModal}
        onDeleteClick={(id) => setDeleteTargetId(id)}
      />

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        categories={categories}
        initialData={editingTransaction}
        type="EXPENSE"
      />

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}