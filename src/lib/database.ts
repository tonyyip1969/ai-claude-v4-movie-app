import { Movie, MovieCreatePayload } from '@/types/movie';
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

    // Create settings table
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.exec(createSettingsTable);
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

  // Get favorite movies with pagination
  getFavoriteMoviesPaginated(page: number = 1, limit: number = 20): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    
    const movies = this.db.prepare(`
      SELECT * FROM movies 
      WHERE isFavourite = 1 
      ORDER BY title 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as unknown as Movie[];
    
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    const convertedMovies = movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
    
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM movies WHERE isFavourite = 1').get() as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);
    
    return { movies: convertedMovies, total, totalPages };
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

  // Get watchlist movies with pagination
  getWatchlistMoviesPaginated(page: number = 1, limit: number = 20): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    
    const movies = this.db.prepare(`
      SELECT * FROM movies 
      WHERE isInWatchlist = 1 
      ORDER BY title 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as unknown as Movie[];
    
    // Convert SQLite integers to booleans for isFavourite and isInWatchlist
    const convertedMovies = movies.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];
    
    const totalResult = this.db.prepare('SELECT COUNT(*) as count FROM movies WHERE isInWatchlist = 1').get() as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);
    
    return { movies: convertedMovies, total, totalPages };
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

  // Update movie with comprehensive field support
  updateMovie(id: number, updates: {
    title?: string;
    description?: string;
    code?: string;
    publishedAt?: string;
    coverUrl?: string;
    videoUrl?: string;
  }): boolean {
    const movie = this.getMovieById(id);
    if (!movie) {
      throw new Error('Movie not found');
    }

    // Validate updates
    const validationErrors: string[] = [];

    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        validationErrors.push('Title cannot be empty');
      } else if (updates.title.length > 200) {
        validationErrors.push('Title must be 200 characters or less');
      }
    }

    if (updates.description !== undefined && updates.description.length > 1000) {
      validationErrors.push('Description must be 1000 characters or less');
    }

    if (updates.code !== undefined) {
      if (!updates.code.trim()) {
        validationErrors.push('Code cannot be empty');
      } else if (updates.code.length < 3 || updates.code.length > 20) {
        validationErrors.push('Code must be between 3 and 20 characters');
      } else if (updates.code !== movie.code && this.getMovieByCode(updates.code, id)) {
        validationErrors.push('Movie code already exists');
      }
    }

    if (updates.videoUrl !== undefined) {
      if (!updates.videoUrl.trim()) {
        validationErrors.push('Video URL cannot be empty');
      } else if (!this.isValidUrl(updates.videoUrl)) {
        validationErrors.push('Video URL must be a valid URL');
      }
    }

    if (updates.coverUrl !== undefined) {
      if (!updates.coverUrl.trim()) {
        validationErrors.push('Cover URL cannot be empty');
      } else if (!this.isValidUrl(updates.coverUrl)) {
        validationErrors.push('Cover URL must be a valid URL');
      }
    }

    if (updates.publishedAt !== undefined && updates.publishedAt.trim() && !this.isValidDate(updates.publishedAt)) {
      validationErrors.push('Published date must be a valid date');
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '));
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title.trim());
    }

    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description.trim());
    }

    if (updates.code !== undefined) {
      updateFields.push('code = ?');
      updateValues.push(updates.code.trim());
    }

    if (updates.publishedAt !== undefined) {
      updateFields.push('publishedAt = ?');
      updateValues.push(updates.publishedAt.trim() || null);
    }

    if (updates.coverUrl !== undefined) {
      updateFields.push('coverUrl = ?');
      updateValues.push(updates.coverUrl.trim());
    }

    if (updates.videoUrl !== undefined) {
      updateFields.push('videoUrl = ?');
      updateValues.push(updates.videoUrl.trim());
    }

    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    // Add ID to the end for WHERE clause
    updateValues.push(id);

    const query = `UPDATE movies SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = this.db.prepare(query).run(...updateValues);

    return result.changes > 0;
  }

  // Get movie by code (with optional exclude ID for uniqueness checking)
  getMovieByCode(code: string, excludeId?: number): Movie | null {
    let query = 'SELECT * FROM movies WHERE code = ?';
    const params: unknown[] = [code];

    if (excludeId !== undefined) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const movie = this.db.prepare(query).get(...params) as unknown as Movie | undefined;
    
    if (!movie) return null;

    // Convert SQLite integers to booleans
    return {
      ...movie,
      isFavourite: Boolean(movie.isFavourite),
      isInWatchlist: Boolean(movie.isInWatchlist)
    } as Movie;
  }

  // Helper method to validate URLs
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to validate dates
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // Close database connection
  close() {
    this.db.close();
  }

  // Create a new movie
  createMovie(movieData: MovieCreatePayload): Movie {
    // Set defaults
    const rating = movieData.rating ?? 5;
    const publishedAt = movieData.publishedAt || new Date().toISOString().split('T')[0];
    
    // Validation
    const validationErrors: string[] = [];

    // Required field validation
    if (!movieData.title?.trim()) {
      validationErrors.push('Title is required');
    } else if (movieData.title.length > 200) {
      validationErrors.push('Title must be 200 characters or less');
    }

    if (!movieData.code?.trim()) {
      validationErrors.push('Movie code is required');
    } else if (movieData.code.length < 3 || movieData.code.length > 20) {
      validationErrors.push('Code must be between 3 and 20 characters');
    } else if (this.checkMovieCodeExists(movieData.code)) {
      validationErrors.push('Movie code already exists');
    }

    if (!movieData.videoUrl?.trim()) {
      validationErrors.push('Video URL is required');
    } else if (!this.isValidUrl(movieData.videoUrl)) {
      validationErrors.push('Video URL must be a valid URL');
    }

    if (!movieData.coverUrl?.trim()) {
      validationErrors.push('Cover URL is required');
    } else if (!this.isValidUrl(movieData.coverUrl)) {
      validationErrors.push('Cover URL must be a valid URL');
    }

    // Optional field validation
    if (movieData.description && movieData.description.length > 1000) {
      validationErrors.push('Description must be 1000 characters or less');
    }

    if (movieData.publishedAt && !this.isValidDate(movieData.publishedAt)) {
      validationErrors.push('Published date must be a valid date');
    }

    if (rating < 1 || rating > 10) {
      validationErrors.push('Rating must be between 1 and 10');
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('; '));
    }

    // Insert the movie
    const stmt = this.db.prepare(`
      INSERT INTO movies (code, title, description, videoUrl, coverUrl, rating, publishedAt, isFavourite, isInWatchlist)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    const result = stmt.run(
      movieData.code.trim(),
      movieData.title.trim(),
      movieData.description?.trim() || '',
      movieData.videoUrl.trim(),
      movieData.coverUrl.trim(),
      rating,
      publishedAt
    );

    // Fetch and return the created movie
    const createdMovie = this.getMovieById(result.lastInsertRowid as number);
    
    if (!createdMovie) {
      throw new Error('Failed to create movie');
    }

    return createdMovie;
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

  // Settings methods
  getAllSettings(): Record<string, string> {
    const rows = this.db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }

  setSetting(key: string, value: string): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updatedAt)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, value);
  }

  setSettings(settings: Record<string, string>): void {
    const transaction = this.db.transaction((settingsData: Record<string, string>) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO app_settings (key, value, updatedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      
      for (const [key, value] of Object.entries(settingsData)) {
        stmt.run(key, value);
      }
    });
    
    transaction(settings);
  }

  deleteSetting(key: string): void {
    this.db.prepare('DELETE FROM app_settings WHERE key = ?').run(key);
  }

  clearSettings(): void {
    this.db.prepare('DELETE FROM app_settings').run();
  }
}

// Export singleton instance
export const movieDB = new MovieDatabase();
