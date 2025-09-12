// 图片数据
export interface ImageInfo {
    width: number,
    height: number
}

// 瀑布流布局
export interface WaterfallLayoutResult {
    items: ImageInfo[],
    totalColumns: number,
    maxHeight: number,
    totalHeight: number,
}