import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { Loader2 } from 'lucide-react';

type SettlementItem = {
  id: number;
  date: string;
  descZh: string;
  descVi: string;
  amountRmb: number;
  amountVnd: number;
};

interface EditItemModalProps {
  isOpen: boolean;
  item: SettlementItem | null;
  onClose: () => void;
  onSave: (id: number, updated: Partial<SettlementItem>) => void;
}

export default function EditItemModal({ isOpen, item, onClose, onSave }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    descVi: '',
    descZh: '',
    amountVnd: 0
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [changedField, setChangedField] = useState<'vi' | 'zh' | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        date: item.date,
        descVi: item.descVi,
        descZh: item.descZh,
        amountVnd: item.amountVnd
      });
      setChangedField(null);
    }
  }, [item]);

  const handleBlurVi = async () => {
    if (changedField === 'vi' && formData.descVi) {
      setIsTranslating(true);
      try {
        const translated = await geminiService.translateText(formData.descVi, 'zh');
        if (translated) {
          setFormData(prev => ({ ...prev, descZh: translated }));
        }
      } finally {
        setIsTranslating(false);
        setChangedField(null);
      }
    }
  };

  const handleBlurZh = async () => {
    if (changedField === 'zh' && formData.descZh) {
      setIsTranslating(true);
      try {
        const translated = await geminiService.translateText(formData.descZh, 'vi');
        if (translated) {
          setFormData(prev => ({ ...prev, descVi: translated }));
        }
      } finally {
        setIsTranslating(false);
        setChangedField(null);
      }
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa khoản chi</h3>
          {isTranslating && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ngày tháng (DD/MM)</label>
            <input 
              type="text" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nội dung (Tiếng Việt)</label>
            <input 
              type="text" 
              value={formData.descVi}
              onChange={e => {
                setFormData({...formData, descVi: e.target.value});
                setChangedField('vi');
              }}
              onBlur={handleBlurVi}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Nhập tiếng Việt..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nội dung (Tiếng Trung)</label>
            <input 
              type="text" 
              value={formData.descZh}
              onChange={e => {
                setFormData({...formData, descZh: e.target.value});
                setChangedField('zh');
              }}
              onBlur={handleBlurZh}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Nhập tiếng Trung..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền (VND)</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={formData.amountVnd ? formData.amountVnd.toLocaleString('en-US') : ''}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setFormData({...formData, amountVnd: val ? parseInt(val, 10) : 0});
              }}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isTranslating}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => onSave(item.id, formData)}
            disabled={isTranslating}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium disabled:opacity-50"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
