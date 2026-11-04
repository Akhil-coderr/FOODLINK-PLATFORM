import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  className = '',
  buttonClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-black text-xs sm:text-sm shadow-xs hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition cursor-pointer min-w-[140px] ${buttonClassName}`}
      >
        <span className="truncate text-slate-950 font-black">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-950 shrink-0 transition-transform duration-150 font-bold ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-52 sm:w-56 rounded-xl bg-white border-2 border-emerald-600 shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-black flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-950 font-black border-l-4 border-l-emerald-600'
                      : 'text-slate-950 bg-white hover:bg-emerald-50 hover:text-emerald-950'
                  }`}
                >
                  <span className="truncate text-slate-950 font-black">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-800 shrink-0 font-black stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
