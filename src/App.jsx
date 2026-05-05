import React, { useState } from 'react';
import { Menu, X, Plus, Minus, Sparkles, Loader2, ShoppingCart, MapPin, Phone, Calendar } from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = ""; // Add your Gemini API key here
const INQUIRY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnpxWharoic53E9DGcUHgglNXCib23zyFLN9UOaLgp7MmY0G7rIygsuU53onDdDk3g/exec'; 
const ORDERS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwj1xFTHEen8qZiz-EnzIA5vvGXfbKicOMwnRHVLsEi/dev';

// --- GEMINI AI HELPER (with Restored Retry Logic) ---
const generateWithGemini = async (prompt) => {
  if (!apiKey) return "Please add your Gemini API Key to use the AI features!";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (attempt === 2) return "Our AI is currently busy. Please try again in a moment.";
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
};

// --- DATA ---
const FAQ_DATA = [
  {
    question: "What services do you offer?",
    answer: "We specialize in bulk orders of primal cuts, specialty custom cuts, and our signature house-blend longanisa. We offer flexible fulfillment options including door-to-door delivery and scheduled in-store pick-ups."
  },
  {
    question: "How do I get started?",
    answer: "Reach out through our contact form or schedule a call, and we'll guide you through our partnership process. For in-depth discussion, we can coordinate online consultations or personal meetings."
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us anytime via our contact page or email. We aim to respond quickly—usually within one business day."
  },
  {
    question: "What's your pricing model?",
    answer: "At Ced Jek, we work with our partners to find pricing that works for everyone. Once we talk, we'll give you a clear price list with no extra charges."
  },
  {
    question: "What's it like to work with you?",
    answer: "Collaborative, honest, and straightforward. We're here to guide the process, bring ideas to the table, and keep things moving."
  }
];

const PRODUCTS_DATA = {
  longanisa: {
    id: 'longanisa',
    name: 'LONGANISA',
    price: 280,
    subtitle: 'Price starts at Php 280.00',
    options: ['Garlic', 'Spicy Garlic', 'Sweet'],
    details: ['Garlic', 'Spicy Garlic', 'Sweet']
  },
  specific: {
    id: 'specific',
    name: 'SPECIFIC CUTS',
    price: 350,
    subtitle: 'Price starts at Php 350.00 (Partners enjoy incentives and discounts)',
    options: ['Pork Shoulder', 'Pork Loin', 'Pork Belly', 'Pork Leg'],
    sections: [
      {
        title: 'Pork Shoulder (Front)',
        items: [
          'Boston Butt (Blade Shoulder): The upper part of the shoulder, well-marbled and the standard for pulled pork.',
          'Picnic Shoulder: The lower portion of the shoulder. Tougher than the butt.',
          'Hock & Trotter: The lower leg (hock) and foot (trotter).'
        ]
      },
      {
        title: 'Pork Loin (Back)',
        items: [
          'Tenderloin: A small, very lean muscle. Most tender cut.',
          'Pork Chops: Sliced from the loin; bone-in or boneless.',
          'Baby Back Ribs: Shorter and leaner than spare ribs.'
        ]
      },
      {
        title: 'Pork Belly (Underside)',
        items: [
          'Bacon: The most famous use for the belly.',
          'Spare Ribs: Meatier and fattier than baby backs.',
          'Pork Belly Strips: Perfect for Samgyeopsal or braised dishes.'
        ]
      }
    ]
  },
  primal: {
    id: 'primal',
    name: 'PRIMAL CUTS',
    price: 320,
    subtitle: 'Price starts at Php 320.00 (Partners enjoy incentives and discounts)',
    options: ['Whole Blade', 'Arm Shoulder', 'Full Loin', 'Full Side'],
    details: ['Blade shoulder, Arm Shoulder, Head, Loin Side, Spare Rib, Hock, Leg, Side']
  }
};

// --- COMPONENTS ---

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
            <p className="text-gray-500 mt-2 text-sm font-bold">Check your SMS or Email for confirmation shortly.</p>
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
              <input required placeholder="Full Name" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100] font-medium" onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input required placeholder="Contact Number" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100] font-medium" onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              {formData.fulfillmentType === 'Delivery' ? (
                <input required placeholder="Complete Delivery Address" className="w-full bg-gray-50 rounded-xl px-5 py-3 outline-[#e65100] font-medium" onChange={e => setFormData({...formData, address: e.target.value})} />
              ) : (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-[11px] font-bold text-[#4a3424]">Pickup at: Stall 11, Maria Aurora Public Market</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Qty (kg)</label>
                  <input type="number" min="1" value={formData.quantity} className="w-full bg-transparent font-bold outline-none" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <label className="text-[9px] font-black block text-gray-400 uppercase">Preference</label>
                  <select className="w-full bg-transparent font-bold outline-none" onChange={e => setFormData({...formData, cutType: e.target.value})}>
                    {product.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                <input type="time" required className="bg-gray-50 p-3 rounded-xl text-sm font-bold" onChange={e => setFormData({...formData, deliveryTime: e.target.value})} />
              </div>
              <select className="w-full bg-gray-50 rounded-xl px-5 py-3 font-bold text-sm outline-none" onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option>Cash on {formData.fulfillmentType}</option>
                <option>GCash</option>
                <option>Online Banking</option>
              </select>
            </div>
            <div className="pt-6 border-t flex items-center justify-between">
               <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Amount</p><p className="text-2xl font-black text-[#e65100]">₱{(product.price * formData.quantity).toLocaleString()}</p></div>
               <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-black transition-colors">
                 {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Place Order'}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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
          <label className="block text-xs font-bold mb-1">First Name <span className="text-gray-500 font-normal">(required)</span></label>
          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 outline-none focus:border-[#4a3424]" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">Last Name <span className="text-gray-500 font-normal">(required)</span></label>
          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 outline-none focus:border-[#4a3424]" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-1">Email <span className="text-gray-500 font-normal">(required)</span></label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 outline-none focus:border-[#4a3424]" />
      </div>
      {showNewsletter && (
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" name="newsletter" id="newsletter" checked={formData.newsletter} onChange={handleChange} className="accent-[#4a3424]" />
          <label htmlFor="newsletter" className="text-xs font-bold uppercase">SIGN UP FOR NEWS AND UPDATES</label>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-xs font-bold mb-1">Message <span className="text-gray-500 font-normal">(required)</span></label>
        <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-transparent border-2 border-[#6c5545] rounded-2xl px-4 py-3 resize-none outline-none focus:border-[#4a3424]"></textarea>
      </div>
      {success ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-full font-bold inline-block">Thank you! We've received your message.</div>
      ) : (
        <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-black transition-colors">
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      )}
    </form>
  );
};

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
          <button key={item} onClick={() => setCurrentView(item.toLowerCase().replace(' ', '-'))} className={`hover:text-[#e65100] transition-colors ${currentView === item.toLowerCase().replace(' ', '-') ? 'border-b-2 border-[#4a3424] pb-1' : ''}`}>{item}</button>
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
  <footer className="bg-[#eae6e1] text-[#4a3424] pt-16 pb-24 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#d5d0ca]">
    <div><h2 className="text-3xl font-black text-[#e65100] mb-8 uppercase tracking-tighter">Fresh is Best</h2><p className="text-sm font-bold">To God be the Glory!</p></div>
    <div><h3 className="font-black uppercase mb-4 tracking-widest">Location</h3><p className="text-sm font-medium leading-relaxed">Stall 11, Wet Market<br/>3202, Maria Aurora, Aurora Public Market</p></div>
    <div><h3 className="font-black uppercase mb-4 tracking-widest">Contact</h3><p className="text-sm font-medium leading-relaxed">fresh@cedjek.com<br/>+63 (961) 842 0618</p></div>
  </footer>
);

// --- VIEWS ---

const AboutView = () => (
  <div className="pt-24 min-h-screen bg-[#eae6e1] flex flex-col">
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
      <div className="px-8 md:px-16 py-12 md:py-24 text-[#4a3424] max-w-2xl flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-wide">Who are we?</h1>
        <p className="font-medium mb-12 text-sm leading-relaxed">Quality ingredients are the heart of a great menu. At Ced Jek, we specialize in delivering farm-fresh pork directly to local businesses in Maria Aurora, Aurora.</p>
        <h2 className="text-2xl font-black mb-4 tracking-wide uppercase">Our Roots & Commitment</h2>
        <p className="text-sm font-medium mb-12 leading-relaxed"> Established in 2021, we have built our reputation on a transparent and reliable supply chain. As a business led by a former Pastor and a family of Agriculturist with deep roots in the local agricultural community, we understand the technical side of quality production and biosecurity. This expertise allows us to bridge the gap between safe, quality farming and your kitchen.</p>
         <h2 className="text-2xl font-black mb-4 tracking-wide">WHY PARTNER WITH US?</h2>
        <p className="font-medium text-sm leading-relaxed">
          Beyond our own production, we maintain a vast network of well-established piggery suppliers. This ensures that we can consistently meet your volume requirements while maintaining the standards you expect for your customers.
        </p>
      </div>
      
      <div className="h-64 lg:h-auto relative overflow-hidden"><img src="/11.jpg" alt="About" className="absolute inset-0 w-full h-full object-cover" /></div>
    </div>
    <div className="bg-[#c2bdc6] px-8 md:px-16 py-16"><h2 className="text-4xl font-black mb-6 uppercase">Partner with us?</h2>  
    
    <p className="font-medium mb-2 text-sm">We would love to visit your location and show you our product offerings firsthand.

    </p> <Form showNewsletter={true} />

    </div>

  </div>

);
const ContactView = () => (
  <div className="pt-24 min-h-screen bg-[#eae6e1]">
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[80vh]">
      <div className="px-8 md:px-16 py-12 md:py-24 text-[#4a3424] flex flex-col justify-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-wide leading-tight">BE ONE OF OUR PARTNER?</h1> <p 
        className="font-medium mb-12 text-sm">Tell us your needs and we'll deliver.</p>
        <Form showNewsletter={false} />
      </div>
      <div className="h-64 lg:h-auto relative">
        <img 
          src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1000" 
          alt="Farm fresh pigs" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
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
    const result = await generateWithGemini(`You are a master chef. Write a short, mouth-watering recipe idea using ${productName}. Keep it under 150 words. No markdown.`);
    setRecipe(result); setLoadingRecipe(false);
  };

  const handleAskAiButcher = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true); setAiRecommendation('');
    const result = await generateWithGemini(`You are a helpful butcher at Ced Jek. A customer says: "${aiQuery}". Recommend ONE available product (Longanisa, Pork Shoulder, Pork Loin, Pork Belly, Pork Leg) and explain why in 2 sentences.`);
    setAiRecommendation(result); setLoadingAi(false);
  };

  const renderDetails = () => {
    const product = PRODUCTS_DATA[selectedProduct];
    return (
      <div className="max-w-4xl px-8 md:px-16 py-12 text-[#4a3424]">
        <button onClick={() => { setSelectedProduct(null); setRecipe(''); }} className="text-sm font-bold mb-12 hover:text-[#e65100]">← Back to Offerings</button>
        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-wide">{product.name}</h1>
        <p className="text-lg font-bold mb-4">₱{product.price}.00 / kg</p>
        <p className="text-sm font-medium mb-8 text-gray-700">{product.subtitle}</p>

        {/* RESTORED PRODUCT SPECS */}
        {product.sections ? (
          <div className="space-y-6 mb-12">
            {product.sections.map((section, i) => (
              <div key={i}>
                <h3 className="font-bold text-sm mb-2 uppercase">• {section.title}</h3>
                <ul className="list-none pl-6 space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-700 relative before:content-['∘'] before:absolute before:-left-4 before:top-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : product.details && (
          <ul className="list-disc pl-5 space-y-2 text-sm font-medium mb-12">
            {product.details.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
        
        {/* AI RECIPE SECTION */}
        <div className="bg-[#e3ded9] p-6 rounded-2xl border-2 border-[#6c5545] mb-12 shadow-sm">
           <h3 className="font-black text-lg flex items-center gap-2"><Sparkles className="text-[#e65100]"/> Need cooking inspiration?</h3>
           <p className="text-xs font-medium text-gray-600 mt-1">Let our AI Chef generate a custom recipe for this product.</p>
           <button onClick={() => handleGetRecipe(product.name)} disabled={loadingRecipe} className="mt-4 flex items-center gap-2 bg-[#e65100] text-white px-6 py-2 rounded-full text-xs font-bold uppercase transition-colors hover:bg-[#bf4300] disabled:opacity-50">
             {loadingRecipe ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
             {loadingRecipe ? 'Cooking...' : 'Generate Recipe'}
           </button>
           {recipe && <div className="mt-4 text-sm bg-white p-5 rounded-xl border border-[#d5d0ca] whitespace-pre-wrap">{recipe}</div>}
        </div>

        <button onClick={() => setOrderModalOpen(true)} className="bg-[#4a3424] text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg">Order / Checkout Now</button>
        {isOrderModalOpen && <CheckoutModal product={product} isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} />}
      </div>
    );
  };

  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1]">
      {!selectedProduct ? (
        <>
          <div className="relative h-64 md:h-80 overflow-hidden bg-black">
            <img src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=1200" alt="Cuts" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center"><h1 className="text-white text-3xl md:text-5xl font-black tracking-widest uppercase text-center px-4">Choose Your Product</h1></div>
          </div>

          <div className="px-8 md:px-16 py-12 max-w-6xl mx-auto">
            {/* AI BUTCHER */}
            <div className="bg-[#c2bdc6] p-8 rounded-3xl mb-16 shadow-md">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><Sparkles className="text-[#e65100]"/> Ask our AI Butcher ✨</h3>
              <p className="text-sm font-medium mb-6 text-gray-800">Tell us what you're cooking, and we'll recommend the perfect cut.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="e.g., I want to make a slow-cooked stew..." className="flex-1 bg-white border-2 border-[#6c5545] rounded-full px-6 py-3 outline-none" />
                <button onClick={handleAskAiButcher} disabled={loadingAi || !aiQuery} className="bg-[#4a3424] text-white px-8 py-3 rounded-full font-bold uppercase transition-colors hover:bg-black disabled:opacity-50 min-w-[120px]">
                  {loadingAi ? <Loader2 className="animate-spin" size={20} /> : 'Ask AI'}
                </button>
              </div>
              {aiRecommendation && <div className="mt-6 bg-white p-5 rounded-2xl border-l-4 border-[#e65100] text-sm font-medium shadow-sm">{aiRecommendation}</div>}
            </div>

            <div className="space-y-16">
              {Object.values(PRODUCTS_DATA).map(p => (
                <div key={p.id} className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-[#d5d0ca] pb-12 cursor-pointer group" onClick={() => setSelectedProduct(p.id)}>
                  <h2 className="text-3xl font-black group-hover:text-[#e65100] transition-colors uppercase tracking-tight">{p.name}</h2>
                  <div className="md:w-2/4">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">{p.subtitle}</p>
                    <p className="text-sm font-medium underline group-hover:text-[#e65100]">View Pricing & Cut Details</p>
                  </div>
                  <div className="md:w-1/4 text-right font-black text-lg">₱{p.price}.00/kg</div>
                </div>
              ))}
            </div>
            {/* DECORATIVE WAVE */}
            <div className="w-full h-24 mt-24 border-t-2 border-[#4a3424] rounded-[100%] rounded-b-none translate-y-12"></div>
          </div>
        </>
      ) : renderDetails()}
    </div>
  );
};

const FAQView = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1] px-8 md:px-16">
      <div className="max-w-6xl mx-auto py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl font-black mb-12 uppercase tracking-wide">
            FAQ
          </h1>
        </div>
        <div className="border-t border-[#d5d0ca]">
          {FAQ_DATA.map((item, index) => ( 
            <div key={index} className="border-b border-[#d5d0ca]">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)} 
                className="w-full text-left py-6 font-bold text-sm flex justify-between hover:text-[#e65100]"
              >
                {item.question} 
                <span>{openIndex === index ? <Minus size={16}/> : <Plus size={16}/>}</span>
              </button>
              {openIndex === index && (
                <div className="pb-6 text-sm font-medium text-gray-700 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Restored the bottom form section */}
      <div className="max-w-6xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-black mb-4 uppercase">Have Questions?</h2>
          <p className="font-medium text-sm">We'll get back to you within 48 hours.</p>
        </div>
        <Form />
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentView, setCurrentView] = useState('about');
  return (
    <div className="min-h-screen font-sans bg-[#eae6e1] selection:bg-[#e65100] selection:text-white">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main>
        {currentView === 'about' && <AboutView />}
        {currentView === 'contact' && <ContactView />}
        {currentView === 'product-offerings' && <ProductsView />}
        {currentView === 'services' && <FAQView />}
      </main>
      <Footer />
    </div>
  );
}