import { ImageInfo, WaterfallLayoutColumnItem, WaterfallLayoutResult } from "../types";

export interface CreateWaterfallLayoutOptions {
    columnWidth?: number;
    gap?: number;
    minColumns?: number;
    maxColumns?: number;
    containerWidth?: number;
    minimumItemHeight?: number;
    defaultItemHeight?: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getContainerWidth(containerWidth?: number): number {
    if (typeof containerWidth === "number" && Number.isFinite(containerWidth) && containerWidth > 0) {
        return containerWidth;
    }

    if (typeof window !== "undefined" && typeof window.innerWidth === "number") {
        return window.innerWidth;
    }

    return 1200;
}

function getSafeGap(gap?: number): number {
    if (typeof gap !== "number" || Number.isNaN(gap)) {
        return 0;
    }
    return Math.max(0, gap);
}

/**
 * 计算瀑布流布局
 */
export function createWaterfallLayout(
    images: ImageInfo[],
    options: CreateWaterfallLayoutOptions = {}
): WaterfallLayoutResult {
    const {
        columnWidth = 320,
        gap: rawGap = 16,
        minColumns = 2,
        maxColumns = 8,
        containerWidth,
    } = options;

    const gap = getSafeGap(rawGap);

    if (!Array.isArray(images) || images.length === 0) {
        const columns: WaterfallLayoutColumnItem[] = Array.from({ length: minColumns }, () => ({ items: [], totalHeight: 0 }));
        return {
            columns,
            images: columns,
            totalColumns: minColumns,
            columnWidth,
            containerWidth: getContainerWidth(containerWidth),
            gap,
            maxColumnHeight: 0,
        };
    }

    const computedContainerWidth = getContainerWidth(containerWidth);
    const availableWidth = Math.max(computedContainerWidth - gap * 2, columnWidth);
    const columnWithGap = columnWidth + gap;

    let columnCount = Math.floor(availableWidth / columnWithGap);
    columnCount = clamp(columnCount, minColumns, maxColumns);

    const columns: WaterfallLayoutColumnItem[] = Array.from({ length: columnCount }, () => ({
        items: [],
        totalHeight: 0,
    }));

    images.forEach((image, index) => {
        const width = image.width ?? image.originalWidth ?? columnWidth;
        const height = image.height ?? image.originalHeight ?? columnWidth;
        const aspectRatio = image.aspectRatio ?? (height && width ? height / width : undefined);

        const scaledHeight = aspectRatio ? columnWidth * aspectRatio : (height * columnWidth) / (width || columnWidth);

        const shortestColumnIndex = columns.reduce((minIndex, column, columnIndex) => (
            columns[minIndex].totalHeight > column.totalHeight ? columnIndex : minIndex
        ), 0);

        const metadata = image.metadata ? { ...image.metadata } : undefined;

        const item: ImageInfo = {
            id: image.id ?? index,
            width: columnWidth,
            height: scaledHeight,
            src: image.src,
            alt: image.alt,
            metadata,
            originalHeight: height,
            originalWidth: width,
            aspectRatio: aspectRatio ?? (height && width ? height / width : undefined),
        };

        columns[shortestColumnIndex].items.push(item);
        columns[shortestColumnIndex].totalHeight += scaledHeight + gap;
    });

    const maxColumnHeight = columns.reduce((max, column) => Math.max(max, column.totalHeight), 0);

    return {
        columns,
        images: columns,
        totalColumns: columnCount,
        columnWidth,
        containerWidth: computedContainerWidth,
        gap,
        maxColumnHeight,
    };
}