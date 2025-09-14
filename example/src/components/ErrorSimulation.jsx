import React, { useState, useEffect } from 'react';
import './ErrorSimulation.css';

function ErrorSimulation() {
  const [corsError, setCorsError] = useState(null);
  const [whiteScreenError, setWhiteScreenError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState([]);

  // 添加错误日志
  const addErrorLog = (type, message, details) => {
    const log = {
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setErrorLogs(prev => [log, ...prev.slice(0, 9)]); // 保持最新10条
  };

  // 模拟跨域错误
  const simulateCorsError = async () => {
    setIsLoading(true);
    setCorsError(null);
    
    try {
      // 尝试请求一个会产生CORS错误的URL
      const response = await fetch('https://httpbin.org/headers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addErrorLog('success', '请求成功', '这个API实际上支持CORS');
      setCorsError({
        type: 'success',
        message: '意外成功！这个API实际上支持CORS',
        details: data
      });
    } catch (error) {
      // 模拟典型的CORS错误
      const corsErrorDetails = {
        type: 'cors',
        message: 'CORS policy blocked the request',
        details: {
          error: error.message,
          origin: window.location.origin,
          targetUrl: 'https://httpbin.org/headers',
          commonCauses: [
            'Access-Control-Allow-Origin header missing',
            'Preflight request failed',
            'Credentials not allowed',
            'Method not allowed by CORS policy'
          ],
          solutions: [
            '在服务端添加正确的CORS头',
            '使用代理服务器转发请求',
            '在开发环境中配置代理',
            '使用JSONP（仅限GET请求）'
          ]
        }
      };
      
      setCorsError(corsErrorDetails);
      addErrorLog('cors', 'CORS错误', corsErrorDetails.details);
    }
    
    setIsLoading(false);
  };

  // 模拟白屏错误
  const simulateWhiteScreen = () => {
    setWhiteScreenError(true);
    addErrorLog('white-screen', '白屏错误触发', {
      cause: 'JavaScript运行时错误',
      component: 'ErrorSimulation',
      timestamp: new Date().toISOString()
    });

    // 3秒后恢复
    setTimeout(() => {
      setWhiteScreenError(false);
      addErrorLog('recovery', '白屏恢复', '错误边界捕获并恢复');
    }, 3000);
  };

  // 白屏错误边界组件
  const WhiteScreenErrorBoundary = ({ children }) => {
    if (whiteScreenError) {
      return (
        <div className="white-screen-error">
          <div className="error-content">
            <div className="error-icon">💥</div>
            <h2>应用崩溃 - 白屏错误</h2>
            <div className="error-details">
              <p><strong>错误类型:</strong> JavaScript Runtime Error</p>
              <p><strong>常见原因:</strong></p>
              <ul>
                <li>未捕获的异常导致React组件崩溃</li>
                <li>网络资源加载失败</li>
                <li>第三方库兼容性问题</li>
                <li>内存泄漏或无限循环</li>
              </ul>
              <p><strong>解决方案:</strong></p>
              <ul>
                <li>使用Error Boundary捕获错误</li>
                <li>添加try-catch包装异步操作</li>
                <li>实现降级UI和错误上报</li>
                <li>优化资源加载策略</li>
              </ul>
            </div>
            <div className="recovery-timer">
              <div className="timer-bar"></div>
              <p>3秒后自动恢复...</p>
            </div>
          </div>
        </div>
      );
    }
    return children;
  };

  return (
    <WhiteScreenErrorBoundary>
      <div className="error-simulation">
        <div className="simulation-header">
          <h2>🐛 前端错误模拟器</h2>
          <p>模拟常见的前端开发问题，学习错误处理和调试技巧</p>
        </div>

        <div className="simulation-controls">
          <div className="control-section">
            <h3>🌐 跨域错误模拟</h3>
            <p>模拟CORS (Cross-Origin Resource Sharing) 错误</p>
            <button 
              className="error-button cors-button"
              onClick={simulateCorsError}
              disabled={isLoading}
            >
              {isLoading ? '请求中...' : '触发CORS错误'}
            </button>
          </div>

          <div className="control-section">
            <h3>⚪ 白屏错误模拟</h3>
            <p>模拟应用崩溃导致的白屏问题</p>
            <button 
              className="error-button white-screen-button"
              onClick={simulateWhiteScreen}
              disabled={whiteScreenError}
            >
              {whiteScreenError ? '错误中...' : '触发白屏错误'}
            </button>
          </div>
        </div>

        {/* CORS错误展示 */}
        {corsError && (
          <div className={`error-display ${corsError.type === 'success' ? 'success' : 'error'}`}>
            <div className="error-header">
              <span className="error-icon">
                {corsError.type === 'success' ? '✅' : '🚫'}
              </span>
              <h3>
                {corsError.type === 'success' ? '请求成功' : 'CORS错误'}
              </h3>
            </div>
            <div className="error-message">
              <p><strong>消息:</strong> {corsError.message}</p>
            </div>
            {corsError.details && corsError.type !== 'success' && (
              <div className="error-details">
                <p><strong>错误详情:</strong> {corsError.details.error}</p>
                <p><strong>源地址:</strong> {corsError.details.origin}</p>
                <p><strong>目标URL:</strong> {corsError.details.targetUrl}</p>
                
                <div className="error-analysis">
                  <div className="analysis-section">
                    <h4>🔍 常见原因:</h4>
                    <ul>
                      {corsError.details.commonCauses.map((cause, index) => (
                        <li key={index}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="analysis-section">
                    <h4>💡 解决方案:</h4>
                    <ul>
                      {corsError.details.solutions.map((solution, index) => (
                        <li key={index}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 错误日志 */}
        {errorLogs.length > 0 && (
          <div className="error-logs">
            <h3>📋 错误日志</h3>
            <div className="logs-container">
              {errorLogs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <div className="log-header">
                    <span className="log-type">{log.type.toUpperCase()}</span>
                    <span className="log-time">{log.timestamp}</span>
                  </div>
                  <div className="log-message">{log.message}</div>
                  {log.details && typeof log.details === 'object' && (
                    <div className="log-details">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学习资源 */}
        <div className="learning-resources">
          <h3>📚 学习资源</h3>
          <div className="resources-grid">
            <div className="resource-card">
              <h4>🌐 CORS深入理解</h4>
              <ul>
                <li>同源策略的工作原理</li>
                <li>预检请求(Preflight)机制</li>
                <li>服务端CORS配置方法</li>
                <li>开发环境代理设置</li>
              </ul>
            </div>
            
            <div className="resource-card">
              <h4>⚪ 白屏问题排查</h4>
              <ul>
                <li>Error Boundary错误边界</li>
                <li>性能监控和错误上报</li>
                <li>资源加载失败处理</li>
                <li>渐进式降级策略</li>
              </ul>
            </div>
            
            <div className="resource-card">
              <h4>🛠️ 调试工具推荐</h4>
              <ul>
                <li>Chrome DevTools网络面板</li>
                <li>React Developer Tools</li>
                <li>Sentry错误监控</li>
                <li>Lighthouse性能分析</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </WhiteScreenErrorBoundary>
  );
}

export default ErrorSimulation;
