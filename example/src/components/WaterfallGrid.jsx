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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // 每次加载20张图片

  // 初始化第一页数据
  useEffect(() => {
    const actualLoadCount = Math.min(pageSize, imageCount);
    const initialImages = generateDemoImages(actualLoadCount);
    setImages(initialImages);
    
    const initialMetrics = initialImages.map((img) => ({
      id: img.id,
      loaded: false,
      error: false,
      loadTime: 0,
      inViewport: false,
      loadOrder: 0,
    }));
    setImageMetrics(initialMetrics);
    
    setCurrentPage(1);
    // 只有当实际加载的数量小于总数时才有更多数据
    const initialHasMore = actualLoadCount < imageCount;
    setHasMore(initialHasMore);
    
    console.log('初始化:', {
      pageSize,
      imageCount,
      actualLoadCount,
      initialHasMore
    });
  }, [imageCount, pageSize]);

  const sdkImages = useMemo(() => images, [images]);

  const handleLayout = useCallback(
    /** @param {import('solar-waterfall').WaterfallLayoutResult} layout */
    (layout) => {
      setComputedLayout(layout);
    },
    []
  );

  // 加载更多数据
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // 模拟网络延迟
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * pageSize;
      const endIndex = Math.min(startIndex + pageSize, imageCount);
      
      if (startIndex >= imageCount) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // 生成新的图片数据
      const newImages = generateDemoImages(pageSize, startIndex);
      const actualNewImages = newImages.slice(0, endIndex - startIndex);
      
      // 合并到现有图片数组
      setImages(prevImages => [...prevImages, ...actualNewImages]);
      
      // 为新图片添加指标
      const newMetrics = actualNewImages.map((img) => ({
        id: img.id,
        loaded: false,
        error: false,
        loadTime: 0,
        inViewport: false,
        loadOrder: 0,
      }));
      setImageMetrics(prevMetrics => [...prevMetrics, ...newMetrics]);
      
      setCurrentPage(nextPage);
      setHasMore(endIndex < imageCount);
      setLoading(false);
    }, 500); // 1秒延迟模拟加载时间
  }, [loading, hasMore, currentPage, pageSize, imageCount]);

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
          瀑布流布局 + 懒加载 + 无限滚动 - 共{imageCount}张图片，已加载{images.length}张
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
          hasMore={hasMore}
          loading={loading}
          loadingThreshold={200}
          onLoadMore={handleLoadMore}
          loadingPlaceholder={
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                display: "inline-block", 
                width: 20, 
                height: 20, 
                border: "2px solid #e2e8f0", 
                borderTop: "2px solid #3b82f6", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite",
                marginBottom: 8 
              }}></div>
              <div>正在加载更多精彩内容...</div>
            </div>
          }
          loadMorePlaceholder={
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>🌊</div>
              <div>继续滚动加载更多</div>
            </div>
          }
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
