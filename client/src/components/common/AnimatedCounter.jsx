import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter: Smoothly animates numbers from zero to target value.
 * Triggers only when visible in viewport via IntersectionObserver.
 * Runs once per visit with smooth easing.
 */
export default function AnimatedCounter({
  target,
  value,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  once = false,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  // Extract pure numeric value from string or number (supports both value and target props)
  const rawTarget = value !== undefined ? value : target;
  const numericTarget = typeof rawTarget === 'number'
    ? rawTarget
    : parseFloat(String(rawTarget).replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(numericTarget);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAnimatedRef.current || !once) {
            hasAnimatedRef.current = true;
            startCount();
          }
        } else if (!once) {
          hasAnimatedRef.current = false;
        }
      },
      { threshold: 0.2 }
    );

    const currentEl = elementRef.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [numericTarget, once]);

  const startCount = () => {
    const startTime = performance.now();
    const startVal = 0;
    const endVal = numericTarget;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = startVal + (endVal - startVal) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    requestAnimationFrame(step);
  };

  const formattedNumber = decimals > 0
    ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}
