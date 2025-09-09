import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  createWaterfallLayout,
  generateTestImages,
} from "../utils/waterfallLayout";
import { createWaterfallMonitor } from "../utils/WaterfallPerformanceMonitor";
import "./WaterfallGrid.css";

/**
 * 集成性能监控的瀑布流组件
 * 展示如何在实际组件中使用WaterfallPerformanceMonitor
 */
function WaterfallGridWithMonitor({
  imageCount = 50,
  columnWidth = 300,
  gap = 16,
  onPerformanceReport
}) {
  const [layout, setLayout] = useState(null);
  const [images, setImages] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [imageMetrics, setImageMetrics] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(null);
  
  const containerRef = useRef(null);
  const monitorRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  // 初始化性能监控
  useEffect(() => {
    monitorRef.current = createWaterfallMonitor({
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      enableUserExperienceMonitoring: true,
      reportInterval: 10000, // 10秒上报一次
      onReport: (report) => {
        setPerformanceData(report);
        setPerformanceScore(monitorRef.current.getPerformanceScore());
        
        // 回调给父组件
        if (onPerformanceReport) {
          onPerformanceReport(report);
        }
        
        console.log('📊 瀑布流性能报告:', report);
      }
    });

    monitorRef.current.startMonitoring();

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stopMonitoring();
      }
    };
  }, [onPerformanceReport]);

  // 生成图片数据并监控
  useEffect(() => {
    const startTime = performance.now();
    
    const testImages = generateTestImages(imageCount);
    setImages(testImages);
    
    // 初始化图片指标
    const initialMetrics = testImages.map(img => ({
      id: img.id,
      loaded: false,
      error: false,
      loadStartTime: null,
      loadTime: 0,
      inViewport: false,
      loadOrder: 0,
    }));
    setImageMetrics(initialMetrics);

    const endTime = performance.now();
    
    // 记录图片生成时间（作为布局准备时间）
    if (monitorRef.current) {
      monitorRef.current.recordLayoutCalculation(
        startTime, 
        endTime, 
        'image_generation', 
        imageCount, 
        0
      );
    }
  }, [imageCount]);

  // 监听容器宽度变化
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width !== containerWidth) {
          const startTime = performance.now();
          setContainerWidth(width);
          
          // 记录响应式布局变化
          if (monitorRef.current) {
            setTimeout(() => {
              const endTime = performance.now();
              const oldColumns = Math.max(2, Math.floor(containerWidth / (columnWidth + gap)));
              const newColumns = Math.max(2, Math.floor(width / (columnWidth + gap)));
              
              monitorRef.current.recordResponsiveLayoutTime(
                startTime,
                endTime,
                oldColumns,
                newColumns
              );
            }, 0);
          }
        }
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [containerWidth, columnWidth, gap]);

  // 计算瀑布流布局并监控
  useEffect(() => {
    if (images.length > 0) {
      const startTime = performance.now();
      
      const waterfallLayout = createWaterfallLayout(
        images,
        columnWidth,
        gap,
        2, // 最小列数
        Math.max(2, Math.floor(containerWidth / (columnWidth + gap))) // 最大列数
      );
      
      const endTime = performance.now();
      
      setLayout(waterfallLayout);
      
      // 记录布局计算性能
      if (monitorRef.current) {
        monitorRef.current.recordLayoutCalculation(
          startTime,
          endTime,
          'greedy_algorithm',
          images.length,
          waterfallLayout.totalColumns
        );
        
        // 计算并记录列高度方差
        const columnHeights = waterfallLayout.columns.map(col => col.totalHeight);
        const avgHeight = columnHeights.reduce((sum, h) => sum + h, 0) / columnHeights.length;
        const variance = columnHeights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / columnHeights.length;
        
        monitorRef.current.recordColumnHeightVariance(variance, columnHeights);
      }
    }
  }, [images, containerWidth, columnWidth, gap]);

  // 监控帧率
  useEffect(() => {
    const monitorFrameRate = () => {
      frameCountRef.current++;
      const now = Date.now();
      
      if (now - lastFrameTimeRef.current >= 1000) {
        const fps = frameCountRef.current;
        
        if (monitorRef.current) {
          monitorRef.current.recordFrameRate(fps);
        }
        
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      
      requestAnimationFrame(monitorFrameRate);
    };

    const rafId = requestAnimationFrame(monitorFrameRate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 图片加载处理
  const handleImageLoad = useCallback((imageId, success, errorType = null) => {
    const now = performance.now();
    
    setImageMetrics(prev => prev.map(metric => {
      if (metric.id === imageId) {
        const loadTime = now - (metric.loadStartTime || now);
        
        // 记录到性能监控
        if (monitorRef.current) {
          monitorRef.current.recordImageLoad(
            imageId,
            metric.loadStartTime || now,
            now,
            success,
            errorType
          );
        }
        
        return {
          ...metric,
          loaded: success,
          error: !success,
          loadTime: success ? loadTime : 0
        };
      }
      return metric;
    }));
  }, []);

  const handleImageLoadStart = useCallback((imageId) => {
    const now = performance.now();
    
    setImageMetrics(prev => prev.map(metric => 
      metric.id === imageId 
        ? { ...metric, loadStartTime: now }
        : metric
    ));
  }, []);

  // 懒加载监控
  const handleImageInViewport = useCallback((imageId, inViewport) => {
    if (monitorRef.current) {
      monitorRef.current.recordLazyLoadHit(imageId, inViewport, true);
    }
    
    setImageMetrics(prev => prev.map(metric => 
      metric.id === imageId 
        ? { ...metric, inViewport }
        : metric
    ));
  }, []);

  // 滚动性能监控
  useEffect(() => {
    let scrollStartTime = null;
    let scrollStartY = 0;
    
    const handleScrollStart = () => {
      scrollStartTime = performance.now();
      scrollStartY = window.scrollY;
    };
    
    const handleScrollEnd = () => {
      if (scrollStartTime) {
        const scrollEndTime = performance.now();
        const scrollDistance = Math.abs(window.scrollY - scrollStartY);
        const duration = scrollEndTime - scrollStartTime;
        const fps = Math.min(60, 1000 / (duration / 60)); // 估算FPS
        
        if (monitorRef.current && duration > 100) { // 只记录有意义的滚动
          monitorRef.current.recordScrollPerformance(fps, scrollDistance, duration);
        }
        
        scrollStartTime = null;
      }
    };

    let scrollTimeout;
    const handleScroll = () => {
      if (!scrollStartTime) {
        handleScrollStart();
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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
      {/* 性能监控面板 */}
      {performanceData && (
        <div className="performance-monitor-panel">
          <h3>📊 实时性能监控</h3>
          
          {performanceScore && (
            <div className="performance-score">
              <div className="score-main">
                性能得分: <span className={`score ${performanceScore.totalScore > 80 ? 'good' : performanceScore.totalScore > 60 ? 'warning' : 'poor'}`}>
                  {performanceScore.totalScore}
                </span>
              </div>
              <div className="score-breakdown">
                <span>布局: {performanceScore.breakdown.layout}</span>
                <span>渲染: {performanceScore.breakdown.rendering}</span>
                <span>体验: {performanceScore.breakdown.userExperience}</span>
                <span>加载: {performanceScore.breakdown.resourceLoading}</span>
              </div>
            </div>
          )}
          
          <div className="performance-metrics">
            <div className="metric-group">
              <h4>布局性能</h4>
              <div className="metrics">
                <span>平均计算时间: {performanceData.layoutPerformance.avgCalculationTime?.toFixed(2)}ms</span>
                <span>重布局次数: {performanceData.layoutPerformance.reLayoutCount}</span>
                <span>列高度方差: {performanceData.layoutPerformance.avgColumnVariance?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="metric-group">
              <h4>渲染性能</h4>
              <div className="metrics">
                <span>平均帧率: {performanceData.renderingPerformance.avgFrameRate?.toFixed(1)} FPS</span>
                <span>LCP: {performanceData.renderingPerformance.largestContentfulPaintTime?.toFixed(0)}ms</span>
                {performanceData.renderingPerformance.currentMemoryUsage && (
                  <span>内存使用: {(performanceData.renderingPerformance.currentMemoryUsage.used / 1024 / 1024).toFixed(1)}MB</span>
                )}
              </div>
            </div>
            
            <div className="metric-group">
              <h4>用户体验</h4>
              <div className="metrics">
                <span>懒加载命中率: {(performanceData.userExperienceMetrics.lazyLoadHitRate * 100).toFixed(1)}%</span>
                <span>平均交互延迟: {performanceData.userExperienceMetrics.avgInteractionDelay?.toFixed(2)}ms</span>
                <span>滚动FPS: {performanceData.userExperienceMetrics.avgScrollFPS?.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="metric-group">
              <h4>资源加载</h4>
              <div className="metrics">
                <span>加载成功率: {(performanceData.resourceLoadingMetrics.loadSuccessRate * 100).toFixed(1)}%</span>
                <span>平均加载时间: {performanceData.userExperienceMetrics.avgImageLoadTime?.toFixed(0)}ms</span>
                <span>已加载图片: {performanceData.resourceLoadingMetrics.totalImagesLoaded}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 瀑布流标题和统计 */}
      <div className="waterfall-header">
        <h2 className="waterfall-title">🌊 瀑布流图片展示 (性能监控版)</h2>
        <div className="waterfall-description">
          瀑布流布局 - {imageCount} 张图片动态排列 (实时性能监控)
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
          <div className="stat-item">
            <div className="stat-label">已加载</div>
            <div className="stat-value">{imageMetrics.filter(m => m.loaded).length}</div>
          </div>
        </div>
      </div>

      {/* 瀑布流网格 */}
      <div
        ref={containerRef}
        className="waterfall-grid"
        style={{
          display: "flex",
          gap: `${gap}px`,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {layout.columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="waterfall-column"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${gap}px`,
              width: `${columnWidth}px`,
            }}
          >
            {column.items.map((image, imageIndex) => (
              <WaterfallImage
                key={image.id}
                image={image}
                onLoadStart={() => handleImageLoadStart(image.id)}
                onLoad={() => handleImageLoad(image.id, true)}
                onError={() => handleImageLoad(image.id, false, 'load_error')}
                onInViewport={(inViewport) => handleImageInViewport(image.id, inViewport)}
                metrics={imageMetrics.find(m => m.id === image.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 支持性能监控的图片组件
 */
function WaterfallImage({ image, onLoadStart, onLoad, onError, onInViewport, metrics }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef(null);

  // 懒加载和可视区域检测
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          
          if (onInViewport) {
            onInViewport(visible);
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [onInViewport]);

  const handleImageLoadStart = () => {
    if (onLoadStart) {
      onLoadStart();
    }
  };

  const handleImageLoad = () => {
    setHasLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleImageError = () => {
    if (onError) {
      onError();
    }
  };

  return (
    <div 
      ref={imgRef}
      className={`waterfall-image-container ${hasLoaded ? 'loaded' : ''} ${metrics?.error ? 'error' : ''}`}
      style={{
        height: `${image.height}px`,
        backgroundColor: hasLoaded ? 'transparent' : '#f0f0f0',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {isVisible && (
        <img
          src={image.src}
          alt={image.alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: hasLoaded ? 1 : 0,
          }}
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* 性能指标叠加层 */}
      {metrics && (
        <div className="image-metrics-overlay">
          {metrics.loadTime > 0 && (
            <div className="load-time">{metrics.loadTime.toFixed(0)}ms</div>
          )}
          {metrics.error && (
            <div className="error-indicator">❌</div>
          )}
        </div>
      )}
      
      {/* 加载状态 */}
      {!hasLoaded && isVisible && !metrics?.error && (
        <div className="loading-placeholder">
          <div className="loading-spinner-small"></div>
        </div>
      )}
    </div>
  );
}

export default WaterfallGridWithMonitor;
