"use client";

import { useEffect, useRef, useState } from "react";

export default function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  wrapperClassName = "",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;

    if (img?.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className={`skeleton-shimmer absolute inset-0 z-0 ${skeletonClassName}`}
        />
      )}

      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`relative z-10 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
}