import Database from 'better-sqlite3';
import path from 'path';

export interface Movie {
  id: number;
  code: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl: string;
  isFavourite: boolean;
  rating: number;
  createdAt: string;
  publishedAt: string;
}

class MovieDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'movies.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
    this.seedData();
  }

  private initializeDatabase() {
    // Create movies table
    const createMoviesTable = `
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        videoUrl TEXT NOT NULL,
        coverUrl TEXT NOT NULL,
        isFavourite BOOLEAN DEFAULT FALSE,
        rating INTEGER CHECK(rating >= 1 AND rating <= 10),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME
      )
    `;
    
    this.db.exec(createMoviesTable);
  }

  private seedData() {
    // Check if data already exists
    const count = this.db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number };
    
    if (count.count === 0) {
      this.insertSampleMovies();
    }
  }

  private insertSampleMovies() {
    const movies = [
      {
        code: 'MOV001',
        title: 'Quantum Odyssey',
        description: 'A mind-bending sci-fi thriller that follows Dr. Sarah Chen, a quantum physicist who discovers a way to manipulate reality through quantum entanglement. When her experiments accidentally tear holes in the fabric of space-time, she must race against time to prevent a catastrophic collapse of multiple dimensions. With stunning visual effects and a gripping storyline, this film explores the boundaries between science and possibility.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        coverUrl: 'https://picsum.photos/300/450?random=1',
        rating: 9,
        publishedAt: '2024-03-15'
      },
      {
        code: 'MOV002',
        title: 'The Last Guardian',
        description: 'In a post-apocalyptic world where nature has reclaimed civilization, Maya discovers she\'s the last guardian of an ancient secret that could restore balance to Earth. This epic fantasy adventure combines breathtaking landscapes with emotional depth as Maya embarks on a perilous journey across dangerous territories, accompanied by mythical creatures and facing formidable enemies who want to exploit her power.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        coverUrl: 'https://picsum.photos/300/450?random=2',
        rating: 8,
        publishedAt: '2024-02-28'
      },
      {
        code: 'MOV003',
        title: 'Neon Nights',
        description: 'Set in the cyberpunk streets of Neo Tokyo 2089, this action-packed thriller follows Jack Rivera, a reformed cyber-criminal who must infiltrate the most secure digital fortress ever created. With his team of elite hackers, Jack faces deadly AI security systems and corporate espionage in a race to expose a conspiracy that threatens to control humanity\'s digital consciousness.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        coverUrl: 'https://picsum.photos/300/450?random=3',
        rating: 7,
        publishedAt: '2024-01-20'
      },
      {
        code: 'MOV004',
        title: 'Echoes of Tomorrow',
        description: 'A thought-provoking drama about Dr. Elena Rodriguez, a neuroscientist who develops technology that can record and replay human memories. When she uses the device to investigate her own traumatic past, she uncovers a web of lies and discovers that her memories may not be her own. This psychological thriller examines identity, truth, and the malleable nature of human recollection.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        coverUrl: 'https://picsum.photos/300/450?random=4',
        rating: 9,
        publishedAt: '2024-04-10'
      },
      {
        code: 'MOV005',
        title: 'Stellar Horizons',
        description: 'When the first manned mission to Mars goes silent, Captain Lisa Park leads a rescue mission that discovers more than they bargained for. Ancient alien structures beneath the Martian surface hold secrets that could change humanity\'s understanding of its place in the universe. This space epic combines hard science fiction with spectacular visual effects and emotional character development.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        coverUrl: 'https://picsum.photos/300/450?random=5',
        rating: 8,
        publishedAt: '2024-05-22'
      }
    ];

    // Generate 95 more movies to reach 100 total
    const movieTitles = [
      'Digital Dreams', 'Shadow Protocol', 'Infinite Loop', 'Crystal Empire', 'Void Runners',
      'Time Architects', 'Neural Network', 'Cosmic Drift', 'Binary Heart', 'Phantom Code',
      'Electric Soul', 'Quantum Leap', 'Dark Matter', 'Cyber Phoenix', 'Virtual Reality',
      'Neon Genesis', 'Tech Noir', 'Digital Fortress', 'Code Breaker', 'System Override',
      'Memory Palace', 'Data Stream', 'Pixel Perfect', 'Chrome Dreams', 'Synthetic Life',
      'Algorithm', 'Firewall', 'Mainframe', 'Circuit City', 'Digital Horizon',
      'Cyber Storm', 'Tech Savvy', 'Binary Code', 'Virtual World', 'Digital Age',
      'Cyber Space', 'Tech Revolution', 'Digital Future', 'Cyber Reality', 'Tech Dreams',
      'Digital World', 'Cyber Life', 'Tech Vision', 'Digital Evolution', 'Cyber Mind',
      'Tech Matrix', 'Digital Soul', 'Cyber Heart', 'Tech Spirit', 'Digital Energy',
      'Cyber Force', 'Tech Power', 'Digital Light', 'Cyber Shadow', 'Tech Magic',
      'Digital Fire', 'Cyber Ice', 'Tech Thunder', 'Digital Wind', 'Cyber Earth',
      'Tech Water', 'Digital Storm', 'Cyber Rain', 'Tech Snow', 'Digital Sun',
      'Cyber Moon', 'Tech Stars', 'Digital Galaxy', 'Cyber Universe', 'Tech Cosmos',
      'Digital Infinity', 'Cyber Eternity', 'Tech Forever', 'Digital Always', 'Cyber Never',
      'Tech Beyond', 'Digital Above', 'Cyber Below', 'Tech Inside', 'Digital Outside',
      'Cyber Around', 'Tech Through', 'Digital Across', 'Cyber Between', 'Tech Among',
      'Digital Within', 'Cyber Without', 'Tech Beside', 'Digital Behind', 'Cyber Ahead',
      'Tech Before', 'Digital After', 'Cyber During', 'Tech Until', 'Digital Since',
      'Cyber While', 'Tech When', 'Digital Where', 'Cyber Why', 'Tech How'
    ];

    const descriptions = [
      'A thrilling adventure that pushes the boundaries of imagination and takes viewers on an unforgettable journey through time and space.',
      'An emotional masterpiece that explores the depths of human connection and the power of love in the face of adversity.',
      'A high-octane action film filled with spectacular stunts, explosive sequences, and heart-pounding suspense from start to finish.',
      'A thought-provoking drama that delves into complex moral questions and challenges viewers to examine their own beliefs and values.',
      'A visually stunning epic that combines cutting-edge special effects with compelling storytelling and memorable characters.',
      'A mysterious thriller that keeps audiences guessing until the very last scene with its intricate plot twists and suspenseful atmosphere.',
      'A heartwarming family film that celebrates the bonds between generations and the importance of following your dreams.',
      'A dark and gritty crime story that exposes the seedy underbelly of urban life and the corrupt forces that shape society.',
      'A romantic comedy that brings laughter and joy while exploring the complicated nature of modern relationships and love.',
      'A supernatural horror film that delivers genuine scares and explores the thin line between reality and the paranormal world.'
    ];

    const stmt = this.db.prepare(`
      INSERT INTO movies (code, title, description, videoUrl, coverUrl, rating, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert the initial 5 movies
    movies.forEach(movie => {
      stmt.run(
        movie.code,
        movie.title,
        movie.description,
        movie.videoUrl,
        movie.coverUrl,
        movie.rating,
        movie.publishedAt
      );
    });

    // Generate 95 more movies
    for (let i = 6; i <= 100; i++) {
      const titleIndex = (i - 6) % movieTitles.length;
      const descIndex = (i - 6) % descriptions.length;
      const randomDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      stmt.run(
        `MOV${i.toString().padStart(3, '0')}`,
        movieTitles[titleIndex],
        descriptions[descIndex],
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        `https://picsum.photos/300/450?random=${i}`,
        Math.floor(Math.random() * 10) + 1,
        randomDate.toISOString().split('T')[0]
      );
    }
  }

  // Get movies with pagination
  getMovies(page: number = 1, limit: number = 20): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    
    const movies = this.db.prepare(`
      SELECT * FROM movies 
      ORDER BY publishedAt DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Movie[];
    
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);
    
    return { movies, total, totalPages };
  }

  // Get favorite movies
  getFavoriteMovies(): Movie[] {
    return this.db.prepare('SELECT * FROM movies WHERE isFavourite = 1 ORDER BY title').all() as Movie[];
  }

  // Get random movie
  getRandomMovie(): Movie | null {
    const result = this.db.prepare('SELECT * FROM movies ORDER BY RANDOM() LIMIT 1').get() as Movie;
    return result || null;
  }

  // Get movie by ID
  getMovieById(id: number): Movie | null {
    const result = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as Movie;
    return result || null;
  }

  // Search movies
  searchMovies(query: string): Movie[] {
    return this.db.prepare(`
      SELECT * FROM movies 
      WHERE title LIKE ? OR description LIKE ? 
      ORDER BY title
    `).all(`%${query}%`, `%${query}%`) as Movie[];
  }

  // Toggle favorite status
  toggleFavorite(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;
    
    const newStatus = !movie.isFavourite;
    this.db.prepare('UPDATE movies SET isFavourite = ? WHERE id = ?').run(newStatus, id);
    return newStatus;
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

// Export singleton instance
export const movieDB = new MovieDatabase();
