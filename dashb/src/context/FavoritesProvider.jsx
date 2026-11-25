import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { FavoritesContext } from "./FavoritesContext";

function storageKey(uid) {
  return `liked-songs:${uid}`;
}

function readLiked(key) {
  if (!key) return [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

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
    likedAt: Date.now(),
  };
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const key = user ? storageKey(user.uid) : null;
  const [state, setState] = useState(() => ({ key, items: readLiked(key) }));

  if (state.key !== key) {
    setState({ key, items: readLiked(key) });
  }

  const likedSongs = state.items;

  function save(items) {
    setState({ key, items });
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
    }
  }

  function isLiked(id) {
    return likedSongs.some((item) => item.id === id);
  }

  function addToLikedSongs(song) {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (isLiked(song.id)) return;
    save([toLikedItem(song), ...likedSongs]);
  }

  function removeFromLikedSongs(song) {
    if (!user) return;
    save(likedSongs.filter((item) => item.id !== song.id));
  }

  function toggleLiked(song) {
    if (isLiked(song.id)) removeFromLikedSongs(song);
    else addToLikedSongs(song);
  }

  const value = {
    likedSongs,
    isLiked,
    addToLikedSongs,
    removeFromLikedSongs,
    toggleLiked,
  };

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}
