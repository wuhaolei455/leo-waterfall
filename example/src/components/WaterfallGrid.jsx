import React, { useEffect, useState, useRef } from "react";
import { useContainerSize } from "../hooks/useContainerSize";
import {
  createWaterfallLayout,
  generateTestImages,
} from "../utils/waterfallLayout";
import "./WaterfallGrid.css";

function WaterfallGrid({
  imageCount = 50,
  columnWidth = 300,
  gap = 16,
}) {
  const [layout, setLayout] = useState(null);
  const [images, setImages] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [imageMetrics, setImageMetrics] = useState([]);
  const containerRef = useRef(null);

  const { width: observedWidth } = useContainerSize(containerRef);

  // 生成图片数据
  useEffect(() => {
    const testImages = generateTestImages(imageCount);
    setImages(testImages);
    
    // 初始化图片指标
    const initialMetrics = testImages.map(img => ({
      id: img.id,
      loaded: false,
      error: false,
      loadTime: 0,
      inViewport: false,
      loadOrder: 0,
    }));
    setImageMetrics(initialMetrics);
  }, [imageCount]);

  // 根据容器尺寸更新本地宽度状态（解耦计算依赖）
  useEffect(() => {
    if (observedWidth > 0) {
      setContainerWidth(observedWidth);
    }
  }, [observedWidth]);

  // 计算瀑布流布局
  useEffect(() => {
    if (images.length > 0) {
      const waterfallLayout = createWaterfallLayout(
        images,
        columnWidth,
        gap,
        2, // 最小列数
        Math.max(2, Math.floor(containerWidth / (columnWidth + gap))) // 最大列数
      );
      setLayout(waterfallLayout);
    }
  }, [images, containerWidth, columnWidth, gap]);

  // 图片加载处理
  const handleImageLoad = (imageId, loadTime) => {
    setImageMetrics(prev => prev.map(metric => 
      metric.id === imageId 
        ? { ...metric, loaded: true, loadTime }
        : metric
    ));
  };

  const handleImageError = (imageId) => {
    setImageMetrics(prev => prev.map(metric => 
      metric.id === imageId 
        ? { ...metric, error: true }
        : metric
    ));
  };

  if (!layout) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">正在计算瀑布流布局...</p>
      </div>
    );
  }

  return (
    <div className="waterfall-container">
      {/* 标题和描述 */}
      <div className="waterfall-header">
        <h2 className="waterfall-title">🌊 瀑布流图片展示</h2>
        <div className="waterfall-description">
          瀑布流布局 - {imageCount} 张图片动态排列
        </div>
        <div className="waterfall-stats">
          <div className="stat-item">
            <div className="stat-label">总列数</div>
            <div className="stat-value">{layout.totalColumns}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">列宽度</div>
            <div className="stat-value">{columnWidth}px</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">图片间隙</div>
            <div className="stat-value">{gap}px</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">图片总数</div>
            <div className="stat-value">{imageCount}</div>
          </div>
        </div>
      </div>

      {/* 瀑布流网格 */}
      <div
        ref={containerRef}
        className="waterfall-grid"
        style={{ gap: `${gap}px` }}
      >
        {layout.columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="waterfall-column"
            style={{
              width: `${columnWidth}px`,
              gap: `${gap}px`,
            }}
          >
            {column.items.map((img) => {
              const metric = imageMetrics.find((m) => m.id === img.id);
              return (
                <div
                  key={img.id}
                  className="waterfall-item"
                >
                  {/* 加载状态指示器 */}
                  <div className="status-indicator">
                    {metric?.loaded ? (
                      <div className="status-badge loaded">
                        ✓ {metric.loadTime.toFixed(0)}ms
                      </div>
                    ) : metric?.error ? (
                      <div className="status-badge error">
                        ✗ 错误
                      </div>
                    ) : (
                      <div className="status-badge loading">
                        ⏳ 加载中
                      </div>
                    )}
                  </div>

                  {/* 图片序号 */}
                  <div className="image-number">
                    <div className="number-badge">
                      #{img.id + 1}
                    </div>
                  </div>

                  {/* 图片 */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    data-image-id={img.id}
                    className="waterfall-image"
                    style={{
                      opacity: metric?.loaded ? 1 : 0.8,
                      height: `${img.height}px`,
                    }}
                    loading="lazy"
                    onLoad={() => {
                      const loadTime = performance.now();
                      handleImageLoad(img.id, loadTime);
                    }}
                    onError={() => handleImageError(img.id)}
                  />

                  {/* 图片尺寸信息 - 悬停时显示 */}
                  <div className="image-overlay">
                    <div className="image-info">
                      {img.width} × {Math.round(img.height)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 布局统计信息 */}
      <div className="waterfall-footer">
        <h4 className="footer-title">📊 瀑布流布局统计</h4>
        <div className="column-stats">
          {layout.columns.map((column, index) => (
            <div key={index} className="column-stat">
              <div className="column-title">第 {index + 1} 列</div>
              <div className="column-info">{column.items.length} 张图片</div>
              <div className="column-info">{Math.round(column.totalHeight)}px 高</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WaterfallGrid;
