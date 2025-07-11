// src/components/AudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, VolumeX, Volume2, Plus, Minus, Music, List, X } from 'lucide-react';

interface AudioTrack {
    id: string;
    name: string;
    url: string;
}

interface AudioPlayerProps {
    tracks: AudioTrack[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ tracks }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // Vurğu: isMinimized default olaraq 'true' olaraq təyin edildi
    const [isMinimized, setIsMinimized] = useState(true); 

    // Track dəyişdikdə və ya yükləndikdə audionu yenilə
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load(); // Yeni track-i yüklə
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    }, [currentTrackIndex]);

    // Oynatma statusunu idarə et
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Səs səviyyəsini idarə et
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleNextTrack = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex + 1) % tracks.length);
        setIsPlaying(true);
    };

    const handlePrevTrack = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleVolumeChange = (type: 'increase' | 'decrease') => {
        setVolume(prevVolume => {
            let newVolume;
            if (type === 'increase') {
                newVolume = Math.min(1, prevVolume + 0.1);
            } else {
                newVolume = Math.max(0, prevVolume - 0.1);
            }
            return parseFloat(newVolume.toFixed(1));
        });
    };

    const handleToggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.right) / rect.width;
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (tracks.length === 0) {
        return (
            <div className="fixed bottom-6 right-6 bg-gradient-to-br from-black to-gray-800 p-6 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-700/50 text-white max-w-sm">
                <div className="flex items-center justify-center space-x-3">
                    <Music className="text-gray-400" size={24} />
                    <span className="text-gray-300">Musiqi yoxdur. Zəhmət olmasa siyahıya mahnı əlavə edin.</span>
                </div>
            </div>
        );
    }

    const currentTrack = tracks[currentTrackIndex];

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 bg-gradient-to-br from-black-900 to-gray-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700/50 cursor-pointer transition-all duration-300 hover:scale-105"
                 onClick={() => setIsMinimized(false)}>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <Music className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-medium text-sm truncate max-w-32">
                            {currentTrack.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handlePlayPause();
                                }}
                                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <div className="flex-1 bg-white/20 rounded-full h-1">
                                <div 
                                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-700/50 overflow-hidden max-w-sm z-50">
            <audio 
                ref={audioRef} 
                src={currentTrack.url} 
                onEnded={handleNextTrack}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
            />

            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <Music className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Now Playing</h3>
                        <p className="text-gray-400 text-sm">Track {currentTrackIndex + 1} of {tracks.length}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 transition-colors"
                    title="Kiçilt"
                >
                    <Minus size={20} />
                </button>
            </div>

            {/* Track Info */}
            <div className="px-4 pb-4">
                <h4 className="text-white font-semibold text-xl mb-2 truncate">
                    {currentTrack.name}
                </h4>
                
                {/* Progress Bar */}
                <div className="mb-4">
                    <div 
                        className="w-full bg-gray-700 rounded-full h-2 cursor-pointer relative overflow-hidden"
                        onClick={handleSeek}
                    >
                        <div 
                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300 relative"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        >
                            <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full -translate-y-0.5 shadow-lg" />
                        </div>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                        onClick={handlePrevTrack}
                        className="p-3 rounded-full hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200"
                        title="Əvvəlki Mahnı"
                    >
                        <SkipBack size={24} />
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        title={isPlaying ? 'Fasilə Ver' : 'Çal'}
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>
                    <button
                        onClick={handleNextTrack}
                        className="p-3 rounded-full hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200"
                        title="Növbəti Mahnı"
                    >
                        <SkipForward size={24} />
                    </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <button
                        onClick={handleToggleMute}
                        className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        title={isMuted ? 'Səsi Aç' : 'Səsi Kəs'}
                    >
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={() => handleVolumeChange('decrease')}
                        className="p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        title="Səsi Azalt"
                    >
                        <Minus size={16} />
                    </button>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5 mx-2">
                        <div 
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                    <button
                        onClick={() => handleVolumeChange('increase')}
                        className="p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        title="Səsi Artır"
                    >
                        <Plus size={16} />
                    </button>
                    <span className="text-gray-400 text-sm w-10 text-center">{Math.round(volume * 100)}%</span>
                </div>

                {/* Playlist Toggle */}
                <button
                    onClick={() => setShowPlaylist(prev => !prev)}
                    className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2"
                    title={showPlaylist ? 'Playlisti Gizlə' : 'Playlistə Bax'}
                >
                    <List size={20} />
                    <span>{showPlaylist ? 'Playlisti Gizlə' : 'Playlistə Bax'}</span>
                </button>
            </div>

            {/* Playlist */}
            {showPlaylist && (
                <div className="bg-gray-800/50 border-t border-gray-700/50 max-h-64 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-white font-semibold">Playlist</h5>
                            <button
                                onClick={() => setShowPlaylist(false)}
                                className="p-1 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                                title="Playlisti Bağla"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                        index === currentTrackIndex 
                                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30' 
                                            : 'hover:bg-gray-700/30'
                                    }`}
                                    onClick={() => {
                                        setCurrentTrackIndex(index);
                                        setIsPlaying(true);
                                    }}
                                >
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-300 text-sm font-medium">{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${
                                            index === currentTrackIndex ? 'text-white font-semibold' : 'text-gray-300'
                                        }`}>
                                            {track.name}
                                        </p>
                                    </div>
                                    {index === currentTrackIndex && isPlaying && (
                                        <div className="flex items-center space-x-1">
                                            <div className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" />
                                            <div className="w-1 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-1 h-4 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;