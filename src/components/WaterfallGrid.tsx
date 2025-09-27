import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  WaterfallGridProps,
  WaterfallLayoutResult,
} from "../types";
import { createWaterfallLayout } from "../utils/waterfallLayout";
import { defaultRenderItem } from "./DefaultImageRenterItem";

function WaterfallGrid(props: WaterfallGridProps) {
  const {
    images = [],
    columnWidth = 320,
    gap = 16,
    minColumns = 2,
    maxColumns = 8,
    autoResize = true,
    className,
    columnClassName,
    columnStyle,
    style,
    emptyPlaceholder,
    renderItem,
    onLayout,
    // LoadMore 相关属性
    hasMore = false,
    loading = false,
    loadingThreshold = 500,
    onLoadMore,
    loadMorePlaceholder,
    loadingPlaceholder,
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [layout, setLayout] = useState<WaterfallLayoutResult | null>(null);

  const isEmpty = !images || images.length === 0;

  const baseClassName = useMemo(() => {
    const classes = ["sw-waterfall-grid"];
    if (className) {
      classes.push(className);
    }
    return classes.join(" ");
  }, [className]);

  const handleResize = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const width = Math.floor(
      containerRef.current.getBoundingClientRect().width,
    );
    if (Number.isFinite(width) && width > 0) {
      setContainerWidth((prev) => (prev === width ? prev : width));
    }
  }, []);

  const placeholderStyle = useMemo<CSSProperties>(
    () => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      color: "#6b7280",
      fontSize: 14,
      boxSizing: "border-box",
      ...style,
    }),
    [style],
  );

  const renderPlaceholder = useCallback(
    (content: ReactNode) => (
      <div
        ref={containerRef}
        className={baseClassName}
        style={placeholderStyle}
      >
        {content}
      </div>
    ),
    [baseClassName, placeholderStyle],
  );

  const computeLayout = useCallback(() => {
    if (isEmpty) {
      setLayout(null);
      return;
    }

    const layoutResult = createWaterfallLayout(images, {
      columnWidth,
      gap,
      minColumns,
      maxColumns,
      containerWidth,
    });

    setLayout(layoutResult);
    onLayout?.(layoutResult);
  }, [isEmpty,images,columnWidth,gap,minColumns,maxColumns,containerWidth,onLayout]);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) {
      return;
    }

    handleResize();

    if (!autoResize) {
      return;
    }

    const ResizeObserverRef =
      typeof window !== "undefined" ? window.ResizeObserver : undefined;

    if (ResizeObserverRef) {
      const observer = new ResizeObserverRef(() => handleResize());
      observer.observe(containerEl);

      return () => observer.disconnect();
    }

    if (typeof window !== "undefined") {
      const resizeListener = () => handleResize();
      window.addEventListener("resize", resizeListener);

      return () => {
        window.removeEventListener("resize", resizeListener);
      };
    }

    return undefined;
  }, [autoResize, handleResize]);

  useEffect(() => {
    if (autoResize) {
      return;
    }

    handleResize();
  }, [
    autoResize,
    handleResize,
    images,
    columnWidth,
    gap,
    minColumns,
    maxColumns,
  ]);

  useEffect(() => {
    computeLayout();
  }, [computeLayout]);

  // LoadMore 监听逻辑
  useEffect(() => {
    const triggerEl = loadMoreTriggerRef.current;
    if (!triggerEl || !hasMore || loading || !onLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 当触发区域进入视口时，调用 loadMore
            console.log('LoadMore执行');
            onLoadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: `${loadingThreshold}px`, // 提前触发的距离
        threshold: 0.1,
      }
    );

    observer.observe(triggerEl);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, loadingThreshold]);

  // 渲染 LoadMore 区域
  const renderLoadMoreSection = useCallback(() => {
    if (!hasMore && !loading) {
      return null;
    }

    const loadMoreStyle: CSSProperties = {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      marginTop: gap,
      color: "#6b7280",
      fontSize: 14,
      boxSizing: "border-box",
    };

    if (loading) {
      // 加载中状态
      return (
        <div style={loadMoreStyle}>
          {loadingPlaceholder ?? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>⏳</div>
              <div>正在加载更多...</div>
            </div>
          )}
        </div>
      );
    }

    if (hasMore) {
      // 有更多数据，显示触发区域
      return (
        <div ref={loadMoreTriggerRef} style={loadMoreStyle}>
          {loadMorePlaceholder ?? (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>👆</div>
              <div>滚动加载更多</div>
            </div>
          )}
        </div>
      );
    }

    // 没有更多数据
    return (
      <div style={loadMoreStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}>✨</div>
          <div>没有更多数据了</div>
        </div>
      </div>
    );
  }, [hasMore, loading, gap, loadingPlaceholder, loadMorePlaceholder]);

  if (isEmpty) {
    return renderPlaceholder(
      emptyPlaceholder ?? <div className="sw-waterfall-empty">暂无数据</div>,
    );
  }

  if (!layout) {
    return renderPlaceholder(
      <div className="sw-waterfall-placeholder">正在计算布局...</div>,
    );
  }

  return (
    <div
      ref={containerRef}
      className={baseClassName}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* 瀑布流网格 */}
      <div
        style={{
          display: "flex",
          gap,
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {layout.columns.map((column, columnIndex) => {
          const columnClasses = ["sw-waterfall-column"];
          if (columnClassName) {
            columnClasses.push(columnClassName);
          }

          return (
            <div
              key={columnIndex}
              className={columnClasses.join(" ")}
              style={{
                display: "flex",
                flexDirection: "column",
                gap,
                width: layout.columnWidth,
                boxSizing: "border-box",
                ...columnStyle,
              }}
            >
              {column.items.map((item, itemIndex) => {
                const element = renderItem
                  ? renderItem({ item, columnIndex, itemIndex })
                  : defaultRenderItem(item);

                return (
                  <Fragment key={item.id ?? `${columnIndex}-${itemIndex}`}>
                    {element}
                  </Fragment>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* LoadMore 区域 */}
      {renderLoadMoreSection()}
    </div>
  );
}

export default WaterfallGrid;
