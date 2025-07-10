import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize2, RotateCcw, Trash2, Pause, Square, History, X, Edit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
    startTimerSession,
    pauseTimerSession,
    completeTimerSession,
    stopTimerSession,
    getUserTimerSessions,
    deleteTimerSession,
    clearCurrentTimer,
    updateTimerSession, // updateTimerSession-u indi import edirik
} from '@/redux/features/timerSlice';
import SessionNameModal from '@/components/SessionNameModal';
import HistorySidebar from '@/components/HistorySidebar'; // Yeni HistorySidebar-ı import edirik

const Index = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentTimer, timerSessions, loading, error } = useSelector((state: RootState) => state.timer);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [initialTime, setInitialTime] = useState<number>(0);
    const [isCurrentlyFullScreen, setIsCurrentlyFullScreen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
    const [confirmedSessionName, setConfirmedSessionName] = useState<string>('');

    const fullScreenRef = useRef<HTMLDivElement>(null);
    const tenSecondWarningSound = useRef<HTMLAudioElement | null>(null);
    const endSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            tenSecondWarningSound.current = new Audio('/sounds/ten_second_warning.mp3');
            endSound.current = new Audio('/sounds/stoptime.mp3');
        }
    }, []);

    useEffect(() => {
        dispatch(getUserTimerSessions());
    }, [dispatch]);

    useEffect(() => {
        if (currentTimer) {
            if (currentTimer.status === 'running') {
                const now = new Date().getTime();
                const startTimeMs = new Date(currentTimer.startTime).getTime();
                const totalPassedTime = (now - startTimeMs) / 1000;
                const remaining = (currentTimer.selectedDuration * 60) - (totalPassedTime - currentTimer.totalPausedTime);

                setTimeLeft(Math.max(0, Math.floor(remaining)));
                setIsRunning(true);
            } else if (currentTimer.status === 'paused') {
                setTimeLeft((currentTimer.selectedDuration * 60) - currentTimer.elapsedTime);
                setIsRunning(false);
            } else { // stopped or completed
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
                const totalElapsedTime = initialTime - timeLeft;
                dispatch(completeTimerSession({ timerId: currentTimer._id, elapsedTime: totalElapsedTime }));
            }
            dispatch(getUserTimerSessions());
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, timeLeft, initialTime, dispatch, currentTimer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const setTimerDuration = async (minutes: number) => {
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        setInitialTime(seconds);
        setIsRunning(false);
        dispatch(clearCurrentTimer());
        dispatch(getUserTimerSessions());
    };

    const handleConfirmNameFromModal = (name: string) => {
        setConfirmedSessionName(name);
        alert(`Sessiya adı təsdiqləndi: "${name}"`);
        // Eğer cari taymer varsa ve ad değişmişse, updateTimerSession'ı burada da çağırabiliriz
        if (currentTimer && currentTimer.name !== name) {
            dispatch(updateTimerSession({ timerId: currentTimer._id, name: name }));
        }
    };

    const handleStartPause = async () => {
        if (timeLeft === 0 && initialTime === 0) {
            alert("Zəhmət olmasa bir taymer müddəti seçin.");
            return;
        }

        if (!isRunning && !currentTimer && confirmedSessionName === '') {
            alert("Zəhmət olmasa sessiya adını daxil edib təsdiqləyin.");
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

    // Sessiyanın adını redaktə etmək üçün funksiya (sidebar üçün)
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

    return (
        <div className="">
            {/* Session Name Modal */}
            <SessionNameModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onConfirm={handleConfirmNameFromModal}
                currentName={confirmedSessionName}
            />

            {/* History Sidebar Component */}
            <HistorySidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                timerSessions={timerSessions}
                loading={loading}
                error={error}
                formatTime={formatTime}
                handleDeleteTimer={handleDeleteTimer}
                handleEditSessionName={handleEditSessionName}
            />

            {/* Main Timer Section */}
            <div
                ref={fullScreenRef}
                style={{
                    // backgroundImage: "url('https://wallpaper.dog/large/20470250.png')", // Uncomment if you have a background image
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "100vh",
                }}
                className='bg-[#161616] text-white flex flex-col items-center justify-center px-4 w-full h-full'
            >
                {/* Edit Icon for main timer session name */}
                

                <div
                    className="
                        w-full max-w-2xl mx-auto
                        flex flex-col items-center justify-center
                        px-4
                    "
                >
                    <div className="text-3xl md:text-5xl text-center text-amber-200 mt-6 md:mt-12">
                        Pomodoro Taymer: Dəqiqələri Seçin
                    </div>

                    {confirmedSessionName && (
                        <p className="text-green-400 text-lg font-semibold mt-4">Cari Sessiya Adı: <span className="font-bold">"{confirmedSessionName}"</span></p>
                    )}
                    {!confirmedSessionName && (
                        <div className="flex gap-3 justify-center ">
                            <span>sessiyana ad ver</span>  
                        <button
                            onClick={() => setIsNameModalOpen(true)}
                            className="text-amber-200 hover:text-amber-300 transition-colors duration-200 mt-2"
                            title="Sessiyaya ad ver"
                        >
                          <Edit size={28} />
                        </button>
                    </div>
                      
                    )}

                    <div className="tabs flex flex-col md:flex-row justify-center mt-6 gap-4 w-full items-center">
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 0.5 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(0.5)}
                        >
                            1 dəqiqə
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 10 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(10)}
                        >
                            10 dəqiqə
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 25 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(25)}
                        >
                            25 dəqiqə
                        </a>
                    </div>

                    <div className="times w-full mt-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
                            <div className="flex flex-col items-center">
                                <span className="text-6xl md:text-9xl text-amber-200">{formatTime(timeLeft).split(':')[0]}</span>
                                <span className="text-gray-400 text-sm">Dəqiqə</span>
                            </div>
                            <div className="text-6xl md:text-9xl text-gray-400">:</div>
                            <div className="flex flex-col items-center">
                                <span className="text-6xl md:text-9xl text-amber-200">{formatTime(timeLeft).split(':')[1]}</span>
                                <span className="text-gray-400 text-sm">Saniyə</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-10 w-full">
                        <button
                            className="border border-amber-200 text-amber-200 px-6 py-3 rounded-xl text-lg font-semibold hover:text-white hover:bg-amber-300 transition duration-300"
                            onClick={handleStartPause}
                            disabled={loading === 'pending' || (timeLeft === 0 && initialTime === 0 && !currentTimer)}
                        >
                            {getButtonText()}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center items-center mt-4 flex-wrap gap-4">
                        <div className="flex flex-col items-center group">
                            <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Tarixçə</div>
                            <History className='cursor-pointer' onClick={toggleSidebar} size={28} />
                        </div>

                        {!isCurrentlyFullScreen ? (
                            <div className="flex flex-col items-center group">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Tam Ekran</div>
                                <Maximize className='cursor-pointer' onClick={handleFullScreen} size={28} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Tam Ekrandan Çıx</div>
                                <Minimize2 className='cursor-pointer' onClick={handleExitFullScreen} size={28} />
                            </div>
                        )}

                        <div className="flex flex-col items-center group">
                            <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Sıfırla</div>
                            <RotateCcw className='cursor-pointer' onClick={handleReset} size={28} />
                        </div>

                        {isRunning && (
                            <div className="flex flex-col items-center group">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Fasilə</div>
                                <Pause className='cursor-pointer' onClick={handleStartPause} size={28} />
                            </div>
                        )}

                        {(isRunning || currentTimer?.status === 'paused') && (
                            <div className="flex flex-col items-center group">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap">Dayandır</div>
                                <Square className='cursor-pointer' onClick={handleStopTimer} size={28} />
                            </div>
                        )}
                    </div>

                    {loading === 'pending' && <p className="text-amber-200 mt-4">Əməliyyat icra olunur...</p>}
                    {error && <p className="text-red-500 mt-4">Xəta: {error}</p>}

                    {/* Current Timer Session Info */}
                    {currentTimer && (
                        <div className="mt-8 text-center bg-[#2a2a2a] p-4 rounded-xl shadow-lg">
                            <h3 className="text-green-400 text-xl font-semibold mb-2">Cari Taymer Sessiyası</h3>
                            <p className="text-white">Ad: {currentTimer.name || 'Ad yoxdur'}</p>
                            <p className="text-gray-300">ID: {currentTimer._id}</p>
                            <p className="text-gray-300">Seçilən Müddət: {currentTimer.selectedDuration} dəqiqə</p>
                            <p className="text-gray-300">Başlama Vaxtı: {new Date(currentTimer.startTime).toLocaleString('az-AZ')}</p>
                            <p className="text-amber-300 font-bold">Status: {currentTimer.status}</p>
                            <p className="text-gray-300">İşləyən Vaxt: {formatTime(currentTimer.elapsedTime)}</p>
                            {currentTimer.totalPausedTime > 0 && <p className="text-gray-300">Ümumi Fasilə Vaxtı: {formatTime(currentTimer.totalPausedTime)}</p>}
                            {currentTimer.endTime && <p className="text-gray-300">Bitmə Vaxtı: {new Date(currentTimer.endTime).toLocaleString('az-AZ')}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Index;