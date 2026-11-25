import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPlaylists } from "../../services/service.js";
import { withRetry, isNetworkError } from "../../services/withRetry.js";

export const STALE_TIME = 60_000;

export function normalizeQuery(query = "") {
  const params = new URLSearchParams(query);
  params.sort();
  return params.toString();
}

export const fetchAlbums = createAsyncThunk(
  "albums/fetchList",
  async ({ query }, { rejectWithValue }) => {
    try {
      const result = await withRetry(() => getPlaylists(query), {
        shouldRetry: (error) => !isNetworkError(error),
      });
      return { ...result, fetchedAt: Date.now() };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        isNetworkError: isNetworkError(error),
      });
    }
  },
  {
    condition: ({ query, force = false }, { getState }) => {
      const list = getState().albums.lists[query];

      if (!list) return true;
      if (list.status === "loading") return force; 
      if (force) return true;
      if (list.status === "failed" || list.stale) return true;

      const isFresh = Date.now() - list.fetchedAt < STALE_TIME;
      return !isFresh;
    },
  },
);
