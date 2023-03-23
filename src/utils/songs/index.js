const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId
})

const mapDBToModelSong = ({
  id,
  title,
  performer
}) => ({
  id,
  title,
  performer
})

module.exports = { mapDBToModel, mapDBToModelSong }
