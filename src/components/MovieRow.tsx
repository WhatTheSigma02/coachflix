import React, { useState, useEffect } from 'react';
import { Movie, MovieCategory } from '../types/movie';
import { getMoviesByCategory, getCategoryDisplayName } from '../api/imdb';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  category: MovieCategory;
  onMovieClick: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ category, onMovieClick }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMoviesByCategory(category);
        setMovies(response.results);
      } catch (err) {
        setError('Failed to load movies. Please check your API key.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category]);

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`movie-row-${category}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 px-4">
          {getCategoryDisplayName(category)}
        </h2>
        <div className="px-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4">
        {getCategoryDisplayName(category)}
      </h2>
      
      <div className="relative group">
        <button
          onClick={() => scrollContainer('left')}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => scrollContainer('right')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div
          id={`movie-row-${category}`}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 10 }, (_, index) => (
                <SkeletonCard key={index} />
              ))
            : movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={onMovieClick}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;