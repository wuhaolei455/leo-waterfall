/**
 * 瀑布流性能监控类
 * 用于监控瀑布流组件的各项性能指标
 * 可集成到性能SDK中
 */

export class WaterfallPerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      enableUserExperienceMonitoring: true,
      sampleRate: 1.0, // 采样率
      reportInterval: 30000, // 30秒上报一次
      maxMetricsHistory: 100, // 最大历史记录数
      ...options
    };

    // 性能指标数据存储
    this.metrics = {
      // 布局性能
      layout: {
        calculationTimes: [],
        reLayoutCount: 0,
        columnHeightVariances: [],
        responsiveTimes: [],
        algorithmPerformance: {}
      },
      
      // 渲染性能
      rendering: {
        firstPaintTime: null,
        firstContentfulPaintTime: null,
        largestContentfulPaintTime: null,
        frameRates: [],
        memoryUsage: [],
        renderingErrors: []
      },
      
      // 用户体验
      userExperience: {
        imageLoadOrder: [],
        lazyLoadHitRate: 0,
        interactionDelays: [],
        errorRecoveryTimes: [],
        scrollPerformance: []
      },
      
      // 资源加载
      resourceLoading: {
        imageLoadTimes: [],
        loadSuccessRate: 0,
        cacheHitRate: 0,
        networkErrors: [],
        bandwidthUtilization: []
      }
    };

    // 监控状态
    this.isMonitoring = false;
    this.startTime = null;
    this.observers = [];
    this.timers = [];

    // 初始化监控
    this.init();
  }

  /**
   * 初始化监控系统
   */
  init() {
    this.startTime = Date.now();
    
    // 初始化性能观察器
    this.initPerformanceObservers();
    
    // 初始化内存监控
    if (this.options.enableMemoryMonitoring) {
      this.initMemoryMonitoring();
    }
    
    // 初始化网络监控
    if (this.options.enableNetworkMonitoring) {
      this.initNetworkMonitoring();
    }
    
    // 启动定期上报
    this.startPeriodicReporting();
  }

  /**
   * 初始化性能观察器
   */
  initPerformanceObservers() {
    try {
      // 观察渲染性能
      if (window.PerformanceObserver) {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.rendering.largestContentfulPaintTime = entry.startTime;
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // 长任务监控
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > 50) { // 超过50ms的任务
              this.recordInteractionDelay(entry.duration);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      }
    } catch (error) {
      console.warn('Performance Observer initialization failed:', error);
    }
  }

  /**
   * 初始化内存监控
   */
  initMemoryMonitoring() {
    const monitorMemory = () => {
      if (performance.memory) {
        const memoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.metrics.rendering.memoryUsage.push(memoryInfo);
        this.limitArraySize(this.metrics.rendering.memoryUsage);
      }
    };

    const memoryTimer = setInterval(monitorMemory, 5000); // 每5秒监控一次
    this.timers.push(memoryTimer);
  }

  /**
   * 初始化网络监控
   */
  initNetworkMonitoring() {
    // 监控网络连接状态
    const updateNetworkStatus = () => {
      if (navigator.connection) {
        const connection = navigator.connection;
        this.metrics.resourceLoading.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    };

    updateNetworkStatus();
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }
  }

  /**
   * 启动定期上报
   */
  startPeriodicReporting() {
    const reportTimer = setInterval(() => {
      if (this.options.onReport && typeof this.options.onReport === 'function') {
        this.options.onReport(this.generateReport());
      }
    }, this.options.reportInterval);
    
    this.timers.push(reportTimer);
  }

  /**
   * 记录布局计算性能
   */
  recordLayoutCalculation(startTime, endTime, algorithm, imageCount, columnCount) {
    const calculationTime = endTime - startTime;
    
    this.metrics.layout.calculationTimes.push({
      duration: calculationTime,
      algorithm,
      imageCount,
      columnCount,
      timestamp: Date.now()
    });
    
    // 记录算法性能
    if (!this.metrics.layout.algorithmPerformance[algorithm]) {
      this.metrics.layout.algorithmPerformance[algorithm] = {
        totalTime: 0,
        count: 0,
        avgTime: 0
      };
    }
    
    const algPerf = this.metrics.layout.algorithmPerformance[algorithm];
    algPerf.totalTime += calculationTime;
    algPerf.count += 1;
    algPerf.avgTime = algPerf.totalTime / algPerf.count;
    
    this.limitArraySize(this.metrics.layout.calculationTimes);
  }

  /**
   * 记录重布局事件
   */
  recordReLayout(reason, affectedImages) {
    this.metrics.layout.reLayoutCount += 1;
    
    // 记录重布局详情
    this.metrics.layout.reLayoutEvents = this.metrics.layout.reLayoutEvents || [];
    this.metrics.layout.reLayoutEvents.push({
      reason,
      affectedImages,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.layout.reLayoutEvents);
  }

  /**
   * 记录列高度方差
   */
  recordColumnHeightVariance(variance, columnHeights) {
    this.metrics.layout.columnHeightVariances.push({
      variance,
      columnHeights: [...columnHeights],
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.layout.columnHeightVariances);
  }

  /**
   * 记录响应式布局切换时间
   */
  recordResponsiveLayoutTime(startTime, endTime, fromColumns, toColumns) {
    const responseTime = endTime - startTime;
    
    this.metrics.layout.responsiveTimes.push({
      duration: responseTime,
      fromColumns,
      toColumns,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.layout.responsiveTimes);
  }

  /**
   * 记录图片加载性能
   */
  recordImageLoad(imageId, loadStartTime, loadEndTime, success, errorType = null) {
    const loadTime = loadEndTime - loadStartTime;
    
    const loadRecord = {
      imageId,
      loadTime,
      success,
      errorType,
      timestamp: loadEndTime
    };
    
    this.metrics.resourceLoading.imageLoadTimes.push(loadRecord);
    this.limitArraySize(this.metrics.resourceLoading.imageLoadTimes);
    
    // 更新成功率
    this.updateLoadSuccessRate();
    
    // 记录加载顺序
    if (success) {
      this.metrics.userExperience.imageLoadOrder.push({
        imageId,
        loadOrder: this.metrics.userExperience.imageLoadOrder.length + 1,
        loadTime,
        timestamp: loadEndTime
      });
    }
  }

  /**
   * 记录懒加载命中
   */
  recordLazyLoadHit(imageId, inViewport, loadTriggered) {
    this.metrics.userExperience.lazyLoadEvents = this.metrics.userExperience.lazyLoadEvents || [];
    this.metrics.userExperience.lazyLoadEvents.push({
      imageId,
      inViewport,
      loadTriggered,
      timestamp: Date.now()
    });
    
    // 计算命中率
    const events = this.metrics.userExperience.lazyLoadEvents;
    const hitCount = events.filter(e => e.inViewport && e.loadTriggered).length;
    this.metrics.userExperience.lazyLoadHitRate = events.length > 0 ? hitCount / events.length : 0;
    
    this.limitArraySize(this.metrics.userExperience.lazyLoadEvents);
  }

  /**
   * 记录交互延迟
   */
  recordInteractionDelay(delay) {
    this.metrics.userExperience.interactionDelays.push({
      delay,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.userExperience.interactionDelays);
  }

  /**
   * 记录错误恢复时间
   */
  recordErrorRecovery(errorType, recoveryTime) {
    this.metrics.userExperience.errorRecoveryTimes.push({
      errorType,
      recoveryTime,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.userExperience.errorRecoveryTimes);
  }

  /**
   * 记录滚动性能
   */
  recordScrollPerformance(fps, scrollDistance, duration) {
    this.metrics.userExperience.scrollPerformance.push({
      fps,
      scrollDistance,
      duration,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.userExperience.scrollPerformance);
  }

  /**
   * 记录帧率
   */
  recordFrameRate(fps) {
    this.metrics.rendering.frameRates.push({
      fps,
      timestamp: Date.now()
    });
    
    this.limitArraySize(this.metrics.rendering.frameRates);
  }

  /**
   * 更新加载成功率
   */
  updateLoadSuccessRate() {
    const loads = this.metrics.resourceLoading.imageLoadTimes;
    if (loads.length > 0) {
      const successCount = loads.filter(load => load.success).length;
      this.metrics.resourceLoading.loadSuccessRate = successCount / loads.length;
    }
  }

  /**
   * 限制数组大小，防止内存泄漏
   */
  limitArraySize(array, maxSize = this.options.maxMetricsHistory) {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize);
    }
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const now = Date.now();
    const runningTime = now - this.startTime;
    
    return {
      timestamp: now,
      runningTime,
      
      // 布局性能摘要
      layoutPerformance: {
        avgCalculationTime: this.calculateAverage(this.metrics.layout.calculationTimes, 'duration'),
        reLayoutCount: this.metrics.layout.reLayoutCount,
        avgColumnVariance: this.calculateAverage(this.metrics.layout.columnHeightVariances, 'variance'),
        avgResponsiveTime: this.calculateAverage(this.metrics.layout.responsiveTimes, 'duration'),
        algorithmPerformance: this.metrics.layout.algorithmPerformance
      },
      
      // 渲染性能摘要
      renderingPerformance: {
        firstPaintTime: this.metrics.rendering.firstPaintTime,
        firstContentfulPaintTime: this.metrics.rendering.firstContentfulPaintTime,
        largestContentfulPaintTime: this.metrics.rendering.largestContentfulPaintTime,
        avgFrameRate: this.calculateAverage(this.metrics.rendering.frameRates, 'fps'),
        currentMemoryUsage: this.getCurrentMemoryUsage(),
        renderingErrorCount: this.metrics.rendering.renderingErrors.length
      },
      
      // 用户体验摘要
      userExperienceMetrics: {
        avgImageLoadTime: this.calculateAverage(this.metrics.resourceLoading.imageLoadTimes, 'loadTime'),
        lazyLoadHitRate: this.metrics.userExperience.lazyLoadHitRate,
        avgInteractionDelay: this.calculateAverage(this.metrics.userExperience.interactionDelays, 'delay'),
        avgErrorRecoveryTime: this.calculateAverage(this.metrics.userExperience.errorRecoveryTimes, 'recoveryTime'),
        avgScrollFPS: this.calculateAverage(this.metrics.userExperience.scrollPerformance, 'fps')
      },
      
      // 资源加载摘要
      resourceLoadingMetrics: {
        loadSuccessRate: this.metrics.resourceLoading.loadSuccessRate,
        cacheHitRate: this.metrics.resourceLoading.cacheHitRate,
        networkErrorCount: this.metrics.resourceLoading.networkErrors.length,
        totalImagesLoaded: this.metrics.resourceLoading.imageLoadTimes.length
      },
      
      // 原始数据（可选）
      rawMetrics: this.options.includeRawData ? this.metrics : null
    };
  }

  /**
   * 计算平均值
   */
  calculateAverage(array, property) {
    if (!array || array.length === 0) return 0;
    
    const sum = array.reduce((acc, item) => {
      return acc + (typeof item === 'object' ? item[property] : item);
    }, 0);
    
    return sum / array.length;
  }

  /**
   * 获取当前内存使用情况
   */
  getCurrentMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * 获取性能得分
   */
  getPerformanceScore() {
    const report = this.generateReport();
    let score = 100;
    
    // 布局性能评分 (30%)
    const layoutScore = this.calculateLayoutScore(report.layoutPerformance);
    
    // 渲染性能评分 (30%)
    const renderingScore = this.calculateRenderingScore(report.renderingPerformance);
    
    // 用户体验评分 (25%)
    const uxScore = this.calculateUXScore(report.userExperienceMetrics);
    
    // 资源加载评分 (15%)
    const loadingScore = this.calculateLoadingScore(report.resourceLoadingMetrics);
    
    const weightedScore = 
      layoutScore * 0.3 + 
      renderingScore * 0.3 + 
      uxScore * 0.25 + 
      loadingScore * 0.15;
    
    return {
      totalScore: Math.round(weightedScore),
      breakdown: {
        layout: Math.round(layoutScore),
        rendering: Math.round(renderingScore),
        userExperience: Math.round(uxScore),
        resourceLoading: Math.round(loadingScore)
      }
    };
  }

  /**
   * 计算布局性能得分
   */
  calculateLayoutScore(layoutPerf) {
    let score = 100;
    
    // 布局计算时间惩罚
    if (layoutPerf.avgCalculationTime > 50) score -= 20;
    else if (layoutPerf.avgCalculationTime > 20) score -= 10;
    
    // 重布局次数惩罚
    if (layoutPerf.reLayoutCount > 10) score -= 15;
    else if (layoutPerf.reLayoutCount > 5) score -= 8;
    
    // 响应时间惩罚
    if (layoutPerf.avgResponsiveTime > 100) score -= 15;
    else if (layoutPerf.avgResponsiveTime > 50) score -= 8;
    
    return Math.max(0, score);
  }

  /**
   * 计算渲染性能得分
   */
  calculateRenderingScore(renderingPerf) {
    let score = 100;
    
    // FCP惩罚
    if (renderingPerf.firstContentfulPaintTime > 2000) score -= 20;
    else if (renderingPerf.firstContentfulPaintTime > 1000) score -= 10;
    
    // LCP惩罚
    if (renderingPerf.largestContentfulPaintTime > 4000) score -= 20;
    else if (renderingPerf.largestContentfulPaintTime > 2500) score -= 10;
    
    // 帧率惩罚
    if (renderingPerf.avgFrameRate < 30) score -= 20;
    else if (renderingPerf.avgFrameRate < 45) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 计算用户体验得分
   */
  calculateUXScore(uxMetrics) {
    let score = 100;
    
    // 交互延迟惩罚
    if (uxMetrics.avgInteractionDelay > 100) score -= 25;
    else if (uxMetrics.avgInteractionDelay > 50) score -= 15;
    
    // 懒加载命中率奖励
    if (uxMetrics.lazyLoadHitRate > 0.9) score += 5;
    else if (uxMetrics.lazyLoadHitRate < 0.7) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 计算资源加载得分
   */
  calculateLoadingScore(loadingMetrics) {
    let score = 100;
    
    // 加载成功率惩罚
    if (loadingMetrics.loadSuccessRate < 0.95) score -= 20;
    else if (loadingMetrics.loadSuccessRate < 0.98) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * 开始监控
   */
  startMonitoring() {
    this.isMonitoring = true;
    console.log('瀑布流性能监控已启动');
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    // 清理观察器
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // 清理定时器
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];
    
    console.log('瀑布流性能监控已停止');
  }

  /**
   * 重置监控数据
   */
  resetMetrics() {
    this.metrics = {
      layout: {
        calculationTimes: [],
        reLayoutCount: 0,
        columnHeightVariances: [],
        responsiveTimes: [],
        algorithmPerformance: {}
      },
      rendering: {
        firstPaintTime: null,
        firstContentfulPaintTime: null,
        largestContentfulPaintTime: null,
        frameRates: [],
        memoryUsage: [],
        renderingErrors: []
      },
      userExperience: {
        imageLoadOrder: [],
        lazyLoadHitRate: 0,
        interactionDelays: [],
        errorRecoveryTimes: [],
        scrollPerformance: []
      },
      resourceLoading: {
        imageLoadTimes: [],
        loadSuccessRate: 0,
        cacheHitRate: 0,
        networkErrors: [],
        bandwidthUtilization: []
      }
    };
    
    this.startTime = Date.now();
  }

  /**
   * 导出监控数据
   */
  exportMetrics(format = 'json') {
    const report = this.generateReport();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(report);
    }
    
    return report;
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(data) {
    // 简化的CSV转换，实际项目中可能需要更复杂的实现
    const headers = Object.keys(data);
    const csvContent = headers.join(',') + '\n' + 
                      headers.map(header => JSON.stringify(data[header])).join(',');
    return csvContent;
  }
}

// 默认配置
export const DEFAULT_MONITOR_CONFIG = {
  enableMemoryMonitoring: true,
  enableNetworkMonitoring: true,
  enableUserExperienceMonitoring: true,
  sampleRate: 1.0,
  reportInterval: 30000,
  maxMetricsHistory: 100,
  includeRawData: false
};

// 工厂函数
export function createWaterfallMonitor(options = {}) {
  return new WaterfallPerformanceMonitor({
    ...DEFAULT_MONITOR_CONFIG,
    ...options
  });
}
