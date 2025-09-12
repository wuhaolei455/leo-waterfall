import React, { useState } from 'react';
import './App.css';
import WaterfallGrid from './components/WaterfallGrid';
import AlgorithmComparison from './components/AlgorithmComparison';
import ErrorSimulation from './components/ErrorSimulation';

function App() {
  const [imageCount, setImageCount] = useState(30);
  const [columnWidth, setColumnWidth] = useState(300);
  const [gap, setGap] = useState(16);
  const [activeTab, setActiveTab] = useState('waterfall');

  return (
    <div className="App">
      {/* 导航标签 */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'waterfall' ? 'active' : ''}`}
          onClick={() => setActiveTab('waterfall')}
        >
          🌊 瀑布流展示
        </button>
        <button 
          className={`nav-tab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          🧮 算法对比
        </button>
        <button 
          className={`nav-tab ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          🐛 错误模拟
        </button>
      </div>

      {activeTab === 'waterfall' && (
        <>
          {/* 控制面板 */}
          <div className="control-panel">
            <h1 className="app-title">🌊 Leo 瀑布流展示</h1>
        <div className="controls">
          <div className="control-group">
            <label htmlFor="imageCount">图片数量:</label>
            <input
              id="imageCount"
              type="range"
              min="10"
              max="100"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
            />
            <span className="control-value">{imageCount}</span>
          </div>
          
          <div className="control-group">
            <label htmlFor="columnWidth">列宽度:</label>
            <input
              id="columnWidth"
              type="range"
              min="200"
              max="500"
              value={columnWidth}
              onChange={(e) => setColumnWidth(Number(e.target.value))}
            />
            <span className="control-value">{columnWidth}px</span>
          </div>
          
          <div className="control-group">
            <label htmlFor="gap">图片间隙:</label>
            <input
              id="gap"
              type="range"
              min="8"
              max="32"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
            />
            <span className="control-value">{gap}px</span>
          </div>
        </div>
      </div>

      {/* 瀑布流组件 */}
      <WaterfallGrid
        imageCount={imageCount}
        columnWidth={columnWidth}
        gap={gap}
      />
        </>
      )}

      {activeTab === 'comparison' && (
        <AlgorithmComparison />
      )}

      {activeTab === 'errors' && (
        <ErrorSimulation />
      )}
    </div>
  );
}

export default App;
