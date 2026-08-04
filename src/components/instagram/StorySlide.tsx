import { forwardRef } from "react";
import { DesignPreset, StorySlideData } from "@/lib/instagram-designs";

/** Renders **bold** and *italic* inside slide text */
function renderRich(text: string, strongColor: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: strongColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

interface StorySlideProps {
  slide: StorySlideData;
  design: DesignPreset;
  /** rendered width in px (height is always width * 16/9) */
  width: number;
  index: number;
  total: number;
  footer?: string;
}

export const StorySlide = forwardRef<HTMLDivElement, StorySlideProps>(
  ({ slide, design, width, index, total, footer }, ref) => {
    const u = width / 1080;
    const height = (width * 16) / 9;

    return (
      <div
        ref={ref}
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          background: design.background,
          color: design.text,
          fontFamily: design.bodyFont,
          borderRadius: 0,
        }}
      >
        {slide.image && (
          <img
            src={slide.image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: slide.image ? design.overlay : "transparent",
          }}
        />

        {/* content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: `${110 * u}px ${86 * u}px`,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${16 * u}px`,
              fontSize: `${26 * u}px`,
              letterSpacing: `${4 * u}px`,
              textTransform: "uppercase",
              color: design.accent,
            }}
          >
            <span
              style={{
                width: `${64 * u}px`,
                height: `${2 * u}px`,
                background: design.accent,
                display: "inline-block",
              }}
            />
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: `${40 * u}px` }}>
            <h2
              style={{
                fontFamily: design.headingFont,
                fontSize: `${slide.heading.length > 26 ? 82 * u : 104 * u}px`,
                lineHeight: 1.08,
                fontWeight: 700,
                margin: 0,
                letterSpacing: `${-1 * u}px`,
              }}
            >
              {slide.heading}
            </h2>
            <span
              style={{
                width: `${120 * u}px`,
                height: `${4 * u}px`,
                background: design.accent,
                borderRadius: `${4 * u}px`,
              }}
            />
            <div
              style={{
                fontSize: `${slide.body.length > 180 ? 38 * u : 46 * u}px`,
                lineHeight: 1.5,
                margin: 0,
                color: design.muted,
                display: "flex",
                flexDirection: "column",
                gap: `${14 * u}px`,
              }}
            >
              {slide.body.split("\n").map((line, i) => {
                const bullet = /^\s*([-*•])\s+/.test(line);
                const content = bullet ? line.replace(/^\s*([-*•])\s+/, "") : line;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: bullet ? `${18 * u}px` : 0,
                      whiteSpace: "pre-wrap",
                      minHeight: content ? undefined : `${20 * u}px`,
                    }}
                  >
                    {bullet && (
                      <span style={{ color: design.accent, lineHeight: 1.5 }}>•</span>
                    )}
                    <span style={{ flex: 1 }}>{renderRich(content, design.text)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              fontSize: `${26 * u}px`,
              letterSpacing: `${3 * u}px`,
              textTransform: "uppercase",
              color: design.muted,
            }}
          >
            {footer || "Teachings Hub"}
          </div>
        </div>
      </div>
    );
  },
);

StorySlide.displayName = "StorySlide";
