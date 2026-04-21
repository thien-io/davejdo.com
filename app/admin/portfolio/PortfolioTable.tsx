"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { deleteProjectAction, reorderProjectsAction } from "../actions/projects";

type Row = {
  id: string;
  title: string;
  year: number | null;
  client: string | null;
  published: boolean;
  position: number;
};

export function PortfolioTable({ projects }: { projects: Row[] }) {
  const [rows, setRows] = useState(projects);

  async function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === e.active.id);
    const newIdx = rows.findIndex((r) => r.id === e.over!.id);
    const next = arrayMove(rows, oldIdx, newIdx);
    setRows(next);
    const res = await reorderProjectsAction(next.map((r) => r.id));
    if ("error" in res) toast.error(String(res.error));
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this project? This removes its media too.")) return;
    const prev = rows;
    setRows(rows.filter((r) => r.id !== id));
    const res = await deleteProjectAction(id);
    if ("error" in res) {
      setRows(prev);
      toast.error(String(res.error));
    } else {
      toast.success("Deleted");
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900">
          {rows.map((r) => (
            <SortableRow key={r.id} row={r} onDelete={onDelete} />
          ))}
          {rows.length === 0 && (
            <div className="px-4 py-8 text-center text-neutral-600 text-sm">
              No projects yet.
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ row, onDelete }: { row: Row; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-600">
        <GripVertical size={14} />
      </button>
      <div className="flex-1">
        <div className="text-sm">{row.title}</div>
        <div className="text-xs font-mono text-neutral-500">
          {row.client ?? "—"} · {row.year ?? "—"} ·{" "}
          {row.published ? "Published" : "Draft"}
        </div>
      </div>
      <Link
        href={`/admin/portfolio/${row.id}`}
        className="text-neutral-500 hover:text-white"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={() => onDelete(row.id)}
        className="text-neutral-500 hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
