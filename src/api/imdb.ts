import { MovieResponse, MovieCategory, Movie, ImdbApiTitle, ImdbApiSeason, ImdbApiEpisode } from '../types/movie';

const BASE_URL = 'https://api.imdbapi.dev';

export const getImageUrl = (path: string | null): string => {
  if (!path) return '/placeholder-movie.jpg';
  return path; // IMDb API provides full URLs
};

const fetchImdbApi = async (endpoint: string, params: Record<string, any> = {}): Promise<any> => {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    // Handle array parameters
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from IMDb API:', error);
    throw error;
  }
};

const mapImdbTitleToMovie = (imdbTitle: ImdbApiTitle): Movie => {
  const isTV = imdbTitle.type === 'tvSeries' || imdbTitle.type === 'tvMiniSeries';
  
  return {
    id: imdbTitle.id,
    title: imdbTitle.primaryTitle,
    name: isTV ? imdbTitle.primaryTitle : undefined,
    poster_path: imdbTitle.primaryImage?.url || null,
    backdrop_path: imdbTitle.primaryImage?.url || null,
    overview: imdbTitle.plot || '',
    release_date: imdbTitle.startYear ? `${imdbTitle.startYear}-01-01` : '',
    first_air_date: isTV && imdbTitle.startYear ? `${imdbTitle.startYear}-01-01` : undefined,
    vote_average: imdbTitle.rating?.aggregateRating || 0,
    media_type: isTV ? 'tv' : 'movie'
  };
};

export const getMoviesByCategory = async (category: MovieCategory): Promise<MovieResponse> => {
  const categoryConfig: Record<MovieCategory, { types: string[], sortBy: string, sortOrder: string }> = {
    trending: { types: ['MOVIE'], sortBy: 'SORT_BY_POPULARITY', sortOrder: 'DESC' },
    popular: { types: ['MOVIE'], sortBy: 'SORT_BY_POPULARITY', sortOrder: 'DESC' },
    top_rated: { types: ['MOVIE'], sortBy: 'SORT_BY_USER_RATING', sortOrder: 'DESC' },
    upcoming: { types: ['MOVIE'], sortBy: 'SORT_BY_RELEASE_DATE', sortOrder: 'DESC' },
    trending_tv: { types: ['TV_SERIES'], sortBy: 'SORT_BY_POPULARITY', sortOrder: 'DESC' },
    popular_tv: { types: ['TV_SERIES'], sortBy: 'SORT_BY_POPULARITY', sortOrder: 'DESC' },
    top_rated_tv: { types: ['TV_SERIES'], sortBy: 'SORT_BY_USER_RATING', sortOrder: 'DESC' },
  };

  const config = categoryConfig[category];
  const params = {
    types: config.types,
    sortBy: config.sortBy,
    sortOrder: config.sortOrder,
    minVoteCount: 1000, // Filter for titles with decent vote counts
  };

  const data = await fetchImdbApi('/titles', params);
  
  const movies = data.titles ? data.titles.map(mapImdbTitleToMovie) : [];
  
  return {
    page: 1,
    results: movies.slice(0, 20), // Limit to 20 results like TMDB
    total_pages: Math.ceil((data.totalCount || 0) / 20),
    total_results: data.totalCount || 0
  };
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
};

export const searchMulti = async (query: string): Promise<MovieResponse> => {
  const data = await fetchImdbApi('/search/titles', { query, limit: 20 });
  
  const movies = data.titles ? data.titles.map(mapImdbTitleToMovie) : [];
  
  return {
    page: 1,
    results: movies,
    total_pages: 1,
    total_results: movies.length
  };
};

export const getTVSeasons = async (tvId: string): Promise<any> => {
  try {
    // Get the main title info first
    const titleData = await fetchImdbApi(`/titles/${tvId}`);
    
    // Get seasons data
    const seasonsData = await fetchImdbApi(`/titles/${tvId}/seasons`);
    
    return {
      ...titleData,
      seasons: seasonsData.seasons || []
    };
  } catch (error) {
    console.error('Error fetching TV seasons:', error);
    throw error;
  }
};

export const getTVSeason = async (tvId: string, seasonNumber: number): Promise<any> => {
  try {
    const data = await fetchImdbApi(`/titles/${tvId}/episodes`, { 
      season: seasonNumber.toString() 
    });
    
    const episodes = data.episodes ? data.episodes.map((episode: ImdbApiEpisode) => ({
      id: episode.id,
      name: episode.title,
      episode_number: episode.episodeNumber,
      season_number: parseInt(episode.season),
      overview: episode.plot || '',
      still_path: episode.primaryImage?.url || null
    })) : [];
    
    return {
      episodes
    };
  } catch (error) {
    console.error('Error fetching TV season:', error);
    throw error;
  }
};