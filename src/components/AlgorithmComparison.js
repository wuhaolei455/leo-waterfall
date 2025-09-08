import React, { useState, useEffect } from 'react';
import { generateTestImages, createWaterfallLayout } from '../utils/waterfallLayout';
import { compareAlgorithms, createWaterfallLayoutDP } from '../utils/waterfallLayoutDP';
import './AlgorithmComparison.css';

function AlgorithmComparison() {
  const [imageCount, setImageCount] = useState(10);
  const [columnCount, setColumnCount] = useState(2);
  const [results, setResults] = useState(null);
  const [testImages, setTestImages] = useState([]);
  const [isComputing, setIsComputing] = useState(false);

  const runComparison = async () => {
    setIsComputing(true);
    
    // 生成测试图片
    const newTestImages = generateTestImages(imageCount);
    setTestImages(newTestImages);
    
    // 延迟执行以显示加载状态
    setTimeout(() => {
      const comparisonResults = compareAlgorithms(newTestImages, 300, 16, columnCount);
      setResults(comparisonResults);
      setIsComputing(false);
    }, 100);
  };

  useEffect(() => {
    runComparison();
  }, [imageCount, columnCount]);

  const renderWaterfallLayout = (name, result, color, testImages) => {
    if (!result) return null;

    return (
      <div className={`waterfall-layout-result ${color}`}>
        <div className="layout-header">
          <h3 className="algorithm-name">{name}</h3>
          <div className="metrics-summary">
            <span className="metric-chip">
              最大高度: {result.maxHeight?.toFixed(1) || 'N/A'}
            </span>
            <span className="metric-chip">
              方差: {result.heightVariance?.toFixed(2) || 'N/A'}
            </span>
            <span className="metric-chip">
              列数: {result.columns?.length || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* 实际瀑布流布局展示 */}
        <div className="mini-waterfall-grid" style={{ gap: '8px' }}>
          {result.columns?.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="mini-waterfall-column"
              style={{ width: '120px', gap: '8px' }}
            >
              {column.items.map((img, imgIndex) => (
                <div
                  key={img.id}
                  className="mini-waterfall-item"
                  style={{
                    height: `${Math.max(40, (img.scaledHeight || img.height) * 0.3)}px`,
                    backgroundColor: `hsl(${(img.id * 137.5) % 360}, 70%, 75%)`,
                    position: 'relative'
                  }}
                >
                  {/* 图片缩略图 */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="mini-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                    loading="lazy"
                  />
                  {/* 图片序号 */}
                  <div className="mini-image-number">
                    #{img.id + 1}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 列统计信息 */}
        <div className="column-stats-grid">
          {result.columns?.map((column, index) => (
            <div key={index} className="column-stat-item">
              <div className="stat-label">第 {index + 1} 列</div>
              <div className="stat-values">
                <div>{column.items.length} 张</div>
                <div>{column.totalHeight.toFixed(1)}px</div>
              </div>
              <div 
                className="stat-bar" 
                style={{ 
                  width: `${(column.totalHeight / (result.maxHeight || 1)) * 100}%`,
                  backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="algorithm-comparison">
      <div className="comparison-header">
        <h2>🧮 瀑布流算法对比分析</h2>
        <p>比较贪心算法、动态规划算法和混合算法的性能与效果</p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label>图片数量:</label>
          <input
            type="range"
            min="5"
            max="15"
            value={imageCount}
            onChange={(e) => setImageCount(Number(e.target.value))}
          />
          <span>{imageCount}</span>
        </div>
        
        <div className="control-group">
          <label>列数:</label>
          <input
            type="range"
            min="2"
            max="4"
            value={columnCount}
            onChange={(e) => setColumnCount(Number(e.target.value))}
          />
          <span>{columnCount}</span>
        </div>

        <button onClick={runComparison} disabled={isComputing} className="run-button">
          {isComputing ? '计算中...' : '重新计算'}
        </button>
      </div>

      {isComputing ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>正在运行算法对比...</p>
        </div>
      ) : results ? (
        <div className="results">
          <div className="results-grid">
            {renderWaterfallLayout('贪心算法', results.greedy, 'greedy', testImages)}
            {results.dp && renderWaterfallLayout('动态规划算法', results.dp, 'dp', testImages)}
            {renderWaterfallLayout('混合算法', results.hybrid, 'hybrid', testImages)}
          </div>

          <div className="analysis">
            <h3>📊 分析结果</h3>
            <div className="analysis-content">
              {/* 算法性能对比图表 */}
              <div className="performance-chart">
                <h4>算法性能对比</h4>
                <div className="chart-container">
                  <div className="chart-bars">
                    <div className="chart-bar greedy-bar">
                      <div className="bar-fill" style={{ 
                        height: `${(results.greedy.maxHeight / Math.max(results.greedy.maxHeight, results.dp?.maxHeight || 0, results.hybrid.maxHeight)) * 100}%` 
                      }}></div>
                      <div className="bar-label">贪心算法</div>
                      <div className="bar-value">{results.greedy.maxHeight?.toFixed(1)}</div>
                    </div>
                    {results.dp && (
                      <div className="chart-bar dp-bar">
                        <div className="bar-fill" style={{ 
                          height: `${(results.dp.maxHeight / Math.max(results.greedy.maxHeight, results.dp.maxHeight, results.hybrid.maxHeight)) * 100}%` 
                        }}></div>
                        <div className="bar-label">动态规划</div>
                        <div className="bar-value">{results.dp.maxHeight?.toFixed(1)}</div>
                      </div>
                    )}
                    <div className="chart-bar hybrid-bar">
                      <div className="bar-fill" style={{ 
                        height: `${(results.hybrid.maxHeight / Math.max(results.greedy.maxHeight, results.dp?.maxHeight || 0, results.hybrid.maxHeight)) * 100}%` 
                      }}></div>
                      <div className="bar-label">混合算法</div>
                      <div className="bar-value">{results.hybrid.maxHeight?.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {results.dp && results.greedy && (
                <div className="comparison-stats">
                  <h4>详细对比分析:</h4>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-title">最大高度差异</div>
                      <div className="stat-value">
                        {Math.abs(results.greedy.maxHeight - results.dp.maxHeight).toFixed(2)}px
                      </div>
                      <div className="stat-description">
                        {results.dp.maxHeight < results.greedy.maxHeight ? 
                          '✅ DP算法更优' : results.dp.maxHeight > results.greedy.maxHeight ? 
                          '⚠️ 贪心算法更优' : '🤝 两者相同'}
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-title">平衡性对比</div>
                      <div className="stat-value">
                        {((results.dp.heightVariance < results.greedy.heightVariance ? 
                          results.greedy.heightVariance - results.dp.heightVariance : 
                          results.dp.heightVariance - results.greedy.heightVariance) / 
                          Math.max(results.greedy.heightVariance, results.dp.heightVariance) * 100).toFixed(1)}%
                      </div>
                      <div className="stat-description">
                        {results.dp.heightVariance < results.greedy.heightVariance ? 
                          '✅ DP更平衡' : results.dp.heightVariance > results.greedy.heightVariance ? 
                          '⚠️ 贪心更平衡' : '🤝 平衡性相同'}
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-title">优化程度</div>
                      <div className="stat-value">
                        {((results.greedy.maxHeight - results.dp.maxHeight) / results.greedy.maxHeight * 100).toFixed(1)}%
                      </div>
                      <div className="stat-description">
                        {results.dp.maxHeight < results.greedy.maxHeight ? 
                          '🎯 DP算法优化显著' : '📊 优化空间有限'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="algorithm-notes">
                <div className="note greedy-note">
                  <strong>贪心算法:</strong> 
                  <p>时间复杂度 O(n×k)，空间复杂度 O(k)。适合实时应用，效果通常很好。</p>
                </div>
                {results.dp && (
                  <div className="note dp-note">
                    <strong>动态规划算法:</strong>
                    <p>时间复杂度 O(n×2^H)，空间复杂度 O(2^H)。理论最优，但仅适用于小规模问题。</p>
                  </div>
                )}
                <div className="note hybrid-note">
                  <strong>混合算法:</strong>
                  <p>结合两种方法的优势，在小规模时使用DP，大规模时使用贪心。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="theory-section">
        <h3>🎓 理论背景</h3>
        <div className="theory-content">
          <div className="theory-item">
            <h4>问题本质</h4>
            <p>瀑布流布局是一个多路分割问题的变种，目标是将n个元素分配到k个组中，使得组间差异最小。</p>
          </div>
          <div className="theory-item">
            <h4>算法选择</h4>
            <p>贪心算法提供了良好的近似比（2-1/k），而动态规划可以找到全局最优解，但计算复杂度较高。</p>
          </div>
          <div className="theory-item">
            <h4>实际应用</h4>
            <p>在UI布局中，贪心算法的实时性和良好效果使其成为首选，动态规划更适合离线优化场景。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlgorithmComparison;
