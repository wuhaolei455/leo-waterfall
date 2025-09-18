import { MutableRefObject, useEffect, useState } from "react";

export interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize<T extends HTMLElement>(
  containerRef: MutableRefObject<T | null>
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef?.current;
    if (!element) return;

    const updateSize = () => {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
    };

    updateSize();

    let resizeObserver: ResizeObserver | undefined;
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


