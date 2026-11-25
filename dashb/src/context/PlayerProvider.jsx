import { useEffect, useRef, useState } from "react";
import { PlayerContext } from "./PlayerContext";
import { useAuth } from "../hooks/useAuth";

const DEMO_TRACKS_COUNT = 3;

export function getAudioUrl(song) {
  if (song.audioUrl) return song.audioUrl;
  const number = Number(song.songId ?? song.id) || 1;
  const n = ((number - 1) % DEMO_TRACKS_COUNT + DEMO_TRACKS_COUNT) % DEMO_TRACKS_COUNT;
  return `/audio/track-${n + 1}.mp3`;
}

const VOLUME_KEY = "player-volume";

export const PREVIEW_SECONDS = 30;

function readSavedVolume() {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    const value = saved === null ? NaN : Number(saved);
    return Number.isFinite(value) ? value : 0.8;
  } catch {
    return 0.8;
  }
}
export function PlayerProvider({ children }) {
  const [audio] = useState(() => new Audio());
  const [queue, setQueue] = useState([]); 
  const [index, setIndex] = useState(-1); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(readSavedVolume);
  const [error, setError] = useState(null);
  const [previewEnded, setPreviewEnded] = useState(false);

  const { user } = useAuth();
  const isGuest = !user;

  const current = queue[index] ?? null;

  const isGuestRef = useRef(isGuest);
  useEffect(() => {
    isGuestRef.current = isGuest;
  });
  const stateRef = useRef({ queue, index });
  useEffect(() => {
    stateRef.current = { queue, index };
  });


  function startTrack(track) {
    setError(null);
    setPreviewEnded(false);
    setCurrentTime(0);
    setDuration(0);
    audio.src = getAudioUrl(track);
    audio.play().catch((err) => {
      if (err.name !== "AbortError") setIsPlaying(false);
    });
  }

  function goTo(newIndex) {
    const { queue: q } = stateRef.current;
    if (newIndex < 0 || newIndex >= q.length) return;
    stateRef.current = { queue: q, index: newIndex };
    setIndex(newIndex);
    startTrack(q[newIndex]);
  }

  function playQueue(songs, startIndex, album) {
    const tracks = songs.map((song) => ({
      ...song,
      albumTitle: song.albumTitle ?? album.title,
      artists: song.artists ?? album.artists,
      cover: song.cover ?? album.cover,
    }));
    stateRef.current = { queue: tracks, index: startIndex };
    setQueue(tracks);
    setIndex(startIndex);
    startTrack(tracks[startIndex]);
  }

  function toggle() {
    if (!current) return;
    if (audio.paused) {
      if (isGuest && audio.currentTime >= PREVIEW_SECONDS) {
        audio.currentTime = 0;
      }
      setPreviewEnded(false);
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }

  function next() {
    goTo(stateRef.current.index + 1);
  }

  function prev() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    goTo(stateRef.current.index - 1);
  }

  function seek(seconds) {
    const target = isGuest ? Math.min(seconds, PREVIEW_SECONDS - 0.5) : seconds;
    audio.currentTime = target;
    setCurrentTime(target);
  }

  function stop() {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    stateRef.current = { queue: [], index: -1 };
    setQueue([]);
    setIndex(-1);
    setError(null);
  }

  const actionsRef = useRef({ next, prev });
  useEffect(() => {
    actionsRef.current = { next, prev };
  });
  useEffect(() => {
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (isGuestRef.current && audio.currentTime >= PREVIEW_SECONDS) {
        audio.pause();
        setPreviewEnded(true);
      }
    };
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      const { queue: q, index: i } = stateRef.current;
      if (i + 1 < q.length) actionsRef.current.next();
      else setIsPlaying(false);
    };
    const onError = () => {
      if (!audio.getAttribute("src")) return;
      setIsPlaying(false);
      setError(
        navigator.onLine
          ? "Couldn't play this track."
          : "This track isn't available offline.",
      );
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, [audio]);

  useEffect(() => {
    audio.volume = volume;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
    }
  }, [audio, volume]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artists,
      album: current.albumTitle,
      artwork: current.cover ? [{ src: current.cover, sizes: "512x512" }] : [],
    });

    navigator.mediaSession.setActionHandler("play", () => audio.play().catch(() => {}));
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => actionsRef.current.prev());
    navigator.mediaSession.setActionHandler("nexttrack", () => actionsRef.current.next());
  }, [audio, current]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const value = {
    current,
    queue,
    index,
    isPlaying,
    currentTime,
    duration,
    volume,
    error,
    isGuest,
    previewEnded,
    previewSeconds: PREVIEW_SECONDS,
    hasNext: index + 1 < queue.length,
    hasPrev: index > 0,
    playQueue,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    stop,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
