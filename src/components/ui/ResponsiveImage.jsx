import React from 'react';
import { resolveMediaUrl } from '../../utils/mediaUrl';

/**
 * Image optimisée : lazy/eager, fetchpriority, sizes.
 * Passez srcSet pour des variantes (ex. WebP générées).
 */
const ResponsiveImage = ({
  src,
  alt = '',
  className,
  priority = false,
  sizes = '100vw',
  srcSet,
  width,
  height,
  onError,
  ...rest
}) => {
  const loading = priority ? 'eager' : 'lazy';
  const fetchpriority = priority ? 'high' : undefined;
  const resolvedSrc = resolveMediaUrl(src);

  if (srcSet) {
    return (
      <img
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        {...(fetchpriority ? { fetchpriority } : {})}
        decoding={priority ? 'sync' : 'async'}
        width={width}
        height={height}
        onError={onError}
        {...rest}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      {...(fetchpriority ? { fetchpriority } : {})}
      decoding={priority ? 'sync' : 'async'}
      width={width}
      height={height}
      onError={onError}
      {...rest}
    />
  );
};

export default ResponsiveImage;
