const mapDBToModel = ({
  id,
  name,
  username
}) => ({
  id,
  name,
  username
})

const mapDbActivitiesToModel = ({
  username,
  title,
  action,
  time
}) => ({
  username,
  title,
  action,
  time

})

module.exports = { mapDBToModel, mapDbActivitiesToModel }
