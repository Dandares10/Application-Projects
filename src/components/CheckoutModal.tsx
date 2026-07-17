import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, ShieldCheck, MapPin, Loader2, ArrowRight, X, Sparkles, Receipt, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ShippingAddress } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onViewOrders }: CheckoutModalProps) {
  const { cart, currentUser, createOrder, addToast } = useStore();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Address State
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'simulated'>('simulated');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('321');
  const [paymentLog, setPaymentLog] = useState<string>('');

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // When checkout modal opens, reset state
  useEffect(() => {
    if (isOpen) {
      setStep('shipping');
      setIsProcessing(false);
      setCreatedOrder(null);
      setPaymentLog('');
    }
  }, [isOpen]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      addToast('Please fill out all required shipping fields.', 'info');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentLog('Initiating checkout transaction...');

    try {
      // Call backend API to create payment intent (Stripe integration proxy)
      const payRes = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal, currency: 'usd' })
      });

      if (!payRes.ok) {
        throw new Error('Payment gateway failed to initialize.');
      }

      const paymentData = await payRes.json();
      
      if (paymentData.isSimulated) {
        setPaymentLog('Stripe API Key absent. Running high-fidelity local sandbox processor...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPaymentLog('Authorizing card digits securely...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPaymentLog('Payment authorized. Generating invoice metadata...');
      } else {
        setPaymentLog(`Real Stripe Payment Intent established (ID: ${paymentData.id})...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPaymentLog('Securing payment confirmation via webhook simulation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Complete checkout order
      const newOrder = await createOrder(
        address,
        paymentMethod,
        paymentData.isSimulated ? undefined : paymentData.id
      );

      if (newOrder) {
        setCreatedOrder(newOrder);
        setStep('success');
        addToast('Payment successful! Invoice generated.', 'success');
      } else {
        addToast('Checkout completed, but failed to create order ledger.', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={step === 'success' ? undefined : onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white border border-brand-200 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden z-10 my-8"
          >
            {/* Top design line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700" />

            {/* Close button - hide during success step */}
            {step !== 'success' && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-stone-400 hover:text-brand-500 p-1.5 hover:bg-brand-100 rounded-full transition-all border border-transparent hover:border-brand-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header section */}
            <div className="p-6 pb-4 border-b border-brand-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif tracking-tight text-brand-900">
                  Secure Checkout
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {step === 'shipping' && 'Phase 1: Enter your delivery destination'}
                  {step === 'payment' && 'Phase 2: Finalize your secure payment'}
                  {step === 'success' && 'Order Completed!'}
                </p>
              </div>

              {/* Progress visual pills */}
              {step !== 'success' && (
                <div className="flex items-center gap-1.5 mr-8">
                  <div className={`w-2.5 h-2.5 rounded-full ${step === 'shipping' ? 'bg-brand-500' : 'bg-brand-200'}`} />
                  <div className="h-0.5 w-4 bg-neutral-200" />
                  <div className={`w-2.5 h-2.5 rounded-full ${step === 'payment' ? 'bg-brand-500' : 'bg-brand-200'}`} />
                </div>
              )}
            </div>

            {/* STEP 1: SHIPPING ADDRESS */}
            {step === 'shipping' && (
              <form onSubmit={handleAddressSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100/60">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Delivery Address</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Please provide correct billing and shipping coordinates.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      placeholder="123 Innovation Blvd, Apt 4B"
                      className="w-full px-4 py-3 border border-neutral-200 text-sm rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        placeholder="San Francisco"
                        className="w-full px-4 py-3 border border-neutral-200 text-sm rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        State / Province
                      </label>
                      <input
                        type="text"
                        required
                        value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        placeholder="CA"
                        className="w-full px-4 py-3 border border-neutral-200 text-sm rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        Zip / Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={address.zipCode}
                        onChange={e => setAddress({ ...address, zipCode: e.target.value })}
                        placeholder="94107"
                        className="w-full px-4 py-3 border border-neutral-200 text-sm rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                        Country
                      </label>
                      <select
                        value={address.country}
                        onChange={e => setAddress({ ...address, country: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-200 text-sm rounded-xl focus:outline-none focus:border-brand-500 text-neutral-800 transition-all bg-white"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Order total: <strong className="text-neutral-800">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-950 text-white font-semibold text-sm hover:bg-brand-600 shadow transition-all active:scale-98"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD & SUBMISSION */}
            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                {/* Billing Summary banner */}
                <div className="flex justify-between items-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100/60 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-500 truncate max-w-[320px]">
                      Shipping to: <strong className="text-neutral-800">{address.street}, {address.city}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                  >
                    Edit
                  </button>
                </div>

                {/* Gateway Selector Tabs */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'stripe'
                          ? 'border-brand-500 bg-brand-50/20 text-brand-950 shadow-sm'
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-500 hover:text-neutral-700 bg-neutral-50/30'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-semibold">Stripe Checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-brand-500 bg-brand-50/20 text-brand-950 shadow-sm'
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-500 hover:text-neutral-700 bg-neutral-50/30'
                      }`}
                    >
                      <span className="text-sm font-black font-display tracking-tight text-blue-900 mb-1.5 italic">PayPal</span>
                      <span className="text-xs font-semibold">Instant Balance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('simulated')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'simulated'
                          ? 'border-brand-500 bg-brand-50/20 text-brand-950 shadow-sm'
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-500 hover:text-neutral-700 bg-neutral-50/30'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 mb-1.5 text-amber-500 animate-bounce" />
                      <span className="text-xs font-semibold text-amber-900">Sandbox Play</span>
                    </button>
                  </div>
                </div>

                {/* Credit Card Input mock frame */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Cardholder Ledger</span>
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Card Number</span>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-transparent border-b border-neutral-700 text-sm font-mono py-1.5 focus:outline-none focus:border-brand-500 text-white placeholder-neutral-500 mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Expiration Date</span>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-transparent border-b border-neutral-700 text-sm font-mono py-1.5 focus:outline-none focus:border-brand-500 text-white placeholder-neutral-500 mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">CVC / Security</span>
                        <input
                          type="password"
                          required
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          maxLength={3}
                          placeholder="***"
                          className="w-full bg-transparent border-b border-neutral-700 text-sm font-mono py-1.5 focus:outline-none focus:border-brand-500 text-white placeholder-neutral-500 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live transaction log (highly interactive visual element) */}
                {isProcessing && (
                  <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl flex items-start gap-3">
                    <Loader2 className="w-5 h-5 text-brand-600 animate-spin mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-neutral-700 block">Gateway Transaction Active</span>
                      <p className="text-[10px] text-brand-700 font-mono mt-1 leading-relaxed">{paymentLog}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setStep('shipping')}
                    className="px-4 py-2 text-xs font-semibold border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition-all disabled:opacity-40"
                  >
                    Back to Address
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isProcessing ? 'Authorizing...' : `Pay $${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: TRANSACTION SUCCESS / RECEIPT */}
            {step === 'success' && createdOrder && (
              <div className="p-8 text-center space-y-6">
                {/* Visual success trigger */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold font-display text-neutral-900">Payment Confirmed!</h4>
                    <p className="text-sm text-neutral-500 mt-1">Thank you for shopping with AURA. Your order is registered.</p>
                  </div>
                </div>

                {/* Printable Invoice Card */}
                <div className="border border-neutral-150/80 bg-neutral-50/50 rounded-2xl p-6 text-left max-w-md mx-auto space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-neutral-400 uppercase pb-3 border-b border-neutral-200/50">
                    <div className="flex items-center gap-1.5 text-neutral-800">
                      <Receipt className="w-4 h-4 text-brand-600" />
                      <span>Invoice Receipt</span>
                    </div>
                    <span>ID: {createdOrder.id}</span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-3">
                    {createdOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-baseline text-xs">
                        <span className="text-neutral-600 truncate max-w-[200px]">{item.name} <strong className="text-neutral-400 font-mono font-normal">x{item.quantity}</strong></span>
                        <span className="font-semibold text-neutral-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-200/60 my-2"></div>

                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-semibold text-neutral-800">${createdOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <div className="border-t border-neutral-200/60 my-2"></div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-neutral-800">Total Charged</span>
                    <span className="text-base font-bold font-display text-brand-600">${createdOrder.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Shipping Address confirmation */}
                  <div className="pt-3 border-t border-neutral-200/50 text-[10px] text-neutral-500">
                    <strong className="text-neutral-700 uppercase tracking-wider block mb-1">Shipping coordinates:</strong>
                    {createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} {createdOrder.shippingAddress.zipCode}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-all"
                  >
                    Continue Shopping
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onViewOrders();
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-950 hover:bg-brand-600 text-white text-xs font-semibold transition-all shadow active:scale-95"
                  >
                    <span>View Order Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
