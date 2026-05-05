import React, { useState } from 'react';
import { Menu, X, Plus, Minus, Sparkles, Loader2 } from 'lucide-react';

// --- GEMINI AI SETUP ---
const apiKey = ""; // You can put your Gemini API key here later!

const generateWithGemini = async (prompt) => {
  if (!apiKey) return "Please add your Gemini API Key to the code to use the AI features!";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  for (let attempt = 0; attempt < 5; attempt++) {
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
      if (attempt === 4) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
};

// --- DATA ---
const FAQ_DATA = [
  {
    question: "What services do you offer?",
    answer: "We specialize in bulk orders of primal cuts, specialty custom cuts, and our signature house-blend longanisa. To support your business operations, we offer flexible fulfillment options including door-to-door delivery and scheduled in-store pick-ups at your convenience."
  },
  {
    question: "How do I get started?",
    answer: "Getting started is easy. Reach out through our contact form or schedule a call, and we'll guide you through our partnership process. For a more in-depth discussion, we are happy to coordinate an online consultation or a personal meeting at your convenience to answer all your questions."
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us anytime via our contact page or email. We aim to respond quickly—usually within one business day."
  },
  {
    question: "What's your pricing model?",
    answer: "At Ced Jek, we work with our partners to find pricing that works for everyone. We're all about great quality and honest service. Once we talk, we'll give you a clear price list with no extra charges, helping you keep your budget on track."
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
    price: 'Php 280.00',
    subtitle: 'Price starts at Php 280.00',
    details: ['Garlic', 'Spicy Garlic', 'Sweet']
  },
  specific: {
    id: 'specific',
    name: 'SPECIFIC CUTS',
    price: 'Php 350.00',
    subtitle: 'Price starts at Php 350.00 (Partners enjoy incentives and discounts)',
    sections: [
      {
        title: 'Pork Shoulder (Front)',
        items: [
          'Boston Butt (Blade Shoulder): The upper part of the shoulder, often sold as "butt" or "shoulder blade roast". It is well-marbled and the standard for pulled pork.',
          'Picnic Shoulder: The lower portion of the shoulder. It is tougher than the butt.',
          'Hock & Trotter: The lower leg (hock) and foot (trotter).'
        ]
      },
      {
        title: 'Pork Loin (Back)',
        items: [
          'Tenderloin: A small, very lean muscle running along the spine. It is the most tender cut and is best for quick roasting or grilling.',
          'Pork Chops: Sliced from the loin; they can be bone-in (rib chops) or boneless (loin chops).',
          'Baby Back Ribs: These come from the upper ribcage near the spine and are shorter and leaner than spare ribs.',
          'Sirloin & Roast: Larger lean sections used for whole roasts or medallions.'
        ]
      },
      {
        title: 'Pork Belly (Underside)',
        items: [
          'Bacon: The most famous use for the belly.',
          'Spare Ribs: Larger ribs taken from the belly side of the ribcage, meatier and fattier than baby backs.',
          'Pork Belly Strips: For Korean BBQ (Samgyeopsal) or braised Chinese-style dishes.'
        ]
      },
      {
        title: 'Pork Leg (Hind Quarter)',
        items: [
          'Ham: The whole leg.',
          'Pigue (Fresh Leg): meat from the hind leg.'
        ]
      }
    ]
  },
  primal: {
    id: 'primal',
    name: 'PRIMAL CUTS',
    price: 'Php 320.00',
    subtitle: 'Price starts at Php 320.00 (Partners enjoy incentives and discounts)',
    details: ['Blade shoulder, Arm Shoulder, Head, Loin Side, Spare Rib, Hock, Leg, Side']
  }
};

// --- COMPONENTS ---

const Form = ({ title, showNewsletter = false, onSubmitSuccess }) => {
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
    
    // 1. Paste your Google Script URL inside the quotes below!
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwnpxWharoic53E9DGcUHgglNXCib23zyFLN9UOaLgp7MmY0G7rIygsuU53onDdDk3g/exec'; 
    
    try {
      // 2. This packages up the form data and sends it to Google
      const formBody = new URLSearchParams(formData);
      await fetch(scriptURL, { 
        method: 'POST', 
        body: formBody,
        mode: 'no-cors' // This prevents browser security blocks
      });
      
      // 3. Show success message and clear the form
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', message: '', newsletter: false });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error('Error!', error.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl text-[#4a3424]">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">First Name <span className="text-gray-500 font-normal">(required)</span></label>
          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 focus:outline-none focus:border-[#4a3424] transition-colors" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">Last Name <span className="text-gray-500 font-normal">(required)</span></label>
          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 focus:outline-none focus:border-[#4a3424] transition-colors" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-1">Email <span className="text-gray-500 font-normal">(required)</span></label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-2 border-[#6c5545] rounded-full px-4 py-2 focus:outline-none focus:border-[#4a3424] transition-colors" />
      </div>
      {showNewsletter && (
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" name="newsletter" id="newsletter" checked={formData.newsletter} onChange={handleChange} className="w-4 h-4 accent-[#4a3424]" />
          <label htmlFor="newsletter" className="text-xs font-bold uppercase tracking-wide">SIGN UP FOR NEWS AND UPDATES</label>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-xs font-bold mb-1">Message <span className="text-gray-500 font-normal">(required)</span></label>
        <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-transparent border-2 border-[#6c5545] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#4a3424] transition-colors resize-none"></textarea>
      </div>
      
      {success ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded-full font-bold inline-block">
          Thank you! We've received your message.
        </div>
      ) : (
        <button type="submit" disabled={isSubmitting} className="bg-[#4a3424] text-white px-8 py-2 rounded-full font-bold uppercase tracking-wider hover:bg-[#322318] transition-colors disabled:opacity-50">
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      )}
    </form>
  );
};

const Header = ({ currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = ['About', 'Contact', 'Product Offerings', 'Services', 'Cart'];

  return (
    <header className="fixed w-full top-0 z-50 bg-[#eae6e1]/90 backdrop-blur-md px-6 py-4 flex justify-between items-center text-[#4a3424]">
      {/* Logo Area */}
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setCurrentView('about')}
      >
        {/* Make sure your file is named exactly logo.jpg and is inside the public folder */}
        <img src="/logo.jpg" alt="CedJek Logo" className="h-10 w-10 object-contain rounded-lg" />
        <span className="font-black text-xl tracking-widest hidden sm:block">CEDJEK</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-8 text-sm font-bold tracking-wide">
        {navItems.map(item => (
          <button 
            key={item} 
            onClick={() => setCurrentView(item.toLowerCase().replace(' ', '-'))}
            className={`hover:text-[#e65100] transition-colors ${currentView === item.toLowerCase().replace(' ', '-') ? 'border-b-2 border-[#4a3424] pb-1' : ''}`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Mobile Toggle */}
      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#eae6e1] border-t border-[#d5d0ca] py-4 flex flex-col items-center gap-4 md:hidden shadow-xl">
          {navItems.map(item => (
            <button 
              key={item} 
              onClick={() => {
                setCurrentView(item.toLowerCase().replace(' ', '-'));
                setMobileMenuOpen(false);
              }}
              className="font-bold text-lg hover:text-[#e65100]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-[#eae6e1] text-[#4a3424] pt-16 pb-24 px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#d5d0ca]">
    <div>
      <h2 className="text-3xl font-black text-[#e65100] tracking-wider mb-8">FRESH IS BEST</h2>
      <p className="text-sm font-bold">To God be the Glory!</p>
    </div>
    <div>
      <h3 className="font-black tracking-widest uppercase mb-4">Location</h3>
      <p className="text-sm font-medium leading-relaxed">
        Stall 11, Wet Market<br/>
        3202, Maria Aurora, Aurora Public<br/>
        Market
      </p>
    </div>
    <div>
      <h3 className="font-black tracking-widest uppercase mb-4">Contact</h3>
      <p className="text-sm font-medium leading-relaxed">
        fresh@cedjek.com<br/>
        +63 (961) 842 0618
      </p>
    </div>
  </footer>
);

// --- PAGE VIEWS ---

const AboutView = () => (
  <div className="pt-24 min-h-screen bg-[#eae6e1] flex flex-col">
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
      <div className="px-8 md:px-16 py-12 md:py-24 text-[#4a3424] max-w-2xl flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-wide leading-tight">WHO ARE WE?</h1>
        <p className="font-medium mb-12 text-sm leading-relaxed">
          Quality ingredients are the heart of a great menu. At Ced Jek, we specialize in delivering farm-fresh pork directly to local businesses in Maria Aurora, Aurora.
        </p>

        <h2 className="text-2xl font-black mb-4 tracking-wide">OUR ROOTS & COMMITMENT</h2>
        <p className="font-medium mb-12 text-sm leading-relaxed">
          Established in 2021, we have built our reputation on a transparent and reliable supply chain. As a business led by a former Pastor and a family of Agriculturist with deep roots in the local agricultural community, we understand the technical side of quality production and biosecurity. This expertise allows us to bridge the gap between safe, quality farming and your kitchen.
        </p>

        <h2 className="text-2xl font-black mb-4 tracking-wide">WHY PARTNER WITH US?</h2>
        <p className="font-medium text-sm leading-relaxed">
          Beyond our own production, we maintain a vast network of well-established piggery suppliers. This ensures that we can consistently meet your volume requirements while maintaining the standards you expect for your customers.
        </p>
      </div>
      <div className="h-64 lg:h-auto relative overflow-hidden">
        {/* Replace with your image name below */}
        <img 
          src="/about-photo.jpg" 
          alt="Butcher preparing meat" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
    
    <div className="bg-[#c2bdc6] text-[#4a3424] px-8 md:px-16 py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-wide leading-tight">PARTNER WITH US?</h2>
        <p className="font-medium mb-2 text-sm">We would love to visit your location and show you our product offerings firsthand.</p>
        <p className="font-medium mb-10 text-sm">We look forward to the possibility of a successful partnership!</p>
        <Form showNewsletter={true} />
      </div>
    </div>
  </div>
);

const ContactView = () => (
  <div className="pt-24 min-h-screen bg-[#eae6e1]">
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[80vh]">
      <div className="px-8 md:px-16 py-12 md:py-24 text-[#4a3424] flex flex-col justify-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-wide leading-tight">BE ONE OF OUR<br/>PARTNER?</h1>
        <p className="font-medium mb-12 text-sm">Tell us your needs and we'll deliver.</p>
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
  const [recipe, setRecipe] = useState('');
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGetRecipe = async (productName) => {
    setLoadingRecipe(true);
    setRecipe('');
    try {
      const prompt = `You are a master chef. Write a short, mouth-watering recipe idea using ${productName}. Keep it under 150 words. Format it simply without markdown.`;
      const result = await generateWithGemini(prompt);
      setRecipe(result);
    } catch (e) {
      setRecipe("Sorry, our AI chef is currently busy. Please try again later!");
    }
    setLoadingRecipe(false);
  };

  const handleAskAiButcher = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiRecommendation('');
    try {
      const prompt = `You are a helpful butcher at Ced Jek. A customer says: "${aiQuery}". Recommend ONE of our available products (Longanisa, Pork Shoulder, Pork Loin, Pork Belly, Pork Leg, Primal Cuts) that fits their needs best. Explain why in 2-3 sentences.`;
      const result = await generateWithGemini(prompt);
      setAiRecommendation(result);
    } catch (e) {
      setAiRecommendation("Sorry, our AI butcher is currently helping another customer.");
    }
    setLoadingAi(false);
  };

  const renderProductDetails = () => {
    const product = PRODUCTS_DATA[selectedProduct];
    if (!product) return null;

    return (
      <div className="max-w-4xl px-8 md:px-16 py-12 text-[#4a3424]">
        <div className="text-sm font-bold mb-12 flex gap-2">
          <button onClick={() => { setSelectedProduct(null); setRecipe(''); }} className="hover:text-[#e65100]">Product Offerings</button>
          <span>&gt;</span>
          <span>{product.name}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-wide">{product.name}</h1>
        <p className="text-lg font-bold mb-4">{product.price}</p>
        <p className="text-sm font-medium mb-8 text-gray-700">{product.subtitle}</p>

        {product.details && (
          <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
            {product.details.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {product.sections && (
          <div className="space-y-6">
            {product.sections.map((section, i) => (
              <div key={i}>
                <h3 className="font-bold text-sm mb-2">• {section.title}</h3>
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
        )}

        {/* AI Recipe Generator */}
        <div className="mt-12 bg-[#e3ded9] border-2 border-[#6c5545] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg tracking-wide flex items-center gap-2">
                 <Sparkles size={20} className="text-[#e65100]"/> Need cooking inspiration?
              </h3>
              <p className="text-xs font-medium text-gray-600 mt-1">Let our AI Chef generate a custom recipe for {product.name.toLowerCase()}.</p>
            </div>
            <button 
              onClick={() => handleGetRecipe(product.name)}
              disabled={loadingRecipe}
              className="flex items-center gap-2 bg-[#e65100] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#bf4300] transition-colors disabled:opacity-50 min-w-[140px] justify-center"
            >
              {loadingRecipe ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {loadingRecipe ? 'Cooking...' : '✨ Generate'}
            </button>
          </div>
          {recipe && (
            <div className="mt-4 text-sm font-medium leading-relaxed bg-white p-5 rounded-xl border border-[#d5d0ca] whitespace-pre-wrap">
              {recipe}
            </div>
          )}
        </div>

        <div className="mt-12">
          <button className="w-full max-w-sm bg-[#4a3424] text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#322318] transition-colors">
            {selectedProduct === 'primal' ? 'INQUIRE/ORDER' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    );
  };

  const renderListings = () => (
    <div className="px-8 md:px-16 py-12 max-w-6xl mx-auto text-[#4a3424]">
      
      {/* AI Butcher Matchmaker */}
      <div className="bg-[#c2bdc6] p-8 rounded-3xl mb-16 shadow-md relative overflow-hidden">
         <div className="relative z-10">
           <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
             <Sparkles className="text-[#e65100]" /> 
             Ask our AI Butcher ✨
           </h3>
           <p className="text-sm font-medium mb-6 text-gray-800">Not sure what cut to get? Tell us what dish you're making or what you're craving, and we'll recommend the perfect cut.</p>
           <div className="flex flex-col sm:flex-row gap-4">
             <input 
               type="text" 
               value={aiQuery}
               onChange={(e) => setAiQuery(e.target.value)}
               placeholder="e.g., I want to make a slow-cooked stew..." 
               className="flex-1 bg-white border-2 border-[#6c5545] rounded-full px-6 py-3 focus:outline-none focus:border-[#4a3424] transition-colors shadow-inner"
             />
             <button 
               onClick={handleAskAiButcher}
               disabled={loadingAi || !aiQuery}
               className="bg-[#4a3424] text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#322318] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
             >
               {loadingAi ? <Loader2 className="animate-spin" size={20} /> : 'Ask AI ✨'}
             </button>
           </div>
           {aiRecommendation && (
             <div className="mt-6 bg-white p-5 rounded-2xl border-l-4 border-[#e65100] text-sm font-medium shadow-sm leading-relaxed">
               {aiRecommendation}
             </div>
           )}
         </div>
      </div>

      <div className="flex gap-4 mb-16 text-sm font-bold border-b border-[#d5d0ca] pb-2">
        <span className="text-[#4a3424]">Cuts</span>
        <span className="text-gray-400">|</span>
        <span className="text-[#4a3424]">Longanisa</span>
      </div>

      <div className="space-y-16">
        {/* Longanisa Item */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 cursor-pointer group" onClick={() => setSelectedProduct('longanisa')}>
          <h2 className="text-2xl font-black uppercase tracking-wide md:w-1/4 group-hover:text-[#e65100] transition-colors">LONGANISA</h2>
          <div className="md:w-2/4">
             <p className="text-xs font-bold text-gray-500 mb-2">{PRODUCTS_DATA.longanisa.subtitle}</p>
             <ul className="list-disc pl-4 text-sm font-medium space-y-1">
               <li>Garlic</li>
               <li>Spicy Garlic</li>
               <li>Sweet...</li>
             </ul>
          </div>
          <div className="md:w-1/4 text-right font-bold text-sm">
            {PRODUCTS_DATA.longanisa.price}
          </div>
        </div>

        {/* Specific Cuts Item */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 cursor-pointer group" onClick={() => setSelectedProduct('specific')}>
          <h2 className="text-2xl font-black uppercase tracking-wide md:w-1/4 group-hover:text-[#e65100] transition-colors">SPECIFIC CUTS</h2>
          <div className="md:w-2/4">
             <p className="text-xs font-bold text-gray-500 mb-2">{PRODUCTS_DATA.specific.subtitle}</p>
             <ul className="list-disc pl-4 text-sm font-medium space-y-2">
               <li>Pork Shoulder (Front)
                 <ul className="pl-4 mt-1 text-gray-600 space-y-1 list-circle">
                   <li>Boston Butt (Blade Shoulder): The upper part of the shoulder, often sold as "butt" or "shoulder blade roast". It is well-marbled and the standard for pulled pork...</li>
                 </ul>
               </li>
             </ul>
             <span className="text-xs font-bold underline mt-4 inline-block hover:text-[#e65100]">Learn More</span>
          </div>
          <div className="md:w-1/4 text-right font-bold text-sm">
            {PRODUCTS_DATA.specific.price}
          </div>
        </div>

        {/* Primal Cuts Item */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 cursor-pointer group" onClick={() => setSelectedProduct('primal')}>
          <h2 className="text-2xl font-black uppercase tracking-wide md:w-1/4 group-hover:text-[#e65100] transition-colors">PRIMAL CUTS</h2>
          <div className="md:w-2/4">
             <p className="text-xs font-bold text-gray-500 mb-2">{PRODUCTS_DATA.primal.subtitle}</p>
             <ul className="list-disc pl-4 text-sm font-medium">
               <li>Blade shoulder, Arm Shoulder, Head, Loin Side, Spare Rib, Hock, Leg, Side</li>
             </ul>
          </div>
          <div className="md:w-1/4 text-right font-bold text-sm">
            {PRODUCTS_DATA.primal.price}
          </div>
        </div>
      </div>
      
      {/* Decorative Wave */}
      <div className="w-full h-24 mt-24 border-t-2 border-[#4a3424] rounded-[100%] rounded-b-none translate-y-12"></div>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1]">
      {!selectedProduct && (
        <div className="relative h-64 md:h-80 overflow-hidden bg-black">
          {/* Replace with your image name below */}
          <img 
            src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=1200" 
            alt="Pork Cuts" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-5xl font-black tracking-widest uppercase px-4 text-center">CHOOSE YOUR CUTS OR PRODUCT</h1>
          </div>
        </div>
      )}
      
      {selectedProduct ? renderProductDetails() : renderListings()}
    </div>
  );
};

const FAQView = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="pt-24 min-h-screen bg-[#eae6e1]">
      <div className="px-8 md:px-16 py-12 md:py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 text-[#4a3424]">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-12 tracking-wide">FREQUENTLY ASKED QUESTIONS</h1>
        </div>
        
        <div className="flex flex-col border-t border-[#d5d0ca]">
          {FAQ_DATA.map((item, index) => (
            <div key={index} className="border-b border-[#d5d0ca]">
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center py-4 text-left font-bold text-sm hover:text-[#e65100] transition-colors"
              >
                {item.question}
                {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-sm font-medium leading-relaxed pr-8">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 md:px-16 py-12 md:py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 text-[#4a3424]">
        <div>
          <h2 className="text-3xl font-black mb-4 tracking-wide">HAVE QUESTIONS?</h2>
          <p className="font-medium text-sm">We'll review your message and get back to you within 48 hours.</p>
        </div>
        <div>
           <Form showNewsletter={false} />
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentView, setCurrentView] = useState('about');

  const renderView = () => {
    switch (currentView) {
      case 'about': return <AboutView />;
      case 'contact': return <ContactView />;
      case 'product-offerings': return <ProductsView />;
      case 'services': return <FAQView />;
      case 'cart': return <div className="pt-32 px-16 min-h-screen text-center text-xl font-bold text-[#4a3424]">Cart is currently empty.</div>;
      default: return <AboutView />;
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#e65100] selection:text-white">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main>
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}