import React from 'react';
import { MediaProgress } from '../types/movie';
import { getStoredProgress } from '../utils/progress';
import { Play, Clock } from 'lucide-react';

interface ContinueWatchingProps {
  onMovieClick: (movie: any) => void;
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ onMovieClick }) => {
  const progress = getStoredProgress();
  const recentlyWatched = Object.values(progress)
    .filter(item => item.progress.watched > 0 && item.progress.watched < item.progress.duration * 0.95) // Not fully watched
    .sort((a, b) => b.last_updated - a.last_updated)
    .slice(0, 10); // Show last 10 items

  if (recentlyWatched.length === 0) {
    return null;
  }

  const formatProgress = (watched: number, duration: number) => {
    const percentage = Math.min((watched / duration) * 100, 100);
    return percentage;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleItemClick = (item: MediaProgress) => {
    const movie = {
      id: item.id,
      title: item.title,
      name: item.type === 'tv' ? item.title : undefined,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: '',
      release_date: '',
      first_air_date: item.type === 'tv' ? '' : undefined,
      vote_average: 0,
      media_type: item.type
    };
    onMovieClick(movie);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-4">Continue Watching</h2>
      
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide px-4">
        {recentlyWatched.map((item) => {
          const progressPercentage = formatProgress(item.progress.watched, item.progress.duration);
          
          return (
            <div
              key={`${item.type}_${item.id}`}
              onClick={() => handleItemClick(item)}
              className="flex-shrink-0 w-80 cursor-pointer group transition-all duration-300 hover:scale-105"
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl bg-gray-800">
                <div className="flex">
                  {/* Poster */}
                  <div className="w-24 h-36 flex-shrink-0">
                    <img
                      src={item.poster_path || '/placeholder-movie.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      
                      {item.type === 'tv' && item.last_season_watched && item.last_episode_watched && (
                        <p className="text-gray-400 text-xs mb-2">
                          S{item.last_season_watched} E{item.last_episode_watched}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.progress.watched)} watched</span>
                      </div>
                    </div>
                    
                    <div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                        <div
                          className="bg-red-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {Math.round(progressPercentage)}% complete
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-blue-400">
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatching;