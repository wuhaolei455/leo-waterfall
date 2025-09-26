import React, { useCallback, useEffect, useMemo, useState } from "react";
import { WaterfallGrid as SDKWaterfallGrid } from "solar-waterfall";
import { generateDemoImages } from "../utils/imageData";
import "./WaterfallGrid.css";

function WaterfallGrid({
  imageCount = 50,
  columnWidth = 300,
  gap = 16,
}) {
  const [images, setImages] = useState([]);
  const [imageMetrics, setImageMetrics] = useState([]);
  const [computedLayout, setComputedLayout] = useState(null);

  // 生成图片数据
  useEffect(() => {
    const demoImages = generateDemoImages(imageCount);
    setImages(demoImages);

    const initialMetrics = demoImages.map((img) => ({
      id: img.id,
      loaded: false,
      error: false,
      loadTime: 0,
      inViewport: false,
      loadOrder: 0,
    }));
    setImageMetrics(initialMetrics);
  }, [imageCount]);

  const sdkImages = useMemo(() => images, [images]);

  const handleLayout = useCallback(
    /** @param {import('solar-waterfall').WaterfallLayoutResult} layout */
    (layout) => {
      setComputedLayout(layout);
    },
    []
  );

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
            <div className="stat-value">{computedLayout?.totalColumns ?? "-"}</div>
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
      <div className="waterfall-grid" style={{ gap: `${gap}px` }}>
        <SDKWaterfallGrid
          images={sdkImages}
          columnWidth={columnWidth}
          gap={gap}
          minColumns={2}
          maxColumns={10}
          onLayout={handleLayout}
          renderItem={({ item }) => {
            const metric = imageMetrics.find((m) => m.id === item.id);

            return (
              <div className="waterfall-item">
                <div className="status-indicator">
                  {metric?.loaded ? (
                    <div className="status-badge loaded">✓ {metric.loadTime.toFixed(0)}ms</div>
                  ) : metric?.error ? (
                    <div className="status-badge error">✗ 错误</div>
                  ) : (
                    <div className="status-badge loading">⏳ 加载中</div>
                  )}
                </div>

                <div className="image-number">
                  <div className="number-badge">#{(item.id ?? 0) + 1}</div>
                </div>

                <img
                  src={item.src}
                  alt={item.alt}
                  data-image-id={item.id}
                  className="waterfall-image"
                  style={{
                    opacity: metric?.loaded ? 1 : 0.8,
                    height: `${item.height ?? item.originalHeight ?? 300}px`,
                  }}
                  loading="lazy"
                  onLoad={() => handleImageLoad(item.id, performance.now())}
                  onError={() => handleImageError(item.id)}
                />

                <div className="image-overlay">
                  <div className="image-info">
                    {item.originalWidth ?? item.width} × {Math.round(item.originalHeight ?? item.height ?? 0)}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* 布局统计信息 */}
      <div className="waterfall-footer">
        <h4 className="footer-title">📊 瀑布流布局统计</h4>
        <div className="column-stats">
          {computedLayout ? (
            computedLayout.columns.map((column, index) => (
              <div key={index} className="column-stat">
                <div className="column-title">第 {index + 1} 列</div>
                <div className="column-info">{column.items.length} 张图片</div>
                <div className="column-info">{Math.round(column.totalHeight)}px 高</div>
              </div>
            ))
          ) : (
            <div className="column-stat">
              <div className="column-title">正在计算布局...</div>
              <div className="column-info">请稍候</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaterfallGrid;
