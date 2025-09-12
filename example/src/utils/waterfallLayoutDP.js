// 瀑布流动态规划算法实现

/**
 * 动态规划版本的瀑布流算法
 * 适用于小规模问题，追求最优解
 * @param images 图片数组
 * @param columnWidth 列宽度
 * @param gap 间隙
 * @param columnCount 列数
 * @returns 最优的瀑布流布局
 */
export function createWaterfallLayoutDP(images, columnWidth = 400, gap = 16, columnCount = 2) {
  if (images.length === 0 || columnCount <= 0) {
    return { columns: [], totalColumns: 0 };
  }

  // 预处理：计算所有图片的缩放高度
  const scaledImages = images.map(image => ({
    ...image,
    scaledHeight: (image.height * columnWidth) / image.width
  }));

  // 使用动态规划求解最优分配
  const result = solveOptimalPartition(scaledImages, columnCount, gap);
  
  return {
    columns: result.columns,
    totalColumns: columnCount,
    maxHeight: result.maxHeight,
    heightVariance: result.heightVariance
  };
}

/**
 * 动态规划求解最优分割问题
 * 目标：最小化最大列高度
 */
function solveOptimalPartition(images, k, gap) {
  const n = images.length;
  
  // dp[i][mask] 表示前i个图片按照mask分配到各列的最小最大高度
  // mask 用位表示各列的状态（这里简化为小规模问题）
  
  if (k === 2) {
    // 对于2列的情况，使用专门的DP算法
    return solveTwoColumnDP(images, gap);
  } else {
    // 对于多列的情况，使用通用的分支限界算法
    return solveBranchAndBound(images, k, gap);
  }
}

/**
 * 两列瀑布流的动态规划最优解
 * 这是一个经典的分割问题
 */
function solveTwoColumnDP(images, gap) {
  const n = images.length;
  const totalHeight = images.reduce((sum, img) => sum + img.scaledHeight + gap, 0) - gap;
  const targetHeight = totalHeight / 2;

  // dp[i][h] 表示前i个图片能否组成高度为h的列
  const maxHeight = Math.floor(totalHeight);
  const dp = Array(n + 1).fill(null).map(() => Array(maxHeight + 1).fill(false));
  const parent = Array(n + 1).fill(null).map(() => Array(maxHeight + 1).fill(-1));

  // 初始状态
  dp[0][0] = true;

  // 状态转移
  for (let i = 1; i <= n; i++) {
    const currentHeight = Math.floor(images[i - 1].scaledHeight + gap);
    
    for (let h = 0; h <= maxHeight; h++) {
      // 不选择当前图片
      if (dp[i - 1][h]) {
        dp[i][h] = true;
        parent[i][h] = 0; // 0表示不选择
      }
      
      // 选择当前图片
      if (h >= currentHeight && dp[i - 1][h - currentHeight]) {
        dp[i][h] = true;
        parent[i][h] = 1; // 1表示选择
      }
    }
  }

  // 找到最接近目标高度的解
  let bestHeight = 0;
  let minDiff = Math.abs(targetHeight);
  
  for (let h = 0; h <= maxHeight; h++) {
    if (dp[n][h]) {
      const diff = Math.abs(h - targetHeight);
      if (diff < minDiff) {
        minDiff = diff;
        bestHeight = h;
      }
    }
  }

  // 回溯构造解
  const column1 = [];
  const column2 = [];
  let currentHeight = bestHeight;
  
  for (let i = n; i >= 1; i--) {
    if (parent[i][currentHeight] === 1) {
      column1.push(images[i - 1]);
      currentHeight -= Math.floor(images[i - 1].scaledHeight + gap);
    } else {
      column2.push(images[i - 1]);
    }
  }

  // 计算实际高度
  const height1 = column1.reduce((sum, img) => sum + img.scaledHeight + gap, 0) - (column1.length > 0 ? gap : 0);
  const height2 = column2.reduce((sum, img) => sum + img.scaledHeight + gap, 0) - (column2.length > 0 ? gap : 0);

  return {
    columns: [
      { items: column1.reverse(), totalHeight: height1 },
      { items: column2.reverse(), totalHeight: height2 }
    ],
    maxHeight: Math.max(height1, height2),
    heightVariance: Math.pow(height1 - height2, 2) / 2
  };
}

/**
 * 多列瀑布流的分支限界算法
 * 用于处理列数大于2的情况
 */
function solveBranchAndBound(images, k, gap) {
  const n = images.length;
  let bestSolution = null;
  let bestMaxHeight = Infinity;

  // 初始化列
  const columns = Array(k).fill(null).map(() => ({ items: [], totalHeight: 0 }));

  function backtrack(imageIndex) {
    if (imageIndex === n) {
      // 找到一个完整解
      const maxHeight = Math.max(...columns.map(col => col.totalHeight));
      if (maxHeight < bestMaxHeight) {
        bestMaxHeight = maxHeight;
        bestSolution = columns.map(col => ({
          items: [...col.items],
          totalHeight: col.totalHeight
        }));
      }
      return;
    }

    // 剪枝：如果当前最大高度已经超过已知最优解，停止搜索
    const currentMaxHeight = Math.max(...columns.map(col => col.totalHeight));
    if (currentMaxHeight >= bestMaxHeight) {
      return;
    }

    const currentImage = images[imageIndex];
    const imageHeight = currentImage.scaledHeight + gap;

    // 尝试将当前图片放到每一列
    for (let colIndex = 0; colIndex < k; colIndex++) {
      columns[colIndex].items.push(currentImage);
      columns[colIndex].totalHeight += imageHeight;

      backtrack(imageIndex + 1);

      // 回溯
      columns[colIndex].items.pop();
      columns[colIndex].totalHeight -= imageHeight;
    }
  }

  backtrack(0);

  // 如果没有找到解，使用贪心算法作为后备
  if (!bestSolution) {
    return greedyFallback(images, k, gap);
  }

  // 计算方差
  const heights = bestSolution.map(col => col.totalHeight);
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / k;
  const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / k;

  return {
    columns: bestSolution,
    maxHeight: bestMaxHeight,
    heightVariance: variance
  };
}

/**
 * 贪心算法作为后备方案
 */
function greedyFallback(images, k, gap) {
  const columns = Array(k).fill(null).map(() => ({ items: [], totalHeight: 0 }));

  images.forEach(image => {
    // 找到最短的列
    let shortestIndex = 0;
    for (let i = 1; i < k; i++) {
      if (columns[i].totalHeight < columns[shortestIndex].totalHeight) {
        shortestIndex = i;
      }
    }

    // 确保图片有scaledHeight属性
    const imageWithHeight = {
      ...image,
      scaledHeight: image.scaledHeight || image.height
    };

    columns[shortestIndex].items.push(imageWithHeight);
    columns[shortestIndex].totalHeight += imageWithHeight.scaledHeight + gap;
  });

  const maxHeight = Math.max(...columns.map(col => col.totalHeight));
  const heights = columns.map(col => col.totalHeight);
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / k;
  const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / k;

  return {
    columns,
    maxHeight,
    heightVariance: variance
  };
}

/**
 * 混合优化策略：先贪心，再局部优化
 */
export function createHybridWaterfallLayout(images, columnWidth = 400, gap = 16, columnCount = 2) {
  // 第一阶段：使用贪心算法获得初始解
  const greedyResult = greedyFallback(
    images.map(img => ({
      ...img,
      scaledHeight: (img.height * columnWidth) / img.width
    })),
    columnCount,
    gap
  );

  // 第二阶段：对于小规模的局部区域使用DP优化
  if (images.length <= 20 && columnCount <= 3) {
    return createWaterfallLayoutDP(images, columnWidth, gap, columnCount);
  }

  return {
    ...greedyResult,
    totalColumns: columnCount
  };
}

/**
 * 性能测试函数
 */
export function compareAlgorithms(images, columnWidth = 400, gap = 16, columnCount = 2) {
  const results = {};

  // 预处理图片数据
  const processedImages = images.map(img => ({
    ...img,
    scaledHeight: (img.height * columnWidth) / img.width
  }));

  // 测试贪心算法
  console.time('贪心算法');
  const greedyResult = greedyFallback(processedImages, columnCount, gap);
  console.timeEnd('贪心算法');
  results.greedy = greedyResult;

  // 测试动态规划算法（仅对小规模问题）
  if (images.length <= 15 && columnCount <= 2) {
    console.time('动态规划算法');
    try {
      const dpResult = createWaterfallLayoutDP(images, columnWidth, gap, columnCount);
      console.timeEnd('动态规划算法');
      results.dp = dpResult;
    } catch (error) {
      console.warn('动态规划算法执行失败:', error);
      console.timeEnd('动态规划算法');
    }
  }

  // 测试混合算法
  console.time('混合算法');
  const hybridResult = createHybridWaterfallLayout(images, columnWidth, gap, columnCount);
  console.timeEnd('混合算法');
  results.hybrid = hybridResult;

  // 添加性能对比信息
  console.log('📊 算法性能对比:');
  console.log('贪心算法 - 最大高度:', greedyResult.maxHeight?.toFixed(2));
  if (results.dp) {
    console.log('动态规划 - 最大高度:', results.dp.maxHeight?.toFixed(2));
    const improvement = ((greedyResult.maxHeight - results.dp.maxHeight) / greedyResult.maxHeight * 100);
    console.log('DP优化程度:', improvement.toFixed(2) + '%');
  }
  console.log('混合算法 - 最大高度:', hybridResult.maxHeight?.toFixed(2));

  return results;
}
