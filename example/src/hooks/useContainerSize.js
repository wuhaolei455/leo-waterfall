import { useEffect, useState } from "react";

export function useContainerSize(containerRef) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef?.current) return;

    const element = containerRef.current;

    const updateSize = () => {
      const { offsetWidth, offsetHeight } = element;
      setSize({ width: offsetWidth, height: offsetHeight });
    };

    updateSize();

    // Prefer ResizeObserver for accuracy; fall back to window resize
    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(element);
    } else {
      window.addEventListener("resize", updateSize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateSize);
      }
    };
  }, [containerRef]);

  return size;
}


