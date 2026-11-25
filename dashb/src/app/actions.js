import { createAction } from "@reduxjs/toolkit";

export const dataInvalidated = createAction("app/dataInvalidated", () => ({
  payload: { at: Date.now() },
}));