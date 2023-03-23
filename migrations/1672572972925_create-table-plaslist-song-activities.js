exports.up = pgm => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)'
    },
    song_id: { type: 'VARCHAR(50)' },
    user_id: { type: 'VARCHAR(50)' },
    action: { type: 'VARCHAR(50)' },
    time: { type: 'VARCHAR(50)' }
  })
  // foreign key column playlist_id
  pgm.sql("UPDATE playlist_song_activities SET playlist_id = 'old_activities' WHERE playlist_id IS NULL")

  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('playlist_song_activities')
}
