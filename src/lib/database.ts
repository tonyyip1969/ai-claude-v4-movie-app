import { Movie } from '@/types/movie';
import Database from 'better-sqlite3';
import path from 'path';
import { BulkInsertResult, ValidationResult } from '@/types/import';

class MovieDatabase {
  private db: Database.Database;

  constructor() {
    // Get database path from environment variable or fallback to default
    const dbPath = process.env.DB_PATH
      ? path.resolve(process.env.DB_PATH)
      : path.join(process.cwd(), 'movies.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
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
        isInWatchlist BOOLEAN DEFAULT FALSE,
        rating INTEGER CHECK(rating >= 1 AND rating <= 10),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME
      )
    `;
    
    this.db.exec(createMoviesTable);
    
    // Add isInWatchlist column if it doesn't exist (for existing databases)
    try {
      this.db.exec(`ALTER TABLE movies ADD COLUMN isInWatchlist BOOLEAN DEFAULT FALSE`);
    } catch {
      // Column already exists or other error, ignore
    }
  }

  // Get movies with pagination
  getMovies(page: number = 1, limit: number = 20): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    
    const movies = this.db.prepare(`
      SELECT * FROM movies 
      ORDER BY publishedAt DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as unknown as Movie[];
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    const convertedMovies = movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);
    return { movies: convertedMovies, total, totalPages };
  }

  // Get favorite movies
  getFavoriteMovies(): Movie[] {
    const movies = this.db.prepare('SELECT * FROM movies WHERE isFavourite = 1 ORDER BY title').all() as unknown as Movie[];
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    return movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
  }

  // Get watchlist movies
  getWatchlistMovies(): Movie[] {
    const movies = this.db.prepare('SELECT * FROM movies WHERE isInWatchlist = 1 ORDER BY title').all() as unknown as Movie[];
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    return movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
  }

  // Get random movie
  getRandomMovie(): Movie | null {
    const result = this.db.prepare('SELECT * FROM movies ORDER BY RANDOM() LIMIT 1').get() as unknown;
    if (!result) return null;
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    const movie = result as Movie;
    return {
      ...movie,
      isFavourite: Boolean(movie.isFavourite),
      isInWatchlist: Boolean(movie.isInWatchlist)
    };
  }

  // Get movie by ID
  getMovieById(id: number): Movie | null {
    const result = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as unknown;
    if (!result) return null;
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    const movie = result as Movie;
    return {
      ...movie,
      isFavourite: Boolean(movie.isFavourite),
      isInWatchlist: Boolean(movie.isInWatchlist)
    };
  }

  // Search movies
  searchMovies(query: string): Movie[] {
    const movies = this.db.prepare(`
      SELECT * FROM movies 
      WHERE title LIKE ? OR description LIKE ? OR code LIKE ? 
      ORDER BY title
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as unknown as Movie[];
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    return movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
  }

  // Toggle favorite status
  toggleFavorite(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;
    
    const newStatus = !movie.isFavourite;
    const result = this.db.prepare('UPDATE movies SET isFavourite = ? WHERE id = ?').run(newStatus ? 1 : 0, id);
    
    // Verify the update was successful
    if (result.changes > 0) {
      return newStatus;
    }
    
    return movie.isFavourite; // Return original status if update failed
  }

  // Toggle watchlist status
  toggleWatchlist(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;
    
    const newStatus = !movie.isInWatchlist;
    const result = this.db.prepare('UPDATE movies SET isInWatchlist = ? WHERE id = ?').run(newStatus ? 1 : 0, id);
    
    // Verify the update was successful
    if (result.changes > 0) {
      return newStatus;
    }
    
    return movie.isInWatchlist; // Return original status if update failed
  }

  // Update movie rating
  updateRating(id: number, rating: number): boolean {
    // Validate rating range
    if (rating < 1 || rating > 10) {
      throw new Error('Rating must be between 1 and 10');
    }
    
    const movie = this.getMovieById(id);
    if (!movie) return false;
    
    const result = this.db.prepare('UPDATE movies SET rating = ? WHERE id = ?').run(rating, id);
    
    // Verify the update was successful
    return result.changes > 0;
  }

  // Close database connection
  close() {
    this.db.close();
  }

  // Check if movie code exists
  checkMovieCodeExists(code: string): boolean {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM movies WHERE code = ?').get(code) as { count: number };
    return result.count > 0;
  }

  // Validate movie data
  validateMovieData(movieData: Partial<Movie>): ValidationResult {
    const errors: string[] = [];

    // Required fields validation
    if (!movieData.code || movieData.code.trim() === '') {
      errors.push('Movie code is required');
    }

    if (!movieData.title || movieData.title.trim() === '') {
      errors.push('Movie title is required');
    }

    if (!movieData.description || movieData.description.trim() === '') {
      errors.push('Movie description is required');
    }

    if (!movieData.videoUrl || movieData.videoUrl.trim() === '') {
      errors.push('Video URL is required');
    }

    // Rating validation
    if (movieData.rating !== undefined) {
      if (movieData.rating < 1 || movieData.rating > 10) {
        errors.push('Rating must be between 1 and 10');
      }
    }

    // Check for duplicate code
    if (movieData.code && this.checkMovieCodeExists(movieData.code)) {
      errors.push('Movie code already exists');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Bulk insert movies with validation
  bulkInsertMovies(movies: Partial<Movie>[]): BulkInsertResult {
    const result: BulkInsertResult = {
      success: 0,
      skipped: 0,
      errors: []
    };

    const stmt = this.db.prepare(`
      INSERT INTO movies (code, title, description, videoUrl, coverUrl, isFavourite, isInWatchlist, rating, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Use transaction for better performance
    const transaction = this.db.transaction((movieList: Partial<Movie>[]) => {
      movieList.forEach((movie, index) => {
        try {
          // Skip if movie code already exists
          if (movie.code && this.checkMovieCodeExists(movie.code)) {
            result.skipped++;
            return;
          }

          // Validate movie data
          const validation = this.validateMovieData(movie);
          if (!validation.isValid) {
            result.errors.push({
              row: index + 1,
              error: validation.errors.join(', ')
            });
            return;
          }

          // Insert movie
          stmt.run(
            movie.code,
            movie.title,
            movie.description,
            movie.videoUrl,
            movie.coverUrl || `https://picsum.photos/300/450?random=${Date.now()}-${index}`,
            movie.isFavourite ? 1 : 0,
            movie.isInWatchlist ? 1 : 0,
            movie.rating || 5,
            movie.publishedAt || new Date().toISOString().split('T')[0]
          );

          result.success++;
        } catch (error) {
          result.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      });
    });

    try {
      transaction(movies);
    } catch (error) {
      // Handle transaction-level errors
      result.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    }

    return result;
  }

  // Get movie counts for dashboard
  getMovieCounts(): { total: number; favorites: number; watchlist: number } {
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number };
    const favoritesResult = this.db.prepare('SELECT COUNT(*) as count FROM movies WHERE isFavourite = 1').get() as { count: number };
    const watchlistResult = this.db.prepare('SELECT COUNT(*) as count FROM movies WHERE isInWatchlist = 1').get() as { count: number };

    return {
      total: totalResult.count,
      favorites: favoritesResult.count,
      watchlist: watchlistResult.count
    };
  }
}

// Export singleton instance
export const movieDB = new MovieDatabase();
