import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlbums, normalizeQuery } from "../features/albums/albumsThunks.js";
import { fetchAlbumById } from "../features/albumDetails/albumDetailsThunks.js";
import {
  selectAlbumById,
  selectAlbumLists,
  selectAlbumsById,
} from "../features/albums/albumsSelectors.js";
import { selectAlbumDetailsStatus } from "../features/albumDetails/albumDetailsSelectors.js";


export function usePlaylists(query = "") {
  const dispatch = useDispatch();
  const normalized = normalizeQuery(query);

  const lists = useSelector(selectAlbumLists);
  const byId = useSelector(selectAlbumsById);

  const list = lists[normalized];
  const needsRefresh = Boolean(list?.stale) && list?.status !== "loading";
  useEffect(() => {
    dispatch(fetchAlbums({ query: normalized }));
  }, [dispatch, normalized, needsRefresh]);
  const hasData = (list?.fetchedAt ?? 0) > 0;
  const [shownQuery, setShownQuery] = useState(normalized);
  if (hasData && shownQuery !== normalized) {
    setShownQuery(normalized);
  }
  const shown = hasData ? list : lists[shownQuery];

  const shownIds = shown?.ids;
  const albums = useMemo(
    () => (shownIds ?? []).map((id) => byId[id]).filter(Boolean),
    [shownIds, byId],
  );
  const refetch = useCallback(
    () => dispatch(fetchAlbums({ query: normalized, force: true })),
    [dispatch, normalized],
  );

  const failed = list?.status === "failed";

  return {
    albums,
    total: shown?.total ?? 0,
    totalPages: shown?.totalPages ?? 0,
    loading: !shown?.fetchedAt && !failed, 
    error: failed ? list.error : null, 
    fetching: list?.status === "loading", 
    refetch,
  };
}


export function usePlaylist(id) {
  const dispatch = useDispatch();
  const albumId = id == null ? null : Number(id);

  const album = useSelector((state) => selectAlbumById(state, albumId));
  const details = useSelector((state) => selectAlbumDetailsStatus(state, albumId));

  useEffect(() => {
    if (albumId == null) return;
    dispatch(fetchAlbumById({ id: albumId }));
  }, [dispatch, albumId]);

  const refetch = useCallback(
    () => dispatch(fetchAlbumById({ id: albumId, force: true })),
    [dispatch, albumId],
  );

  const failed = details?.status === "failed";

  return {
    album: album ?? null,
    loading: !album && !failed, 
    error: failed ? details.error : null,
    notFound: failed && details.notFound,
    fromCache: details?.fromCache ?? false,
    refetch,
  };
}
