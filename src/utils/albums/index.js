const mapDBToModel = ({
  id,
  name,
  year,
  // eslint-disable-next-line camelcase
  cover_url
}) => ({
  id,
  name,
  year,
  // eslint-disable-next-line camelcase
  coverUrl: cover_url
})

const mapSongToModel = ({
  id,
  title,
  performer
}) => ({
  id,
  title,
  performer
})

module.exports = { mapDBToModel, mapSongToModel }
