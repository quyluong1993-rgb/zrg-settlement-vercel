import React, { useState } from 'react';

interface ExchangeRateConfigProps {
  isOpen: boolean;
  onClose: () => void;
  currentRate: number;
  currentEmployee: string;
  onSave: (newRate: number, employeeName: string) => void;
}

export default function ExchangeRateConfig({ isOpen, onClose, currentRate, currentEmployee, onSave }: ExchangeRateConfigProps) {
  const [tempRate, setTempRate] = useState(currentRate.toString());
  const [tempName, setTempName] = useState(currentEmployee);

  if (!isOpen) return null;

  const handleSave = () => {
    const parsed = parseInt(tempRate.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0 && tempName.trim() !== '') {
      onSave(parsed, tempName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 pb-safe">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cấu hình Tỷ giá</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhân viên (Người quyết toán)</label>
          <input 
            type="text" 
            className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-200 focus:border-primary focus:outline-none py-2 transition-colors placeholder:font-normal placeholder:text-gray-300"
            placeholder="Ví dụ: Nguyễn Quý Lương"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tỷ giá hiện tại (VND/RMB)</label>
          <input 
            type="number" 
            className="w-full text-2xl font-bold text-primary border-b-2 border-gray-200 focus:border-primary focus:outline-none py-2 transition-colors"
            value={tempRate}
            onChange={(e) => setTempRate(e.target.value)}
            pattern="[0-9]*"
            inputMode="numeric"
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 btn-primary font-semibold"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
