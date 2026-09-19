import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, Tag, Check, AlertCircle, RefreshCw, Sparkles, Repeat } from 'lucide-react';
import { formatCurrency } from '../utils/financialCalculators';
import { apiCategorize } from '../services/api';

const CATEGORIES = ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"];

export default function TransactionHistory({
  income,
  onIncomeChange,
  expensesList,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Add Expense Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [autoCatSuggestion, setAutoCatSuggestion] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  // Edit State
  const [editingItem, setEditingItem] = useState(null);

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Handle Description Change & Auto Categorization
  const handleDescriptionChange = async (val) => {
    setDescription(val);
    if (val.trim().length >= 3) {
      const res = await apiCategorize(val);
      if (res && res.suggested_category && res.suggested_category !== 'Other') {
        setAutoCatSuggestion(res.suggested_category);
        if (!category || category === 'Other' || category === 'Food') {
          setCategory(res.suggested_category);
        }
        if (res.is_recurring) {
          setIsRecurring(true);
        }
      }
    } else {
      setAutoCatSuggestion(null);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!description.trim()) {
      setValidationError('Please enter an expense description.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Amount must be a positive number greater than 0.');
      return;
    }
    if (!date) {
      setValidationError('Please select a valid date.');
      return;
    }

    onAddExpense({
      description: description.trim(),
      amount: numAmount,
      category,
      date,
      is_recurring: isRecurring
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setAutoCatSuggestion(null);
    setIsRecurring(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    const numAmount = Number(editingItem.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Amount must be positive.');
      return;
    }

    onUpdateExpense(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      onDeleteExpense(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  // Filtered Expenses List
  const filteredExpenses = expensesList.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Income Management Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>💰</span> Monthly Income Setup
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Member 1 Module • User income entry and display
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                value={income}
                onChange={(e) => onIncomeChange(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="40000"
                min="0"
              />
            </div>
            <span className="text-xs font-semibold px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              Total: {formatCurrency(income)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Add New Expense Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Add New Expense
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-category suggestion powered by AI/ML pattern detection
            </p>
          </div>
          {autoCatSuggestion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> AI Category: {autoCatSuggestion}
            </span>
          )}
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Title *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="e.g., Amazon shopping, Uber ride, Netflix"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1500"
              min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="sm:col-span-12 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-indigo-500" /> Mark as Recurring Expense
              </span>
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm hover:shadow-indigo-200"
            >
              Add Expense
            </button>
          </div>

        </form>
      </div>

      {/* 3. Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Transaction History ({filteredExpenses.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, edit, or remove recorded expense transactions
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Recurring</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-600 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {exp.description}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {exp.is_recurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Repeat className="w-3 h-3" /> Recurring
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setEditingItem(exp)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(exp)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Expense Transaction</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editingItem.amount}
                  onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_recurring"
                  checked={editingItem.is_recurring || false}
                  onChange={(e) => setEditingItem({ ...editingItem, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="edit_recurring" className="text-xs text-slate-700 font-medium">
                  Recurring Expense
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteCandidate.description}"</strong> (₹{deleteCandidate.amount})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
