import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg"></div>
    </div>
  );
};

export default SkeletonCard;