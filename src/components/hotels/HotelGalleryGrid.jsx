import React from 'react';
import Icon from '../ui/Icon';

const HotelGalleryGrid = ({ images = [], hotelName, onOpen, t }) => {
  if (!images.length) return null;

  const visible = images.slice(0, 5);
  const extra = images.length - 5;

  if (visible.length === 1) {
    return (
      <div className="htl-gallery htl-gallery--single">
        <button type="button" className="htl-gallery__cell htl-gallery__cell--main" onClick={() => onOpen(0)}>
          <img src={visible[0]} alt={hotelName} />
        </button>
      </div>
    );
  }

  return (
    <div className={`htl-gallery${visible.length < 5 ? ' htl-gallery--compact' : ''}`}>
      <button
        type="button"
        className="htl-gallery__cell htl-gallery__cell--main"
        onClick={() => onOpen(0)}
        aria-label={`${t('stays_gallery')} 1`}
      >
        <img src={visible[0]} alt={hotelName} />
      </button>
      <div className="htl-gallery__side">
        {visible.slice(1, 5).map((src, i) => {
          const idx = i + 1;
          const isLast = idx === 4 && extra > 0;
          return (
            <button
              key={src}
              type="button"
              className="htl-gallery__cell"
              onClick={() => onOpen(idx)}
              aria-label={`${t('stays_gallery')} ${idx + 1}`}
            >
              <img src={src} alt="" loading="lazy" />
              {isLast && (
                <span className="htl-gallery__more">
                  <Icon name="Images" size={16} />
                  {t('hotels_gallery_all')} ({images.length})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HotelGalleryGrid;
