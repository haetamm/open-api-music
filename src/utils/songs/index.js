const mapSongDBToModel = (songData, likes = [], album = null) => ({
  id: songData.id,
  title: songData.title,
  year: songData.year,
  performer: songData.performer,
  genre: songData.genre,
  duration: songData.duration,
  coverUrl: songData.cover_url,
  uploader: songData.uploader_name,
  userId: songData.uploader,
  likes,
  album: album
    ? {
        id: album.album_id,
        title: album.album_title,
        year: album.album_year,
        artist: album.album_artist,
        coverUrl: album.album_cover,
        uploader: album.album_uploader_name
      }
    : null
})

const mapDBToModelSong = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  cover_url,
  uploader
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  coverUrl: cover_url,
  userId: uploader
})

const mapDBToModelSongSearch = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  cover_url,
  uploader,
  likes_count
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  coverUrl: cover_url,
  userId: uploader,
  likesCount: likes_count
})

module.exports = { mapSongDBToModel, mapDBToModelSong, mapDBToModelSongSearch }
