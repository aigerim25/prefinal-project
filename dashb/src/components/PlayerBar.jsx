import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { usePlayer } from "../hooks/usePlayer";
import { useFavorites } from "../hooks/useFavorites";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    error,
    isGuest,
    previewEnded,
    previewSeconds,
    hasNext,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    stop,
  } = usePlayer();
  const { isLiked, toggleLiked } = useFavorites();
  const location = useLocation();

  const visible = current !== null;
  useEffect(() => {
    document.body.classList.toggle("has-player", visible);
    return () => document.body.classList.remove("has-player");
  }, [visible]);

  if (!current) return null;

  return (
    <div className="player" role="region" aria-label="Music player">
      {current.cover ? (
        <img className="player__cover" src={current.cover} alt="" />
      ) : (
        <div className="player__cover" aria-hidden="true" />
      )}

      <div className="player__info">
        <strong className="player__title">{current.title}</strong>
        <span className="player__artist">{current.artists}</span>
        {error && (
          <span className="player__error" role="alert">
            {error}
          </span>
        )}
        {!error && isGuest && !previewEnded && (
          <span className="player__note">Preview · {previewSeconds}s</span>
        )}
        {!error && previewEnded && (
          <Link to="/login" state={{ from: location }} className="player__login">
            Log in to listen to the full track
          </Link>
        )}
      </div>

      <div className="player__controls">
        <button type="button" className="player__btn" onClick={prev} aria-label="Previous track">
          ⏮
        </button>
        <button
          type="button"
          className="player__btn player__btn--play"
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className="player__btn"
          onClick={next}
          disabled={!hasNext}
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div className="player__progress">
        <span className="player__time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={!duration}
          aria-label="Seek"
        />
        <span className="player__time">{formatTime(duration)}</span>
      </div>

      <label className="player__volume">
        <span aria-hidden="true">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </label>

      {/* Сердечко прямо в проигрывателе (если песня из альбома) */}
      {current.albumId != null && (
        <button
          type="button"
          className={isLiked(current.id) ? "player__btn player__like liked" : "player__btn player__like"}
          onClick={() => toggleLiked(current)}
          aria-label={isLiked(current.id) ? "Remove from liked songs" : "Add to liked songs"}
          aria-pressed={isLiked(current.id)}
        >
          {isLiked(current.id) ? "♥" : "♡"}
        </button>
      )}

      <button type="button" className="player__btn player__close" onClick={stop} aria-label="Close player">
        ✕
      </button>
    </div>
  );
}

export default PlayerBar;
