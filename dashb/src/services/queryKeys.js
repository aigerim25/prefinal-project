export const playlistKeys = {
  all: ["playlists"],
  lists: () => [...playlistKeys.all, "list"],
  list: (query) => [...playlistKeys.lists(), query],
  details: () => [...playlistKeys.all, "detail"],
  detail: (id) => [...playlistKeys.details(), Number(id)],
};

export function normalizeQuery(query = "") {
  const params = new URLSearchParams(query);
  params.sort();
  return params.toString();
}