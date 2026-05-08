// src/components/canvas/nodes/NodeStyles.ts
export const SHAPES = {
  rectangle: 'rounded-none',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  diamond: 'rotate-45', // Needs nested content counter-rotation
  hexagon: 'clip-path-hexagon', // Needs custom CSS in index.css
};

export const COLORS = {
  yellow: 'bg-[#FFD700] border-[#FFD700] text-black',
  cyan: 'bg-[#00FFFF] border-[#00FFFF] text-black',
  blue: 'bg-[#0070F3] border-[#0070F3] text-white',
  white: 'bg-white border-gray-200 text-black',
};
