import React from 'react';
import { Film } from 'lucide-react';
import SearchBar from './SearchBar';
import { Movie } from '../types/movie';

interface NavbarProps {
  onMovieClick: (movie: Movie) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMovieClick }) => {
  return (
    <nav className="bg-black bg-opacity-90 backdrop-blur-sm px-4 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <Film className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-white">CoachFlix</h1>
        </div>
        <SearchBar onMovieClick={onMovieClick} />
      </div>
    </nav>
  );
};

export default Navbar;