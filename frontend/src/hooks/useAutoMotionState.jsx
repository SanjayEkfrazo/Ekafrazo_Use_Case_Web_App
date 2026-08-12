import { useEffect, useState } from "react";

function useAutoMotionState({ enabled = true, idleMs = 4200, tickMs = 2600 } = {}) {
  const [isIdle, setIsIdle] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      return undefined;
    }

    let idleTimeout;

    const setIdleLater = () => {
      window.clearTimeout(idleTimeout);
      setIsIdle(false);
      idleTimeout = window.setTimeout(() => {
        setIsIdle(true);
      }, idleMs);
    };

    setIdleLater();

    const activityEvents = ["pointermove", "keydown", "wheel", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, setIdleLater, { passive: true });
    });

    return () => {
      window.clearTimeout(idleTimeout);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, setIdleLater);
      });
    };
  }, [enabled, idleMs]);

  useEffect(() => {
    if (!enabled) {
      setTick(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, tickMs]);

  return { isIdle, tick };
}

export default useAutoMotionState;