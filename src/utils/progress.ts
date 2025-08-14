import { MediaProgress } from '../types/movie';

const STORAGE_KEY = 'coachflix_progress';

export const getStoredProgress = (): Record<string, MediaProgress> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    
    // Clean up old entries (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const cleaned: Record<string, MediaProgress> = {};
    
    Object.entries(parsed).forEach(([key, value]) => {
      if ((value as MediaProgress).last_updated > thirtyDaysAgo) {
        cleaned[key] = value as MediaProgress;
      }
    });
    
    return cleaned;
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
    return {};
  }
};

export const saveProgress = (progress: Record<string, MediaProgress>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
};

export const updateMediaProgress = (
  id: string,
  type: 'movie' | 'tv',
  title: string,
  poster_path: string | null,
  backdrop_path: string | null,
  watched: number,
  duration: number,
  season?: number,
  episode?: number
) => {
  const progress = getStoredProgress();
  const key = `${type === 'movie' ? 'm' : 't'}_${id}`;
  
  const mediaProgress: MediaProgress = {
    id,
    type,
    title,
    poster_path,
    backdrop_path,
    progress: { watched, duration },
    last_updated: Date.now(),
  };

  if (type === 'tv' && season !== undefined && episode !== undefined) {
    mediaProgress.last_season_watched = season;
    mediaProgress.last_episode_watched = episode;
    mediaProgress.show_progress = progress[key]?.show_progress || {};
    mediaProgress.show_progress[`s${season}e${episode}`] = {
      season,
      episode,
      progress: { watched, duration },
      last_updated: Date.now(),
    };
  }

  progress[key] = mediaProgress;
  saveProgress(progress);
  
  return mediaProgress;
};

export const getMediaProgress = (id: string, type: 'movie' | 'tv'): MediaProgress | null => {
  const progress = getStoredProgress();
  const key = `${type === 'movie' ? 'm' : 't'}_${id}`;
  return progress[key] || null;
};

export const removeMediaProgress = (id: string, type: 'movie' | 'tv') => {
  const progress = getStoredProgress();
  const key = `${type === 'movie' ? 'm' : 't'}_${id}`;
  delete progress[key];
  saveProgress(progress);
};