import React, { useState } from 'react';
import SmartInput from '../SmartInput';
import EditItemModal from './EditItemModal';

type SettlementItem = {
  id: number;
  date: string;
  descZh: string;
  descVi: string;
  amountRmb: number;
  amountVnd: number;
};

interface DashboardProps {
  items: SettlementItem[];
  onSave: () => void;
  isSaving: boolean;
  onDelete: (id: number) => void;
  onEdit: (id: number, updated: Partial<SettlementItem>) => void;
}

import * as XLSX from 'xlsx';

export default function Dashboard({ items, onSave, isSaving, onDelete, onEdit }: DashboardProps) {
  const [editingItem, setEditingItem] = useState<SettlementItem | null>(null);

  // Tính tổng tự động
  const totalVnd = items.reduce((acc, curr) => acc + curr.amountVnd, 0);

  const handleSaveEdit = (id: number, updated: Partial<SettlementItem>) => {
    onEdit(id, updated);
    setEditingItem(null);
  };

  const handleExportExcel = () => {
    if (items.length === 0) return;

    const header = ['STT', 'Ngày', 'Nội dung (Tiếng Trung)', 'Nội dung (Tiếng Việt)', 'Số lượng', 'Đơn giá RMB', 'Thành tiền VND'];

    const rows = items.map((item, index) => [
      index + 1,
      item.date,
      item.descZh,
      item.descVi,
      1,
      item.amountRmb,
      item.amountVnd
    ]);

    rows.push(['', '', '', '', '', 'TỔNG CỘNG:', totalVnd]);

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Auto-size columns loosely
    const wscols = [
      { wch: 5 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "QuyetToan");

    const today = new Date();
    const dateStr = `${today.getDate()}_${today.getMonth() + 1}`;
    XLSX.writeFile(workbook, `Quyet_Toan_ZRG_${dateStr}.xlsx`);
  };

  return (
    <div className="p-4 flex flex-col h-full relative">
      <div className="flex-1 space-y-4">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Khoản chi gần đây</h2>

        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{item.date}</span>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{item.descVi}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{item.descZh}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <p className="text-sm font-bold text-gray-900">{item.amountVnd.toLocaleString('vi-VN')} ₫</p>
                <p className="text-xs text-gray-400">¥{item.amountRmb.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
              <button
                onClick={() => setEditingItem(item)}
                className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Sửa
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa khoản chi này?')) onDelete(item.id);
                }}
                className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Xóa
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            Chưa có khoản chi nào. Vui lòng bấm Camera hoặc Mic để bắt đầu.
          </div>
        )}
      </div>

      <SmartInput />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 gap-3">
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-500 font-medium">Tổng tiền (VND)</p>
          <p className="text-xl font-bold text-primary">{totalVnd.toLocaleString('vi-VN')} ₫</p>
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <button
            onClick={handleExportExcel}
            disabled={items.length === 0}
            className="flex-1 max-w-[120px] bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200 px-3 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            Xuất Excel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || items.length === 0}
            className="flex-1 max-w-[140px] bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200 px-3 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isSaving ? 'Đang lưu...' : 'Xuất Báo cáo'}
          </button>
        </div>
      </div>

      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
