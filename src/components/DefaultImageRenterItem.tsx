import { CSSProperties } from "react";
import { ImageInfo } from "../types";
import { LazyLoadImage } from "./LazyImage";

export function defaultRenderItem(item: ImageInfo) {
    const resolvedHeight =
      item.height ?? item.originalHeight ?? item.originalWidth ?? 200;
    const itemStyle: CSSProperties = {
      position: "relative",
      borderRadius: 8,
      background: "#f8fafc",
      boxShadow: "0 8px 16px rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    };
  
    return (
      <div className="sw-waterfall-item" style={itemStyle}>
        {item.src ? (
          <LazyLoadImage
            src={item.src}
            alt={item.alt ?? "waterfall-item"}
            height={resolvedHeight}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: resolvedHeight,
              borderRadius: 8,
              background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 12,
            }}
          >
            {item.alt ?? "Loading"}
          </div>
        )}
      </div>
    );
  }
  