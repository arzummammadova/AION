import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize2, RotateCcw, Trash2, Pause, Square, History, X } from 'lucide-react'; 
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
    clearAllTimerSessions 
} from '@/redux/features/timerSlice'; 

const Index = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentTimer, timerSessions, loading, error } = useSelector((state: RootState) => state.timer);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [initialTime, setInitialTime] = useState<number>(0);
    const [isCurrentlyFullScreen, setIsCurrentlyFullScreen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); 
    
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
            } else {
                setTimeLeft(0); 
                setIsRunning(false);
                setInitialTime(0); 
            }
            setInitialTime(currentTimer.selectedDuration * 60);
        } else {
            setTimeLeft(0);
            setInitialTime(0);
            setIsRunning(false);
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


    const handleStartPause = async () => {
        if (timeLeft === 0 && initialTime === 0) {
            alert("Zəhmət olmasa bir taymer müddəti seçin.");
            return;
        }

        if (!isRunning) {
            const actionResult = await dispatch(startTimerSession(initialTime / 60));
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
        alert("Taymer sıfırlandı.");
        dispatch(getUserTimerSessions()); 
    };



    const handleDeleteTimer = async (timerId: string) => {
        if (window.confirm("Bu taymer sessiyasını silmək istədiyinizə əminsiniz?")) {
            const actionResult = await dispatch(deleteTimerSession(timerId));
            if (deleteTimerSession.fulfilled.match(actionResult)) {
                alert("Taymer sessiyası uğurla silindi.");
            } else {
                alert(`Taymer sessiyası silinərkən xəta: ${actionResult.payload}`);
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
            (document as any).msExitFullscreen();
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


    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;


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

            <div
                className={`fixed top-0 left-0 h-full bg-[#2a2a2a] transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } w-80 p-4 z-50 overflow-y-auto shadow-lg`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-amber-200">Keçmiş Taymer Sessiyaları</h2>
                    <button onClick={toggleSidebar} className="text-white hover:text-amber-200">
                        <X size={24} />
                    </button>
                </div>
                {loading === 'pending' && timerSessions.length === 0 && <p className="text-gray-400">Sessiyalar yüklənir...</p>}
                {timerSessions.length === 0 && loading !== 'pending' && <p className="text-gray-400 text-center">Hələ heç bir taymer sessiyanız yoxdur.</p>}
                <div className="bg-[#2a2a2a] p-2 rounded-xl"> 
                    {timerSessions.map((session) => (
                        <div key={session._id} className="border-b border-gray-600 last:border-b-0 py-3 px-2 flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold text-white">Müddət: {session.selectedDuration} dəqiqə</p>
                                <p className="text-sm text-gray-300">Başlama: {new Date(session.startTime).toLocaleString()}</p>
                                {session.endTime && <p className="text-sm text-gray-300">Bitmə: {new Date(session.endTime).toLocaleString()}</p>}
                                <p className="text-sm text-gray-300">İşləyən Vaxt: {formatTime(session.elapsedTime)}</p>
                                {session.totalPausedTime > 0 && <p className="text-sm text-gray-300">Fasilə Vaxtı: {formatTime(session.totalPausedTime)}</p>}
                                <p className="text-sm text-amber-300">Status: {session.status}</p>
                            </div>
                            <button 
                                onClick={() => handleDeleteTimer(session._id)}
                                className="text-red-400 hover:text-red-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                title="Sessiyanı Sil"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={toggleSidebar}
                ></div>
            )}


            <div 
                ref={fullScreenRef}
                style={{ 
                    // backgroundImage: "url('https://wallpaper.dog/large/20470250.png')", 
                    backgroundRepeat: "no-repeat", 
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "100vh",
                }} 
                className='bg-[#161616] text-white flex flex-col items-center justify-center px-4 w-full h-full'
            >
                <div
                    className="
                        w-[60%] mx-auto
                        flex flex-col items-center justify-center
                        px-4
                    "
                >
                    <div className="text-3xl md:text-5xl text-center text-amber-200 mt-6 md:mt-12">
                        Timer Pomodoro Choose your minutes
                    </div>

                    <div className="tabs flex flex-col md:flex-row justify-center mt-6 gap-4 w-full items-center">
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 0.5 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(0.5)}
                        >
                            1 minutes
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 10 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(10)}
                        >
                            10 minutes
                        </a>
                        <a
                            className={`tab border px-5 py-3 rounded-xl text-md border-amber-200 w-40 text-center cursor-pointer ${initialTime === 25 * 60 ? 'bg-amber-200 text-[#161616]' : ''}`}
                            onClick={() => setTimerDuration(25)}
                        >
                            25 minutes
                        </a>
                    </div>

                    <div className="times w-full mt-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
                            <div className="flex flex-col items-center">
                                <span className="text-6xl md:text-9xl text-amber-200">{minutes.toString().padStart(2, '0')}</span>
                                <span className="text-gray-400 text-sm">Minutes</span>
                            </div>
                            <div className="text-6xl md:text-9xl text-gray-400">:</div>
                            <div className="flex flex-col items-center">
                                <span className="text-6xl md:text-9xl text-amber-200">{seconds.toString().padStart(2, '0')}</span>
                                <span className="text-gray-400 text-sm">Seconds</span>
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
                    <div className="justify-end flex items-end mt-4">

                        <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                            <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Tarixçə</div>
                            <History className='cursor-pointer' onClick={toggleSidebar} />
                        </div>


                        {!isCurrentlyFullScreen && (
                            <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                                <div className="border opacity-0 group-hover:opacity-100 transition border-white rounded-2xl px-3 py-2 ">Tam Ekran</div>
                                <Maximize className='cursor-pointer' onClick={handleFullScreen} />
                            </div>
                        )}

                        {isCurrentlyFullScreen && (
                            <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Tam Ekrandan Çıx</div>
                                <Minimize2 className='cursor-pointer' onClick={handleExitFullScreen} />
                            </div>
                        )}


                        <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                            <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Sıfırla</div>
                            <RotateCcw className='cursor-pointer' onClick={handleReset} />
                        </div>


                        {isRunning && ( 
                            <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Fasilə</div>
                                <Pause className='cursor-pointer' onClick={handleStartPause} /> 
                            </div>
                        )}


                        {(isRunning || currentTimer?.status === 'paused') && ( 
                            <div className="flex justify-center items-center gap-3 flex-col group mr-3">
                                <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Dayandır</div>
                                <Square className='cursor-pointer' onClick={handleStopTimer} />
                            </div>
                        )}
                    </div>


                    {loading === 'pending' && <p className="text-amber-200 mt-4">Əməliyyat icra olunur...</p>}
                    {error && <p className="text-red-500 mt-4">Xəta: {error}</p>}
                    
                    {currentTimer && (
                        <div className="mt-4 text-center">
                            <p className="text-green-400">Cari Taymer Sessiyası:</p>
                            <p>ID: {currentTimer._id}</p>
                            <p>Seçilən Müddət: {currentTimer.selectedDuration} dəqiqə</p>
                            <p>Başlama Vaxtı: {new Date(currentTimer.startTime).toLocaleString()}</p>
                            <p>Status: {currentTimer.status}</p>
                            <p>İşləyən Vaxt: {currentTimer.elapsedTime} saniyə</p>
                            {currentTimer.totalPausedTime > 0 && <p>Ümumi Fasilə Vaxtı: {formatTime(currentTimer.totalPausedTime)}</p>}
                            {currentTimer.endTime && <p>Bitmə Vaxtı: {new Date(currentTimer.endTime).toLocaleString()}</p>}
                        </div>
                    )}
                </div>
            </div> 
        </div>
    );
};

export default Index;