import { createSlice } from "@reduxjs/toolkit";
import { readLikedSongs } from "./favoritesStorage.js";

const initialState = {
  uid: null,
  items: [],
};

function toLikedItem(song) {
  return {
    id: song.id, 
    songId: song.songId ?? song.id,
    albumId: song.albumId,
    title: song.title,
    duration: song.duration,
    artist: song.artist,
    albumTitle: song.albumTitle,
    artists: song.artists,
    cover: song.cover,
    audioUrl: song.audioUrl,
  };
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    favoritesLoaded(state, action) {
      state.uid = action.payload.uid;
      state.items = action.payload.items;
    },

    songLiked: {
      reducer(state, action) {
        if (!state.uid) return; 
        const exists = state.items.some((item) => item.id === action.payload.id);
        if (!exists) state.items.unshift(action.payload);
      },
      prepare(song) {
        return { payload: { ...toLikedItem(song), likedAt: Date.now() } };
      },
    },

    songUnliked(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { favoritesLoaded, songLiked, songUnliked } = favoritesSlice.actions;

export function loadFavoritesForUser(uid) {
  return (dispatch, getState) => {
    if (getState().favorites.uid === uid) return; 
    dispatch(favoritesLoaded({ uid, items: readLikedSongs(uid) }));
  };
}

export default favoritesSlice.reducer;
