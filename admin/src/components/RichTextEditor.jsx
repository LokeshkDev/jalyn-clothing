import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const TOOLBAR_BUTTONS = [
  { key: 'bold', label: 'Bold', icon: Bold, cmd: 'bold', hint: 'Ctrl+B' },
  { key: 'italic', label: 'Italic', icon: Italic, cmd: 'italic', hint: 'Ctrl+I' },
  { key: 'underline', label: 'Underline', icon: Underline, cmd: 'underline', hint: 'Ctrl+U' },
  { key: 'strike', label: 'Strikethrough', icon: Strikethrough, cmd: 'strikeThrough' },
  { key: 'divider' },
  { key: 'h2', label: 'Heading 2', icon: Heading2, cmd: 'formatBlock', arg: 'h2' },
  { key: 'h3', label: 'Heading 3', icon: Heading3, cmd: 'formatBlock', arg: 'h3' },
  { key: 'p', label: 'Paragraph', icon: List, cmd: 'formatBlock', arg: 'p', text: 'P' },
  { key: 'divider' },
  { key: 'ul', label: 'Bullet List', icon: List, cmd: 'insertUnorderedList' },
  { key: 'ol', label: 'Numbered List', icon: ListOrdered, cmd: 'insertOrderedList' },
  { key: 'divider' },
  { key: 'alignLeft', label: 'Align Left', icon: AlignLeft, cmd: 'justifyLeft' },
  { key: 'alignCenter', label: 'Align Center', icon: AlignCenter, cmd: 'justifyCenter' },
  { key: 'alignRight', label: 'Align Right', icon: AlignRight, cmd: 'justifyRight' },
  { key: 'divider' },
  { key: 'link', label: 'Insert Link', icon: Link2, cmd: 'link' },
  { key: 'unlink', label: 'Remove Link', icon: Unlink, cmd: 'unlink' },
  { key: 'divider' },
  { key: 'undo', label: 'Undo', icon: Undo2, cmd: 'undo' },
  { key: 'redo', label: 'Redo', icon: Redo2, cmd: 'redo' },
];

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your content...' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    onChange?.(el?.innerHTML || '');
  };

  const execCommand = (cmd, arg) => {
    const el = editorRef.current;
    el?.focus();
    try {
      document.execCommand('styleWithCSS', false, 'true');
      if (cmd === 'link') {
        const url = window.prompt('Enter link URL (https://...)');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      } else {
        document.execCommand(cmd, false, arg);
      }
    } catch (e) {
      console.warn('execCommand failed:', e);
    }
    emitChange();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data?.file?.url;
      if (imageUrl) {
        const el = editorRef.current;
        el?.focus();
        const imgHtml = `<img src="${imageUrl}" alt="Uploaded content image" class="my-4 max-w-full rounded-xl shadow-md border border-gray-100 block" />`;
        document.execCommand('insertHTML', false, imgHtml);
        emitChange();
      }
    } catch (err) {
      console.error('Failed to upload R2 image:', err);
      alert(err.response?.data?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
    emitChange();
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 select-none">
        {TOOLBAR_BUTTONS.map((btn) => {
          if (btn.key === 'divider') {
            return <span key={btn.key} className="w-px h-6 bg-gray-200 mx-1" />;
          }
          const Icon = btn.icon;
          return (
            <button
              key={btn.key}
              type="button"
              title={btn.label}
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand(btn.cmd, btn.arg);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-brand-100 hover:text-brand-700 transition cursor-pointer"
            >
              {Icon ? <Icon className="w-4 h-4" /> : <span className="text-[11px] font-bold">{btn.text}</span>}
            </button>
          );
        })}

        <span className="w-px h-6 bg-gray-200 mx-1" />

        {/* Upload Image to Cloudflare R2 Button */}
        <button
          type="button"
          title="Upload & Insert Image (Cloudflare R2)"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading R2...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </>
          )}
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="min-h-[180px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-gray-800 outline-none prose prose-sm max-w-none [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400"
      />
    </div>
  );
}
