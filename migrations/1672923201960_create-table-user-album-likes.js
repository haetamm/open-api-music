exports.up = pgm => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    album_id: {
      type: 'VARCHAR(50)'
    },
    user_id: {
      type: 'VARCHAR(50)'
    }
  })

  // foreign key column album_id
  pgm.sql("UPDATE user_album_likes SET album_id = 'old_album_id' WHERE album_id IS NULL")

  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')

  // foregn key colom user_id
  pgm.sql("UPDATE user_album_likes SET user_id = 'old_album_id' WHERE user_id IS NULL")

  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('user_album_likes')
}
