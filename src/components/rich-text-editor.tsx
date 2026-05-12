"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo, Redo, Heading2, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Code
} from 'lucide-react';
import { useEffect, useCallback } from 'react';
import styles from './rich-text.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  limit?: number;
}

export default function RichTextEditor({ content, onChange, limit = 5000 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'ابدأ بكتابة المحتوى هنا بحرية وإبداع...',
      }),
      Underline,
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.editorLink,
        },
      }),
      CharacterCount.configure({
        limit,
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

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('الرابط:', previousUrl);
    
    // cancelled
    if (url === null) return;

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.isActive : ''}`}
            title="عريض"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.isActive : ''}`}
            title="مائل"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.isActive : ''}`}
            title="تسطير"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('strike') ? styles.isActive : ''}`}
            title="يتوسطه خط"
          >
            <Strikethrough size={16} />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}`}
            title="عنوان رئيسي"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('blockquote') ? styles.isActive : ''}`}
            title="اقتباس"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('codeBlock') ? styles.isActive : ''}`}
            title="كتلة برمجية"
          >
            <Code size={16} />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}`}
            title="محاذاة لليمين"
          >
            <AlignRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}`}
            title="محاذاة للوسط"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}`}
            title="محاذاة لليسار"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'justify' }) ? styles.isActive : ''}`}
            title="ضبط النص"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.isActive : ''}`}
            title="قائمة نقطية"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive('orderedList') ? styles.isActive : ''}`}
            title="قائمة رقمية"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={setLink}
            className={`${styles.toolbarBtn} ${editor.isActive('link') ? styles.isActive : ''}`}
            title="إدراج رابط"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            className={styles.toolbarBtn}
            title="إزالة الرابط"
          >
            <Unlink size={16} />
          </button>
        </div>

        <div className={styles.toolbarSpacer} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={styles.toolbarBtn}
            title="تراجع"
          >
            <Undo size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={styles.toolbarBtn}
            title="إعادة"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className={styles.body} />

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.footerCount}>
          <span>{wordCount} كلمة</span>
          <span>•</span>
          <span>{charCount}/{limit} حرف</span>
        </div>
      </div>
    </div>
  );
}
