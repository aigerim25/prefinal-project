import SongRow from './SongRow'
import { usePlayer } from '../hooks/usePlayer'
 
function AlbumDetails({albumId, title, artists, cover, songs, onClose, addToLikedSongs, likedSongs, removeFromLikedSongs, genre, year, tagline}) {
    const player = usePlayer()
    const tracks = songs.map((song) => ({
        ...song, 
        id: `${albumId}-${song.id}`,
        songId: song.id,
        albumId,
        artist: song.artist || artists, 
        albumTitle: title, 
        artists, 
        cover,
    }))
    const isThisAlbum = player.current?.albumTitle === title
 
    function playFrom(index) {
        player.playQueue(songs, index, { title, artists, cover })
    }
 
    function handlePlayAlbum() {
        if (isThisAlbum) player.toggle()
        else playFrom(0)
    }
 
    return (
        <section className="album-details">
            <div className="album-details-with-photo">
                <img src={cover} alt={`${title} cover`} className="img"/>
                <div className="album-info">
                <h3>{title}</h3>
                <p>{artists}</p>
                <span className="genre-year">{genre} • {year}</span>
                <p className="tagline">{tagline}</p>
                <button
                    type="button"
                    className="play-album-button"
                    onClick={handlePlayAlbum}
                    disabled={songs.length === 0}
                >
                    {isThisAlbum && player.isPlaying ? '❚❚ Pause' : '▶ Play'}
                </button>
                </div>
            </div>
            <div className="subtitles">
                <span></span>
                <p>Song</p>
                <p>Artists</p>
                <p>Album</p>
                <p>Time</p>
                <span></span>
            </div>
            <div className="song-list">
                {songs.map((song, index) => {
                    const isCurrent = isThisAlbum && player.current?.id === song.id
                    return (
                        <div
                            key={song.id}
                            className={isCurrent ? 'song-item song-item--current' : 'song-item'}
                            onDoubleClick={() => playFrom(index)}
                            title="Double-click to play"
                        >
                            <SongRow
                            index={index}
                            title={song.title}
                            albumTitle={title}
                            albumArtists={artists}
                            duration={song.duration}
                            addToLikedSongs={addToLikedSongs}
                            song={song}
                            likedSongs={likedSongs}
                            removeFromLikedSongs={removeFromLikedSongs}
                            />
                        </div>
                    )
                })}
            </div>
            <button className="close-button" onClick={onClose}>Back</button>
        </section>
    )
}
export default AlbumDetails;
 