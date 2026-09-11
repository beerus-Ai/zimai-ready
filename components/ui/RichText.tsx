import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Lightweight, safe markdown renderer for AI output (no HTML injection).
 * Supports: headings (#, ##, ###), paragraphs, - / * bullets, 1. numbered lists,
 * **bold**, *italic*, `code`, ```code blocks``` and > quotes.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text || '');
  return (
    <div className={cn('space-y-2.5 text-[15px] leading-relaxed', className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return (
              <p key={i} className={cn('font-bold text-slate-900', b.level === 1 ? 'text-lg' : 'text-base')}>
                {inline(b.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={i} className="space-y-1.5 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="space-y-1.5 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                      {j + 1}
                    </span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'code':
            return (
              <pre key={i} className="overflow-x-auto rounded-xl bg-ink-950 p-3 font-mono text-[13px] leading-relaxed text-slate-100">
                {b.text}
              </pre>
            );
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-gold-400 bg-gold-50/60 px-3 py-2 text-slate-700">
                {inline(b.text)}
              </blockquote>
            );
          default:
            return <p key={i}>{inline(b.text)}</p>;
        }
      })}
    </div>
  );
}

type Block =
  | { type: 'p' | 'quote' | 'code'; text: string }
  | { type: 'h'; text: string; level: number }
  | { type: 'ul' | 'ol'; items: string[] };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r/g, '').split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trim().startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push({ type: 'code', text: buf.join('\n') });
      continue;
    }
    const h = line.match(/^\s*(#{1,4})\s+(.*)$/);
    if (h) {
      out.push({ type: 'h', level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ''));
      out.push({ type: 'ul', items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''));
      out.push({ type: 'ol', items });
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      out.push({ type: 'quote', text: line.replace(/^\s*>\s?/, '') });
      i++;
      continue;
    }
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^\s*([-*•]|\d+[.)]|#{1,4}|>|```)\s*/.test(lines[i])) buf.push(lines[i++]);
    out.push({ type: 'p', text: buf.join(' ') });
  }
  return out;
}

function inline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parts.push(<strong key={k++} className="font-semibold text-slate-900">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={k++} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-800">{tok.slice(1, -1)}</code>);
    else parts.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
