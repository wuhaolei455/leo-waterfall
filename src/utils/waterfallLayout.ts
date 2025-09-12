import { ImageInfo, WaterfallLayoutResult } from "../types";

export function createWaterfallLayout(
    images: ImageInfo[],
    _columnWidth = 400,
    _gap = 16,
    _minColumns = 2,
    _maxColumns = 8
): WaterfallLayoutResult {
    const waterfallLayoutParams: WaterfallLayoutResult = {
        items: [],
        totalColumns: 0,
        maxHeight: 0,
        totalHeight: 0,
    }

    return waterfallLayoutParams;
}