import { create } from "zustand";
import { logger } from "./middleware/logger";

import { YellowSlice, createYellowSlice } from "./slices/yellow";

export const useStore = create(
  logger((...args) => ({
    ...createYellowSlice(...args),
  }))
);
