// 图片数据
export interface ImageInfo {
    width: number,
    height: number
}

// 瀑布流布局列
export interface WaterfallLayoutColumnItem {
    items: ImageInfo[],
    totalHeight: number
}

// 瀑布流布局

export interface WaterfallLayoutResult {
    images: WaterfallLayoutColumnItem[],
    totalColumns: number,
}