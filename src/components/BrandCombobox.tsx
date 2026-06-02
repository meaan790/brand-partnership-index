"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { tierClass100 } from "@/lib/scoring";
import type { BrandWithScores } from "@/lib/types";

interface BrandComboboxProps {
  brands: BrandWithScores[];
  value: string | null;
  onChange: (name: string | null) => void;
  placeholder?: string;
}

export function BrandCombobox({
  brands,
  value,
  onChange,
  placeholder = "Search brands\u2026",
}: BrandComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : brands;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightIdx(0);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.children[highlightIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault();
      onChange(filtered[highlightIdx].name);
      close();
    }
  }

  const selected = value ? brands.find((b) => b.name === value) : null;

  if (selected && !open) {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="w-full flex items-center gap-3 border border-border-hairline rounded px-3 py-2 bg-surface-card hover:border-primary transition-colors text-left cursor-pointer"
        >
          <BrandLogo name={selected.name} domain={selected.domain} size="w-6 h-6" />
          <span className="font-body-md text-body-md text-text-main flex-1 truncate">
            {selected.name}
          </span>
          <span className={`${tierClass100(selected.score)} px-2 py-0.5 rounded text-xs font-data-tabular shrink-0`}>
            {selected.score}
          </span>
          <span className="material-symbols-outlined text-text-caption text-[18px]">unfold_more</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-caption text-[18px]">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-4 py-2 border border-border-hairline rounded bg-surface-card font-body-md text-body-md text-text-main focus:outline-none focus:border-primary transition-colors"
          placeholder={placeholder}
        />
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto border border-border-hairline rounded bg-surface-card shadow-lg"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-center font-caption text-caption text-text-caption">
              No brands match
            </div>
          ) : (
            filtered.map((b, i) => (
              <button
                key={b.slug}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(b.name);
                  close();
                }}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer transition-colors ${
                  i === highlightIdx ? "bg-surface-container" : "hover:bg-surface-container-low"
                }`}
              >
                <BrandLogo name={b.name} domain={b.domain} size="w-6 h-6" />
                <span className="font-body-md text-body-md text-text-main flex-1 truncate">
                  {b.name}
                </span>
                <span className={`${tierClass100(b.score)} px-2 py-0.5 rounded text-xs font-data-tabular shrink-0`}>
                  {b.score}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
