import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { WaterfallGridProps, ImageInfo, WaterfallLayoutResult } from "../types";
import { createWaterfallLayout } from "../utils/waterfallLayout";

function WaterfallGrid({
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
}: WaterfallGridProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
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

        const width = Math.floor(containerRef.current.getBoundingClientRect().width);
        if (Number.isFinite(width) && width > 0) {
            setContainerWidth((prev) => (prev === width ? prev : width));
        }
    }, []);

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
    }, [isEmpty, images, columnWidth, gap, minColumns, maxColumns, containerWidth, onLayout]);

    useEffect(() => {
        if (!autoResize) {
            return;
        }

        const ResizeObserverRef = typeof window !== "undefined" ? window.ResizeObserver : undefined;

        if (ResizeObserverRef) {
            const observer = new ResizeObserverRef(() => handleResize());
            if (containerRef.current) {
                observer.observe(containerRef.current);
                handleResize();
            }

            return () => observer.disconnect();
        }

        handleResize();

        const resizeListener = () => handleResize();
        if (typeof window !== "undefined") {
            window.addEventListener("resize", resizeListener);
            handleResize();

            return () => {
                window.removeEventListener("resize", resizeListener);
            };
        }

        return undefined;
    }, [autoResize, handleResize]);

    useEffect(() => {
        if (!autoResize) {
            handleResize();
        }
    }, [autoResize, handleResize, images, columnWidth, gap, minColumns, maxColumns]);

    useEffect(() => {
        computeLayout();
    }, [computeLayout]);

    if (isEmpty) {
        return (
            <div
                className={baseClassName}
                style={{
                    ...style,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 16px",
                    color: "#6b7280",
                    fontSize: 14,
                }}
                ref={containerRef}
            >
                {emptyPlaceholder ?? <div className="sw-waterfall-empty">暂无数据</div>}
            </div>
        );
    }

    if (!layout) {
        return (
            <div
                className={baseClassName}
                style={{
                    ...style,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 16px",
                    color: "#6b7280",
                    fontSize: 14,
                }}
                ref={containerRef}
            >
                <div className="sw-waterfall-placeholder">正在计算布局...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={baseClassName}
            style={{
                display: "flex",
                gap,
                alignItems: "flex-start",
                width: "100%",
                boxSizing: "border-box",
                ...style,
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
    );
}

function defaultRenderItem(item: ImageInfo) {
    const resolvedHeight = item.height ?? item.originalHeight ?? item.originalWidth;
    const itemStyle: CSSProperties = {
        position: "relative",
        borderRadius: 8,
        background: "#f8fafc",
        boxShadow: "0 8px 16px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
    };

    return (
        <div className="sw-waterfall-item" style={itemStyle}>
            {item.src ? (
                <img
                    src={item.src}
                    alt={item.alt ?? "waterfall-item"}
                    style={{
                        display: "block",
                        width: "100%",
                        height: resolvedHeight,
                        objectFit: "cover",
                        borderRadius: 8,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
                    }}
                    loading="lazy"
                />
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: resolvedHeight,
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b7280",
                        fontSize: 12,
                    }}
                >
                    {item.alt ?? "Loading"}
                </div>
            )}
        </div>
    );
}

export default WaterfallGrid;