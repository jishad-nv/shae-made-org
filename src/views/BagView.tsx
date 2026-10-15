import React from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

export const BagView: React.FC = () => {
  const {
    bag,
    getProductById,
    getProductCover,
    updateBagQty,
    removeFromBag,
    clearBag,
    bagSubtotal,
    shippingFee,
    bagTotal,
    deliveryForm,
    setDeliveryForm,
    generateWhatsAppOrderMessage,
    openWhatsApp,
    logInquiry,
    createOrder,
    navigateTo,
    showToast,
  } = useStore();

  const bagItemsWithDetails = bag
    .map((item) => {
      const product = getProductById(item.id);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);

  const previewMessage = generateWhatsAppOrderMessage(
    bagItemsWithDetails.map((b) => ({
      name: b!.product.name,
      q: b!.q,
      price: b!.product.price,
      note: b!.note,
      img: getProductCover(b!.product),
    })),
    bagTotal,
    deliveryForm
  );

  const handleCheckout = async () => {
    if (!deliveryForm.name.trim() || !deliveryForm.phone.trim() || !deliveryForm.loc.trim()) {
      showToast('Please enter your Name, WhatsApp number & Delivery address');
      return;
    }

    try {
      // 1. Create order in backend pipeline
      const createdOrder = await createOrder({
        customerName: deliveryForm.name.trim(),
        phone: deliveryForm.phone.trim(),
        address: deliveryForm.loc.trim(),
        city: deliveryForm.city?.trim() || '',
        pincode: deliveryForm.pincode?.trim() || '',
        items: bagItemsWithDetails.map((b) => ({
          id: b!.product.id,
          name: b!.product.name,
          price: b!.product.price,
          q: b!.q,
          img: getProductCover(b!.product),
          note: b!.note,
        })),
        totalAmount: bagTotal,
        status: 'Confirmed',
        paid: true,
        notes: deliveryForm.note?.trim() || '',
        source: 'Storefront',
      });

      // 2. Format detailed WhatsApp message with items, photos, and delivery info
      const orderWhatsappMsg = generateWhatsAppOrderMessage(
        bagItemsWithDetails.map((b) => ({
          name: b!.product.name,
          q: b!.q,
          price: b!.product.price,
          note: b!.note,
          img: getProductCover(b!.product),
        })),
        bagTotal,
        deliveryForm,
        createdOrder.id
      );

      openWhatsApp(orderWhatsappMsg);
      clearBag();
      showToast(`Order #${createdOrder.id} registered! Opening WhatsApp 🌿`);
      setTimeout(() => {
        navigateTo('');
      }, 1200);
    } catch (err) {
      console.error(err);
      openWhatsApp(previewMessage);
      clearBag();
      showToast('Opening WhatsApp with your order summary 🌿');
      setTimeout(() => {
        navigateTo('');
      }, 1200);
    }
  };

  if (bagItemsWithDetails.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcf9f4]">
        <Header showBack title="Shopping Bag" />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f5efe6] border border-[#eee7dc] flex items-center justify-center mx-auto mb-3 text-[#737c6e]">
            <span className="material-icon text-3xl">shopping_bag</span>
          </div>
          <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a] mb-1">
            Your shopping bag is empty
          </h2>
          <p className="text-xs text-[#737c6e] mb-4">
            Discover our handmade resin frames, crochet bouquets, and gift hampers.
          </p>
          <button onClick={() => navigateTo('catalog')} className="btn-primary text-xs">
            Browse Catalog
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header showBack title="Shopping Bag" />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 items-start">
          {/* Left Column: Items List & Customer Details */}
          <div className="space-y-3">
            {/* Bag items */}
            <div className="space-y-2">
              {bagItemsWithDetails.map((item) => (
                <div
                  key={`${item!.id}-${item!.note}`}
                  className="bg-white border border-[#eee7dc] rounded-2xl p-2.5 sm:p-3 flex gap-2.5 sm:gap-3 items-center shadow-xs"
                >
                  <img
                    src={getProductCover(item!.product)}
                    alt={item!.product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-[#eee7dc] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <b className="text-xs sm:text-sm text-[#2b352a] font-luxury-serif truncate block">
                        {item!.product.name}
                      </b>
                      <b className="text-xs sm:text-sm font-bold text-[#2b352a] shrink-0 tabular-nums">
                        ₹{(item!.product.price * item!.q).toLocaleString('en-IN')}
                      </b>
                    </div>

                    {item!.note && (
                      <p className="text-[10px] sm:text-[10.5px] text-[#737c6e] mt-0.5 truncate">
                        {item!.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="inline-flex items-center gap-1.5 border border-[#eee7dc] rounded-full p-0.5 bg-[#fcf9f4]">
                        <button
                          onClick={() => updateBagQty(item!.id, -1)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[#2b352a] hover:bg-[#eee7dc] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-icon text-xs">remove</span>
                        </button>
                        <span className="text-[11px] font-bold px-1 tabular-nums">
                          {item!.q}
                        </span>
                        <button
                          onClick={() => updateBagQty(item!.id, 1)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[#2b352a] hover:bg-[#eee7dc] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <span className="material-icon text-xs">add</span>
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromBag(item!.id)}
                        className="text-[11px] text-[#737c6e] hover:text-[#d97a53] flex items-center gap-0.5 font-semibold cursor-pointer"
                      >
                        <span className="material-icon text-sm">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details Card */}
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="font-luxury-serif text-sm sm:text-base font-bold text-[#2b352a]">
                Delivery Information
              </h3>

              <div>
                <label className="text-[11px] font-bold text-[#2b352a] block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryForm.name}
                  onChange={(e) =>
                    setDeliveryForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Anjali Krishna"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#2b352a] block mb-1">
                  WhatsApp Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={deliveryForm.phone}
                  onChange={(e) =>
                    setDeliveryForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="e.g. +91 98470 12345"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#2b352a] block mb-1">
                  Delivery Address & PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryForm.loc}
                  onChange={(e) =>
                    setDeliveryForm((f) => ({ ...f, loc: e.target.value }))
                  }
                  placeholder="House/Apt, Street, City, PIN"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#2b352a] block mb-1">
                  Gift Note or Instructions <span className="font-normal text-[#737c6e]">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryForm.note}
                  onChange={(e) =>
                    setDeliveryForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Gift message card note, delivery timing..."
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Real-time WhatsApp Message Preview */}
          <div className="space-y-3 md:sticky md:top-20">
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
              <h3 className="font-luxury-serif text-sm sm:text-base font-bold text-[#2b352a] mb-2">
                Order Summary
              </h3>

              <div className="flex justify-between text-xs text-[#2b352a]">
                <span>Crafts Subtotal</span>
                <span className="font-bold tabular-nums">
                  ₹{bagSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-xs text-[#2b352a]">
                <span>Customization & Proofs</span>
                <span className="font-bold text-[#59684c]">Free</span>
              </div>

              <div className="flex justify-between text-xs text-[#2b352a]">
                <span>All-India Shipping</span>
                <span className="font-bold tabular-nums">
                  {shippingFee > 0 ? `₹${shippingFee}` : 'Free'}
                </span>
              </div>

              <div className="border-t border-[#f5efe6] pt-2 flex justify-between text-sm sm:text-base font-bold text-[#2b352a]">
                <span>Total Amount</span>
                <span className="text-[#59684c] tabular-nums">
                  ₹{bagTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Live Message Preview */}
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2b352a] flex items-center gap-1">
                  <span className="material-icon fill text-sm text-[#2fb36f]">chat</span>
                  WhatsApp Order Preview
                </span>
                <span className="badge-tag-peach text-[10px] py-0.5">Ready to send</span>
              </div>

              <div className="bg-[#fcf9f4] border border-[#eee7dc] rounded-xl p-2.5 text-[10.5px] sm:text-[11px] text-[#2b352a] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {previewMessage}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-order w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-icon fill text-base">send</span>
              <span>Send Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
