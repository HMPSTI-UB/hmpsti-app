"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/cart-context";
import { Check, UploadCloud, Trash2, FileText, Wallet, ShoppingBag, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

const BANKS = [
  { id: "bca", name: "BCA", acc: "2353748545", logo: "BCA" },
  { id: "mandiri", name: "Mandiri", acc: "2353748545", logo: "Mandiri" },
  { id: "bni", name: "BNI", acc: "2353748545", logo: "BNI" },
  { id: "bri", name: "BRI", acc: "2353748545", logo: "BRI" },
];

export default function Checkout() {
  const { items, totalPrice, totalItems, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [selectedBank, setSelectedBank] = useState("bca");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    const newErrors = { name: "", whatsapp: "", address: "" };
    let hasError = false;

    if (!formData.name) {
      newErrors.name = "Data harus diisi";
      hasError = true;
    }
    if (!formData.whatsapp) {
      newErrors.whatsapp = "Data harus diisi";
      hasError = true;
    }
    if (!formData.address) {
      newErrors.address = "Data harus diisi";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    if (!selectedFile) {
      alert("Mohon upload bukti pembayaran terlebih dahulu");
      return;
    }

    clearCart();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
        
        <div className="max-w-2xl w-full mx-auto relative z-10 text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-black mb-4">Pembayaran</h1>
        </div>

        <div className="bg-[#111111] border border-white/5 p-8 md:p-12 rounded-2xl max-w-2xl w-full relative z-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-6">Pesanan telah tersampaikan !!</h2>
          <p className="text-lg md:text-xl font-bold leading-relaxed mb-10">
            Pesanan Anda telah tercatat dalam sistem kami dan kami sedang memverifikasi status pembayarannya. Mohon menunggu; status pesanan Anda akan diperbarui dalam waktu kurang dari 12 jam.
          </p>
          <button 
            onClick={() => router.push("/merch")}
            className="bg-[#33A5D3] text-black font-bold px-8 py-3 rounded hover:bg-[#33A5D3]/90 transition-colors flex items-center justify-center gap-2"
          >
            Balik ke halaman utama
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <ShoppingBag size={64} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-black mb-4">Keranjang Kosong</h2>
        <p className="text-gray-400 mb-8">Belum ada produk untuk di-checkout.</p>
        <button
          onClick={() => router.push("/merch")}
          className="bg-[#33A5D3] text-black font-bold px-8 py-3 rounded-full hover:bg-[#33A5D3]/90 transition-colors"
        >
          Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Pembayaran</h1>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
            Lengkapi detail pemesanan Anda dan pilih metode pembayaran untuk menyelesaikan transaksi Merch HMPSTI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-[#33A5D3]" size={20} /> Informasi Orderan
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda"
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ""}); }}
                    className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#33A5D3]'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nomor Whatsapp</label>
                  <input 
                    type="text" 
                    placeholder="08xxxxxxxxxx"
                    value={formData.whatsapp}
                    onChange={(e) => { setFormData({...formData, whatsapp: e.target.value}); setErrors({...errors, whatsapp: ""}); }}
                    className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors ${errors.whatsapp ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#33A5D3]'}`}
                  />
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Alamat Lengkap</label>
                  <textarea 
                    placeholder="Detail alamat pengiriman..."
                    rows={3}
                    value={formData.address}
                    onChange={(e) => { setFormData({...formData, address: e.target.value}); setErrors({...errors, address: ""}); }}
                    className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors resize-none ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#33A5D3]'}`}
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </motion.div>

            {/* Payment Options */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="text-[#33A5D3]" size={20} /> Pilihan Pembayaran
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BANKS.map((bank) => (
                  <div 
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                      selectedBank === bank.id 
                        ? "border-[#33A5D3] bg-[#33A5D3]/5" 
                        : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
                    }`}
                  >
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xs">
                      {bank.logo}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{bank.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{bank.acc}</p>
                    </div>
                    {selectedBank === bank.id && (
                      <Check className="text-[#33A5D3]" size={18} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="space-y-6">
            
            {/* Cart Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#33A5D3]" /> Pembayaran Produk
                </h3>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full font-bold">{totalItems} items</span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                    <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity} x <span className="text-[#F56C6C]">Rp {(item.product.price).toLocaleString("id-ID")}</span>
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-end justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-black text-[#33A5D3]">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </motion.div>

            {/* Upload Area & Submit */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 mb-6 text-sm text-gray-400 space-y-2">
                <p className="font-bold text-white mb-2 flex items-center gap-2"><FileText size={16}/> Cara Pembayaran</p>
                <p>1. Transfer ke rekening pilihan Anda.</p>
                <p>2. Simpan bukti transfer berupa screenshot/foto.</p>
                <p>3. Upload bukti pembayaran pada area di bawah ini.</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 bg-[#1A1A1A] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#33A5D3]/50 transition-colors mb-6 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/png, image/jpeg"
                />
                <UploadCloud size={32} className={`${selectedFile ? 'text-[#33A5D3]' : 'text-gray-500'} group-hover:text-[#33A5D3] mb-3 transition-colors`} />
                <p className="font-bold text-sm">{selectedFile ? selectedFile.name : "Upload Bukti"}</p>
                {!selectedFile && <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>}
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(51,165,211,0.2)]"
              >
                Lanjutkan Pembayaran
              </button>
              <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                Tolong upload bukti pembayaran anda
              </p>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
