import { createSelector } from "@reduxjs/toolkit";

export const selectAlbumsById = (state) => state.albums.byId;
export const selectAlbumLists = (state) => state.albums.lists;
export const selectListByQuery = (state, query) => state.albums.lists[query];
export const selectAlbumById = (state, id) => state.albums.byId[id];
export const selectShowingCachedData = (state) => state.albums.showingCachedData;


const EMPTY = [];
export const selectAlbumsByQuery = createSelector(
  [(state, query) => state.albums.lists[query]?.ids, selectAlbumsById],
  (ids, byId) => (ids ? ids.map((id) => byId[id]).filter(Boolean) : EMPTY),
);
