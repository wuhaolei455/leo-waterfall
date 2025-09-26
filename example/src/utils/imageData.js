const ASPECT_RATIOS = [
  { width: 400, height: 300 },
  { width: 400, height: 600 },
  { width: 400, height: 250 },
  { width: 400, height: 400 },
  { width: 400, height: 500 },
  { width: 400, height: 200 },
];

/**
 * 生成示例图片数据
 * @param {number} count 图片数量
 * @returns {import('solar-waterfall').ImageInfo[]}
 */
export function generateDemoImages(count = 30) {
  return Array.from({ length: count }, (_, index) => {
    const ratio = ASPECT_RATIOS[Math.floor(Math.random() * ASPECT_RATIOS.length)];
    const aspectRatio = ratio.height / ratio.width;

    return {
      id: index,
      src: `https://picsum.photos/${ratio.width}/${ratio.height}?random=${index}`,
      alt: `瀑布流图片 ${index + 1}`,
      width: ratio.width,
      height: ratio.height,
      originalWidth: ratio.width,
      originalHeight: ratio.height,
      aspectRatio,
      metadata: {
        seed: index,
        aspectRatio,
      },
    };
  });
}


