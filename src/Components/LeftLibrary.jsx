import React from 'react';
import { FaRegFilePdf } from 'react-icons/fa6';

// A slim, semi-transparent left panel that lists available PDFs
// Props:
// - items: Array<{ id, title, file }>
// - currentFile: string
// - onSelect: (file: string) => void
const LeftLibrary = ({ items = [], currentFile, onSelect }) => {
  return (
    <aside
      className="flex flex-col w-full h-full shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md"
      aria-label="PDF Library"
    >
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-white text-lg font-semibold">Library</h2>
        <p className="text-white/60 text-xs">Select a document</p>
      </div>

      <nav className="flex-1 overflow-y-auto thin-scroll px-1 py-2">
        {items.length === 0 && (
          <div className="px-4 py-6 text-white/60 text-sm">No PDFs found</div>
        )}
        <ul className="space-y-1">
          {items.map((item) => {
            const active = currentFile === item.file;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(item.file)}
                  className={[
                    'w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10',
                  ].join(' ')}
                  title={item.title}
                >
                  <span className="text-rose-300/90">
                    <FaRegFilePdf />
                  </span>
                  <span className="truncate text-sm">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* subtle right-side divider to separate from main content */}
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0 pointer-events-none" />
    </aside>
  );
};

export default LeftLibrary;
