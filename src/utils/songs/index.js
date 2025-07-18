const mapSongDBToModel = (songData, likes = []) => ({
  id: songData.id,
  title: songData.title,
  year: songData.year,
  performer: songData.performer,
  genre: songData.genre,
  duration: songData.duration,
  coverUrl: songData.cover_url,
  uploader: songData.uploader_name,
  likes,
  album: songData.album_id
    ? {
        id: songData.album_id,
        title: songData.album_title,
        year: songData.album_year,
        coverUrl: songData.album_cover,
        uploader: songData.album_uploader_name
      }
    : null
})

const mapDBToModelSong = ({
  id,
  title,
  performer,
  duration,
  cover_url
}) => ({
  id,
  title,
  performer,
  duration,
  coverUrl: cover_url
})

const mapDBToModelSongSearch = ({
  id,
  title,
  performer,
  duration,
  cover_url,
  likes_count
}) => ({
  id,
  title,
  performer,
  duration,
  coverUrl: cover_url,
  likesCount: likes_count
})

module.exports = { mapSongDBToModel, mapDBToModelSong, mapDBToModelSongSearch }
