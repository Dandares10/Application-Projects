import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore, ToastMessage } from '../context/StoreContext.tsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void; key?: React.Key }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-amber-500" />;
    }
  };

  const getBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50/95 border-emerald-100';
      case 'error':
        return 'bg-rose-50/95 border-rose-100';
      case 'info':
      default:
        return 'bg-amber-50/95 border-amber-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg ${getBg()} backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <span className="text-sm font-medium text-neutral-800">{toast.text}</span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100/50"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
