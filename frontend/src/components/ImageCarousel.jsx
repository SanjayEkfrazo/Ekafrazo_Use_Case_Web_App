import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../utils/motion";
import useAutoMotionState from "../hooks/useAutoMotionState";

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
  const [navDirection, setNavDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const { isIdle, tick } = useAutoMotionState({ enabled: !reduceMotion, idleMs: 3000, tickMs: 2600 });
  const isSyncControlled = Number.isFinite(syncStep);
  const safeImages = useMemo(
    () => images.map((url) => String(url || "").trim()).filter(Boolean),
    [images]
  );

  const visibleImages = useMemo(
    () => safeImages
      .map((url, sourceIndex) => ({ url, sourceIndex }))
      .filter((item) => !brokenByIndex[item.sourceIndex]),
    [safeImages, brokenByIndex]
  );

  useEffect(() => {
    setBrokenByIndex({});
    setActiveIndex(0);
    setNavDirection(1);
  }, [safeImages]);

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
      setNavDirection(1);
      setActiveIndex((current) => (current + 1) % visibleImages.length);
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [autoPlayMs, visibleImages.length, isHovering, isFocused, isSyncControlled]);

  if (visibleImages.length === 0) {
    return null;
  }

  const clampedIndex = Math.min(activeIndex, visibleImages.length - 1);
  const displayIndex = isSyncControlled
    ? ((Math.floor(syncStep) % visibleImages.length) + visibleImages.length) % visibleImages.length
    : clampedIndex;

  const showAutoAura = !reduceMotion && isIdle && !isHovering && !isFocused;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border bg-surface-elevated ${className}`}
      role="region"
      aria-label={`${altBase} carousel`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      {showAutoAura && (
        <motion.div
          key={`aura-${tick}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-primary/15 via-[rgb(var(--color-gradient-via))]/18 to-transparent"
          initial={{ opacity: 0, x: "-12%" }}
          animate={{ opacity: [0, 0.38, 0], x: ["-12%", "12%", "20%"] }}
          transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      <AnimatePresence mode="wait" initial={false} custom={navDirection}>
        <motion.img
          key={`${visibleImages[displayIndex].url}-${displayIndex}`}
          custom={navDirection}
          src={visibleImages[displayIndex].url}
          alt={`${altBase} ${displayIndex + 1} of ${visibleImages.length}`}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
          decoding="async"
          initial={reduceMotion ? false : { opacity: 0, x: navDirection * 42, scale: 1.03 }}
          animate={reduceMotion ? {} : { opacity: 1, x: 0, scale: 1, transition: { duration: motionTokens.standard, ease: motionTokens.ease } }}
          exit={reduceMotion ? {} : { opacity: 0, x: navDirection * -30, scale: 1.015, transition: { duration: motionTokens.fast, ease: motionTokens.ease } }}
          onError={() => {
            const sourceIndex = visibleImages[displayIndex]?.sourceIndex;
            if (sourceIndex === undefined) {
              return;
            }
            setBrokenByIndex((current) => ({ ...current, [sourceIndex]: true }));
          }}
        />
      </AnimatePresence>

      {visibleImages.length > 1 && !isSyncControlled && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2 py-1">
          {visibleImages.map((_, index) => (
            <span
              key={`dot-${index}`}
              aria-hidden
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === displayIndex ? "w-4 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
