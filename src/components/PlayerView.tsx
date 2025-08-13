import React, { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { ArrowLeft, Play, ChevronDown } from 'lucide-react';
import { getTVSeasons, getTVSeason } from '../api/tmdb';
import { updateMediaProgress, getMediaProgress } from '../utils/progress';

interface PlayerViewProps {
  movie: Movie;
  onBack: () => void;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  overview: string;
  still_path: string | null;
}

const PlayerView: React.FC<PlayerViewProps> = ({ movie, onBack }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  
  const mediaType = movie.media_type || 'movie';
  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const progress = getMediaProgress(movie.id, mediaType);

  useEffect(() => {
    if (mediaType === 'tv') {
      fetchTVData();
    }
  }, [movie.id, mediaType]);

  useEffect(() => {
    if (mediaType === 'tv' && seasons.length > 0) {
      // Set initial season and episode from progress or default to 1,1
      const initialSeason = progress?.last_season_watched || 1;
      const initialEpisode = progress?.last_episode_watched || 1;
      setSelectedSeason(initialSeason);
      setSelectedEpisode(initialEpisode);
      fetchEpisodes(initialSeason);
    }
  }, [seasons, progress]);

  useEffect(() => {
    if (mediaType === 'tv') {
      fetchEpisodes(selectedSeason);
    }
  }, [selectedSeason]);

  useEffect(() => {
    // Listen for progress updates from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'progress') {
        const { watched, duration } = event.data;
        updateMediaProgress(
          movie.id,
          mediaType,
          title,
          movie.poster_path,
          movie.backdrop_path,
          watched,
          duration,
          mediaType === 'tv' ? selectedSeason : undefined,
          mediaType === 'tv' ? selectedEpisode : undefined
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [movie, mediaType, title, selectedSeason, selectedEpisode]);

  const fetchTVData = async () => {
    try {
      setLoading(true);
      const tvData = await getTVSeasons(movie.id);
      setSeasons(tvData.seasons.filter((season: Season) => season.season_number > 0));
    } catch (error) {
      console.error('Error fetching TV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (seasonNumber: number) => {
    try {
      setLoading(true);
      const seasonData = await getTVSeason(movie.id, seasonNumber);
      setEpisodes(seasonData.episodes);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1);
    setShowSeasonDropdown(false);
  };

  const getPlayerUrl = () => {
    if (mediaType === 'movie') {
      return `https://vidfast.pro/movie/${movie.id}`;
    } else {
      return `https://vidfast.pro/tv/${movie.id}/${selectedSeason}/${selectedEpisode}?autoPlay=true`;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Movies</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {title}
          </h1>
          <div className="flex items-center space-x-4 text-gray-300">
            <span className="text-yellow-400">★ {movie.vote_average.toFixed(1)}</span>
            <span className="text-blue-400 capitalize">{mediaType}</span>
            {releaseDate && <span>{new Date(releaseDate).getFullYear()}</span>}
          </div>
          {movie.overview && (
            <p className="text-gray-300 mt-4 max-w-3xl leading-relaxed">
              {movie.overview}
            </p>
          )}
        </div>

        {/* TV Show Controls */}
        {mediaType === 'tv' && seasons.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* Season Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <span>Season {selectedSeason}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSeasonDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 min-w-40">
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {season.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Selector */}
            {episodes.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Episode:</span>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
                >
                  {episodes.map((episode) => (
                    <option key={episode.id} value={episode.episode_number}>
                      {episode.episode_number}. {episode.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 16:9 Aspect Ratio Container */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={getPlayerUrl()}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allowFullScreen
            allow="encrypted-media"
            title={`${title} Player`}
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;