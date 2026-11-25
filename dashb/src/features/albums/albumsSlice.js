import { createSlice } from "@reduxjs/toolkit";
import { fetchAlbums } from "./albumsThunks.js";
import { fetchAlbumById } from "../albumDetails/albumDetailsThunks.js";
import { createAlbum, updateAlbum, deleteAlbum } from "./albumsMutations.js";
import { dataInvalidated } from "../../app/actions.js";

const initialState = {
  byId: {},
  lists: {},
  showingCachedData: false,
};

function createEmptyList() {
  return {
    ids: [],
    total: 0,
    totalPages: 0,
    fromCache: false,
    status: "idle",
    error: null,
    isNetworkError: false,
    requestId: null,
    fetchedAt: 0,
    stale: false,
  };
}
function markAllListsStale(state) {
  Object.values(state.lists).forEach((list) => {
    list.stale = true;
    if (list.status === "loading") {
      list.status = "idle";
      list.requestId = null;
    }
  });
}

const albumsSlice = createSlice({
  name: "albums",
  initialState,
  reducers: {
    listsInvalidated(state) {
      markAllListsStale(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlbums.pending, (state, action) => {
        const { query } = action.meta.arg;
        if (!state.lists[query]) state.lists[query] = createEmptyList();

        const list = state.lists[query];
        list.status = "loading";
        list.error = null;
        list.isNetworkError = false;
        list.requestId = action.meta.requestId;
      })
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        const list = state.lists[action.meta.arg.query];
        if (!list || list.requestId !== action.meta.requestId) return;

        const { data, total, totalPages, fromCache, fetchedAt } = action.payload;
        data.forEach((album) => {
          state.byId[album.id] = album;
        });

        list.ids = data.map((album) => album.id);
        list.total = total;
        list.totalPages = totalPages;
        list.fromCache = fromCache;
        list.fetchedAt = fetchedAt;
        list.stale = false;
        list.status = "succeeded";
        list.requestId = null;
        state.showingCachedData = fromCache;
      })
      .addCase(fetchAlbums.rejected, (state, action) => {
        const list = state.lists[action.meta.arg.query];
        if (!list || list.requestId !== action.meta.requestId) return;

        list.status = "failed";
        list.error = action.payload?.message ?? action.error.message;
        list.isNetworkError = action.payload?.isNetworkError ?? false;
        list.requestId = null;
      })
      .addCase(fetchAlbumById.fulfilled, (state, action) => {
        const { album, fromCache } = action.payload;
        state.byId[album.id] = album;
        state.showingCachedData = fromCache;
      })
      .addCase(dataInvalidated, (state) => {
        markAllListsStale(state);
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload;
        markAllListsStale(state);
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload;
        markAllListsStale(state);
      })
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.byId[id];
        Object.values(state.lists).forEach((list) => {
          list.ids = list.ids.filter((listId) => listId !== id);
        });
        markAllListsStale(state);
      });
  },
});

export const { listsInvalidated } = albumsSlice.actions;
export default albumsSlice.reducer;
