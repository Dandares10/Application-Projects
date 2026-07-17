import React from 'react';
import { X, Star, Check, RotateCcw, DollarSign, Package } from 'lucide-react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  minPrice: number | '';
  setMinPrice: (price: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (price: number | '') => void;
  minRating: number | '';
  setMinRating: (rating: number | '') => void;
  inStockOnly: boolean;
  setInStockOnly: (inStock: boolean) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  onClearAll,
  activeFiltersCount,
}: FilterSidebarProps) {
  
  // Quick price sets
  const handlePresetPrice = (min: number | '', max: number | '') => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-200 p-6 space-y-6 shadow-sm sticky top-24">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-brand-100 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900 font-sans">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-brand-700 hover:text-brand-900 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Categories Selection */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
          Category
        </span>
        <div className="flex flex-col gap-1.5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-brand-50/20 hover:bg-brand-100/50 text-stone-600 border-transparent hover:border-brand-200'
                }`}
              >
                <span>{category}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 border-t border-brand-100 pt-5">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
          Price Range
        </span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Min"
              className="w-full pl-7 pr-2 py-2 rounded-xl border border-brand-200 text-xs text-brand-900 bg-brand-50/10 focus:outline-none focus:border-brand-500 font-mono"
            />
            <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-stone-400 text-xs">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Max"
              className="w-full pl-7 pr-2 py-2 rounded-xl border border-brand-200 text-xs text-brand-900 bg-brand-50/10 focus:outline-none focus:border-brand-500 font-mono"
            />
            <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Preset Ranges */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => handlePresetPrice('', 100)}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border cursor-pointer transition-all ${
              minPrice === '' && maxPrice === 100
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white hover:bg-brand-100/50 text-stone-500 border-brand-200'
            }`}
          >
            &lt; $100
          </button>
          <button
            onClick={() => handlePresetPrice(100, 150)}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border cursor-pointer transition-all ${
              minPrice === 100 && maxPrice === 150
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white hover:bg-brand-100/50 text-stone-500 border-brand-200'
            }`}
          >
            $100-$150
          </button>
          <button
            onClick={() => handlePresetPrice(150, '')}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center border cursor-pointer transition-all ${
              minPrice === 150 && maxPrice === ''
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-white hover:bg-brand-100/50 text-stone-500 border-brand-200'
            }`}
          >
            $150+
          </button>
        </div>
      </div>

      {/* Ratings Filter */}
      <div className="space-y-3 border-t border-brand-100 pt-5">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
          Minimum Rating
        </span>
        <div className="flex flex-col gap-1.5">
          {[4.8, 4.5, 4.0].map((rating) => {
            const isSelected = minRating === rating;
            return (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-brand-50/20 hover:bg-brand-100/50 text-stone-600 border-transparent hover:border-brand-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-stone-400 font-normal">&amp; Up</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
          <button
            onClick={() => setMinRating('')}
            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer ${
              minRating === ''
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : 'bg-brand-50/20 hover:bg-brand-100/50 text-stone-600 border-transparent hover:border-brand-200'
            }`}
          >
            <span>All Ratings</span>
            {minRating === '' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Availability / In Stock */}
      <div className="space-y-3 border-t border-brand-100 pt-5">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
          Inventory Status
        </span>
        <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/10 cursor-pointer hover:bg-brand-100/30 transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded-md border-brand-200 text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-semibold text-stone-700">In Stock Only</span>
          </div>
        </label>
      </div>
    </div>
  );
}
