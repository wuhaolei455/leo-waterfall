import React, { useState } from 'react';
import { WaterfallGrid, SimpleWaterfall } from './components';
import { generateTestImages } from './utils/waterfallLayout';
import Examples from './pages/Examples';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [imageCount, setImageCount] = useState(20);
  const [columnWidth, setColumnWidth] = useState(300);
  const [gap, setGap] = useState(16);
  const [useSimple, setUseSimple] = useState(false);
  
  const images = generateTestImages(imageCount);

  // 如果当前页面是实例页面，直接返回实例组件
  if (currentPage === 'examples') {
    return <Examples onNavigateHome={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌊 Leo Waterfall
              </h1>
              <p className="mt-2 text-gray-600">
                高性能 React 瀑布流组件库演示
              </p>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏠 主页
              </button>
              <button
                onClick={() => setCurrentPage('examples')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'examples'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 实例演示
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">控制面板</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片数量: {imageCount}
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                列宽度: {columnWidth}px
              </label>
              <input
                type="range"
                min="200"
                max="500"
                value={columnWidth}
                onChange={(e) => setColumnWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                间隙: {gap}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useSimple}
                  onChange={(e) => setUseSimple(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  使用简单版本
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Waterfall Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {useSimple ? '简单瀑布流' : '完整瀑布流'} ({images.length} 张图片)
            </h2>
            <div className="text-sm text-gray-500">
              列宽: {columnWidth}px | 间隙: {gap}px
            </div>
          </div>
          
          {useSimple ? (
            <SimpleWaterfall
              images={images}
              columnWidth={columnWidth}
              gap={gap}
              minColumns={1}
              maxColumns={5}
              onImageClick={(image, index) => {
                console.log('点击图片:', image, index);
              }}
            />
          ) : (
            <WaterfallGrid
              images={images}
              columnWidth={columnWidth}
              gap={gap}
              minColumns={1}
              maxColumns={5}
              lazy={true}
              onImageClick={(image, index) => {
                console.log('点击图片:', image, index);
              }}
              onImageLoad={(image, index) => {
                console.log('图片加载完成:', image.id, index);
              }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>© 2024 Leo Waterfall - 高性能 React 瀑布流组件库</p>
            <p className="mt-2 text-sm">
              支持响应式布局、懒加载、自定义渲染等功能
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
