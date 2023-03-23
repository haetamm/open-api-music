exports.up = pgm => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)'
    },
    song_id: {
      type: 'VARCHAR(50)'
    }
  })

  // foreign key column playlist_id
  pgm.sql("UPDATE playlist_songs SET playlist_id = 'old_playlist_song' WHERE playlist_id IS NULL")

  pgm.addConstraint('playlist_songs', 'fk_playlist_song.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  // foregn key colom song_id
  pgm.sql("UPDATE playlist_songs SET song_id = 'old_playlist_song' WHERE song_id IS NULL")

  pgm.addConstraint('playlist_songs', 'fk_playlist_song.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('playlist_songs')
}
