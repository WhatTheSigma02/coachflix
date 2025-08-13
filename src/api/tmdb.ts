import { MovieResponse, MovieCategory, Movie } from '../types/movie';

const API_KEY = 'e15bbb7cf91b1a0830bcbf694791fb6c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getImageUrl = (path: string | null): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `${IMAGE_BASE_URL}${path}`;
};

const fetchMovies = async (endpoint: string): Promise<MovieResponse> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const getMoviesByCategory = async (category: MovieCategory): Promise<MovieResponse> => {
  const endpoints: Record<MovieCategory, string> = {
    trending: '/trending/movie/week',
    popular: '/movie/popular',
    top_rated: '/movie/top_rated',
    upcoming: '/movie/upcoming',
    trending_tv: '/trending/tv/week',
    popular_tv: '/tv/popular',
    top_rated_tv: '/tv/top_rated',
  };

  return fetchMovies(endpoints[category]);
};

export const getCategoryDisplayName = (category: MovieCategory): string => {
  const displayNames: Record<MovieCategory, string> = {
    trending: 'Trending Now',
    popular: 'Popular Movies',
    top_rated: 'Top Rated',
    upcoming: 'Coming Soon',
    trending_tv: 'Trending TV Shows',
    popular_tv: 'Popular TV Shows',
    top_rated_tv: 'Top Rated TV Shows',
  };

  return displayNames[category];
}