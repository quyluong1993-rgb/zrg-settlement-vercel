import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ExchangeRateConfig from './components/Settings/ExchangeRateConfig';
import { useExchangeRate } from './hooks/useExchangeRate';
import { settlementApi } from './services/api';
import SmartInput from './components/SmartInput';

// Mock data (sẽ lấy từ state thực tế sau này khi nối Agent)
const initialItems: Array<{id: number, date: string, descZh: string, descVi: string, amountRmb: number}> = [];

function App() {
  const { rate, setRate } = useExchangeRate(3800);
  const [employeeName, setEmployeeName] = useState('Nguyễn Quý Lương');
  const [items, setItems] = useState(initialItems);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tính toán lại mảng data với tỷ giá mới (Live-update) và sắp xếp theo ngày
  const computedItems = items
    .map(item => ({
      ...item,
      amountVnd: Math.round(item.amountRmb * rate)
    }))
    .sort((a, b) => {
      // Parse DD/MM for comparison
      const parseDate = (d: string) => {
        const parts = d.split('/');
        if (parts.length === 2) {
          return parseInt(parts[1], 10) * 100 + parseInt(parts[0], 10); // MM * 100 + DD
        }
        return 0; // Fallback for invalid dates
      };
      // Sắp xếp giảm dần (Mới nhất lên đầu)
      return parseDate(b.date) - parseDate(a.date);
    });

  const handleSaveSettlement = async () => {
    try {
      setIsSaving(true);
      const res = await settlementApi.saveSettlement(employeeName, rate, computedItems);
      alert('Đã tạo thành công Báo cáo Quyết toán!\nLink Google Sheets:\n' + (res as any).sheetUrl);
    } catch (error) {
      alert('Lỗi khi lưu dữ liệu!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIResult = (aiItems: any[]) => {
    // Map dữ liệu từ AI về dạng SettlementItem, tạo ID ngẫu nhiên
    const newItems = aiItems.map(item => ({
      id: Math.random(),
      date: item.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      descZh: item.descZh || '',
      descVi: item.descVi || '',
      // Nếu AI trả về VND thì convert ngược ra RMB (bằng cách chia rate) để đồng nhất lưu trữ gốc là RMB
      // Hoặc nếu nó trả RMB thì lấy luôn
      amountRmb: item.currency === 'VND' ? (item.amount / rate) : (item.amount || 0)
    }));
    setItems([...items, ...newItems]);
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (id: number, updated: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // Nếu sửa giá VND, cập nhật lại RMB tương ứng
        const newRmb = updated.amountVnd !== undefined && updated.amountVnd !== item.amountVnd * rate
          ? updated.amountVnd / rate 
          : item.amountRmb;
          
        return { ...item, ...updated, amountRmb: newRmb };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">ZRG Settlement</h1>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="text-sm bg-indigo-800/50 hover:bg-indigo-800 px-3 py-1 rounded-full font-medium transition-colors"
        >
          Tỷ giá: {rate.toLocaleString('vi-VN')}
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-24">
        <Dashboard 
          items={computedItems} 
          onSave={handleSaveSettlement} 
          isSaving={isSaving} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
        <SmartInput onResult={handleAIResult} />
      </main>

      <ExchangeRateConfig 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        currentRate={rate}
        currentEmployee={employeeName}
        onSave={(newRate, newEmployee) => {
          setRate(newRate);
          setEmployeeName(newEmployee);
        }}
      />
    </div>
  )
}

export default App;
