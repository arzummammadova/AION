// src/pages/workspace/index.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Maximize, Minimize2, RotateCcw, History, Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store/store';
import {
    startTimerSession,
    pauseTimerSession,
    completeTimerSession,
    stopTimerSession,
    getUserTimerSessions,
    deleteTimerSession,
    clearCurrentTimer,
    updateTimerSession,
} from '@/redux/features/timerSlice';

import SessionNameModal from '@/components/SessionNameModal';
import HistorySidebar from '@/components/HistorySidebar';
import AudioPlayer from '@/components/AudioPlayer';
import ImageSelector from '@/components/ImageSelector'; // Yeni import
import { getTracks } from '@/redux/features/trackSlice';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const isAuthenticated = context.req.cookies.token;

    if (!isAuthenticated) {
        return {
            redirect: {
                destination: '/auth/login?alert=not-logged-in',
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};

const Index = () => {
    const dispatch: AppDispatch = useDispatch();
    const router = useRouter();
    const { currentTimer, timerSessions, loading, error } = useSelector((state: RootState) => state.timer);
    const { tracks: audioTracksFromRedux, loading: tracksLoading, error: tracksError } = useSelector((state: RootState) => state.tracks);
    const { isDarkMode } = useSelector((state: RootState) => state.theme);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [initialTime, setInitialTime] = useState<number>(0);
    const [isCurrentlyFullScreen, setIsCurrentlyFullScreen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isNameModalAdOpen, setIsNameModalAdOpen] = useState<boolean>(false);
    const [confirmedSessionName, setConfirmedSessionName] = useState<string>('');
    const [backgroundImage, setBackgroundImage] = useState<string>('');

    const fullScreenRef = useRef<HTMLDivElement>(null);
    const tenSecondWarningSound = useRef<HTMLAudioElement | null>(null);
    const endSound = useRef<HTMLAudioElement | null>(null);

    const isRunningRef = useRef(isRunning);
    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    const currentTimerRef = useRef(currentTimer);
    useEffect(() => {
        currentTimerRef.current = currentTimer;
    }, [currentTimer]);

    const timeLeftRef = useRef(timeLeft);
    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    const initialTimeRef = useRef(initialTime);
    useEffect(() => {
        initialTimeRef.current = initialTime;
    }, [initialTime]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            tenSecondWarningSound.current = new Audio('/sounds/ten_second_warning.mp3');
            endSound.current = new Audio('/sounds/stoptime.mp3');
            const storedBackground = localStorage.getItem('pomodoroBackground');
            if (storedBackground) {
                setBackgroundImage(storedBackground);
            }
            else {
                setBackgroundImage('/images/aionbg.png'); // Default fon şəkli
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    useEffect(() => {
        dispatch(getUserTimerSessions());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getTracks());
    }, [dispatch]);

    useEffect(() => {
        if (currentTimer) {
            if (currentTimer.status === 'running') {
                const now = new Date().getTime();
                const startTimeMs = new Date(currentTimer.startTime).getTime();
                const totalPausedTime = currentTimer.totalPausedTime || 0;
                const totalPassedTime = (now - startTimeMs) / 1000;
                const remaining = (currentTimer.selectedDuration * 60) - (totalPassedTime - totalPausedTime);

                setTimeLeft(Math.max(0, Math.floor(remaining)));
                setIsRunning(true);
            } else if (currentTimer.status === 'paused') {
                setTimeLeft((currentTimer.selectedDuration * 60) - currentTimer.elapsedTime);
                setIsRunning(false);
            } else {
                setTimeLeft(0);
                setIsRunning(false);
                setInitialTime(0);
                setConfirmedSessionName('');
            }
            setInitialTime(currentTimer.selectedDuration * 60);
            if (currentTimer.name) {
                setConfirmedSessionName(currentTimer.name);
            }
        } else {
            setTimeLeft(0);
            setInitialTime(0);
            setIsRunning(false);
            setConfirmedSessionName('');
        }
    }, [currentTimer]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            if (timeLeft === 12 && tenSecondWarningSound.current) {
                tenSecondWarningSound.current.currentTime = 0;
                tenSecondWarningSound.current.play();
            }

        } else if (timeLeft === 0 && initialTime > 0 && isRunning) {
            alert("Vaxt bitdi!");
            setIsRunning(false);
            if (interval) {
                clearInterval(interval);
            }
            if (endSound.current) {
                endSound.current.currentTime = 0;
                endSound.current.play();
            }
            if (currentTimer?._id) {
                dispatch(completeTimerSession({ timerId: currentTimer._id, elapsedTime: initialTime }));
            }
            dispatch(getUserTimerSessions());
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, timeLeft, initialTime, dispatch, currentTimer]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isRunningRef.current && currentTimerRef.current?._id) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const setTimerDuration = async (minutes: number) => {
        if (isRunning || (currentTimer && currentTimer.status === 'paused')) {
            if (!window.confirm("Cari taymer sessiyası aktivdir. Yeni müddət seçmək onu sıfırlayacaq. Davam edilsin?")) {
                return;
            }
            if (currentTimer?._id) {
                await dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime: initialTimeRef.current - timeLeftRef.current }));
            }
        }
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        setInitialTime(seconds);
        setIsRunning(false);
        dispatch(clearCurrentTimer());
        setConfirmedSessionName('');
        dispatch(getUserTimerSessions());
    };

    const handleConfirmNameFromModal = (name: string) => {
        setConfirmedSessionName(name);
        alert(`Sessiya adı təsdiqləndi: "${name}"`);
        if (currentTimer && currentTimer.name !== name) {
            dispatch(updateTimerSession({ timerId: currentTimer._id, name: name }));
        }
    };

    const handleStartPause = async () => {
        if (timeLeft === 0 && initialTime === 0) {
            alert("Zəhmət olmasa bir taymer müddəti seçin.");
            return;
        }

        if (!isRunning) {
            const actionResult = await dispatch(
                startTimerSession({
                    selectedDuration: initialTime / 60,
                    name: confirmedSessionName || `Sessiya ${new Date().toLocaleString('az-AZ')}`
                })
            );
            if (startTimerSession.fulfilled.match(actionResult)) {
                alert("Taymer başladı/davam etdirildi!");
            } else {
                alert(`Taymeri başlatarkən xəta: ${actionResult.payload}`);
            }
        } else {
            if (currentTimer?._id) {
                const elapsedTime = initialTime - timeLeft;
                const actionResult = await dispatch(pauseTimerSession({ timerId: currentTimer._id, elapsedTime }));

                if (pauseTimerSession.fulfilled.match(actionResult)) {
                    alert("Taymer fasiləyə verildi!");
                } else {
                    alert(`Taymeri fasiləyə verərkən xəta: ${actionResult.payload}`);
                }
            } else {
                alert("Taymer fasiləyə verilə bilmədi (Cari sessiya tapılmadı).");
            }
        }
    };

    const handleStopTimer = async () => {
        if (currentTimer?._id && (isRunning || currentTimer.status === 'paused')) {
            if (window.confirm("Taymeri tamamilə dayandırmaq istədiyinizə əminsiniz? Bu, sessiyanı bitirəcək.")) {
                const elapsedTime = initialTime - timeLeft;
                const actionResult = await dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime }));

                if (stopTimerSession.fulfilled.match(actionResult)) {
                    alert("Taymer sessiyası dayandırıldı!");
                    dispatch(clearCurrentTimer());
                    dispatch(getUserTimerSessions());
                } else {
                    alert(`Taymeri dayandırarkən xəta: ${actionResult.payload}`);
                }
            }
        } else {
            alert("Hal-hazırda dayandırıla biləcək bir taymer yoxdur.");
        }
    };

    const handleReset = async () => {
        if (currentTimer?._id && (isRunning || currentTimer.status === 'paused')) {
            if (!window.confirm("Cari taymeri sıfırlamaq istədiyinizə əminsiniz? Bu, sessiyanı dayandıracaq və sıfırlayacaq.")) {
                return;
            }
            await dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime: initialTime - timeLeft }));
        }
        setTimeLeft(initialTime);
        setIsRunning(false);
        dispatch(clearCurrentTimer());
        setConfirmedSessionName('');
        alert("Taymer sıfırlandı.");
        dispatch(getUserTimerSessions());
    };

    const handleDeleteTimer = async (timerId: string) => {
        if (window.confirm("Bu taymer sessiyasını silmək istədiyinizə əminsiniz?")) {
            const actionResult = await dispatch(deleteTimerSession(timerId));
            if (deleteTimerSession.fulfilled.match(actionResult)) {
                alert("Taymer sessiyası uğurla silindi.");
                if (currentTimer && currentTimer._id === timerId) {
                    dispatch(clearCurrentTimer());
                    setTimeLeft(0);
                    setInitialTime(0);
                    setIsRunning(false);
                    setConfirmedSessionName('');
                }
            } else {
                alert(`Taymer sessiyası silinərkən xəta: ${actionResult.payload}`);
            }
        }
    };

    const handleEditSessionName = async (timerId: string, currentName: string) => {
        const newName = prompt("Sessiyanın yeni adını daxil edin:", currentName);
        if (newName !== null && newName.trim() !== "") {
            if (newName.trim() === currentName.trim()) {
                alert("Ad dəyişməyib.");
                return;
            }
            const actionResult = await dispatch(updateTimerSession({ timerId, name: newName.trim() }));

            if (updateTimerSession.fulfilled.match(actionResult)) {
                alert("Sessiya adı uğurla yeniləndi.");
                dispatch(getUserTimerSessions());
            } else {
                alert(`Sessiya adı yenilənərkən xəta: ${actionResult.payload}`);
            }
        }
    };

    const handleFullScreen = () => {
        if (fullScreenRef.current) {
            if (fullScreenRef.current.requestFullscreen) {
                fullScreenRef.current.requestFullscreen();
            } else if ((fullScreenRef.current as any).mozRequestFullScreen) {
                (fullScreenRef.current as any).mozRequestFullScreen();
            } else if ((fullScreenRef.current as any).webkitRequestFullscreen) {
                (fullScreenRef.current as any).webkitRequestFullscreen();
            } else if ((fullScreenRef.current as any).msRequestFullscreen) {
                (fullScreenRef.current as any).msRequestFullscreen();
            }
        }
    };

    const handleExitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullScreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsCurrentlyFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getButtonText = () => {
        if (isRunning) {
            return 'Fasilə Ver (Pause)';
        }
        if (currentTimer?.status === 'paused') {
            return 'Davam Etdir (Resume)';
        }
        if (timeLeft === 0 && initialTime === 0) {
            return 'Vaxtı Seç';
        }
        if (currentTimer && (currentTimer.status === 'stopped' || currentTimer.status === 'completed')) {
            return 'Yeni Başlat';
        }
        return 'Başlat';
    };

    const handleImageSelect = (imageUrl: string) => {
        setBackgroundImage(imageUrl);
        localStorage.setItem('pomodoroBackground', imageUrl);
    };

    // Dark/Light Mode üçün dinamik siniflər
    const mainContainerBgStyle = isDarkMode
        ? {
            backgroundColor: 'black',
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
        }
        : {
            backgroundColor: 'white',
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
        };


    const textColorClass = isDarkMode ? "text-white" : "text-black";
    const tabActiveBgClass = isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black';
    const tabInactiveBgClass = isDarkMode ? 'border-white text-white' : 'border-black text-black';
    const iconColor = isDarkMode ? "white" : "black";
    const infoBoxBg = isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-black";


    return (
        <div className="">
            <SessionNameModal
                isOpen={isNameModalAdOpen}
                onClose={() => setIsNameModalAdOpen(false)}
                onConfirm={handleConfirmNameFromModal}
                currentName={confirmedSessionName}
            />

            <HistorySidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                timerSessions={timerSessions}
                loading={loading}
                error={error}
                formatTime={formatTime}
                handleDeleteTimer={handleDeleteTimer}
                handleEditSessionName={handleEditSessionName}
                isDarkMode={isDarkMode}
            />

            <div
                ref={fullScreenRef}
                style={mainContainerBgStyle}
                className={`flex flex-col items-center justify-center px-4 w-full  transition-colors duration-300`}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4">
                    <div className={`text-2xl md:text-5xl text-center mt-6 md:mt-12 font-bold ${textColorClass}`}>
                        Choose your minutes
                    </div>

                    {confirmedSessionName && (
                        <p className={`text-lg font-semibold mt-4 ${textColorClass}`}>Cari Sessiya Adı: <span className="font-bold">"{confirmedSessionName}"</span></p>
                    )}
                    {!confirmedSessionName && (
                        <div className="flex gap-3 justify-center items-center mt-4">
                            <span className={textColorClass}>Sessiyana ad ver</span>
                            <button
                                onClick={() => setIsNameModalAdOpen(true)}
                                className={`hover:text-gray-700 transition-colors duration-200 mt-2 ${textColorClass}`}
                                title="Sessiyaya ad ver"
                            >
                                <Edit size={24} color={iconColor} />
                            </button>
                        </div>
                    )}

                    <div className="tabs flex flex-col md:flex-row justify-center mt-6 gap-4 w-full items-center">
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 0.5 * 60 ? tabActiveBgClass : tabInactiveBgClass}`}
                            onClick={() => setTimerDuration(0.5)}
                        >
                            1 dəqiqə
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 10 * 60 ? tabActiveBgClass : tabInactiveBgClass}`}
                            onClick={() => setTimerDuration(10)}
                        >
                            10 dəqiqə
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 25 * 60 ? tabActiveBgClass : tabInactiveBgClass}`}
                            onClick={() => setTimerDuration(25)}
                        >
                            25 dəqiqə
                        </a>
                    </div>

                    <div className="times w-full mt-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
                            <div className="flex flex-col items-center">
                                <span className={`text-6xl md:text-9xl font-bold ${textColorClass}`}>{formatTime(timeLeft).split(':')[0]}</span>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Dəqiqə</span>
                            </div>
                            <div className={`text-6xl md:text-9xl ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>:</div>
                            <div className="flex flex-col items-center">
                                <span className={`text-6xl md:text-9xl font-bold ${textColorClass}`}>{formatTime(timeLeft).split(':')[1]}</span>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Saniyə</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-10 w-full">
                        <button
                            className={`border px-6 py-3 rounded-xl text-lg font-semibold transition duration-300
                                ${isDarkMode
                                    ? "border-white text-white hover:text-black hover:bg-white"
                                    : "border-black text-black hover:text-white hover:bg-black"
                                }`}
                            onClick={handleStartPause}
                            disabled={loading === 'pending' || (timeLeft === 0 && initialTime === 0 && !currentTimer)}
                        >
                            {getButtonText()}
                        </button>
                    </div>

                    <div className="flex justify-center items-center mt-4 flex-wrap gap-4">
                        {/* ImageSelector komponenti burada əlavə olunub */}
                       

                        <div className="flex flex-col items-center group">
                            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${tabInactiveBgClass}`}>Tarixçə</div>
                            <History className='cursor-pointer' onClick={toggleSidebar} size={28} color={iconColor} />
                        </div>

                        {!isCurrentlyFullScreen ? (
                            <div className="flex flex-col items-center group">
                                <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${tabInactiveBgClass}`}>Tam Ekran</div>
                                <Maximize className='cursor-pointer' onClick={handleFullScreen} size={28} color={iconColor} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group">
                                <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${tabInactiveBgClass}`}>Tam Ekrandan Çıx</div>
                                <Minimize2 className='cursor-pointer' onClick={handleExitFullScreen} size={28} color={iconColor} />
                            </div>
                        )}

                        <div className="flex flex-col items-center group">
                            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${tabInactiveBgClass}`}>Sıfırla</div>
                            <RotateCcw className='cursor-pointer' onClick={handleReset} size={28} color={iconColor} />
                        </div>
                    </div>

                    <ImageSelector onImageSelect={handleImageSelect} currentBackgroundImage={backgroundImage} isDarkMode={isDarkMode} />

                    {loading === 'pending' && <p className={`mt-4 ${textColorClass}`}>Əməliyyat icra olunur...</p>}
                    {error && <p className="text-red-600 mt-4">Xəta: {error}</p>}
                    {tracksLoading === 'pending' && <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Musiqi yüklənir...</p>}
                    {tracksError && <p className="text-red-600 mt-2">Musiqi xətası: {tracksError}</p>}

                    {currentTimer && (
                        <div className={`mt-8 text-center p-4 rounded-xl shadow-lg border ${infoBoxBg}`}>
                            <h3 className="text-green-600 text-xl font-semibold mb-2">Cari Taymer Sessiyası</h3>
                            <p>Ad: {currentTimer.name || 'Ad yoxdur'}</p>
                            <p className="text-gray-400">ID: {currentTimer._id}</p>
                            <p className="text-gray-400">Seçilən Müddət: {currentTimer.selectedDuration} dəqiqə</p>
                            <p className="text-gray-400">Başlama Vaxtı: {new Date(currentTimer.startTime).toLocaleString('az-AZ')}</p>
                            <p className="font-bold">Status: {currentTimer.status}</p>
                            <p className="text-gray-400">İşləyən Vaxt: {formatTime(currentTimer.elapsedTime)}</p>
                            {currentTimer.totalPausedTime > 0 && <p className="text-gray-400">Ümumi Fasilə Vaxtı: {formatTime(currentTimer.totalPausedTime)}</p>}
                            {currentTimer.endTime && <p className="text-gray-400">Bitmə Vaxtı: {new Date(currentTimer.endTime).toLocaleString('az-AZ')}</p>}
                        </div>
                    )}
                </div>
            </div>

            <AudioPlayer tracks={audioTracksFromRedux} />
        </div>
    );
};

export default Index;