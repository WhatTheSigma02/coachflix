import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Movie } from '../types/movie';
import { searchMulti, getImageUrl } from '../api/imdb';

interface SearchBarProps {
  onMovieClick: (movie: Movie) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onMovieClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMovies = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchMulti(query);
        setResults(response.results.slice(0, 8)); // Limit to 8 results
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (movie: Movie) => {
    onMovieClick(movie);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getTitle = (movie: Movie) => movie.title || movie.name || 'Unknown Title';
  const getReleaseYear = (movie: Movie) => {
    const date = movie.release_date || movie.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies and TV shows..."
          className="w-full bg-gray-800 text-white pl-10 pr-10 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none transition-colors duration-200"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            results.map((movie) => (
              <div
                key={`${movie.media_type}-${movie.id}`}
                onClick={() => handleResultClick(movie)}
                className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-200 border-b border-gray-800 last:border-b-0"
              >
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={getTitle(movie)}
                  className="w-12 h-16 object-cover rounded flex-shrink-0"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{getTitle(movie)}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="capitalize">{movie.media_type}</span>
                    {getReleaseYear(movie) && (
                      <>
                        <span>•</span>
                        <span>{getReleaseYear(movie)}</span>
                      </>
                    )}
                    {movie.vote_average > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-400">★ {movie.vote_average.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : query.trim() && !loading ? (
            <div className="p-4 text-center text-gray-400">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;