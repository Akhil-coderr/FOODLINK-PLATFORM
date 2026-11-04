import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollReveal: Google-style viewport-triggered animation component.
 * Uses IntersectionObserver to trigger animations dynamically when entering viewport.
 * Automatically re-renders fresh animations every time any route is viewed.
 * Respects prefers-reduced-motion automatically.
 */
export default function ScrollReveal({
  children,
  variant = 'fade-up', // 'fade-up' | 'fade-in' | 'scale-up'
  delay = 0, // delay in ms
  threshold = 0.12,
  className = '',
  once = false, // false enables Google-style re-rendering on every scroll view
  as: Component = 'div',
  ...rest
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Reset revealed state on route change so it reveals fresh on each page visit
    setIsRevealed(false);

    // Respect reduced motion settings
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (once && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, location.pathname, once]);

  const variantClass =
    variant === 'fade-in'
      ? 'reveal-fade-in'
      : variant === 'scale-up'
      ? 'reveal-scale-up'
      : variant === 'fade-left'
      ? 'reveal-fade-left'
      : variant === 'fade-right'
      ? 'reveal-fade-right'
      : 'reveal-fade-up';

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Component
      ref={elementRef}
      className={`${variantClass} ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
