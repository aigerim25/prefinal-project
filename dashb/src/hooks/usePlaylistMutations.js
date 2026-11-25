import { useThunkMutation } from "./useThunkMutation.js";
import { createAlbum, updateAlbum, deleteAlbum } from "../features/albums/albumsMutations.js";

export function useCreatePlaylist() {
  return useThunkMutation(createAlbum);
}

export function useUpdatePlaylist() {
  return useThunkMutation(updateAlbum);
}

export function useDeletePlaylist() {
  return useThunkMutation(deleteAlbum);
}

export function useToggleFavoriteSong() {
  const update = useUpdatePlaylist();

  function toggle(album, songId) {
    const songs = album.songs.map((song) =>
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song,
    );
    update.mutate({ id: album.id, changes: { songs } });
  }

  return { toggle, isPending: update.isPending, error: update.error };
}
