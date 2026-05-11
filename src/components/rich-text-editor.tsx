"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Heading2 } from 'lucide-react';
import { useEffect } from 'react';
import styles from './rich-text.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'ابدأ بكتابة المحتوى هنا...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        dir: 'rtl',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== content && content !== "<p></p>") {
        editor.commands.setContent(content); 
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.isActive : ''}`}
          title="عريض"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.isActive : ''}`}
          title="مائل"
        >
          <Italic size={18} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`}
          title="عنوان رئيسي"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.toolbarBtn} ${editor.isActive('blockquote') ? styles.isActive : ''}`}
          title="اقتباس"
        >
          <Quote size={18} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
          title="قائمة نقطية"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarBtn} ${editor.isActive('orderedList') ? styles.isActive : ''}`}
          title="قائمة رقمية"
        >
          <ListOrdered size={18} />
        </button>
        <div className={styles.toolbarDivider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={styles.toolbarBtn}
          title="تراجع"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={styles.toolbarBtn}
          title="إعادة"
        >
          <Redo size={18} />
        </button>
      </div>
      <EditorContent editor={editor} className={styles.body} />
    </div>
  );
}
