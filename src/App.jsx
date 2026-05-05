import React, { useState } from 'react';
import { Menu, X, Plus, ShoppingCart, MapPin, Phone, Loader2, Sparkles } from 'lucide-react';

// --- CONFIGURATION ---
const INQUIRY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwSUhm0OghoVU7V1OwfcrJjXbBzhEizleCvPs8lkw/dev';
const ORDERS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUTodubRV8mwz4moTHOsJ-q5Om5OaockdNgN0tOwzv2O1Nm-Hh057svRQZbXnNX94ToA/exec';

const PRODUCTS = [
  { id: 'longanisa', name: 'CEDJEK LONGANISA', price: 280, options: ['Garlic', 'Spicy Garlic', 'Sweet'] },
  { id: 'specific', name: 'SPECIFIC CUTS', price: 350, options: ['Pork Shoulder', 'Pork Loin', 'Pork Belly', 'Pork Leg'] },
  { id: 'primal', name: 'PRIMAL CUTS', price: 320, options: ['Whole Blade', 'Arm Shoulder', 'Full Loin', 'Full Side'] }
];

// --- CHECKOUT MODAL ---
const CheckoutModal = ({ product, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', contactNumber: '', address: '', quantity: 1,
    cutType: product?.options[0] || '', deliveryDate: '', deliveryTime: '',
    paymentMethod: 'Cash on Delivery', fulfillmentType: 'Delivery'
  });

  if (!isOpen) return null;

  const handleOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const params = new URLSearchParams({...formData, productName: product.name, totalPrice: (product.price * formData.quantity)});
    try {
      await fetch(ORDERS_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' });
      setOrderComplete(true);
      setTimeout(() => { onClose(); setOrderComplete(false); }, 3000);
    } catch (err) { alert("Error submitting order."); }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4a3424]/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        {orderComplete ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingCart size={40}/></div>
            <h2 className="text-3xl font-black text-[#4a3424]">Order Placed!</h2>
            <p className="text-gray-500 mt-2">We'll text you to confirm shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-4">
            <h2 className="text-2xl font-black text-[#4a3424] mb-2">Checkout</h2>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {['Delivery', 'Pickup'].map(type => (
                <button key={type} type="button" onClick={() => setFormData({...formData, fulfillmentType: type})}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${formData.fulfillmentType === type ? 'bg-white text-[#e65100] shadow-sm' : 'text-gray-400'}`}>
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
              <input required placeholder="Full Name" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100]" onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input required placeholder="Contact Number" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100]" onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              {formData.fulfillmentType === 'Delivery' ? (
                <input required placeholder="Delivery Address" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100]" onChange={e => setFormData({...formData, address: e.target.value})} />
              ) : (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-[11px] font-bold text-[#4a3424]">Pickup: Stall 11, Maria Aurora Public Market</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Qty (kg)</label>
                  <input type="number" min="1" value={formData.quantity} className="w-full bg-transparent font-bold" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Cut</label>
                  <select className="w-full bg-transparent font-bold outline-none" onChange={e => setFormData({...formData, cutType: e.target.value})}>
                    {product.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                <input type="time" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryTime: e.target.value})} />
              </div>
            </div>
            <div className="pt-6 border-t flex items-center justify-between">
               <div><p className="text-[10px] font-black text-gray-400 uppercase">Total</p><p className="text-2xl font-black text-[#e65100]">₱{(product.price * formData.quantity).toLocaleString()}</p></div>
               <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">
                 {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm'}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  return (
    <div className="min-h-screen bg-[#eae6e1] p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-2"><div className="bg-[#4a3424] p-2 rounded-lg text-white"><ShoppingCart size={20}/></div><span className="text-2xl font-black text-[#4a3424]">CEDJEK</span></div>
      </header>
      <main className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-[#4a3424] mb-12 leading-none">Fresh Selections.</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRODUCTS.map(p => (
            <div key={p.id} className="bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-[#4a3424]">
              <h3 className="text-xl font-black text-[#4a3424] mb-1">{p.name}</h3>
              <p className="text-gray-400 font-bold mb-6 text-sm">₱{p.price}/kg</p>
              <button onClick={() => setActiveProduct(p)} className="w-full bg-[#4a3424] text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-[#e65100]">
                <Plus size={16}/> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
      {activeProduct && <CheckoutModal product={activeProduct} isOpen={!!activeProduct} onClose={() => setActiveProduct(null)} />}
    </div>
  );
}