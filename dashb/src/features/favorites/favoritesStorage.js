function storageKey(uid) {
  return `liked-songs:${uid}`;
}

export function readLikedSongs(uid) {
  if (!uid) return [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(uid)) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function writeLikedSongs(uid, items) {
  if (!uid) return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(items));
  } catch {
  }
}