import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, VolumeX, Volume2, Plus, Minus, Music, List, X } from 'lucide-react';

interface AudioTrack {
    _id: string;
    name: string;
    artist: string;
    audioUrl: string;
    imageUrl?: string;
}

interface AudioPlayerProps {
    tracks: AudioTrack[];
    onTracksReorder: (reorderedTracks: AudioTrack[]) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ tracks, onTracksReorder }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMinimized, setIsMinimized] = useState(true);
    const [reorderedTracks, setReorderedTracks] = useState<AudioTrack[]>(tracks);

    useEffect(() => {
        setReorderedTracks(tracks);
    }, [tracks]);

    useEffect(() => {
        if (audioRef.current && reorderedTracks.length > 0) {
            audioRef.current.src = reorderedTracks[currentTrackIndex].audioUrl;
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed on track change:", e));
            }
        } else if (audioRef.current && reorderedTracks.length === 0) {
            audioRef.current.src = '';
            setIsPlaying(false);
        }
    }, [currentTrackIndex, reorderedTracks]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed on isPlaying change:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleActualPlay = () => {
            if (!isPlaying) {
                setIsPlaying(true);
            }
        };
        const handleActualPause = () => {
            if (isPlaying) {
                setIsPlaying(false);
            }
        };

        const handleEnded = () => {
            handleNextTrack();
        };

        audio.addEventListener('play', handleActualPlay);
        audio.addEventListener('pause', handleActualPause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('play', handleActualPlay);
            audio.removeEventListener('pause', handleActualPause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isPlaying, reorderedTracks, currentTrackIndex]);

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handleNextTrack = useCallback(() => {
        if (reorderedTracks.length === 0) return;
        setCurrentTrackIndex(prevIndex => (prevIndex + 1) % reorderedTracks.length);
        setIsPlaying(true);
    }, [reorderedTracks]);

    const handlePrevTrack = () => {
        if (reorderedTracks.length === 0) return;
        setCurrentTrackIndex(prevIndex => (prevIndex - 1 + reorderedTracks.length) % reorderedTracks.length);
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
            let clickX = e.clientX - rect.left;
            let width = rect.width;
            let percent = Math.max(0, Math.min(1, clickX / width));

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

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.dataTransfer.setData("trackIndex", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData("trackIndex"));
        const newTracks = [...reorderedTracks];
        const [draggedTrack] = newTracks.splice(dragIndex, 1);
        newTracks.splice(dropIndex, 0, draggedTrack);

        setReorderedTracks(newTracks);
        onTracksReorder(newTracks);

        // Adjust currentTrackIndex if the current track was moved
        if (dragIndex === currentTrackIndex) {
            setCurrentTrackIndex(dropIndex);
        } else if (dragIndex < currentTrackIndex && dropIndex >= currentTrackIndex) {
            setCurrentTrackIndex(prev => prev - 1);
        } else if (dragIndex > currentTrackIndex && dropIndex <= currentTrackIndex) {
            setCurrentTrackIndex(prev => prev + 1);
        }
    };


    if (reorderedTracks.length === 0) {
        return (
            <div className="fixed bottom-6 right-6 bg-gradient-to-br from-black to-gray-800 p-6 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-700/50 text-black max-w-sm">
                <div className="flex items-center justify-center space-x-3">
                    <Music className="text-black" size={24} />
                    <span className="text-black">Musiqi yoxdur. Zəhmət olmasa siyahıya mahnı əlavə edin.</span>
                </div>
            </div>
        );
    }

    const currentTrack = reorderedTracks[currentTrackIndex];

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-6 right-6 bg-gradient-to-br from-black to-gray-800 p-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-700/50 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <Music className="text-black" size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-black font-medium text-sm truncate max-w-32">
                            {currentTrack.name}
                        </p>
                        <p className="text-black text-xs truncate max-w-32">
                            {currentTrack.artist}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 bg-gradient-to-b from-[#eeecf2] to-[#E7D8FF] p-6 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-700/50 text-black max-w-sm">
            <button
                onClick={() => setIsMinimized(true)}
                className="absolute top-2 right-2 text-black hover:text-black transition-colors duration-200"
                title="Kiçilt"
            >
                <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                <Music size={20} className="text-amber-400" /> Musiqi Playeri
            </h3>

            <div className="flex items-center space-x-4 mb-4">
                {currentTrack.imageUrl && (
                    <img
                        src={currentTrack.imageUrl}
                        alt={currentTrack.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    />
                )}
                <div className="flex-1">
                    <p className="font-semibold text-lg">{currentTrack.name}</p>
                    <p className="text-black text-sm">{currentTrack.artist}</p>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={handleNextTrack}
            />

            <div
                className="w-full bg-gray-700 rounded-full h-1.5 mb-2 cursor-pointer relative"
                onClick={handleSeek}
            >
                <div
                    className="bg-amber-500 h-1.5 rounded-full absolute top-0 left-0"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-black mb-4">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
                <button onClick={handlePrevTrack} className="text-black hover:text-black transition-colors">
                    <SkipBack size={28} />
                </button>
                <button
                    onClick={handlePlayPause}
                    className="bg-gradient-to-b from-[#d7c6f5] to-[#c2a4f0] p-3 rounded-full text-black shadow-lg transition-colors"
                >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button onClick={handleNextTrack} className="text-black hover:text-black transition-colors">
                    <SkipForward size={28} />
                </button>
            </div>

            <div className="flex items-center justify-between text-black">
                <div className="flex items-center space-x-2">
                    <button onClick={handleToggleMute} className="hover:text-black transition-colors">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button onClick={() => handleVolumeChange('decrease')} className="hover:text-black transition-colors">
                        <Minus size={20} />
                    </button>
                    <span className="w-8 text-center text-sm">{Math.round(volume * 100)}%</span>
                    <button onClick={() => handleVolumeChange('increase')} className="hover:text-black transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
                <button onClick={() => setShowPlaylist(prev => !prev)} className="hover:text-black transition-colors flex items-center gap-1">
                    <List size={20} /> Playlist
                </button>
            </div>

            {showPlaylist && (
                <div className="mt-4 max-h-48 overflow-y-auto custom-scrollbar border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-2">Playlist</h4>
                    <ul>
                        {reorderedTracks.map((track, index) => (
                            <li
                                key={track._id}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${index === currentTrackIndex ? 'bg-gradient-to-b from-[#cbb1fd] to-[#bb99f3] text-black' : 'hover:bg-gray-200'}`}
                                onClick={() => { setCurrentTrackIndex(index); setIsPlaying(true); }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <span className="text-sm">{track.name} - {track.artist}</span>
                                {index === currentTrackIndex && isPlaying && <Play size={16} />}
                                {index === currentTrackIndex && !isPlaying && <Pause size={16} />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;