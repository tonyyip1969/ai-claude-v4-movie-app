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

export interface PaginatedMovies {
  movies: Movie[];
  total: number;
  totalPages: number;
  currentPage: number;
}
