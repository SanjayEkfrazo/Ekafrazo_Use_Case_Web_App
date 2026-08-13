// Responsive card grid that lists use cases
import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { fetchDomainMedia, prefetchUseCaseById } from "../services/useCaseService";
import ImageCarousel from "./ImageCarousel";

function UseCaseDenseTable({ preparedUseCases, direction, reduceMotion, onOpen }) {
  const handleRowKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(id);
    }
  };

  return (
    <motion.div
      className="ui-table-container overflow-hidden"
      initial={reduceMotion ? false : { opacity: 0, x: direction > 0 ? 10 : -10 }}
      animate={reduceMotion ? {} : { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
      exit={reduceMotion ? {} : { opacity: 0, x: direction > 0 ? -12 : 12, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="max-h-[68vh] overflow-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="border-b border-border-strong bg-surface-elevated/95">
            <tr>
              <th className="sticky top-0 z-20 font-display px-4 py-3 text-left text-xs font-semibold tracking-[0.04em] text-muted backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/90">Title</th>
              <th className="sticky top-0 z-20 font-display px-4 py-3 text-left text-xs font-semibold tracking-[0.04em] text-muted backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/90">Domain</th>
              <th className="sticky top-0 z-20 font-display px-4 py-3 text-left text-xs font-semibold tracking-[0.04em] text-muted backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/90">Client</th>
              <th className="sticky top-0 z-20 font-display px-4 py-3 text-left text-xs font-semibold tracking-[0.04em] text-muted backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/90">Updated</th>
              <th className="sticky top-0 z-20 font-display px-4 py-3 text-right text-xs font-semibold tracking-[0.04em] text-muted backdrop-blur supports-[backdrop-filter]:bg-surface-elevated/90">Action</th>
            </tr>
          </thead>
          <tbody>
            {preparedUseCases.map((item, index) => (
              <tr
                key={item.raw.id}
                tabIndex={0}
                role="button"
                aria-label={`Open use case ${item.title}`}
                onClick={() => onOpen(item.raw.id)}
                onKeyDown={(event) => handleRowKeyDown(event, item.raw.id)}
                onMouseEnter={() => {
                  prefetchUseCaseById(item.raw.id);
                }}
                className={`cursor-pointer border-b border-border/80 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${index % 2 === 0 ? "bg-surface" : "bg-surface-elevated/35"} hover:bg-primary/6`}
              >
                <td className="max-w-[360px] px-4 py-3 text-ink">
                  <p className="line-clamp-1 font-semibold">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.description}</p>
                </td>
                <td className="px-4 py-3 text-ink">{item.domain}</td>
                <td className="px-4 py-3 text-ink">{item.client}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{item.updatedLabel}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(item.raw.id);
                    }}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-ink transition-all duration-200 ease-out hover:border-primary"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function UseCaseCard({
  item,
  index,
  direction,
  reduceMotion,
  syncStep,
  domainImages,
  toInitials,
  truncate,
  onPrefetch,
  onOpen,
  onKeyOpen,
}) {
  const useCase = item.raw;
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const rotateXRaw = useTransform(pointerY, [0, 100], [7, -7]);
  const rotateYRaw = useTransform(pointerX, [0, 100], [-7, 7]);
  const rotateX = useSpring(rotateXRaw, { stiffness: 220, damping: 26, mass: 0.8 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 220, damping: 26, mass: 0.8 });
  const zoomOrigin = useMotionTemplate`${pointerX}% ${pointerY}%`;

  const handleMouseMove = (event) => {
    if (reduceMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    pointerX.set(Math.min(100, Math.max(0, x)));
    pointerY.set(Math.min(100, Math.max(0, y)));
  };

  const resetPointer = () => {
    pointerX.set(50);
    pointerY.set(50);
  };

  return (
    <motion.article
      layout
      key={useCase.id}
      role="button"
      tabIndex={0}
      aria-label={`Open use case ${item.title}`}
      onMouseEnter={() => {
        onPrefetch(useCase.id);
      }}
      onFocus={() => {
        onPrefetch(useCase.id);
      }}
      onTouchStart={() => onPrefetch(useCase.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPointer}
      onBlur={resetPointer}
      onClick={() => onOpen(useCase.id)}
      onKeyDown={(event) => onKeyOpen(event, useCase.id)}
      className="usecase-card-pro ui-card relative flex min-h-[330px] cursor-pointer flex-col gap-3 overflow-hidden p-3 outline-none motion-reduce:transition-none"
      initial={reduceMotion ? false : { opacity: 0, x: direction > 0 ? 18 : -18, scale: 0.96, filter: "blur(6px)" }}
      animate={reduceMotion ? {} : { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.42, delay: (index % 9) * 0.055, ease: [0.22, 1, 0.36, 1] } }}
      exit={reduceMotion ? {} : { opacity: 0, x: direction > 0 ? -20 : 20, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      whileHover={reduceMotion ? undefined : { scale: 0.992 }}
      transition={reduceMotion ? undefined : { type: "spring", stiffness: 220, damping: 24 }}
      style={
        reduceMotion
          ? undefined
          : {
            rotateX,
            rotateY,
            transformPerspective: 980,
            transformStyle: "preserve-3d",
          }
      }
    >
      <motion.div
        className="relative z-20 flex min-h-[302px] flex-col gap-3"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        transition={reduceMotion ? undefined : { type: "spring", stiffness: 260, damping: 24 }}
        style={reduceMotion ? undefined : { transformOrigin: zoomOrigin }}
      >
        <motion.div className="h-40" whileHover={reduceMotion ? undefined : { scale: 1.03 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {domainImages?.length > 0 ? (
            <ImageCarousel
              images={domainImages}
              altBase={`${item.domain} visual`}
              className="h-full"
              autoPlayMs={5000}
              syncStep={syncStep}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-surface-elevated">
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-semibold text-on-solid shadow-glow-brand"
                aria-label="Domain initials fallback"
                whileHover={reduceMotion ? undefined : { rotate: 6, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
              >
                {toInitials(useCase.domain)}
              </motion.div>
            </div>
          )}
        </motion.div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-ink">{item.title}</h3>
          <div className="mt-1 text-xs text-muted">
            <p><span className="font-medium text-ink">Domain:</span> {item.domain}</p>
            <p><span className="font-medium text-ink">Client:</span> {item.client}</p>
          </div>
        </div>

        <p className="line-clamp-3 text-sm text-ink/90">{truncate(item.description, 140)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
          <p className="text-[11px] text-muted">Updated {item.updatedLabel}</p>
          <motion.button
            type="button"
            onMouseEnter={() => onPrefetch(useCase.id)}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(useCase.id);
            }}
            className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink transition-all duration-200 ease-out hover:border-primary motion-reduce:transition-none"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? undefined : { type: "spring", stiffness: 360, damping: 20 }}
          >
            View Details
          </motion.button>
        </div>
      </motion.div>
    </motion.article>
  );
}

function Table({ useCases, transitionKey = "default", direction = 1, viewMode = "card" }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [domainMediaByDomain, setDomainMediaByDomain] = useState({});
  const [syncStep, setSyncStep] = useState(0);
  const isCardMode = viewMode !== "table";

  useEffect(() => {
    if (!isCardMode) {
      return undefined;
    }

    const periodMs = 5000;

    let intervalId;
    let timeoutId;

    const startSyncedTicker = () => {
      setSyncStep(Math.floor(Date.now() / periodMs));

      const now = Date.now();
      const nextBoundaryDelay = periodMs - (now % periodMs);

      timeoutId = setTimeout(() => {
        setSyncStep(Math.floor(Date.now() / periodMs));
        intervalId = setInterval(() => {
          setSyncStep(Math.floor(Date.now() / periodMs));
        }, periodMs);
      }, nextBoundaryDelay);
    };

    startSyncedTicker();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isCardMode]);

  const domainKey = (value) => String(value || "").trim().toLowerCase();

  useEffect(() => {
    if (!isCardMode) {
      setDomainMediaByDomain({});
      return undefined;
    }

    let isCancelled = false;

    async function loadDomainMedia() {
      const domains = Array.from(new Set(useCases.map((item) => String(item?.domain || "").trim()).filter(Boolean)));
      if (domains.length === 0) {
        setDomainMediaByDomain({});
        return;
      }

      try {
        const response = await fetchDomainMedia({ domains });
        if (isCancelled) {
          return;
        }

        const grouped = {};
        (response?.data || []).forEach((entry) => {
          const key = domainKey(entry.domain);
          if (!key) {
            return;
          }

          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(String(entry.image_url || "").trim());
        });

        if (Object.keys(grouped).length === 0) {
          const domainResults = await Promise.all(
            domains.map(async (domain) => {
              try {
                const perDomain = await fetchDomainMedia({ domain });
                return [domain, perDomain?.data || []];
              } catch (_error) {
                return [domain, []];
              }
            })
          );

          domainResults.forEach(([domain, rows]) => {
            const key = domainKey(domain);
            if (!key) {
              return;
            }
            grouped[key] = (rows || []).map((entry) => String(entry.image_url || "").trim()).filter(Boolean);
          });
        }

        setDomainMediaByDomain(grouped);
      } catch (_error) {
        if (!isCancelled) {
          setDomainMediaByDomain({});
        }
      }
    }

    loadDomainMedia();

    return () => {
      isCancelled = true;
    };
  }, [isCardMode, useCases]);

  const openUseCaseDetails = (id) => {
    navigate(`/use-cases/${id}`);
  };

  const handleCardKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openUseCaseDetails(id);
    }
  };

  const normalize = (value) => String(value || "").trim();

  const toInitials = (domainValue) => {
    const domain = normalize(domainValue);
    if (!domain) {
      return "NA";
    }
    const parts = domain
      .split(/\s+/)
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("");
    return (parts || domain.slice(0, 2)).toUpperCase();
  };

  const truncate = (value, maxLength = 120) => {
    const text = normalize(value);
    if (!text) {
      return "";
    }
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}...`;
  };

  const preparedUseCases = useMemo(
    () => useCases.map((useCase) => {
      const title = normalize(useCase.title) || "Untitled use case";
      const domain = normalize(useCase.domain) || "Unknown";
      const client = normalize(useCase.client_name) || "Not specified";
      const description = normalize(useCase.description) || "No description available yet.";
      const parsedUpdatedAt = useCase.updated_at ? new Date(String(useCase.updated_at).replace(" ", "T")) : null;
      const updatedLabel = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
        ? parsedUpdatedAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
        : "N/A";
      return {
        raw: useCase,
        title,
        domain,
        domainKey: domainKey(useCase.domain),
        client,
        description,
        updatedLabel,
      };
    }),
    [useCases]
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isCardMode ? (
        <motion.div
          key={transitionKey}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          initial={reduceMotion ? false : { opacity: 0, x: direction > 0 ? 10 : -10 }}
          animate={reduceMotion ? {} : { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
          exit={reduceMotion ? {} : { opacity: 0, x: direction > 0 ? -12 : 12, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] } }}
        >
          {preparedUseCases.map((item, index) => (
            <UseCaseCard
              key={item.raw.id}
              item={item}
              index={index}
              direction={direction}
              reduceMotion={reduceMotion}
              syncStep={syncStep}
              domainImages={domainMediaByDomain[item.domainKey]}
              toInitials={toInitials}
              truncate={truncate}
              onPrefetch={prefetchUseCaseById}
              onOpen={openUseCaseDetails}
              onKeyOpen={handleCardKeyDown}
            />
          ))}
        </motion.div>
      ) : (
        <UseCaseDenseTable
          key={transitionKey}
          preparedUseCases={preparedUseCases}
          direction={direction}
          reduceMotion={reduceMotion}
          onOpen={openUseCaseDetails}
        />
      )}
    </AnimatePresence>
  );
}

export default memo(Table);
