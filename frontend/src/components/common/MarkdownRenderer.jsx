import React from 'react';

/**
 * Clean, lightweight, safe Markdown renderer component for MemoryMate AI messages.
 * Handles headers, bold/italics, code blocks, inline code, bullet/numbered lists, quotes, and links.
 */
export const MarkdownRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Split into lines for block-level parsing
  const lines = content.split('\n');
  const blocks = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }
  let currentCodeBlock = null; // { lang: '', lines: [] }
  let currentQuote = null; // []

  const flushList = () => {
    if (currentList) {
      blocks.push({ ...currentList });
      currentList = null;
    }
  };

  const flushQuote = () => {
    if (currentQuote) {
      blocks.push({ type: 'quote', lines: currentQuote });
      currentQuote = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle (```)
    if (line.trim().startsWith('```')) {
      flushList();
      flushQuote();
      if (currentCodeBlock) {
        blocks.push({ type: 'codeblock', ...currentCodeBlock });
        currentCodeBlock = null;
      } else {
        const lang = line.trim().slice(3).trim();
        currentCodeBlock = { lang, lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      flushList();
      if (!currentQuote) currentQuote = [];
      currentQuote.push(line.trim().replace(/^>\s?/, ''));
      continue;
    } else {
      flushQuote();
    }

    // Unordered List (- or * or •)
    const ulMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[3]);
      continue;
    }

    // Ordered List (1. 2. etc)
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[3]);
      continue;
    }

    // If it's not a list item, flush any open list
    flushList();

    // Headers
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) });
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      blocks.push({ type: 'empty' });
      continue;
    }

    // Normal paragraph line
    blocks.push({ type: 'p', text: line });
  }

  flushList();
  flushQuote();
  if (currentCodeBlock) {
    blocks.push({ type: 'codeblock', ...currentCodeBlock });
  }

  // Inline formatting helper
  const renderInline = (text) => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    const regex = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/;

    while (remaining) {
      const match = remaining.match(regex);
      if (!match) {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      const matchIndex = match.index;
      if (matchIndex > 0) {
        parts.push(<span key={keyIdx++}>{remaining.slice(0, matchIndex)}</span>);
      }

      const full = match[0];
      if (full.startsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-800 text-brand-600 dark:text-brand-300 font-mono text-[0.88em] border border-slate-300 dark:border-slate-700"
          >
            {match[2]}
          </code>
        );
      } else if (full.startsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-slate-900 dark:text-white">
            {match[3]}
          </strong>
        );
      } else if (full.startsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800 dark:text-slate-200">
            {match[4]}
          </em>
        );
      } else if (full.startsWith('[')) {
        parts.push(
          <a
            key={keyIdx++}
            href={match[6]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 underline hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            {match[5]}
          </a>
        );
      }

      remaining = remaining.slice(matchIndex + full.length);
    }

    return parts;
  };

  return (
    <div className={`space-y-2 leading-relaxed break-words ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'h1') {
          return (
            <h1 key={idx} className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-3 mb-1">
              {renderInline(block.text)}
            </h1>
          );
        }
        if (block.type === 'h2') {
          return (
            <h2 key={idx} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-2.5 mb-1">
              {renderInline(block.text)}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={idx} className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 mt-2 mb-0.5">
              {renderInline(block.text)}
            </h3>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="space-y-1.5 my-1.5 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="space-y-1.5 my-1.5 pl-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-[11px] font-bold text-brand-500 shrink-0 mt-0.5 min-w-[16px]">
                    {i + 1}.
                  </span>
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === 'codeblock') {
          return (
            <div
              key={idx}
              className="my-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"
            >
              {block.lang && (
                <div className="text-[10px] text-slate-400 font-sans uppercase mb-1.5 pb-1 border-b border-slate-800">
                  {block.lang}
                </div>
              )}
              <pre className="m-0 leading-normal">{block.lines.join('\n')}</pre>
            </div>
          );
        }
        if (block.type === 'quote') {
          return (
            <blockquote
              key={idx}
              className="my-2 pl-3 border-l-2 border-brand-500 text-slate-600 dark:text-slate-400 italic text-xs sm:text-sm"
            >
              {block.lines.map((l, i) => (
                <p key={i}>{renderInline(l)}</p>
              ))}
            </blockquote>
          );
        }
        if (block.type === 'hr') {
          return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-800" />;
        }
        if (block.type === 'empty') {
          return <div key={idx} className="h-1" />;
        }
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
};
