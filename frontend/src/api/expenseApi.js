
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every API request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle authentication failures centrally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Return to Sign In if authentication is rejected.
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Salary', type: 'INCOME' },
  { id: 2, name: 'Freelance', type: 'INCOME' },
  { id: 3, name: 'Investments', type: 'INCOME' },
  { id: 4, name: 'Food & Dining', type: 'EXPENSE' },
  { id: 5, name: 'Transportation', type: 'EXPENSE' },
  { id: 6, name: 'Utilities', type: 'EXPENSE' },
  { id: 7, name: 'Entertainment', type: 'EXPENSE' },
  { id: 8, name: 'Shopping', type: 'EXPENSE' },
];

const isAuthError = (error) =>
  error.response?.status === 401 ||
  error.response?.status === 403;

const getStoredTransactions = (userId) => {
  if (!userId) return [];

  try {
    const storageKey = `mock_transactions_user_${userId}`;
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredTransactions = (userId, transactions) => {
  if (!userId) return;

  try {
    localStorage.setItem(
      `mock_transactions_user_${userId}`,
      JSON.stringify(transactions)
    );
  } catch (error) {
    console.error('Failed to save fallback transactions:', error);
  }
};

export const expenseApi = {
  getAll: async (userId) => {
    if (!userId) return [];

    try {
      const response = await api.get(`/transactions/user/${userId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (isAuthError(error)) throw error;

      console.warn('Unable to fetch transactions from backend.');
      return getStoredTransactions(userId);
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories');

      return Array.isArray(response.data) && response.data.length > 0
        ? response.data
        : DEFAULT_CATEGORIES;
    } catch (error) {
      if (isAuthError(error)) throw error;

      return DEFAULT_CATEGORIES;
    }
  },

  create: async (transaction) => {
    try {
      const response = await api.post('/transactions', transaction);
      return response.data;
    } catch (error) {
      if (isAuthError(error)) throw error;

      const userId = transaction.userId;
      const all = getStoredTransactions(userId);
      const cat = DEFAULT_CATEGORIES.find(
        (c) => Number(c.id) === Number(transaction.categoryId)
      );

      const newItem = {
        ...transaction,
        id: Date.now(),
        categoryName: cat ? cat.name : 'General',
      };

      saveStoredTransactions(userId, [newItem, ...all]);
      return newItem;
    }
  },

  update: async (id, transaction) => {
    try {
      const response = await api.put(`/transactions/${id}`, transaction);
      return response.data;
    } catch (error) {
      if (isAuthError(error)) throw error;

      const userId = transaction.userId;
      const all = getStoredTransactions(userId);
      const cat = DEFAULT_CATEGORIES.find(
        (c) => Number(c.id) === Number(transaction.categoryId)
      );

      const updatedList = all.map((item) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            ...transaction,
            id: item.id,
            categoryName: cat
              ? cat.name
              : item.categoryName || 'General',
          };
        }

        return item;
      });

      saveStoredTransactions(userId, updatedList);

      return updatedList.find((item) => String(item.id) === String(id));
    }
  },

  delete: async (id, userId) => {
    try {
      await api.delete(`/transactions/${id}`);
      return true;
    } catch (error) {
      if (isAuthError(error)) throw error;

      if (userId) {
        const all = getStoredTransactions(userId);
        const filtered = all.filter(
          (item) => String(item.id) !== String(id)
        );

        saveStoredTransactions(userId, filtered);
      }

      return true;
    }
  },
};
