import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize2, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store'; 
import { 
    createTimerSession, 
    clearCurrentTimer // Reducer-dən gələn custom action
} from '@/redux/features/timerSlice'; // Yenilənmiş slice-ı import edin

const Index = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentTimer, loading, error } = useSelector((state: RootState) => state.timer);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [initialTime, setInitialTime] = useState<number>(0);
    const [isCurrentlyFullScreen, setIsCurrentlyFullScreen] = useState<boolean>(false);
    
    // `currentTimerId` artıq `currentTimer?._id` olaraq `currentTimer` obyektindən gələcək
    // Əgər `currentTimer` null-dursa, deməli aktiv taymer sessiyası yoxdur.
    // Başlanğıcda null olacaq, Mongoose _id-ni avtomatik generasiya edir.

    const fullScreenRef = useRef<HTMLDivElement>(null);
    const tenSecondWarningSound = useRef<HTMLAudioElement | null>(null);
    const endSound = useRef<HTMLAudioElement | null>(null);

    // Audio obyektlərini yarat
    useEffect(() => {
        if (typeof window !== 'undefined') {
            tenSecondWarningSound.current = new Audio('/sounds/ten_second_warning.mp3');
            endSound.current = new Audio('/sounds/stoptime.mp3');
        }
    }, []);

    // Taymer məntiqi (hələlik backend ilə stop/complete/reset çağırılmır)
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

        } else if (timeLeft === 0 && initialTime > 0) {
            alert("Vaxt bitdi!");
            setIsRunning(false);
            if (interval) {
                clearInterval(interval);
            }
            if (endSound.current) {
                endSound.current.currentTime = 0;
                endSound.current.play();
            }
            // Vaxt bitəndə `currentTimer` obyektini təmizləyirik (frontend üçün)
            dispatch(clearCurrentTimer());
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, timeLeft, initialTime, dispatch]); // `currentTimer` artıq asılılıq deyil

    // FullScreen dəyişikliklərini izlə
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsCurrentlyFullScreen(!!document.fullscreenElement || !!(document as any).mozFullScreenElement || !!(document as any).webkitFullscreenElement || !!(document as any).msFullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('msfullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('msfullscreenchange', handleFullScreenChange);
        };
    }, []);

    // Format vaxtı
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Taymer müddətini təyin et
    const setTimerDuration = (minutes: number) => {
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        setInitialTime(seconds);
        setIsRunning(false);
        // Yeni müddət seçildikdə cari taymeri sıfırla
        dispatch(clearCurrentTimer());
    };

    // Taymeri başlat/dayandır
    const handleStartPause = async () => {
        if (timeLeft === 0 && initialTime === 0) {
            return;
        }

        if (!isRunning) { // Taymeri başlatmaq istəyirik
            if (!currentTimer) { // Əgər cari sessiya Redux state-də yoxdursa, yeni sessiya yarat
                const actionResult = await dispatch(createTimerSession(initialTime / 60)); // Dəqiqə ilə göndəririk
                if (createTimerSession.fulfilled.match(actionResult)) {
                    // console.log('Yeni taymer sessiyası yaradıldı:', actionResult.payload);
                    setIsRunning(true);
                } else {
                    alert(`Taymeri başlatarkən xəta: ${actionResult.payload}`);
                }
            } else { // Əgər cari sessiya Redux state-də varsa, onu davam etdir (Resume)
                setIsRunning(true);
                // `updateTimerStatus` funksiyasını hələlik əlavə etmədik, amma gələcəkdə olacaq.
                // dispatch(updateTimerStatus('running')); 
            }
        } else { // Taymeri dayandırmaq istəyirik
            setIsRunning(false);
            // Dayandırma funksiyasını hələlik əlavə etmədik.
            // if (currentTimer) {
            //     dispatch(stopTimerSession({ timerId: currentTimer._id, elapsedTime: initialTime - timeLeft }));
            // }
            alert("Taymer dayandırıldı (Yaddaşa yazılmadı, çünki backend API hələ yoxdur).");
        }
    };

    // Taymeri sıfırla
    const handleReset = async () => {
        setTimeLeft(initialTime);
        setIsRunning(false);
        // Backend sıfırlama funksiyasını hələlik əlavə etmədik.
        // if (currentTimer) {
        //     const actionResult = await dispatch(resetTimerSession(currentTimer._id));
        //     if (resetTimerSession.fulfilled.match(actionResult)) {
        //         alert("Taymer sıfırlandı!");
        //     } else {
        //         alert(`Taymeri sıfırlayarkən xəta: ${actionResult.payload}`);
        //     }
        // }
        dispatch(clearCurrentTimer()); // Frontend state-dəki cari taymeri təmizlə
        alert("Taymer sıfırlandı (Yaddaşa yazılmadı, çünki backend API hələ yoxdur).");
    };

    // Fullscreen funksiyaları (dəyişiklik yoxdur)
    const handleFullScreen = () => { /* ... */ };
    const handleExitFullScreen = () => { /* ... */ };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div style={{ backgroundImage: "url('https://wallpaper.dog/large/20470250.png')", backgroundRepeat: "no-repeat", backgroundSize: "cover" }} className='bg-[#161616] text-white flex flex-col items-center justify-center min-h-screen px-4'>
            <div
                ref={fullScreenRef}
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
                        disabled={initialTime === 0 && timeLeft === 0}
                    >
                        {isRunning ? 'Pause Timer' : (timeLeft === 0 && initialTime === 0 ? 'Set Time' : 'Start Timer')}
                    </button>
                </div>
                <div className="justify-end flex items-end mt-4">
                    {!isCurrentlyFullScreen && (
                        <div className="flex justify-center items-center gap-3 flex-col group ">
                            <div className="border opacity-0 group-hover:opacity-100 transition border-white rounded-2xl px-3 py-2 ">Full Screen</div>
                            <Maximize className='cursor-pointer' onClick={handleFullScreen} />
                        </div>
                    )}

                    {isCurrentlyFullScreen && (
                        <div className="flex justify-center items-center gap-3 flex-col group ">
                            <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Exit Full Screen</div>
                            <Minimize2 className='cursor-pointer' onClick={handleExitFullScreen} />
                        </div>
                    )}

                    <div className="flex justify-center items-center gap-3 flex-col group ">
                        <div className="border border-white opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 ">Reset</div>
                        <RotateCcw className='cursor-pointer' onClick={handleReset} />
                    </div>
                </div>

                {/* Yükləmə və Xəta Göstəriciləri */}
                {loading === 'pending' && <p className="text-amber-200 mt-4">Taymer başladılır...</p>}
                {error && <p className="text-red-500 mt-4">Xəta: {error}</p>}
                {currentTimer && (
                    <div className="mt-4 text-center">
                        <p className="text-green-400">Cari Taymer Sessiyası Başladı!</p>
                        <p>ID: {currentTimer._id}</p>
                        <p>Seçilən Müddət: {currentTimer.selectedDuration} dəqiqə</p>
                        <p>Başlama Vaxtı: {new Date(currentTimer.startTime).toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Index;