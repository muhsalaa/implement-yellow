export const createYellowSlice = (set) => ({
  ischatLoaded: false,
  setLoaded: (cond = true) => set({ ischatLoaded: cond }),
});
