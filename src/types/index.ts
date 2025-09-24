import type { CSSProperties, ReactNode } from "react";

// 图片数据
export interface ImageInfo {
    id?: string | number;
    width?: number;
    height?: number;
    src?: string;
    alt?: string;
    /** 图片原始宽度，默认等于 width */
    originalWidth?: number;
    /** 图片原始高度，默认等于 height */
    originalHeight?: number;
    /** 宽高比，height / width */
    aspectRatio?: number;
    /** 额外数据 */
    metadata?: Record<string, unknown>;
}

// 瀑布流布局列
export interface WaterfallLayoutColumnItem {
    items: ImageInfo[];
    totalHeight: number;
}

// 瀑布流布局
export interface WaterfallLayoutResult {
    columns: WaterfallLayoutColumnItem[];
    /** @deprecated 请使用 columns */
    images?: WaterfallLayoutColumnItem[];
    totalColumns: number;
    columnWidth: number;
    containerWidth: number;
    gap: number;
    maxColumnHeight: number;
}

export interface RenderWaterfallItemParams {
    item: ImageInfo;
    columnIndex: number;
    itemIndex: number;
}

// 入参
export interface WaterfallGridProps {
    images: ImageInfo[];
    columnWidth?: number;
    gap?: number;
    minColumns?: number;
    maxColumns?: number;
    autoResize?: boolean;
    className?: string;
    columnClassName?: string;
    columnStyle?: CSSProperties;
    style?: CSSProperties;
    emptyPlaceholder?: ReactNode;
    renderItem?: (params: RenderWaterfallItemParams) => ReactNode;
    onLayout?: (layout: WaterfallLayoutResult) => void;
}