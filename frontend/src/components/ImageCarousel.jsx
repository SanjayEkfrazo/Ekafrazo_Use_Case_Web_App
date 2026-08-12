import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ImageCarousel({
  images = [],
  altBase = "Image",
  className = "",
  imageClassName = "",
  autoPlayMs = 0,
  syncStep,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenByIndex, setBrokenByIndex] = useState({});
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const touchStartXRef = useRef(null);
  const isSyncControlled = Number.isFinite(syncStep);
  const safeImages = useMemo(
    () => images.map((url) => String(url || "").trim()).filter(Boolean),
    [images]
  );

  if (safeImages.length === 0) {
    return null;
  }

  const visibleImages = safeImages
    .map((url, sourceIndex) => ({ url, sourceIndex }))
    .filter((item) => !brokenByIndex[item.sourceIndex]);

  if (visibleImages.length === 0) {
    return null;
  }

  useEffect(() => {
    setActiveIndex((current) => {
      if (visibleImages.length <= 0) {
        return 0;
      }
      return ((current % visibleImages.length) + visibleImages.length) % visibleImages.length;
    });
  }, [visibleImages.length]);

  useEffect(() => {
    if (isSyncControlled) {
      return undefined;
    }

    if (!autoPlayMs || autoPlayMs < 200 || visibleImages.length <= 1 || isHovering || isFocused) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleImages.length);
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [autoPlayMs, visibleImages.length, isHovering, isFocused, isSyncControlled]);

  const clampedIndex = Math.min(activeIndex, visibleImages.length - 1);
  const displayIndex = isSyncControlled
    ? ((Math.floor(syncStep) % visibleImages.length) + visibleImages.length) % visibleImages.length
    : clampedIndex;

  const prev = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (current - 1 + visibleImages.length) % visibleImages.length);
  };

  const next = (event) => {
    event?.stopPropagation();
    setActiveIndex((current) => (current + 1) % visibleImages.length);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border bg-surface-elevated ${className}`}
      role="region"
      aria-label={`${altBase} carousel`}
      tabIndex={0}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      onKeyDown={(event) => {
        if (isSyncControlled) {
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prev(event);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next(event);
        }
      }}
      onTouchStart={(event) => {
        touchStartXRef.current = event.touches?.[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (isSyncControlled) {
          return;
        }

        const endX = event.changedTouches?.[0]?.clientX ?? null;
        if (touchStartXRef.current === null || endX === null) {
          return;
        }

        const delta = endX - touchStartXRef.current;
        touchStartXRef.current = null;
        if (Math.abs(delta) < 28) {
          return;
        }

        if (delta > 0) {
          prev(event);
        } else {
          next(event);
        }
      }}
    >
      <img
        src={visibleImages[displayIndex].url}
        alt={`${altBase} ${displayIndex + 1} of ${visibleImages.length}`}
        className={`h-full w-full object-cover ${imageClassName}`}
        loading="lazy"
        decoding="async"
        onError={() => {
          const sourceIndex = visibleImages[displayIndex]?.sourceIndex;
          if (sourceIndex === undefined) {
            return;
          }
          setBrokenByIndex((current) => ({ ...current, [sourceIndex]: true }));
        }}
      />

      {visibleImages.length > 1 && !isSyncControlled && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/85 text-ink opacity-0 transition-opacity duration-200 hover:border-border-strong group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/85 text-ink opacity-0 transition-opacity duration-200 hover:border-border-strong group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2 py-1">
            {visibleImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
                  index === displayIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;
