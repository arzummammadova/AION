// pages/index.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Maximize, Minimize2, RotateCcw, History, Edit, Settings } from 'lucide-react';
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
import SettingsModal from '@/components/SettingsModal';
import CustomTimeModal from '@/components/CustomTimeModal';
import PredefinedTimeButtons from '@/components/PredefinedTimeButtons';
import { getTracks } from '@/redux/features/trackSlice';
import { useToast } from 'arzu-toast-modal';

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
    const { showToast } = useToast();

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [initialTime, setInitialTime] = useState<number>(0);
    const [isCurrentlyFullScreen, setIsCurrentlyFullScreen] = useState<boolean>(false);
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [isNameModalAdOpen, setIsNameModalAdOpen] = useState<boolean>(false);
    const [confirmedSessionName, setConfirmedSessionName] = useState<string>('');
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    // State for custom time inputs, including hours
    const [customHours, setCustomHours] = useState<number | ''>(''); // New state
    const [customMinutes, setCustomMinutes] = useState<number | ''>('');
    const [customSeconds, setCustomSeconds] = useState<number | ''>('');
    const [isCustomTimeSelected, setIsCustomTimeSelected] = useState<boolean>(false);
    const [isCustomTimeModalOpen, setIsCustomTimeModalOpen] = useState<boolean>(false);

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
            const predefinedDurationsInSeconds = [0.5 * 60, 10 * 60, 25 * 60];
            const currentTimerDurationInSeconds = currentTimer.selectedDuration * 60;

            if (!predefinedDurationsInSeconds.includes(currentTimerDurationInSeconds)) {
                setIsCustomTimeSelected(true);
                // Calculate hours, minutes and remaining seconds for display
                const totalSeconds = currentTimer.selectedDuration * 60;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = Math.round(totalSeconds % 60);

                setCustomHours(hours);
                setCustomMinutes(minutes);
                setCustomSeconds(seconds);
            } else {
                setIsCustomTimeSelected(false);
                setCustomHours(''); // Clear custom hours
                setCustomMinutes('');
                setCustomSeconds('');
            }
        } else {
            setTimeLeft(0);
            setInitialTime(0);
            setIsRunning(false);
            setConfirmedSessionName('');
            setCustomHours(''); // Clear custom hours when no timer
            setCustomMinutes('');
            setCustomSeconds('');
            setIsCustomTimeSelected(false);
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
            showToast({
                type: 'success',
                title: 'Uğurlu',
                message: 'Vaxt bitdi!',
                duration: 3000,
                position: 'top-right',
            });
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
    }, [isRunning, timeLeft, initialTime, dispatch, currentTimer, showToast]);

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

    // Updated: formatTime to include hours (HH:MM:SS format)
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');

        if (hours > 0) {
            return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        } else {
            return `${paddedMinutes}:${paddedSeconds}`;
        }
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
        setIsCustomTimeSelected(false);
        setCustomHours(''); // Clear custom hours
        setCustomMinutes('');
        setCustomSeconds('');
    };

    // Updated: handleSetCustomDuration to accept hours, minutes, seconds
    const handleSetCustomDuration = async (hours: number, minutes: number, seconds: number) => {
        const totalSeconds = (isNaN(hours) ? 0 : hours * 3600) +
                             (isNaN(minutes) ? 0 : minutes * 60) +
                             (isNaN(seconds) ? 0 : seconds);

        if (totalSeconds <= 0) {
            showToast({
                type: 'error',
                title: 'Xəta',
                message: 'Zəhmət olmasa etibarlı bir müddət daxil edin (saat, dəqiqə və ya saniyə).',
                duration: 3000,
                position: 'top-right',
            });
            return;
        }

        if (isRunning || (currentTimer && currentTimer.status === 'paused')) {
            if (!window.confirm("Cari taymer sessiyası aktivdir. Yeni müddət seçmək onu sıfırlayacaq. Davam edilsin?")) {
                return;
            }
            if (currentTimer?._id) {
                await dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime: initialTimeRef.current - timeLeftRef.current }));
            }
        }

        setTimeLeft(totalSeconds);
        setInitialTime(totalSeconds);
        setIsRunning(false);
        dispatch(clearCurrentTimer());
        setConfirmedSessionName('');
        dispatch(getUserTimerSessions());
        setIsCustomTimeSelected(true);
        setCustomHours(hours); // Update state to reflect chosen custom time
        setCustomMinutes(minutes); // Update state to reflect chosen custom time
        setCustomSeconds(seconds); // Update state to reflect chosen custom time
        showToast({
            type: 'success',
            title: 'Uğurlu',
            message: `${formatTime(totalSeconds)} olaraq təyin edildi.`,
            duration: 3000,
            position: 'top-right',
        });
    };

    const handleConfirmNameFromModal = (name: string) => {
        setConfirmedSessionName(name);
        showToast({
            type: 'success',
            title: 'Uğurlu',
            message: `Sessiya adı təsdiqləndi: "${name}"`,
            duration: 3000,
            position: 'top-right',
        });
        if (currentTimer && currentTimer.name !== name) {
            dispatch(updateTimerSession({ timerId: currentTimer._id, name: name }));
        }
    };

    const handleStartPause = async () => {
        if (timeLeft === 0 && initialTime === 0) {
            showToast({
                type: 'error',
                title: 'Xəta',
                message: 'Zəhmət olmasa bir taymer müddəti seçin.',
                duration: 3000,
                position: 'top-right',
            });
            return;
        }

        if (!isRunning) {
            const actionResult = await dispatch(
                startTimerSession({
                    selectedDuration: initialTime / 60, // Ensure this is in minutes for the backend
                    name: confirmedSessionName || `Sessiya ${new Date().toLocaleString('az-AZ')}`
                })
            );
            if (startTimerSession.fulfilled.match(actionResult)) {
                showToast({
                    type: 'success',
                    title: 'Uğurlu',
                    message: 'Taymer başladı/davam etdirildi!',
                    duration: 3000,
                    position: 'top-right',
                });
            } else {
                showToast({
                    type: 'error',
                    title: 'Xəta',
                    message: `Taymeri başlatarkən xəta: ${actionResult.payload}`,
                    duration: 3000,
                    position: 'top-right',
                });
            }
        } else {
            if (currentTimer?._id) {
                const elapsedTime = initialTime - timeLeft;
                const actionResult = await dispatch(pauseTimerSession({ timerId: currentTimer._id, elapsedTime }));

                if (pauseTimerSession.fulfilled.match(actionResult)) {
                    showToast({
                        type: 'success',
                        title: 'Uğurlu',
                        message: 'Taymer fasiləyə verildi!',
                        duration: 3000,
                        position: 'top-right',
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: 'Xəta',
                        message: `Taymeri fasiləyə verərken xəta: ${actionResult.payload}`,
                        duration: 3000,
                        position: 'top-right',
                    });
                }
            } else {
                showToast({
                    type: 'error',
                    title: 'Xəta',
                    message: 'Taymer fasiləyə verilə bilmədi (Cari sessiya tapılmadı).',
                    duration: 3000,
                    position: 'top-right',
                });
            }
        }
    };

    const handleStopTimer = async () => {
        if (currentTimer?._id && (isRunning || currentTimer.status === 'paused')) {
            if (window.confirm("Taymeri tamamilə dayandırmaq istədiyinizə əminsiniz? Bu, sessiyanı bitirəcək.")) {
                const elapsedTime = initialTime - timeLeft;
                const actionResult = await dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime }));

                if (stopTimerSession.fulfilled.match(actionResult)) {
                    showToast({
                        type: 'success',
                        title: 'Uğurlu',
                        message: 'Taymer sessiyası dayandırıldı!',
                        duration: 3000,
                        position: 'top-right',
                    });
                    dispatch(clearCurrentTimer());
                    dispatch(getUserTimerSessions());
                } else {
                    showToast({
                        type: 'error',
                        title: 'Xəta',
                        message: `Taymeri dayandırarkən xəta: ${actionResult.payload}`,
                        duration: 3000,
                        position: 'top-right',
                    });
                }
            }
        } else {
            showToast({
                type: 'info',
                title: 'Məlumat',
                message: 'Hal-hazırda dayandırıla biləcək bir taymer yoxdur.',
                duration: 3000,
                position: 'top-right',
            });
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
        showToast({
            type: 'success',
            title: 'Uğurlu',
            message: 'Taymer sıfırlandı.',
            duration: 3000,
            position: 'top-right',
        });
        dispatch(getUserTimerSessions());
        setIsCustomTimeSelected(false);
        setCustomHours('');
        setCustomMinutes('');
        setCustomSeconds('');
    };

    const handleDeleteTimer = async (timerId: string) => {
        if (window.confirm("Bu taymer sessiyasını silmək istədiyinizə əminsiniz?")) {
            const actionResult = await dispatch(deleteTimerSession(timerId));
            if (deleteTimerSession.fulfilled.match(actionResult)) {
                showToast({
                    type: 'success',
                    title: 'Uğurlu',
                    message: 'Taymer sessiyası uğurla silindi.',
                    duration: 3000,
                    position: 'top-right',
                });
                if (currentTimer && currentTimer._id === timerId) {
                    dispatch(clearCurrentTimer());
                    setTimeLeft(0);
                    setInitialTime(0);
                    setIsRunning(false);
                    setConfirmedSessionName('');
                    setIsCustomTimeSelected(false);
                    setCustomHours('');
                    setCustomMinutes('');
                    setCustomSeconds('');
                }
            } else {
                showToast({
                    type: 'error',
                    title: 'Xəta',
                    message: `Taymer sessiyası silinərkən xəta: ${actionResult.payload}`,
                    duration: 3000,
                    position: 'top-right',
                });
            }
        }
    };

    const handleEditSessionName = async (timerId: string, currentName: string) => {
        const newName = prompt("Sessiyanın yeni adını daxil edin:", currentName);
        if (newName !== null && newName.trim() !== "") {
            if (newName.trim() === currentName.trim()) {
                showToast({
                    type: 'info',
                    title: 'Məlumat',
                    message: 'Ad dəyişməyib.',
                    duration: 3000,
                    position: 'top-right',
                });
                return;
            }
            const actionResult = await dispatch(updateTimerSession({ timerId, name: newName.trim() }));

            if (updateTimerSession.fulfilled.match(actionResult)) {
                showToast({
                    type: 'success',
                    title: 'Uğurlu',
                    message: 'Sessiya adı uğurla yeniləndi.',
                    duration: 3000,
                    position: 'top-right',
                });
                dispatch(getUserTimerSessions());
            } else {
                showToast({
                    type: 'error',
                    title: 'Xəta',
                    message: `Sessiya adı yenilənərkən xəta: ${actionResult.payload}`,
                    duration: 3000,
                    position: 'top-right',
                });
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

    const toggleHistorySidebar = () => {
        setIsHistorySidebarOpen(!isHistorySidebarOpen);
    };

    const openSettingsModal = () => {
        setIsSettingsModalOpen(true);
    };

    const closeSettingsModal = () => {
        setIsSettingsModalOpen(false);
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
                isOpen={isHistorySidebarOpen}
                toggleSidebar={toggleHistorySidebar}
                timerSessions={timerSessions}
                loading={loading}
                error={error}
                formatTime={formatTime}
                handleDeleteTimer={handleDeleteTimer}
                handleEditSessionName={handleEditSessionName}
                isDarkMode={isDarkMode}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={closeSettingsModal}
                onImageSelect={handleImageSelect}
                currentBackgroundImage={backgroundImage}
                isDarkMode={isDarkMode}
            />

            <CustomTimeModal
                isOpen={isCustomTimeModalOpen}
                onClose={() => setIsCustomTimeModalOpen(false)}
                // Pass hours, minutes, seconds to the modal
                onSetCustomDuration={handleSetCustomDuration}
                currentHours={customHours} // New prop
                currentMinutes={customMinutes}
                currentSeconds={customSeconds}
            />

            <div
                ref={fullScreenRef}
                style={mainContainerBgStyle}
                className={`flex flex-col items-center justify-center px-4 w-full transition-colors duration-300`}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-4">
                    <div className={`text-2xl md:text-5xl text-center mt-6 md:mt-12 font-bold ${textColorClass}`}>
                        Choose your time
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

                    <PredefinedTimeButtons
                        setTimerDuration={setTimerDuration}
                        setIsCustomTimeModalOpen={setIsCustomTimeModalOpen}
                        initialTime={initialTime}
                        isCustomTimeSelected={isCustomTimeSelected}
                    />

                    <div className="times w-full mt-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
                            {/* Display Hours if present, otherwise only Minutes:Seconds */}
                            {formatTime(timeLeft).split(':').length === 3 && (
                                <>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-6xl md:text-9xl font-bold ${textColorClass}`}>{formatTime(timeLeft).split(':')[0]}</span>
                                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Saat</span>
                                    </div>
                                    <div className={`text-6xl md:text-9xl ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>:</div>
                                </>
                            )}
                            <div className="flex flex-col items-center">
                                <span className={`text-6xl md:text-9xl font-bold ${textColorClass}`}>
                                    {formatTime(timeLeft).split(':').length === 3 ? formatTime(timeLeft).split(':')[1] : formatTime(timeLeft).split(':')[0]}
                                </span>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Dəqiqə</span>
                            </div>
                            <div className={`text-6xl md:text-9xl ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>:</div>
                            <div className="flex flex-col items-center">
                                <span className={`text-6xl md:text-9xl font-bold ${textColorClass}`}>
                                    {formatTime(timeLeft).split(':').length === 3 ? formatTime(timeLeft).split(':')[2] : formatTime(timeLeft).split(':')[1]}
                                </span>
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
                        <div className="flex flex-col items-center group">
                            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Ayarlar</div>
                            <Settings className='cursor-pointer' onClick={openSettingsModal} size={28} color={iconColor} />
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Tarixçə</div>
                            <History className='cursor-pointer' onClick={toggleHistorySidebar} size={28} color={iconColor} />
                        </div>

                        {!isCurrentlyFullScreen ? (
                            <div className="flex flex-col items-center group">
                                <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Tam Ekran</div>
                                <Maximize className='cursor-pointer' onClick={handleFullScreen} size={28} color={iconColor} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group">
                                <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Tam Ekrandan Çıx</div>
                                <Minimize2 className='cursor-pointer' onClick={handleExitFullScreen} size={28} color={iconColor} />
                            </div>
                        )}

                        <div className="flex flex-col items-center group">
                            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${isDarkMode ? 'border-white text-white' : 'border-black text-black'}`}>Sıfırla</div>
                            <RotateCcw className='cursor-pointer' onClick={handleReset} size={28} color={iconColor} />
                        </div>
                    </div>

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