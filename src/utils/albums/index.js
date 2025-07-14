const mapDBToModel = ({
  id,
  title,
  artist,
  year,
  cover_url,
  song_count,
  total_duration
}) => ({
  id,
  title,
  artist,
  year,
  coverUrl: cover_url,
  songCount: song_count,
  totalDuration: total_duration
})

const mapAlbumToModel = ({
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

module.exports = { mapDBToModel, mapAlbumToModel }
