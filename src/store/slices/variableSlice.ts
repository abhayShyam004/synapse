export interface Variable {
  key: string;
  value: string;
}

export interface VariableSlice {
  variables: Variable[];
  addVariable: (variable: Variable) => void;
  updateVariable: (key: string, value: string) => void;
  removeVariable: (key: string) => void;
}

export const createVariableSlice = (
  set: (fn: (state: VariableSlice) => Partial<VariableSlice>) => void
): VariableSlice => ({
  variables: [],
  addVariable: (v) => set((state) => ({ variables: [...state.variables, v] })),
  updateVariable: (k, v) => set((state) => ({
    variables: state.variables.map((varItem) => varItem.key === k ? { ...varItem, value: v } : varItem)
  })),
  removeVariable: (k) => set((state) => ({
    variables: state.variables.filter((varItem) => varItem.key !== k)
  })),
});
