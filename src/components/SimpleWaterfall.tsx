import React from 'react';
import { ImageItem } from '../types';
import { useWaterfall } from '../hooks/useWaterfall';

export interface SimpleWaterfallProps {
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
}

/**
 * 简单的瀑布流组件
 * 不包含懒加载等复杂功能，适合快速使用
 */
export const SimpleWaterfall: React.FC<SimpleWaterfallProps> = ({
  images,
  columnWidth = 300,
  gap = 16,
  minColumns = 1,
  maxColumns = 5,
  className = '',
  style,
  imageClassName = '',
  imageStyle,
  onImageLoad,
  onImageError,
  onImageClick,
}) => {
  const { layout, containerRef, isCalculating } = useWaterfall({
    images,
    columnWidth,
    gap,
    minColumns,
    maxColumns,
  });

  // 渲染加载状态
  if (isCalculating || !layout) {
    return (
      <div
        className={`flex items-center justify-center min-h-[200px] ${className}`}
        style={style}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在计算瀑布流布局...</p>
        </div>
      </div>
    );
  }

  // 渲染空状态
  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center min-h-[200px] ${className}`}
        style={style}
      >
        <p className="text-gray-500">暂无图片数据</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      style={{
        gap: `${gap}px`,
        ...style,
      }}
    >
      {layout.columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex flex-col"
          style={{
            width: `${columnWidth}px`,
            gap: `${gap}px`,
          }}
        >
          {column.items.map((image) => {
            const globalIndex = images.findIndex(img => img.id === image.id);
            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={image.src}
                  alt={image.alt || `Image ${globalIndex + 1}`}
                  className={`w-full h-auto object-cover ${imageClassName}`}
                  style={{
                    height: `${image.height}px`,
                    ...imageStyle,
                  }}
                  onLoad={() => onImageLoad?.(image, globalIndex)}
                  onError={() => onImageError?.(image, globalIndex)}
                  onClick={() => onImageClick?.(image, globalIndex)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SimpleWaterfall;
