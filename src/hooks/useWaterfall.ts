import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ImageItem,
  WaterfallLayoutResult,
  UseWaterfallOptions,
  UseWaterfallResult,
} from '../types';
import { createWaterfallLayout, debounce } from '../utils/waterfallLayout';

/**
 * 瀑布流布局 Hook
 * @param options 配置选项
 * @returns 瀑布流布局结果和相关方法
 */
export function useWaterfall(options: UseWaterfallOptions): UseWaterfallResult {
  const {
    images,
    columnWidth = 300,
    gap = 16,
    minColumns = 1,
    maxColumns = 5,
    containerWidth: providedWidth,
  } = options;

  const [layout, setLayout] = useState<WaterfallLayoutResult | null>(null);
  const [containerWidth, setContainerWidth] = useState(providedWidth || 1200);
  const [isCalculating, setIsCalculating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 更新容器宽度
  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
    }
  }, []);

  // 防抖的布局更新函数
  const debouncedUpdateLayout = useCallback(
    debounce(() => {
      updateContainerWidth();
    }, 150),
    [updateContainerWidth]
  );

  // 重新计算布局
  const recalculate = useCallback(() => {
    if (images.length === 0) {
      setLayout(null);
      return;
    }

    setIsCalculating(true);
    
    // 使用 requestAnimationFrame 来确保布局计算不阻塞 UI
    requestAnimationFrame(() => {
      try {
        const actualColumnWidth = providedWidth ? columnWidth : Math.min(columnWidth, containerWidth / minColumns);
        const waterfallLayout = createWaterfallLayout(
          images,
          actualColumnWidth,
          gap,
          minColumns,
          Math.max(minColumns, Math.floor(containerWidth / (actualColumnWidth + gap)))
        );
        setLayout(waterfallLayout);
      } catch (error) {
        console.error('瀑布流布局计算失败:', error);
        setLayout(null);
      } finally {
        setIsCalculating(false);
      }
    });
  }, [images, containerWidth, columnWidth, gap, minColumns, maxColumns, providedWidth]);

  // 监听容器宽度变化
  useEffect(() => {
    if (!providedWidth) {
      updateContainerWidth();
      window.addEventListener('resize', debouncedUpdateLayout);
      return () => {
        window.removeEventListener('resize', debouncedUpdateLayout);
      };
    }
  }, [providedWidth, debouncedUpdateLayout, updateContainerWidth]);

  // 当依赖项变化时重新计算布局
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  return {
    layout,
    containerRef,
    isCalculating,
    recalculate,
  };
}

/**
 * 图片懒加载 Hook
 * @param options 懒加载选项
 * @returns 懒加载相关的状态和方法
 */
export function useLazyLoading(options: {
  rootMargin?: string;
  threshold?: number;
} = {}) {
  const { rootMargin = '100px', threshold = 0.1 } = options;
  const [loadedImages, setLoadedImages] = useState<Set<string | number>>(new Set());
  const [visibleImages, setVisibleImages] = useState<Set<string | number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 初始化 Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const imageId = entry.target.getAttribute('data-image-id');
          if (imageId) {
            if (entry.isIntersecting) {
              setVisibleImages(prev => new Set(prev).add(imageId));
            } else {
              setVisibleImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(imageId);
                return newSet;
              });
            }
          }
        });
      },
      { rootMargin, threshold }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold]);

  // 观察图片元素
  const observeImage = useCallback((element: HTMLElement | null, imageId: string | number) => {
    if (!element || !observerRef.current) return;
    
    element.setAttribute('data-image-id', String(imageId));
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, []);

  // 标记图片为已加载
  const markAsLoaded = useCallback((imageId: string | number) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  }, []);

  // 检查图片是否应该加载
  const shouldLoad = useCallback((imageId: string | number) => {
    return visibleImages.has(imageId) || loadedImages.has(imageId);
  }, [visibleImages, loadedImages]);

  return {
    loadedImages,
    visibleImages,
    observeImage,
    markAsLoaded,
    shouldLoad,
  };
}
