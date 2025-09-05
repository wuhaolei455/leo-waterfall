import React, { useCallback, useRef } from 'react';
import { WaterfallGridProps, ImageItem } from '../types';
import { useWaterfall, useLazyLoading } from '../hooks/useWaterfall';

/**
 * 瀑布流网格组件
 */
export const WaterfallGrid: React.FC<WaterfallGridProps> = ({
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
  renderImage,
  lazy = true,
  rootMargin = '100px',
  threshold = 0.1,
}) => {
  const { layout, containerRef, isCalculating } = useWaterfall({
    images,
    columnWidth,
    gap,
    minColumns,
    maxColumns,
  });

  const { observeImage, markAsLoaded, shouldLoad } = useLazyLoading({
    rootMargin,
    threshold,
  });

  // 图片加载成功处理
  const handleImageLoad = useCallback(
    (image: ImageItem, index: number) => {
      markAsLoaded(image.id);
      onImageLoad?.(image, index);
    },
    [markAsLoaded, onImageLoad]
  );

  // 图片加载失败处理
  const handleImageError = useCallback(
    (image: ImageItem, index: number) => {
      onImageError?.(image, index);
    },
    [onImageError]
  );

  // 图片点击处理
  const handleImageClick = useCallback(
    (image: ImageItem, index: number) => {
      onImageClick?.(image, index);
    },
    [onImageClick]
  );

  // 默认图片渲染函数
  const defaultRenderImage = useCallback(
    (image: ImageItem, index: number) => {
      const shouldLoadImage = !lazy || shouldLoad(image.id);

      return (
        <img
          ref={(el) => {
            if (el && lazy) {
              observeImage(el, image.id);
            }
          }}
          src={shouldLoadImage ? image.src : undefined}
          alt={image.alt || `Image ${index + 1}`}
          className={`w-full h-auto object-cover transition-opacity duration-300 ${imageClassName}`}
          style={{
            height: `${image.height}px`,
            opacity: shouldLoadImage ? 1 : 0.3,
            ...imageStyle,
          }}
          loading={lazy ? 'lazy' : undefined}
          onLoad={() => handleImageLoad(image, index)}
          onError={() => handleImageError(image, index)}
          onClick={() => handleImageClick(image, index)}
        />
      );
    },
    [
      lazy,
      shouldLoad,
      observeImage,
      imageClassName,
      imageStyle,
      handleImageLoad,
      handleImageError,
      handleImageClick,
    ]
  );

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
          {column.items.map((image, imageIndex) => {
            const globalIndex = images.findIndex(img => img.id === image.id);
            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {renderImage ? renderImage(image, globalIndex) : defaultRenderImage(image, globalIndex)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WaterfallGrid;
