const mapDBToModel = ({
  id,
  fullname
}) => ({
  userId: id,
  fullname
})

module.exports = { mapDBToModel }
