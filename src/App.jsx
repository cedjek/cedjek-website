import React, { useState } from 'react';
import { Menu, X, Plus, Minus, Sparkles, Loader2, ShoppingCart, MapPin, Phone, Calendar } from 'lucide-react';

// --- CONFIGURATION ---
// 1. Paste your Gemini API key here
const apiKey = ""; 
// 2. Paste your Google Script URL for the General Inquiry Sheet here
const INQUIRY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnpxWharoic53E9DGcUHgglNXCib23zyFLN9UOaLgp7MmY0G7rIygsuU53onDdDk3g/exec'; 
// 3. Paste your NEW Google Script URL for the Orders Sheet here
const ORDERS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwj1xFTHEen8qZiz-EnzIA5vvGXfbKicOMwnRHVLsEi/dev';

// --- GEMINI AI HELPER ---
const generateWithGemini = async (prompt) => {
  if (!apiKey) return "Please add your Gemini API Key to use the AI features!";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) { return "AI is busy right now."; }
};

// --- DATA ---
const FAQ_DATA = [
  { question: "What services do you offer?", answer: "We specialize in bulk orders of primal cuts, specialty custom cuts, and our signature house-blend longanisa." },
  { question: "How do I get started?", answer: "Reach out through our contact form or schedule a call, and we'll guide you through our process." },
  { question: "How can I contact you?", answer: "Via our contact page or email. We respond within one business day." },
  { question: "What's your pricing model?", answer: "We work with partners to find pricing that works for everyone. Quality and honest service." },
  { question: "What's it like to work with you?", answer: "Collaborative, honest, and straightforward." }
];

const PRODUCTS_DATA = {
  longanisa: { id: 'longanisa', name: 'LONGANISA', price: 280, subtitle: 'Price starts at Php 280.00', options: ['Garlic', 'Spicy Garlic', 'Sweet'] },
  specific: { id: 'specific', name: 'SPECIFIC CUTS', price: 350, subtitle: 'Price starts at Php 350.00', options: ['Pork Shoulder', 'Pork Loin', 'Pork Belly', 'Pork Leg'] },
  primal: { id: 'primal', name: 'PRIMAL CUTS', price: 320, subtitle: 'Price starts at Php 320.00', options: ['Whole Blade', 'Arm Shoulder', 'Full Loin', 'Full Side'] }
};

// --- CHECKOUT MODAL COMPONENT ---
const CheckoutModal = ({ product, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', contactNumber: '', address: '', quantity: 1,
    cutType: product?.options[0] || '', deliveryDate: '', deliveryTime: '',
    paymentMethod: 'Cash on Delivery', fulfillmentType: 'Delivery'
  });

  if (!isOpen) return null;

  const handleOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const params = new URLSearchParams({
      ...formData,
      productName: product.name,
      totalPrice: (product.price * formData.quantity)
    });
    try {
      await fetch(ORDERS_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' });
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); }, 3000);
    } catch (err) { alert("Error submitting order."); }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#4a3424]/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative p-8">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        {success ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingCart size={40}/></div>
            <h2 className="text-3xl font-black text-[#4a3424]">Order Received!</h2>
            <p className="text-gray-500 mt-2">Check your SMS for confirmation shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-4">
            <h2 className="text-2xl font-black text-[#4a3424] mb-2 flex items-center gap-2"><ShoppingCart size={24} className="text-[#e65100]" /> Checkout</h2>
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
                <input required placeholder="Complete Delivery Address" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100]" onChange={e => setFormData({...formData, address: e.target.value})} />
              ) : (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-[11px] font-bold text-[#4a3424]">Pickup at: Stall 11, Maria Aurora Public Market</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Qty (kg)</label>
                  <input type="number" min="1" value={formData.quantity} className="w-full bg-transparent font-bold" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Cut Type</label>
                  <select className="w-full bg-transparent font-bold outline-none" onChange={e => setFormData({...formData, cutType: e.target.value})}>
                    {product.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                <input type="time" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryTime: e.target.value})} />
              </div>
              <select className="w-full bg-gray-50 rounded-xl px-5 py-3 font-bold text-sm" onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option>Cash on {formData.fulfillmentType}</option>
                <option>GCash</option>
                <option>Online Banking</option>
              </select>
            </div>
            <div className="pt-6 border-t flex items-center justify-between">
               <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Amount</p><p className="text-2xl font-black text-[#e65100]">₱{(product.price * formData.quantity).toLocaleString()}</p></div>
               <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">
                 {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Place Order'}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- GENERAL FORM COMPONENT ---
const Form = ({ showNewsletter = false, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '', newsletter: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formBody = new URLSearchParams(formData);
      await fetch(INQUIRY_SCRIPT_URL, { method: 'POST', body: formBody, mode: 'no-cors' });
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', message: '', newsletter: false });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) { console.error('Error!', error.message); }
    finally { setIsSubmitting(false); setTimeout(() => setSuccess(false), 5000); }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl text-[#4a3424]">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">First Name</label>
          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">Last Name</label>
          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-1">Email</label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2" />
      </div>
      {showNewsletter && (
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" name="newsletter" id="newsletter" checked={formData.newsletter} onChange={handleChange} />
          <label htmlFor="newsletter" className="text-xs font-bold uppercase">SIGN UP FOR NEWS AND UPDATES</label>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-xs font-bold mb-1">Message</label>
        <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-transparent border-2 border-[#6c5545] rounded-2xl px-4 py-3 resize-none"></textarea>
      </div>
      {success ? <div className="bg-green-100 text-green-800 px-4 py-3 rounded-full font-bold">Sent successfully!</div> : 
      <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-2 rounded-full font-bold uppercase tracking-wider">{isSubmitting ? 'Sending...' : 'Submit'}</button>}
    </form>
  );
};

// --- UI HELPERS ---
const Header = ({ currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = ['About', 'Contact', 'Product Offerings', 'Services'];
  return (
    <header className="fixed w-full top-0 z-50 bg-[#eae6e1]/90 backdrop-blur-md px-6 py-4 flex justify-between items-center text-[#4a3424] border-b border-black/5">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('about')}>
        <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
        <span className="font-black text-xl tracking-widest hidden sm:block">CEDJEK</span>
      </div>
      <nav className="hidden md:flex gap-8 text-sm font-bold">
        {navItems.map(item => (
          <button key={item} onClick={() => setCurrentView(item.toLowerCase().replace(' ', '-'))} className={`hover:text-[#e65100] ${currentView === item.toLowerCase().replace(' ', '-') ? 'border-b-2 border-[#4a3424]' : ''}`}>{item}</button>
        ))}
      </nav>
      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#eae6e1] border-t p-4 flex flex-col items-center gap-4 shadow-xl">
          {navItems.map(item => (
            <button key={item} onClick={() => { setCurrentView(item.toLowerCase().replace(' ', '-')); setMobileMenuOpen(false); }} className="font-bold text-lg">{item}</button>
          ))}
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-[#eae6e1] text-[#4a3424] pt-16 pb-24 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-t">
    <div><h2 className="text-3xl font-black text-[#e65100] mb-8 uppercase tracking-tighter">Fresh is Best</h2><p className="text-sm font-bold">To God be the Glory!</p></div>
    <div><h3 className="font-black uppercase mb-4">Location</h3><p className="text-sm font-medium">Stall 11, Maria Aurora Public Market</p></div>
    <div><h3 className="font-black uppercase mb-4">Contact</h3><p className="text-sm font-medium">fresh@cedjek.com<br/>+63 (961) 842 0618</p></div>
  </footer>
);

// --- VIEWS ---
const AboutView = () => (
  <div className="pt-24 min-h-screen bg-[#eae6e1]">
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="px-8 md:px-16 py-12 md:py-24 text-[#4a3424]">
        <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase">Who are we?</h1>
        <p className="font-medium mb-12 text-sm leading-relaxed">Quality ingredients are the heart of a great menu. At Ced Jek, we specialize in delivering farm-fresh pork directly to local businesses in Maria Aurora, Aurora.</p>
        <h2 className="text-2xl font-black mb-4">OUR ROOTS & COMMITMENT</h2>
        <p className="text-sm mb-12">Established in 2021, we have built our reputation on a transparent and reliable supply chain.</p>
      </div>
      <div className="h-64 lg:h-auto overflow-hidden"><img src="/about-photo.jpg" className="w-full h-full object-cover" /></div>
    </div>
    <div className="bg-[#c2bdc6] p-8 md:p-16"><h2 className="text-4xl font-black mb-6 uppercase">Partner with us?</h2><Form showNewsletter={true} /></div>
  </div>
);

const ProductsView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [recipe, setRecipe] = useState('');
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGetRecipe = async (productName) => {
    setLoadingRecipe(true); setRecipe('');
    const result = await generateWithGemini(`Write a short mouth-watering recipe using ${productName}. Under 150 words.`);
    setRecipe(result); setLoadingRecipe(false);
  };

  const handleAskAiButcher = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true); setAiRecommendation('');
    const result = await generateWithGemini(`A customer says: "${aiQuery}". Recommend one pork cut and explain why in 2 sentences.`);
    setAiRecommendation(result); setLoadingAi(false);
  };

  const renderDetails = () => {
    const product = PRODUCTS_DATA[selectedProduct];
    return (
      <div className="max-w-4xl px-8 md:px-16 py-12 text-[#4a3424]">
        <button onClick={() => setSelectedProduct(null)} className="text-sm font-bold mb-12 hover:text-[#e65100]">← Back to Offerings</button>
        <h1 className="text-3xl font-black mb-2">{product.name}</h1>
        <p className="text-lg font-bold mb-8">₱{product.price}.00 / kg</p>
        
        <div className="bg-[#e3ded9] p-6 rounded-2xl border-2 border-[#6c5545] mb-8">
           <h3 className="font-black text-lg flex items-center gap-2"><Sparkles className="text-[#e65100]"/> Need inspiration?</h3>
           <button onClick={() => handleGetRecipe(product.name)} disabled={loadingRecipe} className="mt-4 bg-[#e65100] text-white px-6 py-2 rounded-full text-xs font-bold">
             {loadingRecipe ? 'Cooking...' : '✨ Generate Recipe'}
           </button>
           {recipe && <p className="mt-4 text-sm bg-white p-4 rounded-xl">{recipe}</p>}
        </div>

        <button onClick={() => setOrderModalOpen(true)} className="bg-[#4a3424] text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-black">Order / Checkout Now</button>
        {isOrderModalOpen && <CheckoutModal product={product} isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} />}
      </div>
    );
  };

  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1]">
      {!selectedProduct ? (
        <div className="px-8 md:px-16 py-12 max-w-6xl mx-auto">
          <div className="bg-[#c2bdc6] p-8 rounded-3xl mb-12 shadow-sm">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2"><Sparkles className="text-[#e65100]"/> Ask the AI Butcher</h3>
            <div className="flex gap-4"><input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="What are you cooking today?" className="flex-1 bg-white rounded-full px-6 py-3 outline-none" />
            <button onClick={handleAskAiButcher} disabled={loadingAi} className="bg-[#4a3424] text-white px-8 rounded-full font-bold">{loadingAi ? '...' : 'Ask'}</button></div>
            {aiRecommendation && <p className="mt-4 p-4 bg-white rounded-xl text-sm font-medium">{aiRecommendation}</p>}
          </div>
          <div className="space-y-12">
            {Object.values(PRODUCTS_DATA).map(p => (
              <div key={p.id} className="flex flex-col md:flex-row justify-between border-b pb-8 cursor-pointer group" onClick={() => setSelectedProduct(p.id)}>
                <h2 className="text-3xl font-black group-hover:text-[#e65100] transition-colors">{p.name}</h2>
                <div className="text-right"><p className="font-bold">₱{p.price}/kg</p><p className="text-xs text-gray-500 underline">View Details</p></div>
              </div>
            ))}
          </div>
        </div>
      ) : renderDetails()}
    </div>
  );
};

const FAQView = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1] px-8 md:px-16">
      <h1 className="text-3xl font-black mb-12 uppercase">FAQ</h1>
      <div className="max-w-4xl space-y-4">
        {FAQ_DATA.map((item, index) => (
          <div key={index} className="border-b pb-4">
            <button onClick={() => setOpenIndex(index)} className="w-full text-left font-bold text-lg flex justify-between">
              {item.question} <span>{openIndex === index ? '-' : '+'}</span>
            </button>
            {openIndex === index && <p className="mt-2 text-sm text-gray-600">{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('about');
  return (
    <div className="min-h-screen font-sans bg-[#eae6e1]">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main>{currentView === 'about' && <AboutView />} {currentView === 'contact' && <div className="pt-32 p-16"><h1 className="text-4xl font-black mb-8 uppercase">Contact Us</h1><Form /></div>} {currentView === 'product-offerings' && <ProductsView />} {currentView === 'services' && <FAQView />}</main>
      <Footer />
    </div>
  );
}