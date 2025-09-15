/**
 * 生成测试用的图片数据
 * @param count 图片数量
 * @returns 图片数组
 */
export function generateTestImages(count = 100) {
  return Array.from({ length: count }, (_, index) => {
    // 生成随机宽高，模拟真实图片的多样性
    const aspectRatios = [
      { width: 40, height: 30 }, // 4:3
      { width: 400, height: 600 }, // 2:3 (竖图)
      { width: 400, height: 250 }, // 16:10
      { width: 40, height: 40 }, // 1:1 (正方形)
      { width: 40, height: 50 }, // 4:5
      { width: 40, height: 200 }, // 2:1 (宽图)
    ];

    const randomRatio =
      aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

    return {
      id: index,
      width: randomRatio.width,
      height: randomRatio.height,
      src: `https://picsum.photos/400/${randomRatio.height}?random=${index}`,
      alt: `瀑布流图片 ${index + 1}`,
    };
  });
}
