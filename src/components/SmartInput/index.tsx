import React, { useRef, useState } from 'react';
import { Mic, Camera, Loader2 } from 'lucide-react';
import { geminiService } from '../../services/geminiService';

interface SmartInputProps {
  onResult: (items: any[]) => void;
}

export default function SmartInput({ onResult }: SmartInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleMicClick = () => {
    audioInputRef.current?.click();
  };

  const handleAudioChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessing(true);
      const file = files[0];
      
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      const results = await geminiService.analyzeVoiceAudio(base64Audio, file.type);
      if (results && results.length > 0) {
        onResult(results);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xử lý âm thanh: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setIsProcessing(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    setShowCameraMenu(!showCameraMenu);
  };

  const triggerCamera = () => {
    setShowCameraMenu(false);
    cameraInputRef.current?.click();
  };

  const triggerGallery = () => {
    setShowCameraMenu(false);
    galleryInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessing(true);
      const allResults: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        const results = await geminiService.analyzeReceipt(base64Image, file.type);
        if (results && results.length > 0) {
          allResults.push(...results);
        }
      }

      if (allResults.length > 0) {
        onResult(allResults);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xử lý ảnh bằng AI: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.camera-menu-container')) {
        setShowCameraMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-20">
      {/* Input cho Chụp ảnh trực tiếp */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Input cho Chọn từ thư viện */}
      <input 
        type="file" 
        accept="image/*" 
        multiple
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Input ẩn để ghi âm */}
      <input 
        type="file" 
        accept="audio/*" 
        capture="microphone"
        ref={audioInputRef}
        onChange={handleAudioChange}
        className="hidden"
      />

      <div className="relative camera-menu-container flex justify-end">
        {showCameraMenu && (
          <div className="absolute bottom-[60px] right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 w-48 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={triggerCamera}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4 text-primary" />
              Chụp ảnh mới
            </button>
            <button 
              onClick={triggerGallery}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Chọn từ thư viện
            </button>
          </div>
        )}
        <button 
          onClick={handleCameraClick}
          disabled={isProcessing}
          className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          aria-label="Tùy chọn ảnh hóa đơn"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
      
      <button 
        onClick={handleMicClick}
        disabled={isProcessing}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 bg-accent shadow-rose-200 hover:bg-rose-600 ring-accent"
        aria-label="Ra lệnh giọng nói"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {isProcessing && (
        <div className="absolute right-16 bottom-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-right-4 shadow-lg">
          AI đang xử lý...
        </div>
      )}
    </div>
  );
}
