import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { songLiked, songUnliked } from "./favoritesSlice.js";
import { writeLikedSongs } from "./favoritesStorage.js";

export const favoritesListener = createListenerMiddleware();

favoritesListener.startListening({
  matcher: isAnyOf(songLiked, songUnliked),
  effect: (action, listenerApi) => {
    const { uid, items } = listenerApi.getState().favorites;
    writeLikedSongs(uid, items);
  },
});
