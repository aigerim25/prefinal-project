import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPlaylist } from "../../services/service.js";
import { withRetry, isNetworkError } from "../../services/withRetry.js";

export const NOT_FOUND = "Item not found";

export const fetchAlbumById = createAsyncThunk(
  "albumDetails/fetchOne",
  async ({ id }, { rejectWithValue, getState, requestId }) => {
    try {
      const result = await withRetry(() => getPlaylist(id), {
        shouldRetry: (error) => error.message !== NOT_FOUND && !isNetworkError(error),
      });
      if (getState().albumDetails.byId[id]?.requestId !== requestId) {
        return rejectWithValue({ isStale: true });
      }

      const { fromCache, ...album } = result;
      return { album, fromCache: Boolean(fromCache), fetchedAt: Date.now() };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        notFound: error.message === NOT_FOUND,
        isNetworkError: isNetworkError(error),
      });
    }
  },
  {
    condition: ({ id, force = false }, { getState }) => {
      const state = getState();
      const details = state.albumDetails.byId[id];

      if (details?.status === "loading") return force;
      if (force || details?.status === "failed") return true;


      if (!state.albums.byId[id]) return true;
      const loadedAt = details?.fetchedAt ?? 0;
      return loadedAt < state.albumDetails.invalidatedAt;
    },
  },
);
