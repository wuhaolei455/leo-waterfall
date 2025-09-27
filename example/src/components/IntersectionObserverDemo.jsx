import React, { useEffect, useMemo, useRef, useState } from "react";
import "./IntersectionObserverDemo.css";

const demoSections = [
  {
    title: "第一幕 · 清晨",
    description: "日光刚透进画框，城市慢慢醒来。",
    color: "#bfdbfe",
  },
  {
    title: "第二幕 · 午后",
    description: "咖啡香气和键盘声交织在空气里。",
    color: "#bbf7d0",
  },
  {
    title: "第三幕 · 黄昏",
    description: "夕阳把每栋建筑都镀上了暖色。",
    color: "#fcd34d",
  },
  {
    title: "第四幕 · 夜行",
    description: "灯光与流动的车流让街道重新热闹。",
    color: "#c4b5fd",
  },
];

function IntersectionObserverDemo() {
  const [visibleSections, setVisibleSections] = useState(() =>
    demoSections.map(() => false),
  );
  const sectionRefs = useRef([]);

  const visibleCount = useMemo(
    () => visibleSections.filter(Boolean).length,
    [visibleSections],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = [...prev];
          entries.forEach((entry) => {
            const idx = Number(entry.target.dataset.index);
            if (!Number.isNaN(idx)) {
              next[idx] = entry.isIntersecting;
            }
          });
          return next;
        });
      },
      {
        root: null,
        threshold: 0.45,
      },
    );

    sectionRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="io-demo">
      <header className="io-demo__header">
        <h1>👀 Intersection Observer 小剧场</h1>
        <p>
          下滑浏览场景卡片，观察右上角的监控面板如何实时感知哪张卡片进入视口。
        </p>
      </header>

      <aside className="io-demo__status">
        <div className="io-demo__status-count">
          <span className="io-demo__status-number">{visibleCount}</span>
          <span className="io-demo__status-label">卡片在视口内</span>
        </div>
        <ul className="io-demo__status-list">
          {demoSections.map((section, index) => (
            <li
              key={section.title}
              className={`io-demo__status-item${visibleSections[index] ? " active" : ""}`}
            >
              <span className="dot" aria-hidden />
              {section.title}
            </li>
          ))}
        </ul>
      </aside>

      <main className="io-demo__stage">
        {demoSections.map((section, index) => (
          <section
            key={section.title}
            data-index={index}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className={`io-demo__scene${visibleSections[index] ? " visible" : ""}`}
            style={{ backgroundColor: section.color }}
          >
            <div className="io-demo__scene-content">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <div className="io-demo__scene-hint">
                {visibleSections[index] ? "✅ 正在舞台中央" : "👋 等待登场..."}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default IntersectionObserverDemo;

