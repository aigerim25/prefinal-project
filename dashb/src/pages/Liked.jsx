import { Link } from "react-router";
import { useFavorites } from "../hooks/useFavorites";
import { usePlaylists } from "../hooks/useAlbum.js";
import { usePlayer } from "../hooks/usePlayer";
import { HeartIcon } from "../components/icons.jsx";

function toSeconds(duration) {
  if (typeof duration !== "string" || !duration.includes(":")) return 0;
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + s;
}

function formatTotal(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function Liked() {
  const { likedSongs: savedSongs, removeFromLikedSongs } = useFavorites();
  const player = usePlayer();
  const { albums } = usePlaylists("limit=100&sort=name");
  const likedSongs = savedSongs.map((item) => {
    const album = albums.find((a) => a.id === item.albumId);
    const song = album?.songs.find((s) => s.id === item.songId);
    return song ? { ...item, audioUrl: song.audioUrl ?? item.audioUrl } : item;
  });

  const PLAYLIST = { title: "Liked songs", artists: "", cover: "" };
  const isThisPlaylist =
    player.queue.length > 0 &&
    player.queue.length === likedSongs.length &&
    player.queue.every((t, i) => t.id === likedSongs[i]?.id);

  function playFrom(index) {
    player.playQueue(likedSongs, index, PLAYLIST);
  }

  function handlePlayAll() {
    if (isThisPlaylist) player.toggle();
    else playFrom(0);
  }

  const total = likedSongs.reduce((sum, s) => sum + toSeconds(s.duration), 0);

  return (
    <section className="liked">
      <header className="liked__hero">
        <div className="liked__badge" aria-hidden="true">
          <HeartIcon size={44} />
        </div>
        <div className="liked__meta">
          <p className="liked__kicker">Playlist</p>
          <h1 className="liked__title">Liked songs</h1>
          <p className="liked__count">
            {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"}
            {total > 0 && ` · ${formatTotal(total)}`}
          </p>
          {likedSongs.length > 0 && (
            <button type="button" className="liked__play-all" onClick={handlePlayAll}>
              {isThisPlaylist && player.isPlaying ? "❚❚ Pause" : "▶ Play all"}
            </button>
          )}
        </div>
      </header>

      {likedSongs.length === 0 ? (
        <div className="liked__empty">
          <p>No liked songs yet.</p>
          <p>
            Open any album and tap <strong>♡</strong> next to a song.
          </p>
          <Link to="/albums" className="liked__browse">
            Browse albums
          </Link>
        </div>
      ) : (
        <ol className="liked__list">
          {likedSongs.map((song, index) => {
            const isCurrent = player.current?.id === song.id;
            return (
              <li key={song.id} className={isCurrent ? "liked-row current" : "liked-row"}>
                <button
                  type="button"
                  className="liked-row__play"
                  onClick={() => (isCurrent ? player.toggle() : playFrom(index))}
                  aria-label={isCurrent && player.isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                >
                  <span className="liked-row__num">{index + 1}</span>
                  <span className="liked-row__icon">
                    {isCurrent && player.isPlaying ? "❚❚" : "▶"}
                  </span>
                </button>

                {song.cover ? (
                  <img className="liked-row__cover" src={song.cover} alt="" loading="lazy" />
                ) : (
                  <span className="liked-row__cover" aria-hidden="true" />
                )}

                <div className="liked-row__info">
                  <span className="liked-row__title">{song.title}</span>
                  <span className="liked-row__artist">{song.artist || song.artists}</span>
                </div>

                <Link to={`/albums/${song.albumId}`} className="liked-row__album">
                  {song.albumTitle}
                </Link>

                <span className="liked-row__time">{song.duration}</span>

                <button
                  type="button"
                  className="liked-row__heart"
                  onClick={() => removeFromLikedSongs(song)}
                  aria-label={`Remove ${song.title} from liked songs`}
                  title="Remove from liked songs"
                >
                  ♥
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default Liked;
