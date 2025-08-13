import React, { useState } from 'react';
import { Movie, MovieCategory } from './types/movie';
import Navbar from './components/Navbar';
import MovieRow from './components/MovieRow';
import PlayerView from './components/PlayerView';

const categories: MovieCategory[] = [
  'trending', 
  'popular', 
  'top_rated', 
  'upcoming',
  'trending_tv',
  'popular_tv',
  'top_rated_tv'
];

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleBack = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar onMovieClick={handleMovieClick} />
      
      {selectedMovie ? (
        <PlayerView movie={selectedMovie} onBack={handleBack} />
      ) : (
        <main className="pt-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Discover Movies & TV Shows
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl">
                Browse through trending, popular, top-rated movies and TV shows. 
                Click on any poster to start watching instantly.
              </p>
            </div>

            {categories.map((category) => (
              <MovieRow
                key={category}
                category={category}
                onMovieClick={handleMovieClick}
              />
            ))}
          </div>
        </main>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;