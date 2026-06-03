import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy API Key từ biến môi trường (hoặc fallback nếu chưa cấu hình)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Gộp Prompts của Agent 02 và 03
const SYSTEM_PROMPT = `Bạn là Kế toán trưởng hệ thống ZRG (AI Agent).
Nhiệm vụ của bạn là đọc ảnh hóa đơn được cung cấp và bóc tách dữ liệu theo đúng định dạng JSON.

Quy tắc nghiêm ngặt:
1. Nhận diện loại tiền tệ (Currency): Tìm các ký hiệu (đ, VNĐ, VND, nghìn -> "VND") hoặc (¥, RMB, NDT, tệ -> "RMB"). Nếu KHÔNG có ký hiệu nào, để trống (null).
2. Ngày tháng (Date): Định dạng DD/MM. Nếu không có ngày, sử dụng ngày hôm nay.
3. Số tiền (Amount): Lấy số thực tế phải thanh toán.
4. Dịch thuật song ngữ: 
   - descVi: Tóm tắt tiếng Việt (VD: "Thanh toán taxi", "Mua văn phòng phẩm").
   - descZh: Dịch tóm tắt đó sang tiếng Trung giản thể.
5. Chỉ trả về DUY NHẤT một mảng JSON (Array of Objects), không kèm theo bất kỳ văn bản nào khác (không dùng markdown backticks nếu không cần thiết, hoặc chỉ trả nguyên mảng).

Định dạng JSON yêu cầu:
[
  {
    "date": "DD/MM",
    "currency": "VND" | "RMB" | null,
    "amount": 123456,
    "descVi": "Tóm tắt tiếng Việt",
    "descZh": "Tóm tắt tiếng Trung"
  }
]`;

export const geminiService = {
  /**
   * Phân tích ảnh hóa đơn (Base64)
   * @param base64Image Ảnh dạng base64
   * @param mimeType Định dạng ảnh (vd: image/jpeg)
   */
  async analyzeReceipt(base64Image: string, mimeType: string) {
    try {
      // Sử dụng model Flash 2.5 mới nhất do 1.5 đã deprecated
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Lược bỏ phần header của base64 (nếu có, vd: data:image/jpeg;base64,...)
      const base64Data = base64Image.split(',')[1] || base64Image;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType
        },
      };

      const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
      const response = await result.response;
      let text = response.text();
      
      // Làm sạch text để parse JSON (Loại bỏ markdown ```json ... ```)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(text);
      return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      console.error("Lỗi khi xử lý ảnh qua Gemini:", error);
      throw error;
    }
  },

  /**
   * Phân tích văn bản thô (giọng nói STT)
   * @param voiceText Văn bản do Speech-to-Text nhận diện được
   */
  async analyzeVoiceText(voiceText: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `${SYSTEM_PROMPT}\n\nDữ liệu đầu vào là lời nói của nhân viên:\n"${voiceText}"\nHãy lọc bỏ từ lóng, chuẩn hóa số tiền và trả về JSON hợp lệ.`;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      let text = response.text();
      
      // Làm sạch text để parse JSON (Loại bỏ markdown ```json ... ```)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(text);
      return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      console.error("Lỗi khi xử lý giọng nói qua Gemini:", error);
      throw error;
    }
  },

  /**
   * Phân tích âm thanh (file ghi âm)
   * @param base64Audio Âm thanh dạng base64
   * @param mimeType Định dạng file âm thanh
   */
  async analyzeVoiceAudio(base64Audio: string, mimeType: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `${SYSTEM_PROMPT}\n\nDữ liệu đầu vào là 1 đoạn âm thanh ghi âm lời nói của nhân viên.\nHãy nghe, lọc bỏ từ lóng, ngập ngừng, chuẩn hóa số tiền và trả về JSON hợp lệ. Đừng trả về bất kỳ text nào khác ngoài mảng JSON.`;

      const base64Data = base64Audio.split(',')[1] || base64Audio;
      // Tránh lỗi mimeType lạ từ các điện thoại khác nhau, Gemini hỗ trợ tốt các định dạng thông thường
      const safeMimeType = mimeType || 'audio/mp3';

      const audioPart = {
        inlineData: {
          data: base64Data,
          mimeType: safeMimeType
        },
      };

      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(text);
      return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      console.error("Lỗi khi xử lý file âm thanh qua Gemini:", error);
      throw error;
    }
  },

  /**
   * Dịch thuật tự động song ngữ
   * @param text Văn bản cần dịch
   * @param toLang Ngôn ngữ đích (vi hoặc zh)
   */
  async translateText(text: string, toLang: 'vi' | 'zh') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const targetLang = toLang === 'vi' ? 'Tiếng Việt' : 'Tiếng Trung Giản Thể';
      const prompt = `Dịch đoạn văn bản sau sang ${targetLang}. Chỉ trả về kết quả dịch, không giải thích gì thêm.\n\nVăn bản: "${text}"`;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Lỗi khi dịch thuật:", error);
      return '';
    }
  }
};
