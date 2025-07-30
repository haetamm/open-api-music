const mapDBToModel = ({
  id,
  title,
  fullname,
  user_id,
  song_count,
  total_duration
}) => ({
  id,
  title,
  owner: fullname,
  userId: user_id,
  songCount: song_count,
  totalDuration: total_duration
})

const mapDbActivitiesToModel = ({
  title,
  action,
  time,
  fullname
}) => ({
  title,
  action,
  time,
  fullname

})

module.exports = { mapDBToModel, mapDbActivitiesToModel }
