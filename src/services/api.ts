// Lấy URL Web App từ biến môi trường (hoặc fallback về link cứng của bạn)
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwTySUHOCTyiw4iQw_l6ZxGJYnI3JMihexudQvXabNd91qsITJZc8S1MFyLNyuTTijo/exec';

export const settlementApi = {
  /**
   * Hàm gửi dữ liệu quyết toán lên Google Sheets qua Web API (HTTP POST)
   */
  async saveSettlement(employeeName: string, rate: number, items: any[]) {
    const payload = {
      employeeName,
      month: new Date().getMonth() + 1,
      rate,
      items
    };

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'SAVE_SETTLEMENT',
          payload: payload
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Lỗi không xác định từ Server');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API Google Apps Script:', error);
      throw error;
    }
  }
};

