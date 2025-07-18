require('dotenv').config()
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')

// Konfigurasi koneksi database dari .env
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

async function seedDatabase () {
  try {
    // Bersihin data lama
    console.log('Cleaning up existing data...')
    await pool.query('DELETE FROM songs')
    await pool.query('DELETE FROM albums')
    await pool.query('DELETE FROM users')

    // Data pengguna
    const users = [
      { email: 'john@gmail.com', password: 'secret', fullname: 'John Mayer' },
      { email: 'jane@gmail.com', password: 'secret', fullname: 'Adele Laurie' },
      { email: 'tami@gmail.com', password: 'secret', fullname: 'Tatang Haetami' }
    ]

    // Insert users
    const userIds = {}
    for (const user of users) {
      const id = `user-${nanoid(16)}`
      const hashedPassword = await bcrypt.hash(user.password, 10)
      const userQuery = {
        text: 'INSERT INTO users(id, email, password, fullname) VALUES($1, $2, $3, $4) RETURNING id',
        values: [id, user.email, hashedPassword, user.fullname]
      }
      const userResult = await pool.query(userQuery)
      if (userResult.rows.length === 0) {
        throw new Error(`Gagal insert user: ${user.email}`)
      }
      userIds[user.email] = userResult.rows[0].id
      console.log(`Inserted user: ${user.email} with ID: ${id}`)
    }

    // Data albums
    const albums = [
      { id: 'album_john_1', title: 'Room for Squares', artist: 'John Mayer', year: 2001, cover_url: 'https://picsum.photos/250/600', uploader: userIds['john@gmail.com'] },
      { id: 'album_john_2', title: 'Continuum', artist: 'John Mayer', year: 2006, cover_url: 'https://picsum.photos/200/600', uploader: userIds['john@gmail.com'] },
      { id: 'album_john_3', title: 'Battle Studies', artist: 'John Mayer', year: 2009, cover_url: 'https://picsum.photos/210/600', uploader: userIds['john@gmail.com'] },
      { id: 'album_adele_1', title: 'Chasing Pavements', artist: 'Adele Laurie', year: 2008, cover_url: 'https://picsum.photos/150/600', uploader: userIds['jane@gmail.com'] },
      { id: 'album_adele_2', title: 'Rolling in the Deep', artist: 'Adele Laurie', year: 2011, cover_url: 'https://picsum.photos/450/600', uploader: userIds['jane@gmail.com'] },
      { id: 'album_adele_3', title: 'Easy on Me', artist: 'Adele Laurie', year: 2021, cover_url: 'https://picsum.photos/100/600', uploader: userIds['jane@gmail.com'] }
    ]

    // Insert albums
    for (const album of albums) {
      const albumQuery = {
        text: 'INSERT INTO albums(id, title, artist, year, cover_url, uploader) VALUES($1, $2, $3, $4, $5, $6)',
        values: [album.id, album.title, album.artist, album.year, album.cover_url, album.uploader]
      }
      await pool.query(albumQuery)
      console.log(`Inserted album: ${album.title} with uploader: ${album.uploader}`)
    }

    // Data songs
    const songs = [
      { id: 'song_john_1', title: 'No Such Thing', year: 2001, performer: 'John Mayer', genre: 'Pop Rock', duration: 208, album_id: 'album_john_1', cover_url: 'https://picsum.photos/100/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_2', title: 'Why Georgia', year: 2001, performer: 'John Mayer', genre: 'Acoustic', duration: 243, album_id: 'album_john_1', cover_url: 'https://picsum.photos/120/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_3', title: 'My Stupid Mouth', year: 2001, performer: 'John Mayer', genre: 'Pop', duration: 223, album_id: 'album_john_1', cover_url: 'https://picsum.photos/130/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_4', title: 'Neon', year: 2001, performer: 'John Mayer', genre: 'Blues', duration: 225, album_id: 'album_john_1', cover_url: 'https://picsum.photos/140/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_5', title: 'City Love', year: 2001, performer: 'John Mayer', genre: 'Soft Rock', duration: 238, album_id: 'album_john_1', cover_url: 'https://picsum.photos/150/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_6', title: 'Waiting on the World to Change', year: 2006, performer: 'John Mayer', genre: 'Soul', duration: 211, album_id: 'album_john_2', cover_url: 'https://picsum.photos/160/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_7', title: 'Belief', year: 2006, performer: 'John Mayer', genre: 'Rock', duration: 255, album_id: 'album_john_2', cover_url: 'https://picsum.photos/160/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_8', title: 'Gravity', year: 2006, performer: 'John Mayer', genre: 'Blues Rock', duration: 244, album_id: 'album_john_2', cover_url: 'https://picsum.photos/170/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_9', title: 'Vultures', year: 2006, performer: 'John Mayer', genre: 'Pop', duration: 213, album_id: 'album_john_2', cover_url: 'https://picsum.photos/180/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_10', title: 'Slow Dancing in a Burning Room', year: 2006, performer: 'John Mayer', genre: 'Rock', duration: 263, album_id: 'album_john_2', cover_url: 'https://picsum.photos/190/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_11', title: 'Heartbreak Warfare', year: 2009, performer: 'John Mayer', genre: 'Pop Rock', duration: 258, album_id: 'album_john_3', cover_url: 'https://picsum.photos/200/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_12', title: 'All We Ever Do Is Say Goodbye', year: 2009, performer: 'John Mayer', genre: 'Soft Rock', duration: 270, album_id: 'album_john_3', cover_url: 'https://picsum.photos/210/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_13', title: 'Half of My Heart', year: 2009, performer: 'John Mayer', genre: 'Pop', duration: 248, album_id: 'album_john_3', cover_url: 'https://picsum.photos/220/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_14', title: 'Who Says', year: 2009, performer: 'John Mayer', genre: 'Folk Rock', duration: 217, album_id: 'album_john_3', cover_url: 'https://picsum.photos/230/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_john_15', title: 'Edge of Desire', year: 2009, performer: 'John Mayer', genre: 'Rock', duration: 292, album_id: 'album_john_3', cover_url: 'https://picsum.photos/240/300', uploader: userIds['john@gmail.com'] },
      { id: 'song_adele_1', title: 'Chasing Pavements', year: 2008, performer: 'Adele', genre: 'Soul', duration: 208, album_id: 'album_adele_1', cover_url: 'https://picsum.photos/250/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_2', title: 'Hometown Glory', year: 2008, performer: 'Adele', genre: 'Pop', duration: 242, album_id: 'album_adele_1', cover_url: 'https://picsum.photos/260/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_3', title: 'Daydreamer', year: 2008, performer: 'Adele', genre: 'Acoustic', duration: 209, album_id: 'album_adele_1', cover_url: 'https://picsum.photos/270/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_4', title: 'Best for Last', year: 2008, performer: 'Adele', genre: 'Jazz', duration: 265, album_id: 'album_adele_1', cover_url: 'https://picsum.photos/280/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_5', title: 'Make You Feel My Love', year: 2008, performer: 'Adele', genre: 'Ballad', duration: 211, album_id: 'album_adele_1', cover_url: 'https://picsum.photos/290/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_6', title: 'Rolling in the Deep', year: 2011, performer: 'Adele', genre: 'Pop Rock', duration: 228, album_id: 'album_adele_2', cover_url: 'https://picsum.photos/300/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_7', title: 'Rumour Has It', year: 2011, performer: 'Adele', genre: 'Soul', duration: 223, album_id: 'album_adele_2', cover_url: 'https://picsum.photos/10/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_8', title: 'Turning Tables', year: 2011, performer: 'Adele', genre: 'Ballad', duration: 251, album_id: 'album_adele_2', cover_url: 'https://picsum.photos/20/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_9', title: 'Set Fire to the Rain', year: 2011, performer: 'Adele', genre: 'Pop', duration: 242, album_id: 'album_adele_2', cover_url: 'https://picsum.photos/30/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_10', title: 'Someone Like You', year: 2011, performer: 'Adele', genre: 'Pop', duration: 285, album_id: 'album_adele_2', cover_url: 'https://picsum.photos/40/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_11', title: 'Hello', year: 2015, performer: 'Adele', genre: 'Soul', duration: 295, album_id: 'album_adele_3', cover_url: 'https://picsum.photos/50/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_12', title: 'Send My Love', year: 2015, performer: 'Adele', genre: 'Pop', duration: 223, album_id: 'album_adele_3', cover_url: 'https://picsum.photos/60/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_13', title: 'I Miss You', year: 2015, performer: 'Adele', genre: 'Ambient', duration: 331, album_id: 'album_adele_3', cover_url: 'https://picsum.photos/70/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_14', title: 'When We Were Young', year: 2015, performer: 'Adele', genre: 'Ballad', duration: 296, album_id: 'album_adele_3', cover_url: 'https://picsum.photos/80/300', uploader: userIds['jane@gmail.com'] },
      { id: 'song_adele_15', title: 'Water Under the Bridge', year: 2015, performer: 'Adele', genre: 'Pop', duration: 240, album_id: 'album_adele_3', cover_url: 'https://picsum.photos/90/300', uploader: userIds['jane@gmail.com'] }
    ]

    // Insert songs
    for (const song of songs) {
      const songQuery = {
        text: 'INSERT INTO songs(id, title, year, performer, genre, duration, album_id, cover_url, uploader) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        values: [song.id, song.title, song.year, song.performer, song.genre, song.duration, song.album_id, song.cover_url, song.uploader]
      }
      await pool.query(songQuery)
      console.log(`Inserted song: ${song.title} with uploader: ${song.uploader}`)
    }

    // Data user_song_likes
    const userSongLikes = [
      { userEmail: 'john@gmail.com', songId: 'song_adele_1' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_2' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_3' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_4' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_5' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_6' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_7' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_8' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_9' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_10' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_11' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_12' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_13' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_14' },
      { userEmail: 'john@gmail.com', songId: 'song_adele_15' },

      { userEmail: 'john@gmail.com', songId: 'song_john_1' },
      { userEmail: 'john@gmail.com', songId: 'song_john_2' },
      { userEmail: 'john@gmail.com', songId: 'song_john_3' },

      { userEmail: 'jane@gmail.com', songId: 'song_john_1' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_2' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_3' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_4' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_5' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_6' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_7' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_8' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_9' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_10' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_11' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_12' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_13' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_14' },
      { userEmail: 'jane@gmail.com', songId: 'song_john_15' },

      { userEmail: 'jane@gmail.com', songId: 'song_adele_1' },
      { userEmail: 'jane@gmail.com', songId: 'song_adele_2' },
      { userEmail: 'jane@gmail.com', songId: 'song_adele_3' }
    ]

    // Insert user_song_likes
    for (const like of userSongLikes) {
      const id = `likeSong-${nanoid(16)}`
      const userId = userIds[like.userEmail]
      const likeQuery = {
        text: 'INSERT INTO user_song_likes(id, song_id, user_id) VALUES($1, $2, $3)',
        values: [id, like.songId, userId]
      }
      await pool.query(likeQuery)
      console.log(`Inserted like by user: ${like.userEmail} on song: ${like.songId}`)
    }

    // Data playlists
    const playlists = [
      // Original 4 (2 per user)
      { id: 'playlist_john_1', title: 'John\'s Favorite', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_2', title: 'Workout Mix', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_3', title: 'Midnight Coding', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_4', title: 'Gym Power Mix', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_5', title: 'Weekend Vibes', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_6', title: 'Focus Flow', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_7', title: 'Car Singalongs', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_8', title: 'Rainy Day Blues', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_9', title: 'Summer Hits 2023', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_10', title: '90s Throwback', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_11', title: 'Road Trip Anthems', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_12', title: 'Post-Work Unwind', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_13', title: 'EDM Festival', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_14', title: 'Acoustic Mornings', owner: userIds['john@gmail.com'] },
      { id: 'playlist_john_15', title: 'Gaming Session', owner: userIds['john@gmail.com'] },

      // 13 NEW FOR ADELE (total 15)
      { id: 'playlist_adele_1', title: 'Adele\'s Collection', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_2', title: 'Relaxing Songs', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_3', title: 'Soulful Sundays', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_4', title: 'Piano Classics', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_5', title: 'Bath Relaxation', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_6', title: 'Morning Jazz', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_7', title: 'Romantic Dinner', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_8', title: 'Study Focus', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_9', title: 'Yoga Flow', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_10', title: 'Coffee House', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_11', title: 'R&B Nights', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_12', title: 'Indie Discoveries', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_13', title: 'Dinner Party', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_14', title: 'Rainy Day Reads', owner: userIds['jane@gmail.com'] },
      { id: 'playlist_adele_15', title: 'Power Ballads', owner: userIds['jane@gmail.com'] }
    ]

    // Insert playlists
    for (const playlist of playlists) {
      const playlistQuery = {
        text: 'INSERT INTO playlists(id, title, owner) VALUES($1, $2, $3)',
        values: [playlist.id, playlist.title, playlist.owner]
      }
      await pool.query(playlistQuery)
      console.log(`Inserted playlist: ${playlist.title} with owner: ${playlist.owner}`)
    }

    // Data user_playlist_likes
    const userPlaylistLikes = [
      { userEmail: 'john@gmail.com', playlistId: 'playlist_john_1' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_john_2' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_1' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_2' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_3' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_4' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_5' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_6' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_7' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_8' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_9' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_10' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_11' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_12' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_13' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_14' },
      { userEmail: 'john@gmail.com', playlistId: 'playlist_adele_15' },

      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_1' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_2' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_3' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_4' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_5' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_6' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_7' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_8' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_9' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_10' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_11' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_12' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_13' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_14' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_john_15' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_adele_1' },
      { userEmail: 'jane@gmail.com', playlistId: 'playlist_adele_2' }
    ]

    // Insert user_playlist_likes
    for (const like of userPlaylistLikes) {
      const id = `likePlaylist-${nanoid(16)}`
      const userId = userIds[like.userEmail]
      const likeQuery = {
        text: 'INSERT INTO user_playlist_likes(id, playlist_id, user_id) VALUES($1, $2, $3)',
        values: [id, like.playlistId, userId]
      }
      await pool.query(likeQuery)
      console.log(`Inserted like by user: ${like.userEmail} on song: ${like.playlistId}`)
    }

    // Data playlist_songs
    const playlistSongs = [
      // JOHN'S PLAYLISTS (15 playlists)
      // Playlist 1
      { playlistId: 'playlist_john_1', songId: 'song_john_1' },
      { playlistId: 'playlist_john_1', songId: 'song_john_8' },
      { playlistId: 'playlist_john_1', songId: 'song_adele_6' },
      { playlistId: 'playlist_john_1', songId: 'song_john_3' },

      // Playlist 2
      { playlistId: 'playlist_john_2', songId: 'song_john_6' },
      { playlistId: 'playlist_john_2', songId: 'song_john_7' },
      { playlistId: 'playlist_john_2', songId: 'song_john_10' },
      { playlistId: 'playlist_john_2', songId: 'song_john_15' },
      { playlistId: 'playlist_john_2', songId: 'song_john_2' },
      { playlistId: 'playlist_john_2', songId: 'song_adele_7' },
      { playlistId: 'playlist_john_2', songId: 'song_john_5' },
      { playlistId: 'playlist_john_2', songId: 'song_adele_11' },

      // Playlist 3
      { playlistId: 'playlist_john_3', songId: 'song_john_4' },
      { playlistId: 'playlist_john_3', songId: 'song_john_9' },
      { playlistId: 'playlist_john_3', songId: 'song_john_12' },
      { playlistId: 'playlist_john_3', songId: 'song_adele_2' },
      { playlistId: 'playlist_john_3', songId: 'song_adele_8' },
      { playlistId: 'playlist_john_3', songId: 'song_adele_15' },
      { playlistId: 'playlist_john_3', songId: 'song_adele_9' },
      { playlistId: 'playlist_john_3', songId: 'song_adele_12' },

      // Playlist 4
      { playlistId: 'playlist_john_4', songId: 'song_john_1' },
      { playlistId: 'playlist_john_4', songId: 'song_john_6' },
      { playlistId: 'playlist_john_4', songId: 'song_john_11' },
      { playlistId: 'playlist_john_4', songId: 'song_adele_3' },

      // Playlist 5
      { playlistId: 'playlist_john_5', songId: 'song_john_2' },
      { playlistId: 'playlist_john_5', songId: 'song_john_7' },
      { playlistId: 'playlist_john_5', songId: 'song_john_14' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_4' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_10' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_13' },
      { playlistId: 'playlist_john_5', songId: 'song_john_15' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_1' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_11' },
      { playlistId: 'playlist_john_5', songId: 'song_adele_14' },

      // Playlist 6
      { playlistId: 'playlist_john_6', songId: 'song_john_3' },
      { playlistId: 'playlist_john_6', songId: 'song_john_8' },

      // Playlist 7
      { playlistId: 'playlist_john_7', songId: 'song_john_4' },
      { playlistId: 'playlist_john_7', songId: 'song_john_9' },
      { playlistId: 'playlist_john_7', songId: 'song_john_12' },
      { playlistId: 'playlist_john_7', songId: 'song_adele_2' },
      { playlistId: 'playlist_john_7', songId: 'song_adele_7' },
      { playlistId: 'playlist_john_7', songId: 'song_adele_15' },

      // Playlist 8
      { playlistId: 'playlist_john_8', songId: 'song_john_5' },
      { playlistId: 'playlist_john_8', songId: 'song_john_10' },
      { playlistId: 'playlist_john_8', songId: 'song_john_13' },
      { playlistId: 'playlist_john_8', songId: 'song_adele_3' },
      { playlistId: 'playlist_john_8', songId: 'song_adele_8' },
      { playlistId: 'playlist_john_8', songId: 'song_adele_12' },

      // Playlist 9
      { playlistId: 'playlist_john_9', songId: 'song_john_1' },
      { playlistId: 'playlist_john_9', songId: 'song_john_6' },
      { playlistId: 'playlist_john_9', songId: 'song_john_11' },
      { playlistId: 'playlist_john_9', songId: 'song_adele_4' },
      { playlistId: 'playlist_john_9', songId: 'song_adele_9' },
      { playlistId: 'playlist_john_9', songId: 'song_adele_13' },

      // Playlist 10
      { playlistId: 'playlist_john_10', songId: 'song_john_2' },
      { playlistId: 'playlist_john_10', songId: 'song_john_7' },
      { playlistId: 'playlist_john_10', songId: 'song_john_14' },
      { playlistId: 'playlist_john_10', songId: 'song_adele_5' },
      { playlistId: 'playlist_john_10', songId: 'song_adele_10' },
      { playlistId: 'playlist_john_10', songId: 'song_adele_15' },

      // Playlist 11
      { playlistId: 'playlist_john_11', songId: 'song_john_3' },
      { playlistId: 'playlist_john_11', songId: 'song_john_8' },
      { playlistId: 'playlist_john_11', songId: 'song_john_15' },
      { playlistId: 'playlist_john_11', songId: 'song_adele_1' },
      { playlistId: 'playlist_john_11', songId: 'song_adele_6' },
      { playlistId: 'playlist_john_11', songId: 'song_adele_11' },

      // Playlist 12
      { playlistId: 'playlist_john_12', songId: 'song_john_4' },
      { playlistId: 'playlist_john_12', songId: 'song_john_9' },
      { playlistId: 'playlist_john_12', songId: 'song_john_12' },
      { playlistId: 'playlist_john_12', songId: 'song_adele_2' },
      { playlistId: 'playlist_john_12', songId: 'song_adele_7' },
      { playlistId: 'playlist_john_12', songId: 'song_adele_14' },

      // Playlist 13
      { playlistId: 'playlist_john_13', songId: 'song_john_5' },
      { playlistId: 'playlist_john_13', songId: 'song_john_10' },
      { playlistId: 'playlist_john_13', songId: 'song_john_13' },
      { playlistId: 'playlist_john_13', songId: 'song_adele_3' },
      { playlistId: 'playlist_john_13', songId: 'song_adele_8' },
      { playlistId: 'playlist_john_13', songId: 'song_adele_12' },

      // Playlist 14
      { playlistId: 'playlist_john_14', songId: 'song_john_1' },
      { playlistId: 'playlist_john_14', songId: 'song_john_6' },
      { playlistId: 'playlist_john_14', songId: 'song_john_11' },
      { playlistId: 'playlist_john_14', songId: 'song_adele_4' },
      { playlistId: 'playlist_john_14', songId: 'song_adele_9' },
      { playlistId: 'playlist_john_14', songId: 'song_adele_13' },

      // Playlist 15
      { playlistId: 'playlist_john_15', songId: 'song_john_2' },
      { playlistId: 'playlist_john_15', songId: 'song_john_7' },
      { playlistId: 'playlist_john_15', songId: 'song_john_14' },
      { playlistId: 'playlist_john_15', songId: 'song_adele_5' },
      { playlistId: 'playlist_john_15', songId: 'song_adele_10' },
      { playlistId: 'playlist_john_15', songId: 'song_adele_15' },

      // ADELE'S PLAYLISTS (15 playlists)
      // Playlist 1
      { playlistId: 'playlist_adele_1', songId: 'song_adele_1' },
      { playlistId: 'playlist_adele_1', songId: 'song_adele_6' },
      { playlistId: 'playlist_adele_1', songId: 'song_adele_10' },
      { playlistId: 'playlist_adele_1', songId: 'song_adele_3' },
      { playlistId: 'playlist_adele_1', songId: 'song_john_4' },
      { playlistId: 'playlist_adele_1', songId: 'song_john_9' },

      // Playlist 2
      { playlistId: 'playlist_adele_2', songId: 'song_adele_5' },
      { playlistId: 'playlist_adele_2', songId: 'song_john_8' },
      { playlistId: 'playlist_adele_2', songId: 'song_adele_14' },
      { playlistId: 'playlist_adele_2', songId: 'song_adele_7' },
      { playlistId: 'playlist_adele_2', songId: 'song_john_1' },
      { playlistId: 'playlist_adele_2', songId: 'song_john_12' },

      // Playlist 3
      { playlistId: 'playlist_adele_3', songId: 'song_adele_2' },
      { playlistId: 'playlist_adele_3', songId: 'song_adele_8' },
      { playlistId: 'playlist_adele_3', songId: 'song_adele_12' },
      { playlistId: 'playlist_adele_3', songId: 'song_john_3' },
      { playlistId: 'playlist_adele_3', songId: 'song_john_10' },
      { playlistId: 'playlist_adele_3', songId: 'song_john_15' },

      // Playlist 4
      { playlistId: 'playlist_adele_4', songId: 'song_adele_1' },
      { playlistId: 'playlist_adele_4', songId: 'song_adele_9' },
      { playlistId: 'playlist_adele_4', songId: 'song_adele_13' },
      { playlistId: 'playlist_adele_4', songId: 'song_john_4' },
      { playlistId: 'playlist_adele_4', songId: 'song_john_11' },
      { playlistId: 'playlist_adele_4', songId: 'song_john_14' },

      // Playlist 5
      { playlistId: 'playlist_adele_5', songId: 'song_adele_2' },
      { playlistId: 'playlist_adele_5', songId: 'song_adele_10' },
      { playlistId: 'playlist_adele_5', songId: 'song_adele_14' },
      { playlistId: 'playlist_adele_5', songId: 'song_john_5' },
      { playlistId: 'playlist_adele_5', songId: 'song_john_12' },
      { playlistId: 'playlist_adele_5', songId: 'song_john_15' },

      // Playlist 6
      { playlistId: 'playlist_adele_6', songId: 'song_adele_3' },
      { playlistId: 'playlist_adele_6', songId: 'song_adele_11' },
      { playlistId: 'playlist_adele_6', songId: 'song_adele_15' },
      { playlistId: 'playlist_adele_6', songId: 'song_john_1' },
      { playlistId: 'playlist_adele_6', songId: 'song_john_6' },
      { playlistId: 'playlist_adele_6', songId: 'song_john_13' },

      // Playlist 7
      { playlistId: 'playlist_adele_7', songId: 'song_adele_4' },
      { playlistId: 'playlist_adele_7', songId: 'song_adele_12' },
      { playlistId: 'playlist_adele_7', songId: 'song_john_2' },
      { playlistId: 'playlist_adele_7', songId: 'song_john_7' },
      { playlistId: 'playlist_adele_7', songId: 'song_john_14' },
      { playlistId: 'playlist_adele_7', songId: 'song_adele_7' },

      // Playlist 8
      { playlistId: 'playlist_adele_8', songId: 'song_adele_5' },
      { playlistId: 'playlist_adele_8', songId: 'song_adele_13' },
      { playlistId: 'playlist_adele_8', songId: 'song_john_3' },
      { playlistId: 'playlist_adele_8', songId: 'song_john_8' },
      { playlistId: 'playlist_adele_8', songId: 'song_john_15' },
      { playlistId: 'playlist_adele_8', songId: 'song_adele_8' },

      // Playlist 9
      { playlistId: 'playlist_adele_9', songId: 'song_adele_6' },
      { playlistId: 'playlist_adele_9', songId: 'song_adele_14' },
      { playlistId: 'playlist_adele_9', songId: 'song_john_4' },
      { playlistId: 'playlist_adele_9', songId: 'song_john_9' },
      { playlistId: 'playlist_adele_9', songId: 'song_john_12' },
      { playlistId: 'playlist_adele_9', songId: 'song_adele_9' },

      // Playlist 10
      { playlistId: 'playlist_adele_10', songId: 'song_adele_7' },
      { playlistId: 'playlist_adele_10', songId: 'song_adele_15' },
      { playlistId: 'playlist_adele_10', songId: 'song_john_5' },
      { playlistId: 'playlist_adele_10', songId: 'song_john_10' },
      { playlistId: 'playlist_adele_10', songId: 'song_john_13' },
      { playlistId: 'playlist_adele_10', songId: 'song_adele_10' },

      // Playlist 11
      { playlistId: 'playlist_adele_11', songId: 'song_adele_8' },
      { playlistId: 'playlist_adele_11', songId: 'song_john_1' },
      { playlistId: 'playlist_adele_11', songId: 'song_john_6' },
      { playlistId: 'playlist_adele_11', songId: 'song_john_11' },
      { playlistId: 'playlist_adele_11', songId: 'song_adele_11' },
      { playlistId: 'playlist_adele_11', songId: 'song_adele_2' },

      // Playlist 12
      { playlistId: 'playlist_adele_12', songId: 'song_adele_9' },
      { playlistId: 'playlist_adele_12', songId: 'song_john_2' },
      { playlistId: 'playlist_adele_12', songId: 'song_john_7' },
      { playlistId: 'playlist_adele_12', songId: 'song_john_14' },
      { playlistId: 'playlist_adele_12', songId: 'song_adele_12' },
      { playlistId: 'playlist_adele_12', songId: 'song_adele_3' }
    ]

    // Insert playlist_songs
    for (const playlistSong of playlistSongs) {
      const id = `playlist_song-${nanoid(16)}`
      const playlistSongQuery = {
        text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3)',
        values: [id, playlistSong.playlistId, playlistSong.songId]
      }
      await pool.query(playlistSongQuery)
      console.log(`Inserted song ${playlistSong.songId} into playlist ${playlistSong.playlistId}`)
    }

    // data collaborations
    const collaborations = [
      { playlistId: 'playlist_john_1', userId: userIds['jane@gmail.com'] },
      { playlistId: 'playlist_john_1', userId: userIds['tami@gmail.com'] },
      { playlistId: 'playlist_john_2', userId: userIds['jane@gmail.com'] },
      { playlistId: 'playlist_john_2', userId: userIds['tami@gmail.com'] },
      { playlistId: 'playlist_adele_1', userId: userIds['john@gmail.com'] },
      { playlistId: 'playlist_adele_1', userId: userIds['tami@gmail.com'] },
      { playlistId: 'playlist_adele_2', userId: userIds['john@gmail.com'] },
      { playlistId: 'playlist_adele_2', userId: userIds['tami@gmail.com'] }
    ]

    // Insert playlist_songs
    for (const collaboration of collaborations) {
      const id = `collab-${nanoid(16)}`
      const collaborationsQuery = {
        text: 'INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1, $2, $3)',
        values: [id, collaboration.playlistId, collaboration.userId]
      }
      await pool.query(collaborationsQuery)
      console.log(`Inserted song ${collaboration.playlistId} into playlist ${collaboration.playlistId}`)
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await pool.end()
  }
}

seedDatabase()
