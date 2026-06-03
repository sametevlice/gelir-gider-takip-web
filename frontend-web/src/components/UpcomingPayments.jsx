import { useState, useMemo } from 'react';
import { useStore, fmt } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import BrandIcon from './BrandIcon';



export default function UpcomingPayments({ setActivePage }) {
  const [hoveredPayment, setHoveredPayment] = useState(null);
  const payments = useStore(state => state.payments);
  const transactions = useStore(state => state.transactions);

  // Generate 6 days from today
  const schedule = useMemo(() => {
    const days = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get all instances for the next 6 days
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayInstances = [];
      payments.forEach(p => {
        let isInstance = false;
        if (!p.isRecurring) {
          if (p.date === dateStr) isInstance = true;
        } else {
          const pDate = new Date(p.date);
          const instDate = new Date(d);
          if (p.frequency === 'MONTHLY' && pDate.getDate() === instDate.getDate()) isInstance = true;
          else if (p.frequency === 'WEEKLY' && pDate.getDay() === instDate.getDay()) isInstance = true;
        }

        if (isInstance) {
          // Check if paid (exists in transactions)
          const isPaid = transactions.some(t => 
            t.description.toLowerCase().includes(p.brand.toLowerCase()) && 
            t.date === dateStr &&
            t.type === 'EXPENSE'
          );
          dayInstances.push({ ...p, isPaid });
        }
      });
      
      const matrixPayments = [...dayInstances];
      while(matrixPayments.length < 3) matrixPayments.push({ brand: 'empty' });

      days.push({
        date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).toUpperCase(),
        active: i === 0,
        payments: matrixPayments.slice(0, 3)
      });
    }
    return days;
  }, [payments, transactions]);

  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-50 flex flex-col relative overflow-hidden">
      <div className="mb-10">
        <h3 className="text-2xl font-extrabold text-[#11142D] tracking-tight">Yaklaşan Ödemeler</h3>
        <p className="text-[13px] text-gray-400 font-medium mt-1 leading-relaxed">Ödeme planınızı ve aboneliklerinizi buradan takip edin</p>
      </div>

      <div className="flex justify-between mb-10 relative px-2">
        <div className="absolute top-10 left-0 w-full h-[2px] bg-gray-50 -z-10"></div>
        
        {schedule.map((col, idx) => (
          <div key={idx} className="flex flex-col items-center gap-10 w-[50px]">
            <div className="flex flex-col items-center gap-2 relative z-10 w-full">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${col.active ? 'text-[#4318FF]' : 'text-gray-300'}`}>
                {col.date.split(' ')[1]}
              </span>
              <span className={`text-[15px] font-extrabold transition-colors ${col.active ? 'text-[#11142D]' : 'text-gray-300'}`}>
                {col.date.split(' ')[0]}
              </span>
              {col.active && (
                <motion.div layoutId="activeBlueDot" className="w-1.5 h-1.5 rounded-full bg-[#4318FF] absolute -bottom-3"></motion.div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {col.payments.map((payment, pIdx) => {
                const uniqueId = `${idx}-${pIdx}`;
                if (payment.brand === 'empty') {
                  return (
                    <div key={pIdx} className="w-[50px] h-[50px] rounded-full border-2 border-dashed border-gray-100/80 flex items-center justify-center opacity-40"></div>
                  );
                }
                return (
                  <div key={pIdx} className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.1, zIndex: 20 }}
                      onMouseEnter={() => setHoveredPayment(uniqueId)}
                      onMouseLeave={() => setHoveredPayment(null)}
                      className="cursor-pointer relative group"
                    >
                      <BrandIcon 
                        domain={payment.domain} 
                        brand={payment.brand} 
                        color={payment.color} 
                        size="w-[38px] h-[38px]" 
                        className="rounded-full"
                      />
                      {payment.isPaid && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4318FF] rounded-full flex items-center justify-center text-[10px] text-white shadow-lg ring-2 ring-white z-10">
                          ✓
                        </div>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {hoveredPayment === uniqueId && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-32 bg-[#11142D] text-white p-3 rounded-2xl text-center z-50 shadow-2xl pointer-events-none"
                        >
                          <p className="text-[11px] font-extrabold mb-1">{payment.brand}</p>
                          <p className={`text-[12px] font-bold ${payment.isPaid ? 'text-emerald-400' : 'text-indigo-300'}`}>{fmt(payment.amount)}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{payment.isPaid ? 'ÖDENDİ' : 'ÖDEME BEKLİYOR'}</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#11142D]"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setActivePage('payments')}
        className="w-full py-5 bg-[#F4F7FE] text-[#11142D] rounded-[24px] text-[13px] font-extrabold hover:bg-[#E9EDF7] transition-all tracking-tight mt-auto shadow-sm border border-transparent"
      >
        Tüm ödemeleri yönet
      </button>
    </div>
  );
}
