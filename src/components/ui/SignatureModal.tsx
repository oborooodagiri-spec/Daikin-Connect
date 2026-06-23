import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X } from 'lucide-react';
import { t, Language } from "@/lib/i18n";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string, name: string) => void;
  title?: string;
  defaultName?: string;
  lang?: Language;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = "Tanda Tangan Digital",
  defaultName = "",
  lang = 'id'
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [name, setName] = useState(defaultName);
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setIsAgreed(false);
      setError('');
      setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
      }, 100);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError(lang === 'en' ? 'Please enter your name.' : 'Mohon masukkan nama terang Anda.');
      return;
    }
    if (sigCanvas.current?.isEmpty()) {
      setError(lang === 'en' ? 'Please provide your signature.' : 'Mohon berikan tanda tangan Anda.');
      return;
    }
    if (!isAgreed) {
      setError(lang === 'en' ? 'You must agree to the terms.' : 'Anda harus menyetujui pernyataan persetujuan.');
      return;
    }

    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataURL) {
      onSave(dataURL, name);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {lang === 'en' ? 'Signer Name' : 'Nama Terang'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={lang === 'en' ? 'Enter full name' : 'Masukkan nama lengkap'}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {lang === 'en' ? 'Signature' : 'Tanda Tangan'} <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  className: "signature-canvas w-full h-48 sm:h-64 cursor-crosshair"
                }}
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 px-3 py-1 bg-white/80 hover:bg-white text-xs font-medium text-slate-600 rounded shadow-sm border border-slate-200 transition-colors"
              >
                {lang === 'en' ? 'Clear' : 'Bersihkan'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                {lang === 'en' 
                  ? 'I hereby declare that the information provided is true. I agree that this electronic signature serves as my valid and legally binding signature.'
                  : 'Dengan ini saya menyatakan bahwa informasi pada dokumen ini adalah benar. Saya menyetujui bahwa coretan ini berfungsi sebagai tanda tangan elektronik saya yang sah dan mengikat secara hukum sesuai UU ITE.'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {lang === 'en' ? 'Cancel' : 'Batal'}
          </button>
          <button
            onClick={handleSave}
            disabled={!isAgreed || !name.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            {lang === 'en' ? 'Save Signature' : 'Simpan Tanda Tangan'}
          </button>
        </div>
      </div>
    </div>
  );
};
