export interface Movie {
  id: number;
  title: string;
  name?: string; // TV shows use 'name' instead of 'title'
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  first_air_date?: string; // TV shows use 'first_air_date'
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export type MovieCategory = 'trending' | 'popular' | 'top_rated' | 'upcoming' | 'trending_tv' | 'popular_tv' | 'top_rated_tv';

export interface WatchProgress {
  watched: number;
  duration: number;
}

export interface EpisodeProgress {
  season: number;
  episode: number;
  progress: WatchProgress;
  last_updated: number;
}

export interface MediaProgress {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: WatchProgress;
  last_season_watched?: number;
  last_episode_watched?: number;
  show_progress?: Record<string, EpisodeProgress>;
  last_updated: number;
}