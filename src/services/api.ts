// File này đóng vai trò là "Cầu nối" (Bridge) giữa Frontend React và Backend Google Apps Script

// Khai báo biến google global để TypeScript không báo lỗi
declare const google: any;

export const settlementApi = {
  /**
   * Hàm gửi dữ liệu quyết toán lên Google Sheets
   */
  async saveSettlement(employeeName: string, rate: number, items: any[]) {
    const payload = {
      employeeName,
      month: new Date().getMonth() + 1,
      rate,
      items
    };
    const payloadStr = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      // Kiểm tra xem ứng dụng có đang chạy thật trên môi trường Google Apps Script không
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res: any) => resolve(res))
          .withFailureHandler((err: any) => reject(err))
          .processFrontendRequest('SAVE_SETTLEMENT', payloadStr);
      } else {
        // Fallback: Nếu đang chạy trên localhost:5173 (Môi trường Dev)
        console.log('DEV MOCK MODE - Dữ liệu sẽ được gửi lên GAS:', payload);
        setTimeout(() => {
          resolve({ 
            status: 'success', 
            sheetUrl: 'https://docs.google.com/spreadsheets/d/1-_fX12UlLMmbbyjL1QIw_gPSk1yFXqdl5ujBxZU05uk' 
          });
        }, 1500);
      }
    });
  }
};
