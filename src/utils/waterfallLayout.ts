import { ImageInfo, WaterfallLayoutColumnItem, WaterfallLayoutResult } from "../types";

// 贪心算法实现瀑布流算法
// 一组图片宽高
// 一个列宽、一个间隙、一个最小列数、一个最大列数
// 返回：总列数、最大高度、总高度、分组后的图片宽高？（不应该是一个二维数组吗 √）
export function createWaterfallLayout(
    images: ImageInfo[],
    _columnWidth = 400,
    _gap = 16,
    _minColumns = 2,
    _maxColumns = 8
): WaterfallLayoutResult {
    // todo 计算列数
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const availableWidth = screenWidth - 64; // 减去页面边距
    const columnWithGap = _columnWidth + _gap;

    let columnCount = Math.floor(availableWidth / columnWithGap);
    columnCount = Math.max(_minColumns, Math.min(_maxColumns, columnCount));

    const columns: WaterfallLayoutColumnItem[] = Array.from({ length: columnCount }, () => {
        const initData: WaterfallLayoutColumnItem = {
            items: [],
            totalHeight: 0,
        }
        return initData;
    });
    const waterfallLayoutParams: WaterfallLayoutResult = {
        images: columns,
        totalColumns: columnCount,
    }

    // 贪心算法，填充columns
    images.forEach((image) => {
        const scaledHeight = (image.height * _columnWidth) / image.width;
        const currentShortestColumnIndex = columns.reduce((minIndex, column, index) => {
            return columns[minIndex].totalHeight > column.totalHeight ? index : minIndex;
        }, 0);

        columns[currentShortestColumnIndex].items.push({
            width: _columnWidth,
            height: scaledHeight,
        });
        columns[currentShortestColumnIndex].totalHeight += scaledHeight + _gap;
    });

    return waterfallLayoutParams;
}