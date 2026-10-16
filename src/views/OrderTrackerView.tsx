import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { STAGES } from '../data/initialData';
import { Order } from '../types';

export const OrderTrackerView: React.FC = () => {
  const { orders, lookupOrder } = useStore();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderId.trim();
    if (!cleanId) return;

    setIsSearching(true);
    setError('');

    // Check in loaded state first
    let foundOrder = orders.find(
      (o) => o.id.toLowerCase() === cleanId.toLowerCase()
    );

    // If not found in memory (e.g. customer is on a fresh browser), fetch directly from Firestore
    if (!foundOrder && lookupOrder) {
      foundOrder = (await lookupOrder(cleanId)) || undefined;
    }

    setIsSearching(false);

    if (foundOrder) {
      setOrder(foundOrder);
      setError('');
    } else {
      setOrder(null);
      setError('Order not found. Please check your Order ID (e.g. SM-123456) and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-luxury-serif text-2xl sm:text-3xl font-bold text-[#2b352a]">
            Live Order Status Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#737c6e] mt-1">
            Track your handcrafted keepsake crafting stage, dispatch timeline, and tracking details.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID (e.g. SM-123456)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#eee7dc] bg-white text-xs sm:text-sm text-[#2b352a] focus:outline-none focus:border-[#59684c]"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="btn-order px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            {isSearching ? (
              <span>Tracking...</span>
            ) : (
              <>
                <span className="material-icon text-sm">search</span>
                <span>Track</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm mb-6 flex items-center gap-2">
            <span className="material-icon text-base">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-[#eee7dc] space-y-6">
            <div className="flex items-center justify-between border-b border-[#f5efe6] pb-4 flex-wrap gap-2">
              <div>
                <span className="text-[10.5px] font-bold text-[#59684c] uppercase tracking-wider block">
                  Craft Order Reference
                </span>
                <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a]">
                  #{order.id}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#737c6e] block">Placed on</span>
                <b className="text-xs text-[#2b352a]">{order.createdAt}</b>
              </div>
            </div>

            {/* Stepper */}
            <div>
              <b className="text-xs font-bold text-[#737c6e] uppercase tracking-wider block mb-3">
                Crafting & Delivery Pipeline
              </b>
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
                {STAGES.map((stage, index) => {
                  const currentStageIndex = STAGES.indexOf(order.status as any);
                  const isPassed = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div
                      key={stage}
                      className={`flex-1 text-center min-w-[70px] ${
                        isPassed ? 'text-[#59684c]' : 'text-gray-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center mx-auto mb-1.5 text-xs font-bold transition-all ${
                          isPassed
                            ? 'border-[#59684c] bg-[#e8eee3] text-[#59684c]'
                            : 'border-gray-200 bg-white text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-[#59684c]/20' : ''}`}
                      >
                        {isPassed && !isCurrent ? '✓' : index + 1}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase block leading-tight">
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="p-3.5 rounded-xl bg-[#fcf9f4] border border-[#eee7dc] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#737c6e] font-semibold pb-1 border-b border-[#eee7dc]">
                <span>Customer: <b className="text-[#2b352a]">{order.customerName}</b></span>
                <span>Total: <b className="text-[#59684c]">₹{order.totalAmount.toLocaleString('en-IN')}</b></span>
              </div>
              {order.trackingNumber && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <span>Tracking / Courier Number:</span>
                  <b className="font-mono">{order.trackingNumber}</b>
                </div>
              )}
              <div className="space-y-1 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11.5px] text-[#2b352a]">
                    <span>• {item.name} × {item.q} {item.note ? `(${item.note})` : ''}</span>
                    <span className="font-semibold">₹{(item.price * item.q).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};
