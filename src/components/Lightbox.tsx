import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../data/images';

export const Lightbox: React.FC = () => {
  const { stories, lightboxIndex, closeLightbox, openLightbox } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex < 0) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') {
        openLightbox((lightboxIndex + 1) % stories.length);
      }
      if (e.key === 'ArrowLeft') {
        openLightbox((lightboxIndex - 1 + stories.length) % stories.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, stories.length, closeLightbox, openLightbox]);

  if (lightboxIndex < 0 || !stories[lightboxIndex]) return null;

  const current = stories[lightboxIndex];
  const imgSrc = IMAGES[current.img] || current.img;

  return (
    <div
      onClick={closeLightbox}
      className="fixed inset-0 z-50 bg-[#1c1f14]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
    >
      {/* Close button */}
      <button
        onClick={closeLightbox}
        className="absolute top-4 right-4 w-11 h-11 rounded-full border border-[#e2d4b9]/40 bg-[#e2d4b9]/15 text-[#e2d4b9] hover:bg-[#e2d4b9]/30 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close lightbox"
      >
        <span className="material-icon">close</span>
      </button>

      {/* Prev / Next buttons */}
      {stories.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox((lightboxIndex - 1 + stories.length) % stories.length);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#e2d4b9]/40 bg-[#e2d4b9]/15 text-[#e2d4b9] hover:bg-[#e2d4b9]/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous story"
          >
            <span className="material-icon">chevron_left</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox((lightboxIndex + 1) % stories.length);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-[#e2d4b9]/40 bg-[#e2d4b9]/15 text-[#e2d4b9] hover:bg-[#e2d4b9]/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next story"
          >
            <span className="material-icon">chevron_right</span>
          </button>
        </>
      )}

      {/* Media container */}
      <figure
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full flex flex-col items-center gap-3.5 my-auto"
      >
        <img
          src={imgSrc}
          alt={current.cap || 'Shae.made handcrafted story'}
          className="max-h-[72vh] w-auto max-w-full object-contain rounded-2xl border-2 border-[#e2d4b9]/30 shadow-2xl"
        />

        {(current.cap || current.url) && (
          <figcaption className="text-center text-[#e2d4b9] text-sm max-w-md px-2">
            {current.cap && <p className="font-semibold">{current.cap}</p>}
            {current.url && (
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#c9a06c] hover:underline mt-1 font-bold"
              >
                <span>View on Instagram</span>
                <span className="material-icon text-xs">open_in_new</span>
              </a>
            )}
          </figcaption>
        )}

        <div className="text-xs text-[#cdbf9d] font-bold tracking-widest mt-1">
          {lightboxIndex + 1} / {stories.length}
        </div>
      </figure>
    </div>
  );
};
