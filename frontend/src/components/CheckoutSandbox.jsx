import React, { useState, useRef } from 'react';
import { Shield, X, Loader2, CheckCircle, Upload } from 'lucide-react';

export function CheckoutSandbox({ garden, sessionId, lang, onPaymentSuccess }) {
  const t = (en, ar, tr) => lang === 'ar' ? ar : lang === 'tr' ? tr : en;
  const [currency, setCurrency] = useState('EGP');
  const [amount, setAmount] = useState(garden?.priceEGP || 1000);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('Please select an image file', 'يرجى اختيار ملف صورة', 'Lütfen bir resim dosyası seçin'));
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('Please select an image file', 'يرجى اختيار ملف صورة', 'Lütfen bir resim dosyası seçin'));
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePayment = async () => {
    if (!screenshot) {
      setError(t('Please upload a payment screenshot', 'يرجى رفع لقطة شاشة الدفع', 'Lütfen ödeme ekran görüntüsünü yükleyin'));
      return;
    }
    if (!phoneNumber.trim()) {
      setError(t('Please enter your InstaPay phone number', 'يرجى إدخال رقم هاتف إنستاباي الخاص بك', 'Lütfen InstaPay telefon numaranızı girin'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', screenshot);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(t('Failed to upload screenshot', 'فشل رفع لقطة الشاشة', 'Ekran görüntüsü yüklenemedi'));
      }

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gardenId: garden?.id,
          country: currency === 'EGP' ? 'eg' : 'tr',
          paymentMethod: 'instapay:' + phoneNumber.trim(),
          sessionId,
          paymentScreenshot: uploadData.url
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onPaymentSuccess(), 1500);
      } else {
        setError(data.error || t('Payment failed', 'فشل الدفع', 'Ödeme başarısız'));
      }
    } catch (err) {
      setError(err.message || t('Network error', 'خطأ في الشبكة', 'Ağ hatası'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <CheckCircle className="w-16 h-16 text-emerald-400" />
        <p className="text-emerald-300 font-semibold">{t('Payment Successful!', 'تم الدفع بنجاح!', 'Ödeme Başarılı!')}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-purple-400" />
        <span className="text-sm font-semibold text-gray-300">{t('InstaPay Payment', 'الدفع عبر إنستاباي', 'InstaPay ile Ödeme')}</span>
        <span className="ml-auto text-[10px] text-cyan-400/60 font-mono">{t('SECURE', 'آمن', 'GÜVENLİ')}</span>
      </div>

      {garden && (
        <div className="bg-[#0e1424] rounded-xl p-3 mb-4 border border-purple-500/10">
          <p className="text-xs text-gray-400">{garden.titleEn || garden.titleAr}</p>
          <p className="text-lg font-bold text-purple-300">{currency} {amount}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setCurrency('EGP'); setAmount(garden?.priceEGP || 1000); }}
          className={`px-3 py-1.5 text-xs rounded-lg ${currency === 'EGP' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-[#0e1424] text-gray-500 border border-gray-800'}`}>
          {t('Egypt (EGP)', 'مصر (EGP)', 'Mısır (EGP)')}
        </button>
        <button onClick={() => { setCurrency('TRY'); setAmount(garden?.priceTRY || 500); }}
          className={`px-3 py-1.5 text-xs rounded-lg ${currency === 'TRY' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-[#0e1424] text-gray-500 border border-gray-800'}`}>
          {t('Turkey (TRY)', 'تركيا (TRY)', 'Türkiye (TRY)')}
        </button>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">
          {t('Send exact amount via InstaPay and upload the payment screenshot', 'أرسل المبلغ المحدد عبر إنستاباي وارفع لقطة شاشة الدفع', 'Tam tutarı InstaPay ile gönderin ve ödeme ekran görüntüsünü yükleyin')}
        </div>
        <div className="bg-[#0e1424] rounded-xl p-3 border border-purple-500/10 mb-2">
          <p className="text-[10px] text-gray-500">{t('InstaPay Account', 'حساب إنستاباي', 'InstaPay Hesabı')}</p>
          <p className="text-sm font-mono text-cyan-400">01000000000</p>
        </div>

        <div className="mb-3">
          <label className="text-[10px] text-gray-400 mb-1.5 block">
            {t('Your InstaPay Phone Number', 'رقم هاتف إنستاباي الخاص بك', 'InstaPay Telefon Numaranız')}
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            placeholder={t('e.g. 01012345678', 'مثال: 01012345678', 'ör: 01012345678')}
            className="w-full bg-[#0e1424] border border-purple-500/20 rounded-xl px-3 py-2.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
          />
        </div>

        <div className="mb-1">
          <label className="text-[10px] text-gray-400 mb-1.5 block">
            {t('Payment Screenshot', 'لقطة شاشة الدفع', 'Ödeme Ekran Görüntüsü')}
            <span className="text-red-400 ml-1">*</span>
          </label>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${screenshotPreview ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-gray-700 hover:border-purple-500/40 bg-[#0e1424]'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {screenshotPreview ? (
            <div className="flex flex-col items-center gap-2">
              <img src={screenshotPreview} alt="Payment screenshot" className="max-h-32 rounded-lg object-contain" />
              <span className="text-[10px] text-emerald-400/60">{t('Click to Replace', 'انقر للاستبدال', 'Değiştirmek için Tıkla')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">
                {t('Drop screenshot here or click to browse', 'اسحب لقطة الشاشة هنا أو انقر للتصفح', 'Ekran görüntüsünü sürükleyin veya göz atmak için tıklayın')}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-sm font-semibold text-purple-300 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {loading ? t('Processing...', 'جارٍ المعالجة...', 'İşleniyor...') : `${t('Pay with InstaPay', 'ادفع عبر إنستاباي', 'InstaPay ile Öde')} ${currency} ${amount}`}
      </button>
    </div>
  );
}
