import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface CustomOrderDoc {
  craftType: string;
  ideaText: string;
  budget: string;
  photos: string[]; // base64 data URLs
  createdAt: string;
}

export const RefPhotosView: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { navigateTo } = useStore();
  const [order, setOrder] = useState<CustomOrderDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const ref = doc(db, 'customOrders', orderId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setOrder(snap.data() as CustomOrderDoc);
        } else {
          setError('Reference order not found or expired.');
        }
      } catch (err: any) {
        console.error('Error fetching custom order:', err);
        setError('Failed to load reference photos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex flex-col">
      <Header />

      <main className="max-w-xl mx-auto px-3 sm:px-6 pt-6 pb-20 flex-1 w-full space-y-4">
        <div className="bg-white border border-[#eee7dc] rounded-[24px] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f5efe6] pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#59684c] bg-[#e8eee3] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Shae.made Custom Reference
              </span>
              <h1 className="font-luxury-serif text-xl sm:text-2xl font-bold text-[#2b352a] mt-1">
                Order Ref: #{orderId}
              </h1>
            </div>
            <button
              onClick={() => navigateTo('')}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Visit Store
            </button>
          </div>

          {loading && (
            <div className="py-12 text-center text-xs text-[#737c6e]">
              Loading custom order reference photos...
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-xs text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
              {error}
            </div>
          )}

          {order && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-[#fcf9f4] p-3.5 rounded-xl border border-[#eee7dc] text-xs">
                <div>
                  <span className="text-[#737c6e] block font-medium">Craft Type</span>
                  <b className="text-[#2b352a] font-bold">{order.craftType}</b>
                </div>
                <div>
                  <span className="text-[#737c6e] block font-medium">Estimated Budget</span>
                  <b className="text-[#59684c] font-bold">
                    {order.budget ? `₹${Number(order.budget).toLocaleString('en-IN')}` : 'Flexible'}
                  </b>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#2b352a] mb-1">Customer Idea & Details</h3>
                <p className="text-xs text-[#737c6e] bg-[#fcf9f4] p-3 rounded-xl border border-[#eee7dc] leading-relaxed">
                  {order.ideaText}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#2b352a] mb-2">
                  Reference Photos ({order.photos?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.photos?.map((src, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-[#eee7dc] bg-white shadow-xs aspect-square"
                    >
                      <img src={src} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
