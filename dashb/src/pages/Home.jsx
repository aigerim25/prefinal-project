import { Link } from "react-router";
import { usePlaylists } from "../hooks/useAlbum.js";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";

const ALL_ALBUMS_QUERY = "limit=100&sort=name";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { user } = useAuth();
  const { albums, loading, error, refetch } = usePlaylists(ALL_ALBUMS_QUERY);
  const player = usePlayer();

  const name = user?.displayName || user?.email?.split("@")[0];

  function playAlbum(album) {
    if (!album.songs?.length) return;
    if (player.current?.albumId === album.id) {
      player.toggle();
      return;
    }
    const tracks = album.songs.map((song) => ({
      ...song,
      id: `${album.id}-${song.id}`,
      songId: song.id,
      albumId: album.id, 
      artist: song.artist || album.artists,
      albumTitle: album.title,
      artists: album.artists,
      cover: album.cover,
    }));
    player.playQueue(album.songs, 0, {
      title: album.title,
      artists: album.artists,
      cover: album.cover,
    });
  }

  return (
    <section className="home">
      <header className="home__hero">
        <h1 className="home__title">
          {greeting()}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="home__subtitle">Pick an album and press play.</p>
      </header>

      <div className="home__section-head">
        <h2>All albums</h2>
        <Link to="/albums" className="home__see-all">
          See all
        </Link>
      </div>

      {loading && (
        <div className="album-grid" aria-busy="true" aria-label="Loading albums">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="album-tile album-tile--skeleton" />
          ))}
        </div>
      )}

      {error && (
        <div className="home__state">
          <p>Couldn't load albums: {error}</p>
          <button type="button" className="home__retry" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && albums.length === 0 && (
        <p className="home__state">No albums yet.</p>
      )}

      {!loading && !error && albums.length > 0 && (
        <div className="album-grid">
          {albums.map((album) => {
            const isPlaying =
              player.isPlaying && player.current?.albumTitle === album.title;

            return (
              <article key={album.id} className="album-tile">
                <div className="album-tile__cover">
                  <Link to={`/albums/${album.id}`} className="album-tile__cover-link" tabIndex={-1} aria-hidden="true">
                    {album.cover ? (
                      <img src={album.cover} alt="" loading="lazy" />
                    ) : (
                      <span className="album-tile__placeholder">♪</span>
                    )}
                  </Link>

                  <button
                    type="button"
                    className={isPlaying ? "album-tile__play visible" : "album-tile__play"}
                    onClick={() => playAlbum(album)}
                    disabled={!album.songs?.length}
                    aria-label={isPlaying ? `Pause ${album.title}` : `Play ${album.title}`}
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                </div>

                <Link to={`/albums/${album.id}`} className="album-tile__link">
                  <h3 className="album-tile__title">{album.title}</h3>
                  <p className="album-tile__artists">{album.artists}</p>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Home;