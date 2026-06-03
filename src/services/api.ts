// Khai báo biến google global để TypeScript không báo lỗi khi chạy trên GAS
declare const google: any;

// Lấy URL Web App từ biến môi trường (hoặc fallback về link cứng của bạn)
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwTySUHOCTyiw4iQw_l6ZxGJYnI3JMihexudQvXabNd91qsITJZc8S1MFyLNyuTTijo/exec';

export const settlementApi = {
  /**
   * Hàm gửi dữ liệu quyết toán lên Google Sheets (Tự động nhận diện môi trường Vercel hoặc GAS)
   */
  async saveSettlement(employeeName: string, rate: number, items: any[]) {
    const payload = {
      employeeName,
      month: new Date().getMonth() + 1,
      rate,
      items
    };

    // 1. Nếu đang chạy trực tiếp trên Google Apps Script Dashboard
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        const payloadStr = JSON.stringify(payload);
        google.script.run
          .withSuccessHandler((res: any) => resolve(res.data))
          .withFailureHandler((err: any) => reject(err))
          .processFrontendRequest('SAVE_SETTLEMENT', payloadStr);
      });
    }

    // 2. Nếu đang chạy trên Vercel hoặc Localhost (Gọi qua Web API)
    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'SAVE_SETTLEMENT',
          payload: JSON.stringify(payload)
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
