import React from 'react';
import { Movie } from '../types/movie';
import { getImageUrl } from '../api/tmdb';
import { getMediaProgress } from '../utils/progress';

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onMovieClick }) => {
  const mediaType = movie.media_type || 'movie';
  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const progress = getMediaProgress(movie.id, mediaType);
  
  const progressPercentage = progress 
    ? Math.min((progress.progress.watched / progress.progress.duration) * 100, 100)
    : 0;

  return (
    <div 
      className="flex-shrink-0 w-48 cursor-pointer group transition-all duration-300 hover:scale-105"
      onClick={() => onMovieClick(movie)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={title}
          className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold text-sm line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-yellow-400 text-xs">★ {movie.vote_average.toFixed(1)}</span>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-blue-400 capitalize">{mediaType}</span>
              {releaseDate && (
                <span className="text-gray-300">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;