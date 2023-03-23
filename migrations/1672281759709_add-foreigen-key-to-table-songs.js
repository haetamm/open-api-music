exports.up = pgm => {
  // membuat album baru.
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_albums', 'old_albums', 2022)")

  // mengubah nilai owner pada note yang owner-nya bernilai NULL
  pgm.sql("UPDATE songs SET album_id = 'old_notes' WHERE album_id IS NULL")

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
}

exports.down = pgm => {
// menghapus constraint fk_notes.owner_users.id pada tabel notes
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id')
}
