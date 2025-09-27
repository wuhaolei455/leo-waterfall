import { useEffect, useRef, useState } from "react";

// 懒加载图片组件
export function LazyLoadImage({ 
  src, 
  alt, 
  height, 
  onLoad 
}: { 
  src: string; 
  alt: string; 
  height: number | string; 
  onLoad?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            // 开始加载图片
            const realImg = entry.target as HTMLImageElement;
            const dataSrc = realImg.getAttribute('data-src');
            if (dataSrc) {
              realImg.src = dataSrc;
              realImg.removeAttribute('data-src');
            }
            // 加载后停止观察
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // 提前100px开始加载
        threshold: 0.1, // 进入视口10%时触发
      }
    );

    // 开始观察
    observer.observe(img);

    return () => observer.disconnect();
  }, [isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <>
      <img
        ref={imgRef}
        data-src={src} // 使用data-src存储真实地址
        alt={alt}
        style={{
          display: isLoaded ? "block" : "none",
          width: "100%",
          height: height,
          objectFit: "cover",
          borderRadius: 8,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
      {/* 占位符 - 在图片加载完成前显示 */}
      {!isLoaded && !error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: height,
            borderRadius: 8,
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: 12,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 4 }}>📷</div>
            <div>加载中...</div>
          </div>
        </div>
      )}
      {/* 错误占位符 */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: height,
            borderRadius: 8,
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dc2626",
            fontSize: 12,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 4 }}>⚠️</div>
            <div>加载失败</div>
          </div>
        </div>
      )}
    </>
  );
}