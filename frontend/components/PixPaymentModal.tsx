import React, { useState, useEffect } from 'react';
import { X, Check, Copy, QrCode, ShieldCheck, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { PRICE_PER_CELL } from '../constants';

interface PixPaymentModalProps {
  amount: number;
  pixelId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({ amount, pixelId, onClose, onConfirm }) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const fetchPix = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/pix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_amount: amount,
            description: `Pixel Grid - Payment for Pixel ${pixelId}`,
            pixel_id: pixelId,
            payer: {
              email: 'test_user_123@test.com',
              first_name: 'Comprador',
              last_name: 'Fictício',
              identification: {
                type: 'CPF',
                number: '19119119100'
              }
            }
          })
        });

        if (!response.ok) throw new Error('Failed to generate PIX');
        const data = await response.json();
        setPixData({
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64
        });
      } catch (err) {
        console.error(err);
        setError('Erro ao gerar pagamento Pix. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPix();
  }, [amount, pixelId]);

  // Polling for status
  useEffect(() => {
    if (isLoading || !!error) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pixels/${pixelId}/status`);
        if (response.ok) {
          const { status } = await response.json();
          if (status === 'approved') {
            onConfirm(); // Auto confirm if paid
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(pollStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isLoading, error, pixelId, onConfirm]);

  // Countdown timer
  useEffect(() => {
    if (isLoading || !!error) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, error, pixelId]);

  const handleTimeout = async () => {
    try {
      // Notify backend to discard pixel
      await fetch(`${import.meta.env.VITE_API_URL}/api/pixels/${pixelId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Error discarding pixel on timeout:", err);
    }
    alert("O tempo para pagamento expirou. O pixel foi descartado.");
    onClose();
  };

  const handleCopy = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = () => {
    setIsVerifying(true);
    // User clicked manually, we check status one more time
    const checkOnce = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pixels/${pixelId}/status`);
        if (response.ok) {
          const { status } = await response.json();
          if (status === 'approved') {
            onConfirm();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsVerifying(false);
      }
    };
    checkOnce();
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* Header Pix */}
        <div className="bg-[#32BCAD] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
            <QrCode size={120} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Pagamento Seguro</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">Pagamento Pix</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="text-center space-y-1">
            <p className="text-gray-500 text-sm font-medium">Valor a pagar</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{formattedPrice}</p>
          </div>

          {/* QR Code Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-inner relative group min-h-[220px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={40} className="animate-spin text-[#32BCAD]" />
                  <span className="text-xs font-bold text-gray-400">GERANDO QR CODE...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center text-sm font-bold flex flex-col items-center gap-2">
                  <span>{error}</span>
                  <button onClick={() => window.location.reload()} className="text-xs underline">Tentar novamente</button>
                </div>
              ) : (
                <>
                  <div className="w-48 h-48 bg-gray-50 flex items-center justify-center overflow-hidden rounded-2xl">
                    <img
                      src={`data:image/png;base64,${pixData?.qr_code_base64}`}
                      alt="QR Code Pix"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-[2px]">
                    <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <Clock size={12} /> EXPIRA EM {formatTime(timeLeft)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Escaneie o QR Code acima</p>
          </div>

          {/* Copy Code */}
          <div className="space-y-3">
            <button
              onClick={handleCopy}
              disabled={isLoading || !!error}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all group ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 hover:border-[#32BCAD]/30 text-gray-700'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-xl shrink-0 ${copied ? 'bg-green-200' : 'bg-white shadow-sm'}`}>
                  {copied ? <Check size={18} /> : <Copy size={18} className="text-gray-400 group-hover:text-[#32BCAD]" />}
                </div>
                <span className="text-sm font-bold truncate pr-4">
                  {copied ? 'Código Copiado!' : (pixData?.qr_code || 'Aguardando código...')}
                </span>
              </div>
              {!copied && <ArrowRight size={16} className="text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <div className="w-full py-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm tracking-tight flex items-center justify-center gap-3 animate-pulse">
            <Loader2 size={20} className="animate-spin text-gray-400" />
            AGUARDANDO PAGAMENTO...
          </div>
        </div>
      </div>
    </div>
  );
};
