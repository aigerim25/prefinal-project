import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "./useAuth";
import {
  loadFavoritesForUser,
  songLiked,
  songUnliked,
} from "../features/favorites/favoritesSlice.js";
import { selectLikedSongs } from "../features/favorites/favoritesSelectors.js";

export function useSyncFavoritesWithUser() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    dispatch(loadFavoritesForUser(uid));
  }, [dispatch, uid]);
}

export function useFavorites() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const likedSongs = useSelector(selectLikedSongs);

  const isLiked = useCallback(
    (id) => likedSongs.some((item) => item.id === id),
    [likedSongs],
  );

  const addToLikedSongs = useCallback(
    (song) => {
      if (!user) {
        navigate("/login", { state: { from: location } });
        return;
      }
      dispatch(songLiked(song));
    },
    [dispatch, user, navigate, location],
  );

  const removeFromLikedSongs = useCallback(
    (song) => {
      if (!user) return;
      dispatch(songUnliked(song.id));
    },
    [dispatch, user],
  );

  const toggleLiked = useCallback(
    (song) => {
      if (isLiked(song.id)) removeFromLikedSongs(song);
      else addToLikedSongs(song);
    },
    [isLiked, addToLikedSongs, removeFromLikedSongs],
  );

  return { likedSongs, isLiked, addToLikedSongs, removeFromLikedSongs, toggleLiked };
}
