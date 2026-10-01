import React, { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';
import './ImageLightbox.css';

const ImageLightbox = ({ images, initialIndex = 0, onClose, alt = '' }) => {
  const [index, setIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);

  const go = useCallback(
    (dir) => {
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, go]);

  const onTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (touchStart == null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) go(diff > 0 ? -1 : 1);
    setTouchStart(null);
  };

  if (!images?.length) return null;

  return (
    <div
      className="img-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie"
    >
      <button
        type="button"
        className="img-lightbox__close"
        onClick={onClose}
        aria-label="Fermer"
      >
        <Icon name="X" size={22} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="img-lightbox__nav img-lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Précédent"
          >
            <Icon name="ChevronLeft" size={28} />
          </button>
          <button
            type="button"
            className="img-lightbox__nav img-lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Suivant"
          >
            <Icon name="ChevronRight" size={28} />
          </button>
        </>
      )}

      <div
        className="img-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img src={images[index]} alt={alt} draggable={false} />
        {images.length > 1 && (
          <p className="img-lightbox__counter">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
