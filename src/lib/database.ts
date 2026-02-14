import { Movie, MovieCreatePayload } from '@/types/movie';
import Database from 'better-sqlite3';
import path from 'path';
import { BulkInsertResult, ValidationResult } from '@/types/import';

// Tag interface matching database structure
export interface Tag {
  id: number;
  name: string;
  count?: number; // Usage count
}

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

    // Create tags table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);

    // Create movie_tags junction table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movie_tags (
        movie_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (movie_id, tag_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Create settings table
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createSettingsTable);

    // Create play history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS play_history (
        movie_id INTEGER PRIMARY KEY,
        progress_seconds REAL NOT NULL,
        duration_seconds REAL NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      )
    `);
  }

  /**
   * Get sort ORDER BY clause based on sortBy parameter
   * Handles all sort options with proper null handling
   * @private
   */
  private getSortOrderClause(sortBy?: string): string {
    const validSortOptions = ['createdAt', 'publishedAt', 'title', 'rating'];

    // Validate sortBy to prevent SQL injection
    if (sortBy && !validSortOptions.includes(sortBy)) {
      throw new Error(`Invalid sortBy parameter: ${sortBy}`);
    }

    switch (sortBy) {
      case 'createdAt':
        return 'ORDER BY createdAt DESC';
      case 'title':
        return 'ORDER BY LOWER(title) ASC';
      case 'rating':
        return 'ORDER BY COALESCE(rating, 0) DESC, LOWER(title) ASC';
      case 'publishedAt':
      default:
        return 'ORDER BY publishedAt DESC';
    }
  }

  /**
   * Helper to fetch tags for a list of movies
   */
  private attachTagsToMovies(movies: Movie[]): Movie[] {
    const transaction = this.db.transaction((movies: Movie[]) => {
      // Prepare statement for efficiency
      const stmt = this.db.prepare(`
        SELECT t.name 
        FROM tags t 
        JOIN movie_tags mt ON t.id = mt.tag_id 
        WHERE mt.movie_id = ?
        ORDER BY t.name
      `);

      return movies.map(movie => {
        const tags = stmt.all(movie.id) as { name: string }[];
        return {
          ...movie,
          tags: tags.map(t => t.name)
        };
      });
    });
    return transaction(movies);
  }

  /**
   * Helper to fetch tags for a single movie
   */
  private getTagsForMovie(movieId: number): string[] {
    const tags = this.db.prepare(`
        SELECT t.name 
        FROM tags t 
        JOIN movie_tags mt ON t.id = mt.tag_id 
        WHERE mt.movie_id = ?
        ORDER BY t.name
      `).all(movieId) as { name: string }[];
    return tags.map(t => t.name);
  }

  /**
   * Add tags to a movie
   */
  private addTagsToMovie(movieId: number, tags: string[]) {
    if (!tags || tags.length === 0) return;

    const insertTag = this.db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTagId = this.db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = this.db.prepare('INSERT OR IGNORE INTO movie_tags (movie_id, tag_id) VALUES (?, ?)');

    const transaction = this.db.transaction((tags: string[]) => {
      for (const tag of tags) {
        const trimmedTag = tag.trim();
        if (!trimmedTag) continue;

        insertTag.run(trimmedTag);
        const tagIdResult = getTagId.get(trimmedTag) as { id: number };
        if (tagIdResult) {
          linkTag.run(movieId, tagIdResult.id);
        }
      }
    });

    transaction(tags);
  }

  /**
   * Remove all tags from a movie
   */
  private removeTagsFromMovie(movieId: number) {
    this.db.prepare('DELETE FROM movie_tags WHERE movie_id = ?').run(movieId);
  }

  /**
   * Update tags for a movie (replace all)
   */
  private updateMovieTags(movieId: number, tags: string[]) {
    const transaction = this.db.transaction(() => {
      this.removeTagsFromMovie(movieId);
      this.addTagsToMovie(movieId, tags);
    });
    transaction();
  }

  /**
   * Get movies with pagination, optional sorting, and filtering
   * @param page - Page number (1-indexed)
   * @param limit - Number of movies per page
   * @param sortBy - Sort field
   * @param tag - Filter by tag name
   */
  getMovies(page: number = 1, limit: number = 20, sortBy?: string, tag?: string): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    const orderClause = this.getSortOrderClause(sortBy);

    let queryObj;
    let countQuery;
    let params: unknown[] = [];

    if (tag) {
      // Filter by tag
      const tagFilter = `
         JOIN movie_tags mt ON movies.id = mt.movie_id
         JOIN tags t ON mt.tag_id = t.id
         WHERE t.name = ?
       `;

      queryObj = this.db.prepare(`
        SELECT movies.* FROM movies 
        ${tagFilter}
        ${orderClause}
        LIMIT ? OFFSET ?
      `);

      countQuery = `SELECT COUNT(*) as count FROM movies ${tagFilter}`;
      params = [tag];

    } else {
      queryObj = this.db.prepare(`
        SELECT * FROM movies 
        ${orderClause}
        LIMIT ? OFFSET ?
      `);
      countQuery = 'SELECT COUNT(*) as count FROM movies';
    }

    const moviesRaw = queryObj.all(...params, limit, offset) as unknown as Movie[];

    // Convert SQLite integers to booleans
    let movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    // Attach tags
    movies = this.attachTagsToMovies(movies);

    const totalResult = this.db.prepare(countQuery).get(...params) as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    return { movies, total, totalPages };
  }

  // Get favorite movies
  getFavoriteMovies(): Movie[] {
    const moviesRaw = this.db.prepare('SELECT * FROM movies WHERE isFavourite = 1 ORDER BY title').all() as unknown as Movie[];
    // Convert SQLite integers to booleans
    const movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    return this.attachTagsToMovies(movies);
  }

  /**
   * Get favorite movies with pagination
   */
  getFavoriteMoviesPaginated(page: number = 1, limit: number = 20, sortBy?: string, tag?: string): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    const orderClause = this.getSortOrderClause(sortBy);

    let query = `SELECT movies.* FROM movies`;
    let countQuery = `SELECT COUNT(*) as count FROM movies`;
    const params: unknown[] = [];
    let whereClause = `WHERE isFavourite = 1`;

    if (tag) {
      query += ` JOIN movie_tags mt ON movies.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id`;
      countQuery += ` JOIN movie_tags mt ON movies.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id`;
      whereClause += ` AND t.name = ?`;
      params.push(tag);
    }

    const moviesRaw = this.db.prepare(`
      ${query} 
      ${whereClause} 
      ${orderClause}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as unknown as Movie[];

    let movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    movies = this.attachTagsToMovies(movies);

    const totalResult = this.db.prepare(`${countQuery} ${whereClause}`).get(...params) as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    return { movies, total, totalPages };
  }

  // Get watchlist movies
  getWatchlistMovies(): Movie[] {
    const moviesRaw = this.db.prepare('SELECT * FROM movies WHERE isInWatchlist = 1 ORDER BY title').all() as unknown as Movie[];

    const movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    return this.attachTagsToMovies(movies);
  }

  /**
   * Get watchlist movies with pagination
   */
  getWatchlistMoviesPaginated(page: number = 1, limit: number = 20, sortBy?: string, tag?: string): { movies: Movie[]; total: number; totalPages: number } {
    const offset = (page - 1) * limit;
    const orderClause = this.getSortOrderClause(sortBy);

    let query = `SELECT movies.* FROM movies`;
    let countQuery = `SELECT COUNT(*) as count FROM movies`;
    const params: unknown[] = [];
    let whereClause = `WHERE isInWatchlist = 1`;

    if (tag) {
      query += ` JOIN movie_tags mt ON movies.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id`;
      countQuery += ` JOIN movie_tags mt ON movies.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id`;
      whereClause += ` AND t.name = ?`;
      params.push(tag);
    }

    const moviesRaw = this.db.prepare(`
      ${query} 
      ${whereClause} 
      ${orderClause}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as unknown as Movie[];

    let movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    movies = this.attachTagsToMovies(movies);

    const totalResult = this.db.prepare(`${countQuery} ${whereClause}`).get(...params) as { count: number };
    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    return { movies, total, totalPages };
  }

  // Get random movie
  getRandomMovie(tag?: string): Movie | null {
    let query = 'SELECT movies.* FROM movies';
    const params: unknown[] = [];

    if (tag) {
      query += ` JOIN movie_tags mt ON movies.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id WHERE t.name = ?`;
      params.push(tag);
    }

    const result = this.db.prepare(`${query} ORDER BY RANDOM() LIMIT 1`).get(...params) as unknown;
    if (!result) return null;

    const movie = result as Movie;
    const movies = [{
      ...movie,
      isFavourite: Boolean(movie.isFavourite),
      isInWatchlist: Boolean(movie.isInWatchlist)
    }];

    return this.attachTagsToMovies(movies)[0];
  }

  // Get movie by ID
  getMovieById(id: number): Movie | null {
    const result = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as unknown;
    if (!result) return null;

    const movie = result as Movie;
    const movies = [{
      ...movie,
      isFavourite: Boolean(movie.isFavourite),
      isInWatchlist: Boolean(movie.isInWatchlist)
    }];

    return this.attachTagsToMovies(movies)[0];
  }

  // Search movies
  searchMovies(query: string): Movie[] {
    const moviesRaw = this.db.prepare(`
      SELECT * FROM movies 
      WHERE title LIKE ? OR description LIKE ? OR code LIKE ? 
      ORDER BY title
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as unknown as Movie[];

    const movies = moviesRaw.map(movie => ({
      ...movie,
      isFavourite: Boolean((movie as Movie).isFavourite),
      isInWatchlist: Boolean((movie as Movie).isInWatchlist)
    })) as Movie[];

    return this.attachTagsToMovies(movies);
  }

  // Toggle favorite status
  toggleFavorite(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;

    const newStatus = !movie.isFavourite;
    const result = this.db.prepare('UPDATE movies SET isFavourite = ? WHERE id = ?').run(newStatus ? 1 : 0, id);

    if (result.changes > 0) {
      return newStatus;
    }

    return movie.isFavourite;
  }

  // Toggle watchlist status
  toggleWatchlist(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;

    const newStatus = !movie.isInWatchlist;
    const result = this.db.prepare('UPDATE movies SET isInWatchlist = ? WHERE id = ?').run(newStatus ? 1 : 0, id);

    if (result.changes > 0) {
      return newStatus;
    }

    return movie.isInWatchlist;
  }

  // Update movie rating
  updateRating(id: number, rating: number): boolean {
    if (rating < 1 || rating > 10) {
      throw new Error('Rating must be between 1 and 10');
    }

    const movie = this.getMovieById(id);
    if (!movie) return false;

    const result = this.db.prepare('UPDATE movies SET rating = ? WHERE id = ?').run(rating, id);

    return result.changes > 0;
  }

  // Update movie with comprehensive field support including tags
  updateMovie(id: number, updates: {
    title?: string;
    description?: string;
    code?: string;
    publishedAt?: string;
    coverUrl?: string;
    videoUrl?: string;
    tags?: string[];
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

    // Handle tags update separately
    if (updates.tags !== undefined) {
      this.updateMovieTags(id, updates.tags);
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
      // If only tags were updated, we return true if we reached here
      // (implied success of tags update)
      return updates.tags !== undefined;
    }

    updateValues.push(id);

    const query = `UPDATE movies SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = this.db.prepare(query).run(...updateValues);

    return result.changes > 0 || (updates.tags !== undefined);
  }

  // Get movie by code
  getMovieByCode(code: string, excludeId?: number): Movie | null {
    let query = 'SELECT * FROM movies WHERE code = ?';
    const params: unknown[] = [code];

    if (excludeId !== undefined) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const movieResult = this.db.prepare(query).get(...params) as unknown as Movie | undefined;

    if (!movieResult) return null;

    const movie = {
      ...movieResult,
      isFavourite: Boolean(movieResult.isFavourite),
      isInWatchlist: Boolean(movieResult.isInWatchlist)
    } as Movie;

    const moviesWithTags = this.attachTagsToMovies([movie]);
    return moviesWithTags[0];
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

  // Create a new movie with tags
  createMovie(movieData: MovieCreatePayload): Movie {
    const rating = movieData.rating ?? 5;
    const publishedAt = movieData.publishedAt || new Date().toISOString().split('T')[0];

    const validationErrors: string[] = [];

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

    let newMovieId: number | bigint;

    const transaction = this.db.transaction(() => {
      const result = stmt.run(
        movieData.code.trim(),
        movieData.title.trim(),
        movieData.description?.trim() || '',
        movieData.videoUrl.trim(),
        movieData.coverUrl.trim(),
        rating,
        publishedAt
      );
      newMovieId = result.lastInsertRowid;

      // Add tags if present
      if (movieData.tags && movieData.tags.length > 0) {
        this.addTagsToMovie(Number(newMovieId), movieData.tags);
      }
    });

    transaction();

    // Fetch and return the created movie
    const createdMovie = this.getMovieById(Number(newMovieId!));

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

    if (movieData.rating !== undefined) {
      if (movieData.rating < 1 || movieData.rating > 10) {
        errors.push('Rating must be between 1 and 10');
      }
    }

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
          if (movie.code && this.checkMovieCodeExists(movie.code)) {
            result.skipped++;
            return;
          }

          const validation = this.validateMovieData(movie);
          if (!validation.isValid) {
            result.errors.push({
              row: index + 1,
              error: validation.errors.join(', ')
            });
            return;
          }

          const insertResult = stmt.run(
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

          // Handle tags if present in import
          if (movie.tags && Array.isArray(movie.tags)) {
            this.addTagsToMovie(Number(insertResult.lastInsertRowid), movie.tags);
          }

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

  // Tag Management Methods

  /**
   * Get all tags with usage counts
   */
  getAllTags(): Tag[] {
    return this.db.prepare(`
        SELECT t.id, t.name, COUNT(mt.movie_id) as count 
        FROM tags t 
        LEFT JOIN movie_tags mt ON t.id = mt.tag_id 
        GROUP BY t.id 
        ORDER BY t.name
    `).all() as Tag[];
  }

  /**
   * Create a new tag
   */
  createTag(name: string): Tag {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Tag name required');

    try {
      const result = this.db.prepare('INSERT INTO tags (name) VALUES (?)').run(trimmedName);
      return { id: Number(result.lastInsertRowid), name: trimmedName, count: 0 };
    } catch (error) {
      if (String(error).includes('UNIQUE constraint failed')) {
        throw new Error('Tag already exists');
      }
      throw error;
    }
  }

  /**
   * Update tag name
   */
  updateTag(id: number, name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Tag name required');

    const result = this.db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(trimmedName, id);
    if (result.changes === 0) throw new Error('Tag not found or no change');
  }

  /**
   * Delete tag
   */
  deleteTag(id: number): void {
    // Logic handled by foreign key ON DELETE CASCADE, but explicit transaction safe
    const transaction = this.db.transaction(() => {
      this.db.prepare('DELETE FROM movie_tags WHERE tag_id = ?').run(id);
      this.db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    });
    transaction();
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

  getPlaybackProgress(movieId: number): { movieId: number; progressSeconds: number; durationSeconds: number; updatedAt: string } | null {
    const row = this.db.prepare(`
      SELECT movie_id as movieId, progress_seconds as progressSeconds, duration_seconds as durationSeconds, updatedAt
      FROM play_history
      WHERE movie_id = ?
    `).get(movieId) as { movieId: number; progressSeconds: number; durationSeconds: number; updatedAt: string } | undefined;

    return row ?? null;
  }

  upsertPlaybackProgress(movieId: number, progressSeconds: number, durationSeconds: number): void {
    // Clear history when movie is effectively finished
    const completionThreshold = Math.max(durationSeconds - 5, durationSeconds * 0.95);
    if (durationSeconds > 0 && progressSeconds >= completionThreshold) {
      this.db.prepare('DELETE FROM play_history WHERE movie_id = ?').run(movieId);
      return;
    }

    this.db.prepare(`
      INSERT INTO play_history (movie_id, progress_seconds, duration_seconds, updatedAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(movie_id) DO UPDATE SET
        progress_seconds = excluded.progress_seconds,
        duration_seconds = excluded.duration_seconds,
        updatedAt = CURRENT_TIMESTAMP
    `).run(movieId, progressSeconds, durationSeconds);
  }

  getPlaybackHistory(limit: number): Array<{ movieId: number; progressSeconds: number; durationSeconds: number; updatedAt: string; movie: Movie }> {
    const rows = this.db.prepare(`
      SELECT
        ph.movie_id as movieId,
        ph.progress_seconds as progressSeconds,
        ph.duration_seconds as durationSeconds,
        ph.updatedAt,
        m.id,
        m.code,
        m.title,
        m.description,
        m.videoUrl,
        m.coverUrl,
        m.isFavourite,
        m.isInWatchlist,
        m.rating,
        m.createdAt,
        m.publishedAt
      FROM play_history ph
      JOIN movies m ON m.id = ph.movie_id
      ORDER BY ph.updatedAt DESC
      LIMIT ?
    `).all(limit) as Array<{
      movieId: number;
      progressSeconds: number;
      durationSeconds: number;
      updatedAt: string;
      id: number;
      code: string;
      title: string;
      description: string;
      videoUrl: string;
      coverUrl: string;
      isFavourite: number | boolean;
      isInWatchlist: number | boolean;
      rating: number;
      createdAt: string;
      publishedAt: string;
    }>;

    return rows.map((row) => {
      const movie: Movie = {
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description,
        videoUrl: row.videoUrl,
        coverUrl: row.coverUrl,
        isFavourite: Boolean(row.isFavourite),
        isInWatchlist: Boolean(row.isInWatchlist),
        rating: row.rating,
        createdAt: row.createdAt,
        publishedAt: row.publishedAt,
        tags: this.getTagsForMovie(row.id),
      };

      return {
        movieId: row.movieId,
        progressSeconds: row.progressSeconds,
        durationSeconds: row.durationSeconds,
        updatedAt: row.updatedAt,
        movie,
      };
    });
  }
}

// Export singleton instance
export const movieDB = new MovieDatabase();
