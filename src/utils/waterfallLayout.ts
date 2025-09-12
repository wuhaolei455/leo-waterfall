import { ImageInfo, WaterfallLayoutResult } from "../types";

export function createWaterfallLayout(
    images: ImageInfo[],
    columnWidth = 400,
    gap = 16,
    minColumns = 2,
    maxColumns = 8
): WaterfallLayoutResult {
    const waterfallLayoutParams: WaterfallLayoutResult = {
        items: [],
        totalColumns: 0,
        maxHeight: 0,
        totalHeight: 0,
    }

    return waterfallLayoutParams;
}