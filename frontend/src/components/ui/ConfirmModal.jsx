import React from 'react';
import Button from './Button';

export default function ConfirmModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl border border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Delete Record</h3>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}