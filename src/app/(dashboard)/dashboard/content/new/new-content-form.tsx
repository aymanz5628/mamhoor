"use client";

import { useActionState, useState, useRef } from "react";
import { createMaterial } from "@/app/actions/material";
import styles from "./new-content.module.css";
import Link from "next/link";
import RichTextEditor from "@/components/rich-text-editor";

import { FileText, Image as ImageIcon, Film, Mic, Paperclip, CheckCircle, UploadCloud } from "lucide-react";

const materialTypes = [
  { value: "TEXT", label: "نص", icon: <FileText size={24} />, desc: "مقالات، منشورات، نصوص إعلانية" },
  { value: "IMAGE", label: "صورة", icon: <ImageIcon size={24} />, desc: "تصاميم، إنفوجرافيك، بانرات" },
  { value: "VIDEO", label: "فيديو", icon: <Film size={24} />, desc: "إعلانات، ريلز، فيديوهات" },
  { value: "AUDIO", label: "صوت", icon: <Mic size={24} />, desc: "بودكاست، تعليق صوتي" },
];

interface Props {
  projects: { id: string; name: string }[];
}

export default function NewContentForm({ projects }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [state, formAction, isPending] = useActionState(createMaterial, null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  const getAcceptType = () => {
    if (selectedType === "IMAGE") return "image/*";
    if (selectedType === "VIDEO") return "video/*";
    if (selectedType === "AUDIO") return "audio/*";
    return "*/*";
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/content" className={styles.breadcrumbLink}>المواد</Link>
        <span className={styles.breadcrumbSep}>←</span>
        <span className={styles.breadcrumbCurrent}>رفع مادة جديدة</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <div className={styles.formIcon}><Paperclip size={28} /></div>
          <h1 className={styles.formTitle}>رفع مادة جديدة</h1>
          <p className={styles.formSubtitle}>اختر نوع المادة وأضف التفاصيل المطلوبة</p>
        </div>

        <form action={formAction} className={styles.form}>
          {/* نوع المادة — hidden input */}
          <input type="hidden" name="type" value={selectedType || ""} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>نوع المادة *</label>
            <div className={styles.typeGrid}>
              {materialTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  className={`${styles.typeCard} ${selectedType === type.value ? styles.typeCardActive : ""}`}
                  onClick={() => {
                    setSelectedType(type.value);
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <span className={styles.typeIcon}>{type.icon}</span>
                  <span className={styles.typeLabel}>{type.label}</span>
                  <span className={styles.typeDesc}>{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* المشروع */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="projectId">المشروع *</label>
            <select id="projectId" name="projectId" className={styles.select} required>
              <option value="">اختر المشروع...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {projects.length === 0 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--warning)", marginTop: "var(--space-1)" }}>
                لا توجد مشاريع. أنشئ مشروعاً أولاً.
              </p>
            )}
          </div>

          {/* عنوان المادة */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="title">عنوان المادة *</label>
            <input
              id="title"
              name="title"
              type="text"
              className={styles.input}
              placeholder="مثال: مقال أفضل ممارسات التسويق"
              required
            />
          </div>

          {/* موعد الاعتماد النهائي (Deadline) */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="dueDate">موعد الاعتماد النهائي (اختياري)</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className={styles.input}
              min={new Date().toISOString().split("T")[0]}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
              سيتم تنبيه الفريق بناءً على الوقت المتبقي لهذا الموعد.
            </p>
          </div>

          {/* وصف المادة */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="description">وصف المادة (اختياري)</label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="وصف مختصر عن هذه المادة..."
              rows={3}
            />
          </div>

          {/* منطقة رفع الملف */}
          {selectedType && selectedType !== "TEXT" && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>رفع الملف *</label>
              <div 
                className={styles.uploadZone} 
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer", borderColor: fileName ? "var(--indigo)" : undefined, backgroundColor: fileName ? "var(--cream-light)" : undefined }}
              >
                <div className={styles.uploadIcon} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: fileName ? 'var(--success)' : 'inherit'}}>{fileName ? <CheckCircle size={32} /> : <UploadCloud size={32} />}</div>
                {fileName ? (
                  <p className={styles.uploadText} style={{ color: "var(--indigo)" }}>{fileName}</p>
                ) : (
                  <>
                    <p className={styles.uploadText}>اضغط لاختيار الملف</p>
                    <p className={styles.uploadHint}>
                      {selectedType === "IMAGE" && "PNG, JPG, SVG — حتى 10 ميجابايت"}
                      {selectedType === "VIDEO" && "MP4, MOV — حتى 100 ميجابايت"}
                      {selectedType === "AUDIO" && "MP3, WAV — حتى 50 ميجابايت"}
                    </p>
                  </>
                )}
                <input 
                  type="file" 
                  name="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={getAcceptType()}
                  style={{ display: "none" }}
                  required
                />
              </div>
            </div>
          )}

          {/* محرر النص */}
          {selectedType === "TEXT" && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>المحتوى *</label>
              <input type="hidden" name="content" value={textContent} />
              <RichTextEditor content={textContent} onChange={setTextContent} />
            </div>
          )}

          {state?.error && <div className={styles.error}>{state.error}</div>}

          <div className={styles.formActions}>
            <Link href="/dashboard/content" className="btn btn--ghost">إلغاء</Link>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isPending || !selectedType || (selectedType !== "TEXT" && !fileName) || (selectedType === "TEXT" && (!textContent || textContent === "<p></p>"))}
            >
              {isPending ? "جارٍ الرفع..." : "رفع المادة ←"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
