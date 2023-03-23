exports.up = pgm => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)'
    },
    user_id: {
      type: 'VARCHAR(50)'
    }
  })

  // foreign key column playlist_id
  pgm.sql("UPDATE collaborations SET playlist_id = 'old_collaborations' WHERE playlist_id IS NULL")

  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  // foregn key colom user_id
  pgm.sql("UPDATE collaborations SET user_id = 'old_collaborations' WHERE user_id IS NULL")

  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('collaborations')
}
