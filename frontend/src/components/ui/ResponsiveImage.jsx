import React from 'react';

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
  const fetchPriority = priority ? 'high' : undefined;

  if (srcSet) {
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
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
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={priority ? 'sync' : 'async'}
      width={width}
      height={height}
      onError={onError}
      {...rest}
    />
  );
};

export default ResponsiveImage;
