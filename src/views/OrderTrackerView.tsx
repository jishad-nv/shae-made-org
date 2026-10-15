import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { STAGES } from '../data/initialData';

export const OrderTrackerView: React.FC = () => {
  const { orders } = useStore();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const foundOrder = orders.find((o) => o.id === orderId.trim());
    if (foundOrder) {
      setOrder(foundOrder);
      setError('');
    } else {
      setOrder(null);
      setError('Order not found. Please check the ID.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Status Tracker</h1>
        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300"
          />
          <button type="submit" className="bg-[#59684c] text-white px-6 py-2 rounded-xl">Track</button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {order && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Order #{order.id}</h2>
            <div className="flex justify-between mb-8">
              {STAGES.map((stage, index) => {
                const currentStageIndex = STAGES.indexOf(order.status);
                const isActive = index <= currentStageIndex;
                return (
                  <div key={stage} className={`flex-1 text-center ${isActive ? 'text-[#59684c]' : 'text-gray-300'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto mb-2 ${isActive ? 'border-[#59684c] bg-[#e8eee3]' : 'border-gray-300'}`}>
                      {index + 1}
                    </div>
                    <span className="text-[10px] font-bold uppercase">{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};
