import { useEffect, useRef, useState } from "react";
import { ImageInfo, WaterfallLayoutResult } from "../types";
import { createWaterfallLayout } from "../utils/waterfallLayout";

interface WaterfallGridProps {
    images: ImageInfo[]
    columnWidth: number
    gap: number
    minColumns: number
    maxColumns: number
}

export default function WaterfallGrid({ images, columnWidth, gap, minColumns, maxColumns }: WaterfallGridProps) {
    const [layoutRes, setLayoutRes] = useState<WaterfallLayoutResult | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setLayoutRes(createWaterfallLayout(images, columnWidth, gap, minColumns, maxColumns));
    }, [images, columnWidth, gap, minColumns, maxColumns])

    return (
        <div ref={containerRef} className="waterfall-grid" style={{ gap: `${gap}px` }}>
            {
                layoutRes?.columns.map((column, columnIndex) => (
                    <div key={columnIndex}>
                        {
                            column.items.map((item, itemIndex) => (
                                <img key={itemIndex} src={item.url} alt={item.url} width={item.width} height={item.height}/>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    )
}