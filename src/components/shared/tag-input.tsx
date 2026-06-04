'use client';
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}
// TASK S4-CM-05: Component nhập tag kiến thức
export const TagInput = ({ tags, onChange, placeholder }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const addTag = () => {
    const val = inputValue.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInputValue('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-500">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder || 'Thêm concept...'}
          className="flex-1 px-3 py-1 text-sm border rounded-md outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            addTag();
          }}
          className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <Plus size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};
