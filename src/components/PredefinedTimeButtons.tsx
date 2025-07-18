// components/PredefinedTimeButtons.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Clock } from 'lucide-react'; // Saat ikonunu əlavə edirik

interface PredefinedTimeButtonsProps {
    setTimerDuration: (minutes: number) => void;
    setIsCustomTimeModalOpen: (isOpen: boolean) => void;
    initialTime: number;
    isCustomTimeSelected: boolean;
}

const PredefinedTimeButtons: React.FC<PredefinedTimeButtonsProps> = ({
    setTimerDuration,
    setIsCustomTimeModalOpen,
    initialTime,
    isCustomTimeSelected,
}) => {
    const { isDarkMode } = useSelector((state: RootState) => state.theme);

    const tabActiveBgClass = isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black';
    const tabInactiveBgClass = isDarkMode ? 'border-white text-white' : 'border-black text-black';

    return (
        <div className="tabs flex flex-col md:flex-row justify-center mt-6 gap-4 w-full items-center">
            <a
                className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 0.5 * 60 && !isCustomTimeSelected ? tabActiveBgClass : tabInactiveBgClass}`}
                onClick={() => setTimerDuration(0.5)}
            >
                30 saniyə
            </a>
            <a
                className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 10 * 60 && !isCustomTimeSelected ? tabActiveBgClass : tabInactiveBgClass}`}
                onClick={() => setTimerDuration(10)}
            >
                10 dəqiqə
            </a>
            <a
                className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${initialTime === 25 * 60 && !isCustomTimeSelected ? tabActiveBgClass : tabInactiveBgClass}`}
                onClick={() => setTimerDuration(25)}
            >
                25 dəqiqə
            </a>
            <a
                className={`tab border px-5 py-3 rounded-xl text-md w-40 text-center cursor-pointer ${isCustomTimeSelected ? tabActiveBgClass : tabInactiveBgClass}`}
                onClick={() => setIsCustomTimeModalOpen(true)}
            >
                Özəl vaxt
            </a>
        </div>
    );
};

export default PredefinedTimeButtons;