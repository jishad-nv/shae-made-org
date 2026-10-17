import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { compressImageToFile } from '../utils/imageUpload';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const CustomOrderView: React.FC = () => {
  const { openWhatsApp, logInquiry, showToast, config } = useStore();

  const [craftType, setCraftType] = useState<string>('Resin frame');
  const [ideaText, setIdeaText] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [refPhotos, setRefPhotos] = useState<{ file: File; dataUrl: string }[]>([]);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 3 - refPhotos.length);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawResult = reader.result as string;
        try {
          const compressedFile = await compressImageToFile(rawResult, `ref_${Date.now()}.jpg`);
          const compressedReader = new FileReader();
          compressedReader.onload = () => {
            const dataUrl = compressedReader.result as string;
            setRefPhotos((prev) => {
              if (prev.length < 3) {
                return [...prev, { file: compressedFile, dataUrl }];
              }
              return prev;
            });
          };
          compressedReader.readAsDataURL(compressedFile);
        } catch (e) {
          console.error('Compression error:', e);
          showToast('Failed to process photo');
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setRefPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const constructMessage = (refLink?: string) => {
    let msg = `Hello Shae.made! 🌿 I would love to order a bespoke custom piece.\n\n`;
    msg += `Craft Type: ${craftType}\n`;
    msg += `My Idea & Details: ${ideaText.trim()}\n`;
    msg += `Budget: ${budget ? `₹${Number(budget).toLocaleString('en-IN')}` : 'Flexible'}\n`;
    if (refLink) {
      msg += `Reference Photos: ${refLink}\n`;
    } else if (refPhotos.length > 0) {
      msg += `Reference Photos: ${refPhotos.length} photo(s) attached\n`;
    }
    msg += `\nPlease let me know your thoughts, timeline, and quote!`;
    return msg;
  };

  const handleSubmit = async () => {
    if (!ideaText.trim()) {
      showToast('Please describe your idea first!');
      setErrorMsg('Please describe your idea first.');
      return;
    }

    setIsPreparing(true);
    setErrorMsg(null);

    try {
      // 1. Prepare files
      const files: File[] = [];
      const base64Photos: string[] = [];
      for (const p of refPhotos) {
        files.push(p.file);
        base64Photos.push(p.dataUrl);
      }

      const msg = constructMessage();

      const canShareFiles =
        typeof navigator.canShare === 'function' &&
        files.length > 0 &&
        navigator.canShare({ files });

      if (canShareFiles) {
        // Fire lead logging in background so user gesture is never delayed
        logInquiry(
          'Custom Order Lead',
          `Custom: ${craftType}`,
          Number(budget) || 0,
          '—',
          '',
          base64Photos
        ).catch(() => {});

        try {
          await navigator.share({
            title: 'Custom Order - Shae.made',
            text: msg,
            files: files,
          });
          setIsPreparing(false);
          showToast('Shared successfully to WhatsApp!');
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            setIsPreparing(false);
            return; // User cancelled share
          }
          console.warn('Share API failed, falling back to link method:', shareErr);
        }
      }

      // Log inquiry for fallback flow
      logInquiry(
        'Custom Order Lead',
        `Custom: ${craftType}`,
        Number(budget) || 0,
        '—',
        '',
        base64Photos
      ).catch(() => {});

      // 3. Fallback: Save photos in Firestore collection "customOrders" with unique ID
      let refLink = '';
      if (base64Photos.length > 0) {
        const orderId = `co_${Math.floor(100000 + Math.random() * 900000)}`;
        const docRef = doc(db, 'customOrders', orderId);
        await setDoc(docRef, {
          craftType,
          ideaText: ideaText.trim(),
          budget: budget || '',
          photos: base64Photos,
          createdAt: new Date().toISOString(),
        });
        const siteUrl = window.location.href.split('#')[0];
        refLink = `${siteUrl}#/ref/${orderId}`;
      }

      const finalMsg = constructMessage(refLink);
      openWhatsApp(finalMsg);
      setIsPreparing(false);
      showToast('WhatsApp opened with your details and reference link!');
    } catch (err: any) {
      console.error('Custom order submit error:', err);
      setErrorMsg('Failed to prepare order. Please try again.');
      setIsPreparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header />

      <main className="max-w-lg mx-auto px-3 sm:px-6 pt-3 pb-24">
        <div className="mb-3 px-0.5">
          <h1 className="font-luxury-serif text-lg sm:text-2xl font-bold text-[#2b352a]">
            Custom Order Builder
          </h1>
          <p className="text-xs text-[#737c6e] mt-0.5">
            Preserve wedding flowers, create personalized polaroid frames, or customize colors.
          </p>
        </div>

        <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-6 shadow-xs space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Craft Type */}
          <div>
            <label className="text-xs font-bold text-[#2b352a] block mb-1">
              Craft Type
            </label>
            <select
              value={craftType}
              onChange={(e) => setCraftType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] font-semibold focus:outline-none focus:border-[#59684c]"
            >
              {[
                'Resin frame',
                'Crochet bouquet',
                'Gift hamper',
                'Scented candle & coaster',
                'Wedding flower preservation',
                'Spotify music plaque',
                'Something completely different',
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[#2b352a] block mb-1">
              Describe your idea <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Tell us about the colors, occasion, special date, names, flower varieties, fairy lights, or any particular theme you have in mind..."
              className="w-full px-3 py-2 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c] leading-relaxed"
            />
          </div>

          {/* Reference Photos */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#2b352a]">
                Reference Photos <span className="font-normal text-[#737c6e]">(Up to 3)</span>
              </label>
              <span className="text-[11px] text-[#737c6e]">
                {refPhotos.length} / 3
              </span>
            </div>

            {refPhotos.length < 3 && (
              <label className="flex items-center justify-center gap-1.5 p-3 border border-dashed border-[#ded5c7] rounded-xl bg-[#fcf9f4] text-[#59684c] font-semibold text-xs cursor-pointer hover:bg-[#f5efe6] transition-colors mb-2">
                <span className="material-icon text-base">add_photo_alternate</span>
                <span>Upload inspiration or photo idea</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handlePhotoUpload}
                />
              </label>
            )}

            {/* Thumbnails */}
            {refPhotos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {refPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#eee7dc] shadow-xs"
                  >
                    <img
                      src={photo.dataUrl}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer text-[10px]"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs font-bold text-[#2b352a] block mb-1">
              Estimated Budget in ₹ <span className="font-normal text-[#737c6e]">(Optional)</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 750"
              className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSubmit}
              disabled={isPreparing}
              className="btn-order w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <span className="material-icon fill text-base">
                {isPreparing ? 'sync' : 'send'}
              </span>
              <span>{isPreparing ? 'Preparing Photos & WhatsApp...' : 'Send Request on WhatsApp'}</span>
            </button>

            <p className="text-[11px] text-center text-[#737c6e] font-medium pt-0.5">
              Your photos will open in the share menu. Choose WhatsApp and send.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
