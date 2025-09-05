import {
  ImageItem,
  WaterfallColumn,
  WaterfallLayoutResult,
  ResponsiveLayoutOptions,
  ResponsiveLayoutResult,
} from '../types';

/**
 * 瀑布流布局算法
 * @param images 图片数组，每个元素包含宽高信息
 * @param columnWidth 列宽度限制（px）
 * @param gap 图片间隙（px）
 * @param minColumns 最小列数
 * @param maxColumns 最大列数
 * @returns 分组后的瀑布流数据
 */
export function createWaterfallLayout(
  images: ImageItem[],
  columnWidth: number = 300,
  gap: number = 16,
  minColumns: number = 1,
  maxColumns: number = 5
): WaterfallLayoutResult {
  // 根据屏幕宽度计算列数
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const availableWidth = screenWidth - 64; // 减去页面边距
  const columnWithGap = columnWidth + gap;

  let columnCount = Math.floor(availableWidth / columnWithGap);
  columnCount = Math.max(minColumns, Math.min(maxColumns, columnCount));

  // 初始化列数组
  const columns: WaterfallColumn[] = Array.from(
    { length: columnCount },
    () => ({
      items: [],
      totalHeight: 0,
    })
  );

  // 为每个图片分配到最短的列
  images.forEach((image) => {
    // 计算缩放后的高度（保持宽高比，宽度固定为columnWidth）
    const scaledHeight = (image.height * columnWidth) / image.width;

    // 找到当前最短的列
    const shortestColumnIndex = columns.reduce((minIndex, column, index) => {
      return columns[minIndex].totalHeight > column.totalHeight
        ? index
        : minIndex;
    }, 0);

    // 将图片添加到最短列
    columns[shortestColumnIndex].items.push({
      ...image,
      height: scaledHeight, // 使用缩放后的高度
    });

    // 更新列的总高度（包含间隙）
    columns[shortestColumnIndex].totalHeight += scaledHeight + gap;
  });

  return {
    columns,
    totalColumns: columnCount,
  };
}

/**
 * 响应式瀑布流布局计算
 * @param options 布局选项
 * @returns 计算后的列数和实际列宽
 */
export function calculateResponsiveLayout(
  options: ResponsiveLayoutOptions
): ResponsiveLayoutResult {
  const {
    containerWidth,
    columnWidth = 300,
    gap = 16,
    minColumns = 1,
    maxColumns = 5,
  } = options;

  // 计算能容纳的列数
  let columns = Math.floor((containerWidth + gap) / (columnWidth + gap));
  columns = Math.max(minColumns, Math.min(maxColumns, columns));

  // 计算实际列宽（充分利用容器宽度）
  const actualColumnWidth = (containerWidth - gap * (columns - 1)) / columns;

  return {
    columns,
    columnWidth: actualColumnWidth,
  };
}

/**
 * 生成测试用的图片数据
 * @param count 图片数量
 * @param baseUrl 图片基础URL，默认使用 picsum.photos
 * @returns 图片数组
 */
export function generateTestImages(
  count: number = 20,
  baseUrl: string = 'https://picsum.photos'
): ImageItem[] {
  return Array.from({ length: count }, (_, index) => {
    // 生成随机宽高，模拟真实图片的多样性
    const aspectRatios = [
      { width: 400, height: 300 }, // 4:3
      { width: 400, height: 600 }, // 2:3 (竖图)
      { width: 400, height: 250 }, // 16:10
      { width: 400, height: 400 }, // 1:1 (正方形)
      { width: 400, height: 500 }, // 4:5
      { width: 400, height: 200 }, // 2:1 (宽图)
      { width: 400, height: 350 }, // 接近4:3
      { width: 400, height: 450 }, // 接近4:5
      { width: 400, height: 280 }, // 10:7
      { width: 400, height: 320 }, // 5:4
    ];

    const randomRatio =
      aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

    return {
      id: index,
      width: randomRatio.width,
      height: randomRatio.height,
      src: `${baseUrl}/${randomRatio.width}/${randomRatio.height}?random=${index}`,
      alt: `瀑布流图片 ${index + 1}`,
    };
  });
}

/**
 * 计算图片的缩放尺寸
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param targetWidth 目标宽度
 * @returns 缩放后的尺寸
 */
export function calculateImageSize(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
) {
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: targetWidth,
    height: targetWidth * aspectRatio,
  };
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}
