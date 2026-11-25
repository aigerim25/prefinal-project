import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { fetchAlbums } from "../features/albums/albumsThunks.js";
import { fetchAlbumById } from "../features/albumDetails/albumDetailsThunks.js";
import { OFFLINE_ERROR_EVENT } from "../services/offlineEvents.js";

export const offlineListener = createListenerMiddleware();

offlineListener.startListening({
  matcher: isAnyOf(fetchAlbums.rejected, fetchAlbumById.rejected),
  effect: (action, listenerApi) => {
    if (!action.payload?.isNetworkError) return;

    const state = listenerApi.getState();
    const hasData = fetchAlbums.rejected.match(action)
      ? (state.albums.lists[action.meta.arg.query]?.fetchedAt ?? 0) > 0
      : Boolean(state.albums.byId[action.meta.arg.id]);

    if (!hasData) {
      window.dispatchEvent(new CustomEvent(OFFLINE_ERROR_EVENT));
    }
  },
});
