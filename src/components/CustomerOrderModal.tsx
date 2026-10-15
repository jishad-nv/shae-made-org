import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../data/images';

export const CustomerOrderModal: React.FC = () => {
  const {
    orderModalData,
    closeOrderModal,
    createOrder,
    getProductCover,
    generateWhatsAppOrderMessage,
    openWhatsApp,
    showToast,
  } = useStore();

  const product = orderModalData?.product;
  const [qty, setQty] = useState<number>(orderModalData?.qty || 1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Kozhikode');
  const [pincode, setPincode] = useState<string>('');
  const [color, setColor] = useState<string>(orderModalData?.options?.color || 'Pastel Pink');
  const [led, setLed] = useState<string>(orderModalData?.options?.led || 'Warm White');
  const [msg, setMsg] = useState<string>(orderModalData?.options?.msg || '');
  const [giftNote, setGiftNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!orderModalData || !product) return null;

  const unitPrice = product.price;
  const totalPrice = unitPrice * qty;
  const photoCover = getProductCover(product);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter your WhatsApp phone number');
      return;
    }
    if (!address.trim()) {
      showToast('Please enter your delivery street address');
      return;
    }

    setIsSubmitting(true);

    const customizationParts: string[] = [];
    if (['Resin', 'Frames', 'Resin Crafts', 'Custom Frames'].includes(product.cat) && color) {
      customizationParts.push(`Color: ${color}`);
    }
    if (['Frames', 'Custom Frames'].includes(product.cat) && led) {
      customizationParts.push(`Lights: ${led}`);
    }
    if (msg.trim()) {
      customizationParts.push(`Name/Text: ${msg.trim()}`);
    }
    const customizationNote = customizationParts.join(', ');

    try {
      // 1. Register order in backend
      const createdOrder = await createOrder({
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            q: qty,
            img: photoCover,
            note: customizationNote,
          },
        ],
        totalAmount: totalPrice,
        status: 'Confirmed',
        paid: true,
        notes: giftNote.trim(),
        source: 'Storefront',
      });

      // 2. Format detailed WhatsApp message
      const whatsappMsg = generateWhatsAppOrderMessage(
        [
          {
            name: product.name,
            q: qty,
            price: product.price,
            note: customizationNote,
            img: photoCover,
          },
        ],
        totalPrice,
        {
          name: name.trim(),
          phone: phone.trim(),
          loc: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          note: giftNote.trim(),
        },
        createdOrder.id
      );

      // 3. Open WhatsApp
      openWhatsApp(whatsappMsg);
      showToast(`Order #${createdOrder.id} confirmed! Opening WhatsApp 🌿`);
      closeOrderModal();
    } catch (err) {
      console.error(err);
      showToast('Error registering order, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#59684c] rounded-[24px] max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f5efe6] pb-2.5">
          <div>
            <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider bg-[#e8eee3] px-2 py-0.5 rounded-full inline-block">
              Direct Handcrafted Order
            </span>
            <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a]">
              Enter Delivery Details
            </h2>
          </div>
          <button
            onClick={closeOrderModal}
            className="btn-secondary w-7 h-7 p-0 text-xs font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Product Summary Mini Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fcf9f4] border border-[#eee7dc]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#eee7dc] bg-white shrink-0">
            <img
              src={photoCover}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-luxury-serif font-bold text-xs sm:text-sm text-[#2b352a] truncate">
              {product.name}
            </h3>
            <p className="text-[10.5px] text-[#737c6e] truncate">{product.sub}</p>

            <div className="flex items-center justify-between mt-1">
              <b className="text-xs sm:text-sm font-bold text-[#59684c] tabular-nums">
                ₹{totalPrice.toLocaleString('en-IN')}
              </b>

              {/* Quantity Stepper */}
              <div className="inline-flex items-center gap-1.5 border border-[#eee7dc] rounded-full p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-5 h-5 rounded-full bg-[#fcf9f4] flex items-center justify-center font-bold text-xs text-[#2b352a] hover:bg-[#eee7dc]"
                >
                  -
                </button>
                <span className="text-xs font-bold px-1 tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-5 h-5 rounded-full bg-[#fcf9f4] flex items-center justify-center font-bold text-xs text-[#2b352a] hover:bg-[#eee7dc]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Customizations (if craft supports it) */}
          {['Resin', 'Frames', 'Resin Crafts', 'Custom Frames'].includes(product.cat) && (
            <div className="p-3 rounded-xl bg-[#f5efe6]/70 border border-[#eee7dc] space-y-2">
              <span className="text-[10.5px] font-bold text-[#59684c] block uppercase">
                Customization Options
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                    Resin Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  >
                    {['Pastel Pink', 'Lavender', 'Baby Blue', 'Gold Flakes', 'Ocean Teal'].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {['Frames', 'Custom Frames'].includes(product.cat) && (
                  <div>
                    <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                      Fairy Lights
                    </label>
                    <select
                      value={led}
                      onChange={(e) => setLed(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                    >
                      {['Warm White', 'Rainbow Glow', 'No Lights'].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                  Name / Special Date Inscription (Optional)
                </label>
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="e.g. Rahul & Anjali · 14.02.2026"
                  className="w-full px-2.5 py-1 rounded-lg border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                />
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#2b352a] block">
              Recipient & Delivery Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anjali Krishna"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                  WhatsApp Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98470 12345"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                Delivery Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat No, Apartment, Street name"
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                  City / State
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kochi, Kerala"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 673001"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-[#2b352a] block mb-0.5">
                Gift Message Card / Crafting Note (Optional)
              </label>
              <textarea
                rows={2}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="Handwritten gift note text for recipient, delivery deadline, etc."
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
              />
            </div>
          </div>

          {/* Pricing Total Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#e8eee3] text-[#34402c] text-xs font-bold">
            <span>Total to Pay via WhatsApp (UPI):</span>
            <span className="text-sm">₹{totalPrice.toLocaleString('en-IN')} (Free Delivery)</span>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-order w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span className="material-icon fill text-base">chat</span>
              <span>Submit Details & Send to WhatsApp</span>
            </button>
            <small className="block text-center text-[10px] text-[#737c6e] mt-1.5">
              Your details will be registered in our maker studio pipeline and opened in WhatsApp chat with photo reference.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};
