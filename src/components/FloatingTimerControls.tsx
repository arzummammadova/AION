// src/components/FloatingTimerControls.tsx
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Pause, Square, Play, GripVertical, Timer } from 'lucide-react';
import { RootState } from '@/redux/store';

interface FloatingTimerControlsProps {
    isRunning: boolean;
    currentTimer: RootState['timer']['currentTimer'];
    timeLeft: number;
    initialTime: number;
    handleStartPause: () => Promise<void>;
    handleStopTimer: () => Promise<void>;
    handleReset: () => Promise<void>;
    formatTime: (seconds: number) => string;
}

const FloatingTimerControls: React.FC<FloatingTimerControlsProps> = ({
    isRunning,
    currentTimer,
    timeLeft,
    initialTime,
    handleStartPause,
    handleStopTimer,
    handleReset,
    formatTime,
}) => {
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const draggableRef = useRef<HTMLDivElement>(null);

    // Calculate progress percentage
    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

    useEffect(() => {
        const storedX = localStorage.getItem('floatingTimerX');
        const storedY = localStorage.getItem('floatingTimerY');
        const storedMinimized = localStorage.getItem('floatingTimerMinimized');

        if (storedX && storedY) {
            setPosition({ x: parseFloat(storedX), y: parseFloat(storedY) });
        } else {
            if (typeof window !== 'undefined') {
                setPosition({ x: window.innerWidth - 320, y: window.innerHeight - 200 });
            }
        }

        if (storedMinimized === 'true') {
            setIsMinimized(true);
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === draggableRef.current || (e.target as HTMLElement).closest('.drag-handle')) {
            setIsDragging(true);
            setOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;

        if (draggableRef.current) {
            const maxX = window.innerWidth - draggableRef.current.offsetWidth;
            const maxY = window.innerHeight - draggableRef.current.offsetHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
        }

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        localStorage.setItem('floatingTimerX', position.x.toString());
        localStorage.setItem('floatingTimerY', position.y.toString());
    };

    const toggleMinimize = () => {
        setIsMinimized(prev => {
            const newState = !prev;
            localStorage.setItem('floatingTimerMinimized', newState.toString());
            return newState;
        });
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, offset, position]);

    const showPlayIcon = !isRunning && (timeLeft > 0 || initialTime > 0);
    const showPauseIcon = isRunning;
    const showStopButton = isRunning || currentTimer?.status === 'paused';

    return (
        <div
            ref={draggableRef}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 9999,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            }}
            className={`
                bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl 
                border border-white/10 rounded-2xl shadow-2xl
                ${isHovered || isDragging ? 'shadow-amber-500/20' : ''}
                ${isMinimized ? 'w-16 h-16' : 'min-w-max'}
                overflow-hidden transition-all duration-300 ease-in-out
            `}
        >
            {/* Progress Ring Background */}
            {initialTime > 0 && !isMinimized && (
                <div className="absolute inset-0 rounded-2xl">
                    <svg className="absolute inset-0 w-full h-full">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="2"
                            strokeDasharray="100"
                            strokeDashoffset={100 - progress}
                            className="transition-all duration-1000 ease-out"
                            rx="16"
                        />
                    </svg>
                </div>
            )}

            {/* Minimized State */}
            {isMinimized ? (
                <div 
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={toggleMinimize}
                >
                    <div className="relative">
                        <Timer className="text-amber-400" size={24} />
                        {isRunning && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    {/* Header with drag handle and minimize */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="drag-handle flex items-center space-x-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="text-white/40" size={16} />
                            <span className="text-white/60 text-sm font-medium">Timer</span>
                        </div>
                        <button
                            onClick={toggleMinimize}
                            className="text-white/40 hover:text-white/80 transition-colors duration-200"
                        >
                            <div className="w-4 h-0.5 bg-current rounded-full"></div>
                        </button>
                    </div>

                    {/* Timer Display */}
                    {initialTime > 0 && (
                        <div className="text-center mb-4">
                            <div className="text-4xl font-mono font-bold text-white mb-2">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                <div 
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="text-white/60 text-sm">
                                {Math.round(progress)}% tamamlandı
                            </div>
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center space-x-3">
                        {/* Play/Pause Button */}
                        <button
                            onClick={handleStartPause}
                            className={`
                                group relative p-3 rounded-full transition-all duration-300 ease-out
                                ${isRunning 
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                                    : 'bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                                }
                                text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                            `}
                            title={isRunning ? 'Fasilə Ver' : 'Başlat / Davam Etdir'}
                            disabled={timeLeft === 0 && initialTime === 0 && !currentTimer}
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {showPlayIcon && <Play size={24} className="relative z-10" />}
                            {showPauseIcon && <Pause size={24} className="relative z-10" />}
                        </button>

                        {/* Stop Button */}
                        {showStopButton && (
                            <button
                                onClick={handleStopTimer}
                                className="
                                    group relative p-3 rounded-full transition-all duration-300 ease-out
                                    bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600
                                    text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                "
                                title="Dayandır"
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Square size={24} className="relative z-10" />
                            </button>
                        )}

                        {/* Reset Button */}
                        {(timeLeft > 0 || initialTime > 0) && (
                            <button
                                onClick={handleReset}
                                className="
                                    group relative p-3 rounded-full transition-all duration-300 ease-out
                                    bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600
                                    text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                "
                                title="Sıfırla"
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <RotateCcw size={24} className="relative z-10" />
                            </button>
                        )}
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-3 text-center">
                        <div className={`
                            inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
                            ${isRunning 
                                ? 'bg-green-500/20 text-green-400' 
                                : timeLeft > 0 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-gray-500/20 text-gray-400'
                            }
                        `}>
                            <div className={`
                                w-2 h-2 rounded-full
                                ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-current'}
                            `}></div>
                            <span>
                                {isRunning ? 'Çalışır' : timeLeft > 0 ? 'Fasilə' : 'Hazır'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingTimerControls;