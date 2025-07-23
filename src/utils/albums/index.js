const mapDBToModel = ({
  id,
  title,
  artist,
  year,
  cover_url,
  uploader,
  song_count,
  total_duration
}) => ({
  id,
  title,
  artist,
  year,
  userId: uploader,
  coverUrl: cover_url,
  songCount: song_count,
  totalDuration: total_duration
})

const mapAlbum = ({
  id,
  title,
  artist,
  year,
  cover_url,
  uploader
}) => ({
  id,
  title,
  artist,
  year,
  userId: uploader,
  coverUrl: cover_url
})

const mapAlbumToModel = ({
  id,
  title,
  performer,
  duration,
  cover_url,
  uploader
}) => ({
  id,
  title,
  performer,
  duration,
  coverUrl: cover_url,
  userId: uploader
})

module.exports = { mapDBToModel, mapAlbum, mapAlbumToModel }
