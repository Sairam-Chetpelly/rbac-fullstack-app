import { useState, useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder = "Enter content..." }) {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      setIsEditorReady(true);
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 underline"
          title="Underline"
        >
          U
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('justifyLeft')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => formatText('justifyCenter')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => formatText('justifyRight')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Align Right"
        >
          →
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm lg:text-base"
        style={{ minHeight: '200px' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}