import React, { useState, useMemo } from 'react';
import { WaterfallGrid, SimpleWaterfall } from '../components';
import { generateTestImages } from '../utils/waterfallLayout';
import { ImageItem } from '../types';

// 自定义图片数据 - 不同类型的图片
const customImages: ImageItem[] = [
  {
    id: 'landscape-1',
    width: 800,
    height: 400,
    src: 'https://picsum.photos/800/400?random=landscape1',
    alt: '风景图片 1',
    category: '风景',
    title: '美丽的山脉'
  },
  {
    id: 'portrait-1',
    width: 400,
    height: 600,
    src: 'https://picsum.photos/400/600?random=portrait1',
    alt: '人像图片 1',
    category: '人像',
    title: '优雅的肖像'
  },
  {
    id: 'square-1',
    width: 500,
    height: 500,
    src: 'https://picsum.photos/500/500?random=square1',
    alt: '正方形图片 1',
    category: '抽象',
    title: '几何之美'
  },
  {
    id: 'wide-1',
    width: 900,
    height: 300,
    src: 'https://picsum.photos/900/300?random=wide1',
    alt: '宽屏图片 1',
    category: '建筑',
    title: '城市天际线'
  },
  {
    id: 'tall-1',
    width: 300,
    height: 700,
    src: 'https://picsum.photos/300/700?random=tall1',
    alt: '高图片 1',
    category: '自然',
    title: '瀑布奇观'
  },
  {
    id: 'medium-1',
    width: 600,
    height: 450,
    src: 'https://picsum.photos/600/450?random=medium1',
    alt: '中等图片 1',
    category: '动物',
    title: '可爱的小猫'
  },
  {
    id: 'landscape-2',
    width: 750,
    height: 350,
    src: 'https://picsum.photos/750/350?random=landscape2',
    alt: '风景图片 2',
    category: '风景',
    title: '日落海滩'
  },
  {
    id: 'portrait-2',
    width: 350,
    height: 550,
    src: 'https://picsum.photos/350/550?random=portrait2',
    alt: '人像图片 2',
    category: '人像',
    title: '街头摄影'
  },
];

interface ExamplesProps {
  onNavigateHome?: () => void;
}

const Examples: React.FC<ExamplesProps> = ({ onNavigateHome }) => {
  const [activeDemo, setActiveDemo] = useState('basic');
  const [imageCount, setImageCount] = useState(30);
  const [columnWidth, setColumnWidth] = useState(280);
  const [gap, setGap] = useState(16);

  // 生成测试图片
  const testImages = useMemo(() => generateTestImages(imageCount), [imageCount]);

  // 大数据集测试
  const largeDataset = useMemo(() => generateTestImages(200), []);

  const demos = [
    { id: 'basic', name: '基础演示', icon: '🌊' },
    { id: 'custom', name: '自定义渲染', icon: '🎨' },
    { id: 'lazy', name: '懒加载', icon: '⚡' },
    { id: 'responsive', name: '响应式', icon: '📱' },
    { id: 'performance', name: '性能对比', icon: '🚀' },
    { id: 'categories', name: '分类展示', icon: '📂' },
  ];

  const renderBasicDemo = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">基础瀑布流演示</h3>
        <p className="text-blue-700 text-sm">
          展示基本的瀑布流布局功能，包括自适应列数、图片点击事件等。
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium mb-4">参数控制</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片数量: {imageCount}
            </label>
            <input
              type="range"
              min="10"
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
              max="400"
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
              max="40"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 瀑布流展示 */}
      <div className="bg-white rounded-lg border p-6">
        <WaterfallGrid
          images={testImages}
          columnWidth={columnWidth}
          gap={gap}
          minColumns={1}
          maxColumns={6}
          onImageClick={(image, index) => {
            alert(`点击了第 ${index + 1} 张图片: ${image.alt}`);
          }}
          onImageLoad={(image, index) => {
            console.log(`图片 ${image.id} 加载完成`);
          }}
        />
      </div>
    </div>
  );

  const renderCustomDemo = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">自定义渲染演示</h3>
        <p className="text-purple-700 text-sm">
          展示如何使用 renderImage 属性自定义图片的渲染方式，添加悬停效果、标签等。
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <WaterfallGrid
          images={customImages}
          columnWidth={300}
          gap={20}
          minColumns={1}
          maxColumns={4}
          renderImage={(image, index) => (
            <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* 悬停遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-semibold text-lg">{image.title}</h4>
                  <p className="text-sm opacity-90">{image.category}</p>
                </div>
              </div>

              {/* 序号标签 */}
              <div className="absolute top-2 left-2 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                #{index + 1}
              </div>

              {/* 分类标签 */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {image.category}
              </div>
            </div>
          )}
          onImageClick={(image, index) => {
            alert(`点击了 "${image.title}" (${image.category})`);
          }}
        />
      </div>
    </div>
  );

  const renderLazyDemo = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">懒加载演示</h3>
        <p className="text-green-700 text-sm">
          展示懒加载功能，图片只有在即将进入视口时才开始加载，提升页面性能。
          打开浏览器开发者工具的网络面板观察加载行为。
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <WaterfallGrid
          images={largeDataset}
          columnWidth={250}
          gap={15}
          minColumns={2}
          maxColumns={5}
          lazy={true}
          rootMargin="200px" // 提前200px开始加载
          threshold={0.1}
          onImageLoad={(image, index) => {
            console.log(`懒加载: 图片 ${image.id} 开始加载`);
          }}
          renderImage={(image, index) => (
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                <span className="text-white text-sm font-medium">
                  图片 {index + 1}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );

  const renderResponsiveDemo = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">响应式演示</h3>
        <p className="text-orange-700 text-sm">
          调整浏览器窗口大小观察瀑布流如何自动适配不同屏幕尺寸。
          在不同设备上列数会自动调整。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 桌面端样式 */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">桌面端 (大列数)</h4>
          <div className="border rounded overflow-hidden">
            <WaterfallGrid
              images={testImages.slice(0, 20)}
              columnWidth={200}
              gap={12}
              minColumns={3}
              maxColumns={4}
            />
          </div>
        </div>

        {/* 移动端样式 */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">移动端 (小列数)</h4>
          <div className="border rounded overflow-hidden max-w-sm mx-auto">
            <WaterfallGrid
              images={testImages.slice(0, 15)}
              columnWidth={150}
              gap={8}
              minColumns={2}
              maxColumns={2}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceDemo = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">性能对比演示</h3>
        <p className="text-red-700 text-sm">
          对比 SimpleWaterfall 和 WaterfallGrid 的性能差异。
          WaterfallGrid 包含懒加载等高级功能，SimpleWaterfall 更轻量。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SimpleWaterfall */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">SimpleWaterfall (轻量版)</h4>
          <div className="text-sm text-gray-600 mb-3">
            • 更少的 DOM 操作<br/>
            • 无懒加载功能<br/>
            • 适合小数据集
          </div>
          <div className="border rounded overflow-hidden max-h-96 overflow-y-auto">
            <SimpleWaterfall
              images={testImages.slice(0, 30)}
              columnWidth={180}
              gap={10}
              minColumns={2}
              maxColumns={3}
            />
          </div>
        </div>

        {/* WaterfallGrid */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">WaterfallGrid (完整版)</h4>
          <div className="text-sm text-gray-600 mb-3">
            • 内置懒加载<br/>
            • 更多自定义选项<br/>
            • 适合大数据集
          </div>
          <div className="border rounded overflow-hidden max-h-96 overflow-y-auto">
            <WaterfallGrid
              images={testImages.slice(0, 30)}
              columnWidth={180}
              gap={10}
              minColumns={2}
              maxColumns={3}
              lazy={true}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesDemo = () => {
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const categories = ['全部', '风景', '人像', '抽象', '建筑', '自然', '动物'];
    
    const filteredImages = selectedCategory === '全部' 
      ? customImages 
      : customImages.filter(img => img.category === selectedCategory);

    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">分类展示演示</h3>
          <p className="text-indigo-700 text-sm">
            展示如何结合分类筛选功能，动态更新瀑布流内容。
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">选择分类</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
                {category !== '全部' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({customImages.filter(img => img.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 筛选后的瀑布流 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              显示 {filteredImages.length} 张图片
              {selectedCategory !== '全部' && ` (分类: ${selectedCategory})`}
            </span>
          </div>
          <WaterfallGrid
            key={selectedCategory} // 强制重新渲染
            images={filteredImages}
            columnWidth={280}
            gap={16}
            minColumns={1}
            maxColumns={4}
            renderImage={(image, index) => (
              <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <h4 className="text-white font-medium">{image.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/80 text-sm">{image.category}</span>
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    );
  };

  const renderActiveDemo = () => {
    switch (activeDemo) {
      case 'basic':
        return renderBasicDemo();
      case 'custom':
        return renderCustomDemo();
      case 'lazy':
        return renderLazyDemo();
      case 'responsive':
        return renderResponsiveDemo();
      case 'performance':
        return renderPerformanceDemo();
      case 'categories':
        return renderCategoriesDemo();
      default:
        return renderBasicDemo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎯 Leo Waterfall 实例演示
              </h1>
              <p className="mt-2 text-gray-600">
                探索瀑布流组件的各种功能和使用场景
              </p>
            </div>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                🏠 返回主页
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边导航 */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">演示类型</h3>
              <nav className="space-y-2">
                {demos.map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeDemo === demo.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-3">{demo.icon}</span>
                    <span className="font-medium">{demo.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {renderActiveDemo()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
};

export default Examples;
