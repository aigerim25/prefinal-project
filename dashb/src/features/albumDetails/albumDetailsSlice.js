import { createSlice } from "@reduxjs/toolkit";
import { fetchAlbumById } from "./albumDetailsThunks.js";
import { createAlbum, updateAlbum, deleteAlbum } from "../albums/albumsMutations.js";
import { dataInvalidated } from "../../app/actions.js";
const initialState = {
  byId: {},
  invalidatedAt: 0,
};

function createEmptyEntry() {
  return {
    status: "idle", 
    error: null,
    notFound: false,
    isNetworkError: false,
    fromCache: false,
    requestId: null,
    fetchedAt: 0,
  };
}

const albumDetailsSlice = createSlice({
  name: "albumDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlbumById.pending, (state, action) => {
        const { id } = action.meta.arg;
        if (!state.byId[id]) state.byId[id] = createEmptyEntry();

        const entry = state.byId[id];
        entry.status = "loading";
        entry.error = null;
        entry.notFound = false;
        entry.isNetworkError = false;
        entry.requestId = action.meta.requestId;
      })
      .addCase(fetchAlbumById.fulfilled, (state, action) => {
        const entry = state.byId[action.meta.arg.id];
        if (!entry) return;

        entry.status = "succeeded";
        entry.fromCache = action.payload.fromCache;
        entry.fetchedAt = action.payload.fetchedAt;
        entry.requestId = null;
      })
      .addCase(fetchAlbumById.rejected, (state, action) => {
    
        if (action.payload?.isStale) return;

        const entry = state.byId[action.meta.arg.id];
       if (!entry || entry.requestId !== action.meta.requestId) return;

        entry.status = "failed";
        entry.error = action.payload?.message ?? action.error.message;
        entry.notFound = action.payload?.notFound ?? false;
        entry.isNetworkError = action.payload?.isNetworkError ?? false;
        entry.requestId = null;
      })
      .addCase(createAlbum.fulfilled, (state, action) => {
        state.byId[action.payload.id] = { ...createEmptyEntry(), status: "succeeded" };
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        const entry = state.byId[action.payload.id];
        if (!entry) return;
        entry.status = "succeeded";
        entry.error = null;
        entry.notFound = false;
        entry.requestId = null;
      })
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        delete state.byId[action.payload.id];
      })
      .addCase(dataInvalidated, (state, action) => {
        state.invalidatedAt = action.payload.at;
        Object.values(state.byId).forEach((entry) => {
          if (entry.status === "loading") {
            entry.status = "idle";
            entry.requestId = null;
          }
        });
      });
  },
});

export default albumDetailsSlice.reducer;
