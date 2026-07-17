import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types.ts';
import { ChevronLeft, ChevronRight, Clock, Flame, ShoppingBag, Star } from 'lucide-react';

// ==========================================
// CUSTOM TYPE INHERITANCE / EXTENSIONS
// ==========================================

/**
 * DealProduct extends our baseline Product type.
 * It decorates the data with deal-specific parameters:
 * - originalPrice: to show the marked down saving.
 * - discountPercentage: to render eye-catching visual tags.
 * - initialHours: reference parameter to map remaining duration ratios.
 */
interface DealProduct extends Product {
  originalPrice: number;
  discountPercentage: number;
  initialHours: number;
}

// ==========================================
// CURATED LIMITED-EDITION DEALS SEED
// ==========================================

const DEALS_PRODUCTS: DealProduct[] = [
  {
    id: 'deal-1',
    name: 'AURA Vision One MR',
    description: 'Ultra-exclusive mixed reality glasses featuring dual micro-OLED 4K optics, bio-sync focus tracking, and ambient immersive audio.',
    price: 629.99,
    originalPrice: 899.99,
    discountPercentage: 30,
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80',
    category: 'Lifestyle',
    stock: 5,
    rating: 4.9,
    reviewsCount: 18,
    initialHours: 1.75 // 1 hour 45 minutes
  },
  {
    id: 'deal-2',
    name: 'AURA Soundwave Titanium',
    description: 'Pure audiophile class-A wireless soundbar forged from acoustic titanium, featuring active spatial beamforming and self-tuning room metrics.',
    price: 337.50,
    originalPrice: 450.00,
    discountPercentage: 25,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80',
    category: 'Audio',
    stock: 8,
    rating: 4.8,
    reviewsCount: 32,
    initialHours: 3.2 // 3 hours 12 minutes
  },
  {
    id: 'deal-3',
    name: 'AURA Helios Forged Carbon',
    description: 'Ultra-lightweight power bank built with forged carbon fiber and a deployable ultra-slim solar power fabric canopy.',
    price: 102.00,
    originalPrice: 120.00,
    discountPercentage: 15,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&q=80',
    category: 'Accessories',
    stock: 14,
    rating: 4.7,
    reviewsCount: 22,
    initialHours: 5.8 // 5 hours 48 minutes
  },
  {
    id: 'deal-4',
    name: 'AURA Spectra Eyewear',
    description: 'Precision augmented smart glasses with integrated navigation micro-display HUD and discrete bone-conduction acoustics.',
    price: 280.00,
    originalPrice: 350.00,
    discountPercentage: 20,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    category: 'Wearables',
    stock: 4,
    rating: 4.9,
    reviewsCount: 15,
    initialHours: 8.4 // 8 hours 24 minutes
  }
];

interface DealsSliderProps {
  onProductClick?: (product: Product) => void;
}

// ==========================================
// WIDGET EXPORT: DEALS SLIDER CAROUSEL
// ==========================================

export default function DealsSlider({ onProductClick }: DealsSliderProps) {
  // 1. global state context hooks
  const { addToCart } = useStore();
  
  // 2. React Reference Hook: Allows us to trigger smooth custom scrolling on the HTML DOM node.
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // 3. React State Hook: Tracks remaining seconds for each deal to create high-precision ticking countdowns.
  const [remainingTimes, setRemainingTimes] = useState<number[]>(
    DEALS_PRODUCTS.map(p => Math.floor(p.initialHours * 3600))
  );

  // 4. Live Clock Ticker Effect Hook (useEffect)
  // Initiates a background setInterval that subtracts 1 second every 1000 milliseconds.
  // Cleans up on unmount to prevent severe memory leaks.
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes(prevTimes => 
        prevTimes.map(time => (time > 0 ? time - 1 : Math.floor(12 * 3600))) // resets to 12h once expired
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 5. Custom Snap Carousel Controller
  // Programmatically scrolls the slide deck by cards width increments.
  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340; // Card width + layout gap
      const currentScroll = sliderRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      sliderRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // 6. Time Format Utilities
  // Converts flat integers of raw seconds into an elegant object of string pairs (HH, MM, SS).
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return {
      hours: String(hrs).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };
  };

  return (
    <div id="deals-vault-slider" className="space-y-6">
      
      {/* SECTION HEADER: TIMED ACQUISITIONS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Pulsing decoration icon represents a ticking clock/live deal state */}
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200 animate-pulse text-brand-600">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-950 font-sans">
                AURA Timed Acquisitions
              </h2>
              <span className="bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Live
              </span>
            </div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
              Exquisite rare masterpieces, discounted until strict countdown expiry.
            </p>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full border border-brand-200 bg-white hover:bg-brand-50 text-stone-600 hover:text-brand-950 flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95"
            aria-label="Previous Deal"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full border border-brand-200 bg-white hover:bg-brand-50 text-stone-600 hover:text-brand-950 flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95"
            aria-label="Next Deal"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL TRACK WITH CSS SNAPS */}
      <div 
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-none pb-4 px-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {DEALS_PRODUCTS.map((product, index) => {
          const secondsLeft = remainingTimes[index] || 0;
          const formatted = formatTime(secondsLeft);
          const maxInitialSeconds = Math.floor(product.initialHours * 3600);
          
          // Calculate high-precision progress percentages for our visual timers
          const progressPercent = Math.max(0, Math.min(100, (secondsLeft / maxInitialSeconds) * 100));

          return (
            <div 
              key={product.id}
              className="flex-shrink-0 w-[300px] sm:w-[325px] snap-start bg-white rounded-3xl border border-brand-200 p-5 shadow-sm space-y-4 hover:border-brand-400 transition-all group flex flex-col relative overflow-hidden"
            >
              {/* Image Frame with full zoom feedback */}
              <div 
                onClick={() => onProductClick?.(product)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-brand-50/50 border border-brand-100 flex-shrink-0 cursor-pointer"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Sale Tag Indicator */}
                <div className="absolute top-3 left-3 bg-brand-950 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <span>{product.discountPercentage}% OFF</span>
                </div>
                
                {/* Stock Warning Overlay */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[9px] font-bold text-stone-700 px-2 py-0.5 rounded-md border border-brand-100">
                  Only {product.stock} units
                </div>
              </div>

              {/* LIVE TIMER COUNTDOWN WIDGET */}
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-brand-950 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                    <span>Countdown Expiry</span>
                  </div>
                  <span className="font-mono text-brand-700">
                    {formatted.hours}:{formatted.minutes}:{formatted.seconds}
                  </span>
                </div>
                
                {/* Smooth micro progress indicator bar */}
                <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* PRODUCT INFO PANEL */}
              <div 
                onClick={() => onProductClick?.(product)}
                className="space-y-1.5 flex-grow cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-brand-950 uppercase tracking-wide font-sans leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-brand-100/50 px-1.5 py-0.5 rounded-md border border-brand-100 flex-shrink-0 text-[10px] text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{product.rating}</span>
                  </div>
                </div>
                <p className="text-[10.5px] text-stone-500 leading-relaxed font-sans line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* PRICING MATRIX & QUICK-BAG ACTION */}
              <div className="flex items-center justify-between pt-3 border-t border-brand-100 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 line-through font-mono">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-extrabold text-brand-950 font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-950 hover:bg-brand-800 text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95 group-hover:bg-brand-500"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Claim Deal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
