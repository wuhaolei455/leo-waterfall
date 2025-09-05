// 瀑布流组件类型定义

export interface ImageItem {
  id: string | number;
  width: number;
  height: number;
  src?: string;
  alt?: string;
  [key: string]: any; // 允许额外的自定义属性
}

export interface WaterfallColumn {
  items: ImageItem[];
  totalHeight: number;
}

export interface WaterfallLayoutResult {
  columns: WaterfallColumn[];
  totalColumns: number;
}

export interface WaterfallGridProps {
  /** 图片数据数组 */
  images: ImageItem[];
  /** 列宽度，默认 300px */
  columnWidth?: number;
  /** 图片间隙，默认 16px */
  gap?: number;
  /** 最小列数，默认 1 */
  minColumns?: number;
  /** 最大列数，默认 5 */
  maxColumns?: number;
  /** 容器的 CSS 类名 */
  className?: string;
  /** 容器的内联样式 */
  style?: React.CSSProperties;
  /** 图片的 CSS 类名 */
  imageClassName?: string;
  /** 图片的内联样式 */
  imageStyle?: React.CSSProperties;
  /** 图片加载完成的回调 */
  onImageLoad?: (image: ImageItem, index: number) => void;
  /** 图片加载失败的回调 */
  onImageError?: (image: ImageItem, index: number) => void;
  /** 图片点击的回调 */
  onImageClick?: (image: ImageItem, index: number) => void;
  /** 自定义图片渲染函数 */
  renderImage?: (image: ImageItem, index: number) => React.ReactNode;
  /** 是否启用懒加载，默认 true */
  lazy?: boolean;
  /** 懒加载的根边距，默认 '100px' */
  rootMargin?: string;
  /** 懒加载的阈值，默认 0.1 */
  threshold?: number;
}

export interface ResponsiveLayoutOptions {
  /** 容器宽度 */
  containerWidth: number;
  /** 期望的列宽 */
  columnWidth?: number;
  /** 间隙 */
  gap?: number;
  /** 最小列数 */
  minColumns?: number;
  /** 最大列数 */
  maxColumns?: number;
}

export interface ResponsiveLayoutResult {
  /** 计算出的列数 */
  columns: number;
  /** 实际列宽 */
  columnWidth: number;
}

export interface UseWaterfallOptions {
  /** 图片数据 */
  images: ImageItem[];
  /** 列宽度 */
  columnWidth?: number;
  /** 间隙 */
  gap?: number;
  /** 最小列数 */
  minColumns?: number;
  /** 最大列数 */
  maxColumns?: number;
  /** 容器宽度（可选，自动检测） */
  containerWidth?: number;
}

export interface UseWaterfallResult {
  /** 瀑布流布局结果 */
  layout: WaterfallLayoutResult | null;
  /** 容器引用 */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 是否正在计算布局 */
  isCalculating: boolean;
  /** 重新计算布局 */
  recalculate: () => void;
}
