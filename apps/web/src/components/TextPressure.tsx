'use client';

// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const TextPressure: React.FC<TextPressureProps> = ({
  text = 'Compressa',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght@8..144,-10..0,25..151,100..1000&display=swap',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  strokeWidth = 2,
  className = '',
  minFontSize = 24
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const lastActiveRef = useRef(Date.now());

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      lastActiveRef.current = Date.now();
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        cursorRef.current.x = e.touches[0].clientX;
        cursorRef.current.y = e.touches[0].clientY;
        lastActiveRef.current = Date.now();
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        cursorRef.current.x = e.touches[0].clientX;
        cursorRef.current.y = e.touches[0].clientY;
        lastActiveRef.current = Date.now();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + containerWidth / 2;
      mouseRef.current.y = top + containerHeight / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    if (containerW <= 0) return;

    // Ensure font fits both width and height constraints on mobile & desktop
    // Avg uppercase char width in wide state is ~0.65-0.75 of font size
    const approxCharWidthRatio = 0.68;
    let targetFontSize = Math.min(
      containerW / (chars.length * approxCharWidthRatio),
      containerH * 0.85
    );
    targetFontSize = Math.max(targetFontSize, minFontSize);

    setFontSize(targetFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current || !containerRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();

      // Ensure no horizontal overflow on narrow mobile screens
      if (textRect.width > parentRect.width && textRect.width > 0) {
        const fitRatio = (parentRect.width * 0.95) / textRect.width;
        setFontSize(prev => Math.max(prev * fitRatio, minFontSize));
      }

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    const animate = (time: number) => {
      // Gentle idle wave if no mouse or touch movement in 2 seconds (especially great for mobile)
      if (Date.now() - lastActiveRef.current > 2000 && titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const centerX = titleRect.x + titleRect.width / 2;
        const centerY = titleRect.y + titleRect.height / 2;
        const waveX = Math.sin(time / 1200) * (titleRect.width * 0.4);
        const waveY = Math.cos(time / 1500) * 15;
        cursorRef.current.x = centerX + waveX;
        cursorRef.current.y = centerY + waveY;
      }

      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 12;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 12;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 1.8, 120);

        spansRef.current.forEach(span => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          };

          const d = dist(mouseRef.current, charCenter);

          const hoverFactor = 1 - Math.min(1, d / maxDist);
          const wdth = width ? Math.floor(85 + 66 * hoverFactor) : 100;
          const wght = weight ? Math.floor(400 + 500 * hoverFactor) : 400;
          // In Roboto Flex, slant axis is 'slnt' (-10 to 0) rather than 'ital'
          const slntVal = italic ? (-10 * hoverFactor).toFixed(1) : '0';
          const alphaVal = alpha ? hoverFactor.toFixed(2) : '1';

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'slnt' ${slntVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('${fontUrl}');
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}} />
    );
  }, [fontUrl, stroke, textColor, strokeColor, strokeWidth]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-visible bg-transparent flex items-center justify-center">
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${className} ${
          flex ? 'flex justify-between flex-nowrap' : ''
        } ${stroke ? 'stroke' : ''} uppercase text-center whitespace-nowrap`}
        style={{
          fontFamily: fontFamily.includes(',') ? fontFamily : `'${fontFamily}', system-ui, sans-serif`,
          fontSize: fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center center',
          margin: 0,
          fontWeight: 600,
          color: stroke ? undefined : textColor
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={el => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            className="inline-block select-none"
            style={{ fontVariationSettings: "'wght' 600, 'wdth' 100, 'slnt' 0" }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
