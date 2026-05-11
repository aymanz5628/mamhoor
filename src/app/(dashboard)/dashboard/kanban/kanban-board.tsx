"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./kanban.module.css";
import { updateMaterialStatus } from "@/app/actions/material";
import { getDeadlineColor, formatRemainingTime } from "@/lib/deadline";

import { FileText, Image as ImageIcon, Film, Mic, MessageSquare, Clock } from "lucide-react";

type MaterialWithRelations = {
  id: string;
  title: string;
  status: string;
  type: string;
  createdAt: Date;
  dueDate: Date | null;
  project: { name: string };
  creator: { name: string | null };
  _count: { comments: number };
};

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  IN_REVIEW: "قيد المراجعة",
  CHANGES_REQUESTED: "تعديلات مطلوبة",
  PENDING_APPROVAL: "بانتظار الاعتماد",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
};

const statusDotColors: Record<string, string> = {
  DRAFT: "var(--status-draft)",
  IN_REVIEW: "var(--status-in-review)",
  CHANGES_REQUESTED: "var(--status-changes)",
  PENDING_APPROVAL: "var(--warning)",
  APPROVED: "var(--status-approved)",
  PUBLISHED: "var(--success)",
};

const typeIcons: Record<string, React.ReactNode> = { 
  TEXT: <FileText size={12} />, 
  IMAGE: <ImageIcon size={12} />, 
  VIDEO: <Film size={12} />, 
  AUDIO: <Mic size={12} /> 
};
const typeLabels: Record<string, string> = { TEXT: "نص", IMAGE: "صورة", VIDEO: "فيديو", AUDIO: "صوت" };

const COLUMNS = ["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "PENDING_APPROVAL", "APPROVED"] as const;

// التحولات المسموحة
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["CHANGES_REQUESTED", "PENDING_APPROVAL"],
  CHANGES_REQUESTED: ["IN_REVIEW"],
  PENDING_APPROVAL: ["APPROVED", "CHANGES_REQUESTED"],
  APPROVED: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
};

interface KanbanBoardProps {
  initialMaterials: MaterialWithRelations[];
}

export default function KanbanBoard({ initialMaterials }: KanbanBoardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [materials, setMaterials] = useState(initialMaterials);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state if props change (e.g. from server action revalidation)
  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedMaterial = materials.find((m) => m.id === draggableId);
    if (!draggedMaterial) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Check if transition is valid
    const allowedStatuses = VALID_TRANSITIONS[sourceStatus];
    if (sourceStatus !== destStatus && (!allowedStatuses || !allowedStatuses.includes(destStatus))) {
      // Invalid transition, optionally show a toast here
      alert(`لا يمكن الانتقال من "${statusLabels[sourceStatus]}" إلى "${statusLabels[destStatus]}"`);
      return;
    }

    // Optimistic UI update
    const updatedMaterials = materials.map((m) =>
      m.id === draggableId ? { ...m, status: destStatus } : m
    );
    setMaterials(updatedMaterials);

    if (sourceStatus !== destStatus) {
      // Call Server Action
      const res = await updateMaterialStatus(draggableId, destStatus);
      if (res.error) {
        // Revert on error
        setMaterials(initialMaterials);
        alert(res.error);
      }
    }
  };

  if (!mounted) {
    // Render static skeleton before hydration to prevent mismatch
    return <div className={styles.board}>جاري تحميل اللوحة...</div>;
  }

  const grouped: Record<string, MaterialWithRelations[]> = {};
  for (const col of COLUMNS) {
    grouped[col] = materials.filter((m) => m.status === col);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {COLUMNS.map((status) => {
          const items = grouped[status] || [];
          return (
            <div key={status} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span className={styles.columnDot} style={{ background: statusDotColors[status] }}></span>
                  {statusLabels[status]}
                </div>
                <span className={styles.columnCount}>{items.length}</span>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    className={styles.columnContent}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? "rgba(0,0,0,0.02)" : "transparent",
                    }}
                  >
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div className={styles.emptyCol}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-body)", textAlign: "center", paddingTop: "1rem" }}>لا توجد مواد</p>
                      </div>
                    )}
                    
                    {items.map((material, index) => (
                      <Draggable key={material.id} draggableId={material.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <div
                              onClick={() => router.push(`/dashboard/content/${material.id}`)}
                              className={styles.card}
                              style={{
                                cursor: 'pointer',
                                ...status === "CHANGES_REQUESTED" ? { borderColor: "var(--status-changes)", borderLeftWidth: "4px" } : {}
                              }}
                            >
                              <div className={styles.cardHeader}>
                                <span className={styles.cardProject}>{material.project.name}</span>
                                <span className={styles.cardType}>{typeIcons[material.type]} {typeLabels[material.type]}</span>
                              </div>
                              <h3 className={styles.cardTitle}>{material.title}</h3>
                              
                              {material.dueDate && material.status !== "APPROVED" && material.status !== "PUBLISHED" && material.status !== "ARCHIVED" && (
                                <div style={{ 
                                  display: "flex", alignItems: "center", gap: "4px", 
                                  fontSize: "0.75rem", fontFamily: "var(--font-body)", 
                                  color: getDeadlineColor(material.createdAt, material.dueDate) || "var(--text-muted)",
                                  marginBottom: "8px", fontWeight: 500
                                }}>
                                  <Clock size={12} />
                                  <span>{formatRemainingTime(material.dueDate)}</span>
                                </div>
                              )}

                              <div className={styles.cardFooter}>
                                <div className={styles.avatar}>
                                  {material.creator.name?.charAt(0) || "?"}
                                </div>
                                <div className={styles.cardComments}><MessageSquare size={12} /> {material._count.comments}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {status === "DRAFT" && (
                      <Link href="/dashboard/content/new" className={styles.addBtn} style={{ display: "block", textAlign: "center", textDecoration: "none" }}>+ إضافة مادة</Link>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
