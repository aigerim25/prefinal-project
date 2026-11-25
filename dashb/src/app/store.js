import { configureStore } from "@reduxjs/toolkit";
import albumsReducer from "../features/albums/albumsSlice.js";
import albumDetailsReducer from "../features/albumDetails/albumDetailsSlice.js";
import favoritesReducer from "../features/favorites/favoritesSlice.js";
import { favoritesListener } from "../features/favorites/favoritesListener.js";

export const store = configureStore({
  reducer: {
    albums: albumsReducer,
    albumDetails: albumDetailsReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(favoritesListener.middleware),
});
