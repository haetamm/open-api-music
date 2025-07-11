exports.up = pgm => {
  // === AUTHENTICATION ===
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true
    }
  })

  // === USERS ===
  pgm.createTable('users', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    email: { type: 'VARCHAR(50)', unique: true, notNull: true },
    password: { type: 'TEXT', notNull: true },
    fullname: { type: 'TEXT', notNull: true }
  })

  // === ALBUMS ===
  pgm.createTable('albums', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(100)', notNull: true },
    year: { type: 'SMALLINT', notNull: true },
    cover_url: { type: 'VARCHAR(300)' },
    uploader: { type: 'VARCHAR(50)' }
  })

  // === SONGS ===
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'VARCHAR(100)', notNull: true },
    year: { type: 'SMALLINT', notNull: true },
    performer: { type: 'VARCHAR(50)', notNull: true },
    genre: { type: 'VARCHAR(50)', notNull: true },
    duration: { type: 'SMALLINT' },
    album_id: { type: 'VARCHAR(50)' },
    uploader: { type: 'VARCHAR(50)' }
  })

  pgm.sql("INSERT INTO users(id, email, password, fullname) VALUES ('old_song_uploader', 'song@uploader.com', 'secret', 'Old Song uploader') ON CONFLICT (id) DO NOTHING")
  pgm.sql("UPDATE songs SET uploader = 'old_song_uploader' WHERE uploader IS NULL")
  pgm.addConstraint('songs', 'fk_songs.uploader_users.id', 'FOREIGN KEY(uploader) REFERENCES users(id) ON DELETE CASCADE')

  pgm.sql("INSERT INTO users(id, email, password, fullname) VALUES ('old_song_uploader', 'song@uploader.com', 'secret', 'Old Song uploader') ON CONFLICT (id) DO NOTHING")
  pgm.sql("UPDATE albums SET uploader = 'old_album_uploader' WHERE uploader IS NULL")
  pgm.addConstraint('albums', 'fk_albums.uploader_users.id', 'FOREIGN KEY(uploader) REFERENCES users(id) ON DELETE CASCADE')

  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_albums', 'old_albums', 2022)")
  pgm.sql("UPDATE songs SET album_id = 'old_notes' WHERE album_id IS NULL")
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')

  // === PLAYLISTS ===
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(50)', notNull: true },
    owner: { type: 'VARCHAR(50)' }
  })

  pgm.sql("INSERT INTO users(id, email, password, fullname) VALUES ('old_playlists', 'old_playlists', 'old_playlists', 'old_playlists')")
  pgm.sql("UPDATE playlists SET owner = 'old_playlists' WHERE owner IS NULL")
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')

  // === PLAYLIST SONGS ===
  pgm.createTable('playlist_songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    song_id: { type: 'VARCHAR(50)' }
  })

  pgm.sql("UPDATE playlist_songs SET playlist_id = 'old_playlist_song' WHERE playlist_id IS NULL")
  pgm.addConstraint('playlist_songs', 'fk_playlist_song.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  pgm.sql("UPDATE playlist_songs SET song_id = 'old_playlist_song' WHERE song_id IS NULL")
  pgm.addConstraint('playlist_songs', 'fk_playlist_song.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')

  // === COLLABORATIONS ===
  pgm.createTable('collaborations', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' }
  })

  pgm.sql("UPDATE collaborations SET playlist_id = 'old_collaborations' WHERE playlist_id IS NULL")
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  pgm.sql("UPDATE collaborations SET user_id = 'old_collaborations' WHERE user_id IS NULL")
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')

  // === PLAYLIST SONG ACTIVITIES ===
  pgm.createTable('playlist_song_activities', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    song_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' },
    action: { type: 'VARCHAR(50)' },
    time: { type: 'VARCHAR(50)' }
  })

  pgm.sql("UPDATE playlist_song_activities SET playlist_id = 'old_activities' WHERE playlist_id IS NULL")
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  // === USER ALBUM LIKES ===
  pgm.createTable('user_album_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    album_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' }
  })

  pgm.sql("UPDATE user_album_likes SET album_id = 'old_album_id' WHERE album_id IS NULL")
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')

  pgm.sql("UPDATE user_album_likes SET user_id = 'old_album_id' WHERE user_id IS NULL")
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('user_album_likes')
  pgm.dropTable('playlist_song_activities')
  pgm.dropTable('collaborations')
  pgm.dropTable('playlist_songs')
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id')
  pgm.dropTable('playlists')
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id')
  pgm.dropTable('songs')
  pgm.dropTable('albums')
  pgm.dropTable('users')
  pgm.dropTable('authentications')
}
