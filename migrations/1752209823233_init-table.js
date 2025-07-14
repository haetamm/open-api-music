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
    title: { type: 'VARCHAR(100)', notNull: true },
    artist: { type: 'VARCHAR(100)', notNull: true },
    year: { type: 'SMALLINT', notNull: true },
    cover_url: { type: 'TEXT' },
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
    cover_url: { type: 'TEXT' },
    uploader: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('songs', 'fk_songs.uploader_users.id', 'FOREIGN KEY(uploader) REFERENCES users(id) ON DELETE CASCADE')

  pgm.addConstraint('albums', 'fk_albums.uploader_users.id', 'FOREIGN KEY(uploader) REFERENCES users(id) ON DELETE CASCADE')

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')

  // === PLAYLISTS ===
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'VARCHAR(50)', notNull: true },
    owner: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')

  // === PLAYLIST SONGS ===
  pgm.createTable('playlist_songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    song_id: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('playlist_songs', 'fk_playlist_song.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  pgm.addConstraint('playlist_songs', 'fk_playlist_song.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')

  // === COLLABORATIONS ===
  pgm.createTable('collaborations', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

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

  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  // === USER SONG LIKES ===
  pgm.createTable('user_song_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    song_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('user_song_likes', 'fk_user_song_likes.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')

  pgm.addConstraint('user_song_likes', 'fk_user_song_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')

  // === USER PLAYLIST LIKES ===
  pgm.createTable('user_playlist_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' }
  })

  pgm.addConstraint('user_playlist_likes', 'fk_user_playlist_likes.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('user_playlist_likes', 'fk_user_playlist_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('user_playlist_likes')
  pgm.dropTable('user_song_likes')
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
