import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, ArrowLeft, Heart, Send, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

// ==========================================
// INTERFACE CONTRACTS & DATA CONVENTIONS
// ==========================================

/**
 * ProductDetailProps defines the strict typed contract for our widget.
 * It takes the selected `product` object and a reactive `onBack` callback 
 * which handles popping this view off the navigation stack.
 */
interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

/**
 * Review shape represents the data model for user-generated feedback.
 * Note the `verified` boolean, which lets us visually reward authenticated users.
 */
interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

/**
 * Colorway Options for custom variation selection.
 * We pair names with tailwind backgrounds for responsive rendering of interactive swatches.
 */
const COLOR_OPTIONS = [
  { name: 'Obsidian Black', value: '#1a1a1a', tailwindBg: 'bg-stone-900' },
  { name: 'Satin Titanium', value: '#b5b5b5', tailwindBg: 'bg-stone-400' },
  { name: 'Champagne Sand', value: '#e8dec9', tailwindBg: 'bg-amber-100' },
  { name: 'Acoustic Crimson', value: '#8a1f1f', tailwindBg: 'bg-rose-900' }
];

// ==========================================
// SEEDED REVIEWS DATA ENGINE
// ==========================================

/**
 * A seed generator function that yields highly descriptive, contextual review threads
 * based on the product ID. This creates high-fidelity UX that isn't just generic dummy text.
 */
const getSeededReviews = (productId: string, productName: string): Review[] => {
  const reviewsMap: Record<string, Review[]> = {
    'deal-1': [
      { id: 'r1', name: 'Alasdair Sterling', rating: 5, comment: 'The Micro-OLED optics are completely peerless. There is zero latency, and the bio-sync focus tracking feels like absolute magic.', date: 'July 14, 2026', verified: true },
      { id: 'r2', name: 'Helena Vance', rating: 5, comment: 'Absolutely spectacular craftsmanship. The premium travel case is also beautifully designed.', date: 'June 28, 2026', verified: true },
      { id: 'r3', name: 'Marcus Brody', rating: 4, comment: 'Slightly heavy after 3 hours of continuous use, but the spatial depth is mindblowing.', date: 'May 19, 2026', verified: false }
    ],
    'deal-2': [
      { id: 'r1', name: 'Saskia Croft', rating: 5, comment: 'I’ve tested countless soundbars, but none have this acoustic transparency. The room calibration creates a true 3D dome of pure sound.', date: 'July 15, 2026', verified: true },
      { id: 'r2', name: 'Devon Keats', rating: 4, comment: 'Beautiful titanium texture. Bass is punchy and extremely tight, though setting up the app sync took me a few minutes.', date: 'July 02, 2026', verified: true }
    ],
    'deal-3': [
      { id: 'r1', name: 'Valerie Thorne', rating: 5, comment: 'Incredibly lightweight and rugged. The solar charging fabric is very responsive even in filtered light.', date: 'July 11, 2026', verified: true },
      { id: 'r2', name: 'Julian Cross', rating: 4, comment: 'Looks gorgeous and sits beautifully in my travel pouch. Absolute premium device.', date: 'June 18, 2026', verified: true }
    ],
    'deal-4': [
      { id: 'r1', name: 'Gavin Sterling', rating: 5, comment: 'The Heads-Up-Display is extremely bright and legible. Bone-conduction acoustics are incredibly clear for phone calls.', date: 'July 16, 2026', verified: true }
    ]
  };

  // Fallback default review collection for non-promo catalog products
  const defaultReviews = [
    { id: 'd1', name: 'Alistair Vance', rating: 5, comment: `This ${productName} exceeded all my expectations. The industrial design is premium and tactile, fitting perfectly into the minimalist aesthetic.`, date: 'July 10, 2026', verified: true },
    { id: 'd2', name: 'Nicolette Grey', rating: 4, comment: `High-quality construction and gorgeous presentation. Definitely worth the price point for daily use.`, date: 'June 24, 2026', verified: true },
    { id: 'd3', name: 'Robert Finch', rating: 4, comment: 'Beautiful, clean, and highly functional. Delivered within two days in immaculate packaging.', date: 'May 12, 2026', verified: false }
  ];

  return reviewsMap[productId] || defaultReviews;
};

// ==========================================
// WIDGET EXPORT: PRODUCT DETAIL VIEW
// ==========================================

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  // 1. Context Hook: Gather globally managed state controllers for shopping bag and wishlist items.
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  
  // 2. Swatch Color Variation State: defaults to our first premium finish.
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  
  // 3. Local State: Tracks dynamic, live user reviews for active products.
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // 4. Interactive Review Form States
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState(false);

  // 5. Reactive Synchronization Hook (useEffect)
  // Re-syncs review lists and resets local form submissions whenever a user inspects a different product.
  useEffect(() => {
    setReviews(getSeededReviews(product.id, product.name));
    setSubmittedReview(false);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
  }, [product]);

  // 6. Helper check: Determine if this item exists in the user's saved wishlist
  const isFavorite = isInWishlist(product.id);

  // 7. Interactive Wishlist Dispatcher
  const handleWishlistClick = () => {
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // 8. Form Submission Controller
  // Simulates an immediate backend upload and prepends the new review thread live.
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newReview: Review = {
      id: `review-${Date.now()}`,
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: 'Today',
      verified: true
    };

    // Prepend new feedback so it appears instantly at the top of the feed
    setReviews(prev => [newReview, ...prev]);
    setSubmittedReview(true);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* HEADER NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-brand-200 pb-5">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-brand-950 transition-colors cursor-pointer"
        >
          {/* Arrow motion feedback enhances transition feel */}
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalog</span>
        </button>
        <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
          Product ID: {product.id}
        </span>
      </div>

      {/* TWO-COLUMN GRID HERO FRAME */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* COLUMN 1: INTERACTIVE IMAGE DISPLAY STAGE */}
        <div className="relative aspect-video sm:aspect-square md:max-h-[500px] rounded-3xl overflow-hidden bg-brand-50 border border-brand-200 shadow-sm group">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          {/* Floating Category Tag */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm text-brand-600 border border-brand-100 shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Dynamic Colorway Label Indicator Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[10px] font-bold text-white flex items-center gap-2 border border-white/10">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedColor.tailwindBg}`} />
            <span className="uppercase tracking-wider">{selectedColor.name}</span>
          </div>
        </div>

        {/* COLUMN 2: TEXT DETAILS & ACTION CONTROLLERS */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-brand-950 leading-tight">
                {product.name}
              </h1>
              
              {/* Wishlist Toggle Button with spring scale feedback */}
              <button
                onClick={handleWishlistClick}
                className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                  isFavorite 
                    ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-xs' 
                    : 'bg-white border-brand-200 hover:border-brand-500 text-stone-400 hover:text-brand-950'
                }`}
                title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Ratings Summary Block */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-stone-500">
                Based on {reviews.length} authentic community reviews
              </span>
            </div>

            {/* Price Frame */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-serif text-brand-950">
                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-stone-400 font-mono">excluding tax & shipping</span>
            </div>

            {/* Description Block */}
            <p className="text-sm text-stone-600 leading-relaxed font-sans italic">
              {product.description}
            </p>
          </div>

          {/* COLORWAYS VARIATION TRACKER */}
          <div className="space-y-3.5 border-t border-brand-100 pt-6">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-950">
              Select Variations / Premium Colorways
            </h4>
            <div className="flex items-center gap-4">
              {COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'ring-2 ring-brand-950 ring-offset-2 scale-105' 
                        : 'hover:scale-102 hover:ring-1 hover:ring-brand-300'
                    }`}
                    title={color.name}
                  >
                    <span className={`w-7 h-7 rounded-full ${color.tailwindBg} shadow-inner`} />
                    {/* Tooltip on hover */}
                    <span className="absolute -bottom-7 scale-0 group-hover:scale-100 transition-transform bg-brand-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap z-10 uppercase tracking-widest">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider pt-2">
              Currently Selected: <span className="font-bold text-stone-700">{selectedColor.name}</span>
            </p>
          </div>

          {/* MAIN TRANSACTION CONTROL */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-brand-100 pt-6">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className={`flex-grow flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md ${
                product.stock <= 0
                  ? 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-98'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Shopping Bag'}</span>
            </button>
          </div>

          {/* PREMIUM STOCK STATUS SUMMARY */}
          <div className="grid grid-cols-2 gap-4 border-t border-brand-100 pt-6">
            <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
              <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Stock Status</span>
              <span className="text-xs font-bold text-stone-800 uppercase mt-0.5 block">
                {product.stock > 0 ? `${product.stock} units available` : 'Sold Out'}
              </span>
            </div>
            <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
              <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Exclusivity</span>
              <span className="text-xs font-bold text-stone-800 uppercase mt-0.5 block">
                Limited Edition
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY DISCOURSE & REVIEWS */}
      <div className="border-t border-brand-200 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COMPONENT COLUMN: CUSTOM FEEDBACK ENTRY FORM */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-serif text-brand-950 uppercase tracking-wide">
              Customer Voices
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every design decision is refined through continuous community discourse. Write yours below to let us know.
            </p>
          </div>

          {/* Interactive Review Creation Form */}
          <form onSubmit={handleReviewSubmit} className="bg-white rounded-3xl border border-brand-200 p-6 space-y-4 shadow-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-brand-950">
              Write a Review
            </h4>

            {submittedReview ? (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-brand-500 mx-auto" />
                <h5 className="text-xs font-bold uppercase text-brand-950">Review Received</h5>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  Thank you for contributing to the community. Your feedback has been published.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedReview(false)}
                  className="text-[10px] font-bold uppercase text-brand-500 hover:underline pt-1"
                >
                  Write another review
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-bold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="E.g. Sterling Cross"
                    className="w-full px-3 py-2 text-xs border border-brand-200 focus:border-brand-500 focus:outline-hidden rounded-xl bg-brand-50/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-bold">Acoustic & Fit Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            star <= newReviewRating 
                              ? 'text-amber-500 fill-current' 
                              : 'text-stone-200'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-bold">Your Commentary</label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe your design and performance experience..."
                    className="w-full px-3 py-2 text-xs border border-brand-200 focus:border-brand-500 focus:outline-hidden rounded-xl bg-brand-50/30 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-950 hover:bg-brand-800 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Review</span>
                </button>
              </>
            )}
          </form>
        </div>

        {/* RIGHT COMPONENT COLUMN: LIVE DYNAMIC FEED */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-brand-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-950">
              Community Feed ({reviews.length})
            </span>
            <span className="text-[10px] text-stone-400 font-mono">sorted by newest first</span>
          </div>

          <div className="space-y-6 max-h-[480px] overflow-y-auto scrollbar-thin pr-2">
            {reviews.map((review) => (
              <div 
                key={review.id}
                className="bg-brand-50/40 rounded-2xl border border-brand-100 p-5 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-brand-950 font-sans uppercase tracking-wide">
                      {review.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-stone-400">{review.date}</span>
                      {review.verified && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] px-1.5 py-0.5 rounded-sm font-extrabold uppercase tracking-widest">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5-Star visual feedback */}
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
