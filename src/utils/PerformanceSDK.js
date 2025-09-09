/**
 * 瀑布流性能监控SDK
 * 提供统一的性能监控、上报和分析能力
 * 可集成到任何前端项目中
 */

import { WaterfallPerformanceMonitor } from './WaterfallPerformanceMonitor';

/**
 * 性能监控SDK主类
 */
export class PerformanceSDK {
  constructor(config = {}) {
    this.config = {
      // 基础配置
      appId: '',
      appVersion: '1.0.0',
      userId: '',
      sessionId: this.generateSessionId(),
      
      // 监控配置
      enableWaterfallMonitoring: true,
      enableGlobalErrorMonitoring: true,
      enableNetworkMonitoring: true,
      enableUserBehaviorMonitoring: true,
      
      // 上报配置
      reportEndpoint: '',
      reportBatch: true,
      reportBatchSize: 10,
      reportInterval: 30000,
      maxRetries: 3,
      
      // 采样配置
      sampleRate: 1.0,
      errorSampleRate: 1.0,
      
      // 存储配置
      enableLocalStorage: true,
      maxLocalStorageSize: 1024 * 1024, // 1MB
      
      ...config
    };

    // 内部状态
    this.monitors = new Map();
    this.reportQueue = [];
    this.isInitialized = false;
    this.networkInfo = null;
    this.deviceInfo = null;
    
    // 初始化SDK
    this.init();
  }

  /**
   * 初始化SDK
   */
  async init() {
    try {
      // 收集设备信息
      await this.collectDeviceInfo();
      
      // 收集网络信息
      await this.collectNetworkInfo();
      
      // 初始化全局错误监控
      if (this.config.enableGlobalErrorMonitoring) {
        this.initGlobalErrorMonitoring();
      }
      
      // 初始化网络监控
      if (this.config.enableNetworkMonitoring) {
        this.initNetworkMonitoring();
      }
      
      // 初始化用户行为监控
      if (this.config.enableUserBehaviorMonitoring) {
        this.initUserBehaviorMonitoring();
      }
      
      // 启动定期上报
      this.startPeriodicReporting();
      
      this.isInitialized = true;
      
      console.log('🚀 PerformanceSDK initialized successfully');
      
      // 上报初始化事件
      this.reportEvent('sdk_initialized', {
        config: this.sanitizeConfig(),
        deviceInfo: this.deviceInfo,
        networkInfo: this.networkInfo
      });
      
    } catch (error) {
      console.error('❌ PerformanceSDK initialization failed:', error);
    }
  }

  /**
   * 创建瀑布流监控器
   */
  createWaterfallMonitor(componentId, options = {}) {
    if (!this.isInitialized) {
      console.warn('SDK not initialized yet');
      return null;
    }

    const monitorConfig = {
      ...options,
      onReport: (report) => {
        this.reportWaterfallMetrics(componentId, report);
        
        // 调用用户自定义回调
        if (options.onReport) {
          options.onReport(report);
        }
      }
    };

    const monitor = new WaterfallPerformanceMonitor(monitorConfig);
    this.monitors.set(componentId, monitor);
    
    console.log(`📊 Waterfall monitor created for component: ${componentId}`);
    
    return monitor;
  }

  /**
   * 销毁瀑布流监控器
   */
  destroyWaterfallMonitor(componentId) {
    const monitor = this.monitors.get(componentId);
    if (monitor) {
      monitor.stopMonitoring();
      this.monitors.delete(componentId);
      
      console.log(`🗑️ Waterfall monitor destroyed for component: ${componentId}`);
    }
  }

  /**
   * 收集设备信息
   */
  async collectDeviceInfo() {
    this.deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      
      // 屏幕信息
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      
      // 视窗信息
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      
      // 内存信息（如果可用）
      memory: navigator.deviceMemory || null,
      
      // 硬件并发数
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      
      // 时区
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      timestamp: Date.now()
    };
  }

  /**
   * 收集网络信息
   */
  async collectNetworkInfo() {
    if (navigator.connection) {
      this.networkInfo = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
        type: navigator.connection.type || null,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 初始化全局错误监控
   */
  initGlobalErrorMonitoring() {
    // JavaScript错误监控
    window.addEventListener('error', (event) => {
      this.reportError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    // Promise未处理错误监控
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
    });

    // 资源加载错误监控
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.reportError('resource_error', {
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          message: 'Resource failed to load',
          timestamp: Date.now()
        });
      }
    }, true);
  }

  /**
   * 初始化网络监控
   */
  initNetworkMonitoring() {
    // 监控fetch请求
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        
        this.reportNetworkRequest({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          success: response.ok,
          timestamp: endTime
        });
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        
        this.reportNetworkRequest({
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          success: false,
          error: error.message,
          timestamp: endTime
        });
        
        throw error;
      }
    };

    // 监控XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._performanceSDK = {
        method,
        url,
        startTime: null
      };
      return originalXHROpen.call(this, method, url, ...args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      if (this._performanceSDK) {
        this._performanceSDK.startTime = Date.now();
        
        const onLoadEnd = () => {
          const endTime = Date.now();
          const duration = endTime - this._performanceSDK.startTime;
          
          this.reportNetworkRequest({
            url: this._performanceSDK.url,
            method: this._performanceSDK.method,
            status: this.status,
            duration,
            success: this.status >= 200 && this.status < 300,
            timestamp: endTime
          });
        };
        
        this.addEventListener('loadend', onLoadEnd);
      }
      
      return originalXHRSend.call(this, ...args);
    };
  }

  /**
   * 初始化用户行为监控
   */
  initUserBehaviorMonitoring() {
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.reportEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: Date.now()
      });
    });

    // 页面卸载
    window.addEventListener('beforeunload', () => {
      this.reportEvent('page_unload', {
        timestamp: Date.now()
      });
      
      // 强制发送待上报数据
      this.flushReports();
    });

    // 点击事件监控（采样）
    document.addEventListener('click', (event) => {
      if (Math.random() < 0.1) { // 10%采样率
        this.reportEvent('user_click', {
          tagName: event.target.tagName,
          className: event.target.className,
          id: event.target.id,
          x: event.clientX,
          y: event.clientY,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * 上报瀑布流指标
   */
  reportWaterfallMetrics(componentId, metrics) {
    this.addToReportQueue('waterfall_metrics', {
      componentId,
      metrics,
      timestamp: Date.now()
    });
  }

  /**
   * 上报错误
   */
  reportError(errorType, errorData) {
    if (Math.random() > this.config.errorSampleRate) {
      return; // 采样过滤
    }

    this.addToReportQueue('error', {
      type: errorType,
      data: errorData,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  /**
   * 上报网络请求
   */
  reportNetworkRequest(requestData) {
    this.addToReportQueue('network_request', {
      ...requestData,
      sessionId: this.config.sessionId
    });
  }

  /**
   * 上报事件
   */
  reportEvent(eventType, eventData) {
    if (Math.random() > this.config.sampleRate) {
      return; // 采样过滤
    }

    this.addToReportQueue('event', {
      type: eventType,
      data: eventData,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  /**
   * 添加到上报队列
   */
  addToReportQueue(type, data) {
    const report = {
      id: this.generateReportId(),
      type,
      data,
      appId: this.config.appId,
      appVersion: this.config.appVersion,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo,
      timestamp: Date.now()
    };

    this.reportQueue.push(report);

    // 如果开启批量上报且队列未满，等待批量发送
    if (this.config.reportBatch && this.reportQueue.length < this.config.reportBatchSize) {
      return;
    }

    // 立即发送
    this.sendReports();
  }

  /**
   * 发送上报数据
   */
  async sendReports() {
    if (this.reportQueue.length === 0 || !this.config.reportEndpoint) {
      return;
    }

    const reportsToSend = [...this.reportQueue];
    this.reportQueue = [];

    try {
      const response = await fetch(this.config.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reports: reportsToSend,
          metadata: {
            sdkVersion: '1.0.0',
            timestamp: Date.now()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`📤 Sent ${reportsToSend.length} performance reports`);
      
    } catch (error) {
      console.error('❌ Failed to send performance reports:', error);
      
      // 重试机制
      this.retryFailedReports(reportsToSend);
    }
  }

  /**
   * 重试失败的上报
   */
  async retryFailedReports(failedReports) {
    for (const report of failedReports) {
      report.retryCount = (report.retryCount || 0) + 1;
      
      if (report.retryCount <= this.config.maxRetries) {
        // 延迟重试
        setTimeout(() => {
          this.reportQueue.push(report);
        }, Math.pow(2, report.retryCount) * 1000); // 指数退避
      }
    }
  }

  /**
   * 启动定期上报
   */
  startPeriodicReporting() {
    setInterval(() => {
      this.sendReports();
    }, this.config.reportInterval);
  }

  /**
   * 强制发送所有待上报数据
   */
  flushReports() {
    this.sendReports();
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 生成上报ID
   */
  generateReportId() {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 清理配置中的敏感信息
   */
  sanitizeConfig() {
    const { reportEndpoint, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * 获取SDK状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      monitorsCount: this.monitors.size,
      queueLength: this.reportQueue.length,
      sessionId: this.config.sessionId,
      deviceInfo: this.deviceInfo,
      networkInfo: this.networkInfo
    };
  }

  /**
   * 销毁SDK
   */
  destroy() {
    // 发送剩余数据
    this.flushReports();
    
    // 销毁所有监控器
    this.monitors.forEach((monitor, componentId) => {
      this.destroyWaterfallMonitor(componentId);
    });
    
    // 清理状态
    this.monitors.clear();
    this.reportQueue = [];
    this.isInitialized = false;
    
    console.log('🗑️ PerformanceSDK destroyed');
  }
}

/**
 * SDK工厂函数
 */
export function createPerformanceSDK(config = {}) {
  return new PerformanceSDK(config);
}

/**
 * 默认配置
 */
export const DEFAULT_SDK_CONFIG = {
  enableWaterfallMonitoring: true,
  enableGlobalErrorMonitoring: true,
  enableNetworkMonitoring: true,
  enableUserBehaviorMonitoring: true,
  reportBatch: true,
  reportBatchSize: 10,
  reportInterval: 30000,
  maxRetries: 3,
  sampleRate: 1.0,
  errorSampleRate: 1.0,
  enableLocalStorage: true,
  maxLocalStorageSize: 1024 * 1024
};

// 全局SDK实例（可选）
let globalSDK = null;

/**
 * 获取全局SDK实例
 */
export function getGlobalSDK() {
  return globalSDK;
}

/**
 * 初始化全局SDK
 */
export function initGlobalSDK(config = {}) {
  if (globalSDK) {
    console.warn('Global SDK already initialized');
    return globalSDK;
  }

  globalSDK = createPerformanceSDK(config);
  return globalSDK;
}

/**
 * 销毁全局SDK
 */
export function destroyGlobalSDK() {
  if (globalSDK) {
    globalSDK.destroy();
    globalSDK = null;
  }
}
