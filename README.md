# 🌊 Leo Waterfall

[![npm version](https://badge.fury.io/js/leo-waterfall.svg)](https://badge.fury.io/js/leo-waterfall)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

高性能 React 瀑布流组件库，支持响应式布局、懒加载、自定义渲染等功能。

## ✨ 特性

- 🚀 **高性能**: 优化的布局算法，支持大量图片的流畅展示
- 📱 **响应式**: 自动适配不同屏幕尺寸，支持自定义断点
- 🎯 **懒加载**: 内置 Intersection Observer，提升页面加载性能
- 🎨 **高度可定制**: 支持自定义渲染、样式和交互
- 📦 **TypeScript**: 完整的类型定义，提供优秀的开发体验
- 🪝 **Hook 支持**: 提供灵活的 Hook API，适合复杂场景
- 🎛️ **多种模式**: 提供简单模式和完整模式，满足不同需求

## 📦 安装

```bash
npm install leo-waterfall
```

或者使用 yarn:

```bash
yarn add leo-waterfall
```

## 🚀 快速开始

### 基础用法

```tsx
import React from 'react';
import { SimpleWaterfall, generateTestImages } from 'leo-waterfall';

function App() {
  const images = generateTestImages(20);

  return (
    <SimpleWaterfall
      images={images}
      columnWidth={300}
      gap={16}
      onImageClick={(image, index) => {
        console.log('点击图片:', image, index);
      }}
    />
  );
}

export default App;
```

### 完整功能用法

```tsx
import React from 'react';
import { WaterfallGrid } from 'leo-waterfall';

function App() {
  const images = [
    {
      id: 1,
      width: 400,
      height: 300,
      src: 'https://example.com/image1.jpg',
      alt: '图片1'
    },
    // ... 更多图片
  ];

  return (
    <WaterfallGrid
      images={images}
      columnWidth={300}
      gap={16}
      minColumns={1}
      maxColumns={5}
      lazy={true}
      rootMargin="100px"
      onImageLoad={(image, index) => {
        console.log('图片加载完成:', image.id);
      }}
      onImageClick={(image, index) => {
        console.log('点击图片:', image, index);
      }}
      renderImage={(image, index) => (
        <div className="custom-image-wrapper">
          <img src={image.src} alt={image.alt} />
          <div className="image-overlay">
            <span>#{index + 1}</span>
          </div>
        </div>
      )}
    />
  );
}
```

## 📚 API 文档

### SimpleWaterfall Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `images` | `ImageItem[]` | - | **必需** 图片数据数组 |
| `columnWidth` | `number` | `300` | 列宽度（px） |
| `gap` | `number` | `16` | 图片间隙（px） |
| `minColumns` | `number` | `1` | 最小列数 |
| `maxColumns` | `number` | `5` | 最大列数 |
| `className` | `string` | `''` | 容器 CSS 类名 |
| `style` | `CSSProperties` | - | 容器内联样式 |
| `imageClassName` | `string` | `''` | 图片 CSS 类名 |
| `imageStyle` | `CSSProperties` | - | 图片内联样式 |
| `onImageLoad` | `(image, index) => void` | - | 图片加载完成回调 |
| `onImageError` | `(image, index) => void` | - | 图片加载失败回调 |
| `onImageClick` | `(image, index) => void` | - | 图片点击回调 |

### WaterfallGrid Props

继承 `SimpleWaterfall` 的所有属性，额外支持：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `lazy` | `boolean` | `true` | 是否启用懒加载 |
| `rootMargin` | `string` | `'100px'` | 懒加载根边距 |
| `threshold` | `number` | `0.1` | 懒加载阈值 |
| `renderImage` | `(image, index) => ReactNode` | - | 自定义图片渲染函数 |

### ImageItem 接口

```typescript
interface ImageItem {
  id: string | number;        // 唯一标识
  width: number;              // 原始宽度
  height: number;             // 原始高度
  src?: string;               // 图片地址
  alt?: string;               // 图片描述
  [key: string]: any;         // 其他自定义属性
}
```

## 🪝 Hook API

### useWaterfall

用于自定义瀑布流布局的 Hook：

```tsx
import { useWaterfall } from 'leo-waterfall';

function CustomWaterfall({ images }) {
  const { layout, containerRef, isCalculating, recalculate } = useWaterfall({
    images,
    columnWidth: 300,
    gap: 16,
    minColumns: 1,
    maxColumns: 5
  });

  if (isCalculating) {
    return <div>计算布局中...</div>;
  }

  return (
    <div ref={containerRef}>
      {layout?.columns.map((column, index) => (
        <div key={index}>
          {column.items.map(item => (
            <div key={item.id}>
              {/* 自定义渲染 */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### useLazyLoading

用于图片懒加载的 Hook：

```tsx
import { useLazyLoading } from 'leo-waterfall';

function LazyImage({ image }) {
  const { shouldLoad, observeImage, markAsLoaded } = useLazyLoading();
  
  return (
    <img
      ref={el => observeImage(el, image.id)}
      src={shouldLoad(image.id) ? image.src : undefined}
      onLoad={() => markAsLoaded(image.id)}
    />
  );
}
```

## 🛠️ 工具函数

### generateTestImages

生成测试图片数据：

```tsx
import { generateTestImages } from 'leo-waterfall';

const testImages = generateTestImages(50, 'https://picsum.photos');
```

### createWaterfallLayout

手动计算瀑布流布局：

```tsx
import { createWaterfallLayout } from 'leo-waterfall';

const layout = createWaterfallLayout(images, 300, 16, 1, 5);
```

### calculateResponsiveLayout

计算响应式布局参数：

```tsx
import { calculateResponsiveLayout } from 'leo-waterfall';

const { columns, columnWidth } = calculateResponsiveLayout({
  containerWidth: 1200,
  columnWidth: 300,
  gap: 16,
  minColumns: 1,
  maxColumns: 5
});
```

## 🎨 自定义样式

### 使用 CSS 类名

```css
.my-waterfall {
  padding: 20px;
  background: #f5f5f5;
}

.my-waterfall .waterfall-item {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.my-waterfall .waterfall-item:hover {
  transform: translateY(-2px);
}
```

### 自定义渲染

```tsx
<WaterfallGrid
  images={images}
  renderImage={(image, index) => (
    <div className="relative group">
      <img 
        src={image.src} 
        alt={image.alt}
        className="w-full h-auto rounded-lg"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
        <button className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 rounded-full">
          查看大图
        </button>
      </div>
    </div>
  )}
/>
```

## 📱 响应式设计

组件会自动根据容器宽度调整列数，你也可以通过 CSS 媒体查询进一步自定义：

```css
.waterfall-container {
  --column-width: 300px;
  --gap: 16px;
}

@media (max-width: 768px) {
  .waterfall-container {
    --column-width: 250px;
    --gap: 12px;
  }
}

@media (max-width: 480px) {
  .waterfall-container {
    --column-width: 200px;
    --gap: 8px;
  }
}
```

## ⚡ 性能优化

### 懒加载配置

```tsx
<WaterfallGrid
  images={images}
  lazy={true}
  rootMargin="200px"  // 提前 200px 开始加载
  threshold={0.1}     // 10% 可见时触发加载
/>
```

### 虚拟滚动（大数据集）

对于超大数据集，建议结合虚拟滚动库使用：

```tsx
import { FixedSizeList as List } from 'react-window';
import { WaterfallGrid } from 'leo-waterfall';

function VirtualWaterfall({ images }) {
  const chunkSize = 50;
  const chunks = [];
  
  for (let i = 0; i < images.length; i += chunkSize) {
    chunks.push(images.slice(i, i + chunkSize));
  }
  
  return (
    <List
      height={600}
      itemCount={chunks.length}
      itemSize={400}
    >
      {({ index, style }) => (
        <div style={style}>
          <WaterfallGrid images={chunks[index]} />
        </div>
      )}
    </List>
  );
}
```

## 🧪 测试

```bash
npm test
```

## 🏗️ 构建

```bash
# 构建库文件
npm run build:lib

# 构建演示应用
npm run build
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果你觉得这个项目有用，请给它一个 ⭐️！

---

**Leo Waterfall** - 让瀑布流布局变得简单而高效 🌊#   l e o - w a t e r f a l l  
 