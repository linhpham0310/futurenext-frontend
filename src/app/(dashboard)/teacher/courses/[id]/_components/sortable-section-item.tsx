'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil } from 'lucide-react';
interface Props {
  id: string;
  title: string;
}
// Task S2-CM-04: Component từng mục Section có khả năng kéo thả
export const SortableSectionItem = ({ id, title }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-x-2 bg-white border border-gray-200 rounded-md mb-4 text-sm shadow-sm"
    >
      {/* Nút cầm để kéo (Drag Handle) */}
      <div
        {...attributes}
        {...listeners}
        className="px-2 py-3 border-r border-r-gray-200 hover:bg-gray-100 rounded-l-md transition cursor-grab"
      >
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex-1 px-4 py-3 font-medium text-gray-700">{title}</div>
      <div className="pr-4 flex items-center gap-x-2">
        <button className="p-1 hover:text-blue-600 transition">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
