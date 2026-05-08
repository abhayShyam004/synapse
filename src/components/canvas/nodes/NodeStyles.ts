// src/components/canvas/nodes/NodeStyles.ts
export const SHAPES = {
  rectangle: 'rounded-none',
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  diamond: 'rotate-45',
  hexagon: '[clip-path:polygon(25%_0%,_75%_0%,_100%_50%,_75%_100%,_25%_100%,_0%_50%)]',
};

export const COLORS = {
  yellow: 'bg-synapse-yellow border-black text-black',
  cyan: 'bg-synapse-cyan border-black text-black',
  blue: 'bg-synapse-blue border-black text-white',
  purple: 'bg-purple-500 border-black text-white',
  orange: 'bg-orange-500 border-black text-black',
  red: 'bg-red-500 border-black text-white',
  green: 'bg-green-400 border-black text-black',
  pink: 'bg-pink-400 border-black text-black',
  gray: 'bg-gray-300 border-black text-black',
  white: 'bg-white border-black text-black',
};

export const NODE_TYPES = [
  { type: 'Task', color: 'yellow', defaultShape: 'rounded' },
  { type: 'Decision', color: 'cyan', defaultShape: 'diamond' },
  { type: 'Note', color: 'white', defaultShape: 'rectangle' },
  { type: 'AI Prompt', color: 'purple', defaultShape: 'rounded' },
  { type: 'Timer', color: 'orange', defaultShape: 'pill' },
  { type: 'Condition', color: 'red', defaultShape: 'hexagon' },
  { type: 'Variable', color: 'green', defaultShape: 'rounded' },
  { type: 'Loop', color: 'pink', defaultShape: 'rounded' },
  { type: 'Group', color: 'gray', defaultShape: 'rectangle' }
];
