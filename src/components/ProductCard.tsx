import React from 'react';
import { Star, ShoppingCart, Edit, AlertTriangle } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCardProps {
  product: Product;
  onEditClick?: (product: Product) => void;
  onCardClick?: (product: Product) => void;
  key?: React.Key;
}

export default function ProductCard({ product, onEditClick, onCardClick }: ProductCardProps) {
  const { addToCart, currentUser } = useStore();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-3xl border border-brand-200 hover:border-brand-500 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      
      {/* Product Image Stage */}
      <div 
        onClick={() => onCardClick?.(product)}
        className="aspect-video bg-brand-100 overflow-hidden relative cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm text-brand-500 border border-brand-200 shadow-sm">
            {product.category}
          </span>
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-brand-700 text-white shadow-sm self-start">
              Featured
            </span>
          )}
        </div>

        {/* Admin Overlay Edit Action */}
        {currentUser?.role === 'admin' && onEditClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(product);
            }}
            className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-white text-stone-600 hover:text-brand-500 rounded-full border border-brand-200 shadow-sm hover:shadow transition-all active:scale-90 z-10"
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {/* Out of Stock Dark Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="px-4 py-2 rounded-xl bg-white text-brand-900 text-xs font-bold tracking-widest uppercase border border-brand-200 shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title / Description */}
        <div 
          onClick={() => onCardClick?.(product)}
          className="flex-grow cursor-pointer"
        >
          <h4 className="font-serif font-bold text-lg text-brand-900 line-clamp-1 group-hover:text-brand-500 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 h-8 leading-relaxed italic">
            {product.description}
          </p>

          {/* Rating Matrix */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center text-brand-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-stone-700 mt-0.5">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-stone-400 mt-0.5">
              ({product.reviewsCount} reviews)
            </span>
          </div>
        </div>

        {/* Footer actions / Price */}
        <div className="mt-5 pt-4 border-t border-brand-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold leading-none">
              Price
            </div>
            <div className="text-xl font-bold font-serif text-brand-900 mt-1 leading-none">
              ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              isOutOfStock
                ? 'bg-brand-100 text-stone-400 cursor-not-allowed border border-brand-200'
                : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-95 shadow-sm'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="absolute bottom-20 right-5 flex items-center gap-1 text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Only {product.stock} left</span>
          </div>
        )}
      </div>
    </div>
  );
}
