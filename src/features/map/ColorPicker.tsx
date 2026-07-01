import { useState } from 'react';

const COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#6B7280', // Gray
  '#9CA3AF', // Light Gray
  '#FFFFFF', // White
];

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setIsOpen(false);
    onColorSelect(color);
  };

  return (
    <div className="absolute top-16 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded border-2 border-white shadow-lg"
        style={{ backgroundColor: selectedColor }}
      />
      
      {isOpen && (
        <div className="absolute top-10 right-0 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-6 h-6 rounded border-2 border-transparent hover:border-white transition"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
