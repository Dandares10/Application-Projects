import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldAlert, Key, Mail, ArrowRight, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const success = await login(email, name, role);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleQuickLogin = async (targetRole: 'admin' | 'user') => {
    setIsSubmitting(true);
    const demoEmail = targetRole === 'admin' ? 'admin@example.com' : 'user@example.com';
    const demoName = targetRole === 'admin' ? 'Demo Admin' : 'Demo User';
    const success = await login(demoEmail, demoName, targetRole);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white border border-brand-200 rounded-3xl shadow-xl w-full max-w-md overflow-hidden z-10"
          >
            {/* Design accents */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700" />

            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold font-serif tracking-tight text-brand-900">
                  Welcome to Aura
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Access your profile, orders, and premium dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-brand-500 transition-colors p-1.5 rounded-full hover:bg-brand-100 border border-transparent hover:border-brand-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-0 space-y-6">
              {/* Quick Login Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Quick Demo Access
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickLogin('user')}
                    disabled={isSubmitting}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-brand-200 hover:border-brand-500 bg-brand-50/50 hover:bg-brand-100/40 text-stone-700 hover:text-brand-900 transition-all text-center group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 group-hover:scale-105 transition-transform border border-brand-200">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-brand-900">Demo Customer</div>
                    <div className="text-[10px] text-stone-400 font-medium">Browse & Purchase</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('admin')}
                    disabled={isSubmitting}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-brand-200 hover:border-brand-500 bg-brand-50/50 hover:bg-brand-100/40 text-stone-700 hover:text-brand-900 transition-all text-center group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 group-hover:scale-105 transition-transform border border-brand-200">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-brand-900">Demo Administrator</div>
                    <div className="text-[10px] text-stone-400 font-medium">Inventory & Orders</div>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-brand-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">or custom details</span>
                <div className="flex-grow border-t border-brand-200"></div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-200 text-sm focus:outline-none focus:border-brand-500 text-brand-900 transition-colors bg-white"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-200 text-sm focus:outline-none focus:border-brand-500 text-brand-900 transition-colors bg-white"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-1 mt-1 bg-brand-100 p-1.5 rounded-full border border-brand-200">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        role === 'user'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-stone-500 hover:text-brand-500'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        role === 'admin'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-stone-500 hover:text-brand-500'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-600 active:scale-98 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
                >
                  {isSubmitting ? 'Verifying...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
