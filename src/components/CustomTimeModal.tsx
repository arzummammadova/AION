// components/CustomTimeModal.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';

interface CustomTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetCustomDuration: (hours: number, minutes: number, seconds: number) => void;
    currentHours: number | '';
    currentMinutes: number | '';
    currentSeconds: number | '';
}

const CustomTimeModal: React.FC<CustomTimeModalProps> = ({ 
    isOpen, 
    onClose, 
    onSetCustomDuration, 
    currentHours, 
    currentMinutes, 
    currentSeconds 
}) => {
    const { isDarkMode } = useSelector((state: RootState) => state.theme);
    const [hours, setHours] = useState<number | ''>(currentHours);
    const [minutes, setMinutes] = useState<number | ''>(currentMinutes);
    const [seconds, setSeconds] = useState<number | ''>(currentSeconds);

    useEffect(() => {
        setHours(currentHours);
        setMinutes(currentMinutes);
        setSeconds(currentSeconds);
    }, [currentHours, currentMinutes, currentSeconds]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const finalHours = Number(hours) || 0;
        const finalMinutes = Number(minutes) || 0;
        const finalSeconds = Number(seconds) || 0;

        // Minimum 1 saniyə yoxlaması
        if (finalHours === 0 && finalMinutes === 0 && finalSeconds === 0) {
            return;
        }

        onSetCustomDuration(finalHours, finalMinutes, finalSeconds);
        onClose();
    };

    // Təmizlənmiş giriş yoxlaması funksiyası
    const cleanInput = (value: string): string => {
        // Boşluqları və qeyri-rəqəm simvolları təmizlə
        return value.replace(/[^\d]/g, '');
    };

    const handleHoursChange = (value: string) => {
        const cleanedValue = cleanInput(value);
        
        if (cleanedValue === '') {
            setHours('');
            return;
        }
        
        const numValue = parseInt(cleanedValue);
        // Maksimum 23 saat
        if (numValue >= 0 && numValue <= 23) {
            setHours(numValue);
        }
    };

    const handleMinutesChange = (value: string) => {
        const cleanedValue = cleanInput(value);
        
        if (cleanedValue === '') {
            setMinutes('');
            return;
        }
        
        const numValue = parseInt(cleanedValue);
        // Maksimum 59 dəqiqə
        if (numValue >= 0 && numValue <= 59) {
            setMinutes(numValue);
        }
    };

    const handleSecondsChange = (value: string) => {
        const cleanedValue = cleanInput(value);
        
        if (cleanedValue === '') {
            setSeconds('');
            return;
        }
        
        const numValue = parseInt(cleanedValue);
        // Maksimum 59 saniyə
        if (numValue >= 0 && numValue <= 59) {
            setSeconds(numValue);
        }
    };

    const incrementHours = () => {
        const current = Number(hours) || 0;
        if (current < 23) setHours(current + 1);
    };

    const decrementHours = () => {
        const current = Number(hours) || 0;
        if (current > 0) setHours(current - 1);
    };

    const incrementMinutes = () => {
        const current = Number(minutes) || 0;
        if (current < 59) {
            setMinutes(current + 1);
        } else {
            setMinutes(0); // 59-dan sonra 0-a qayıt
        }
    };

    const decrementMinutes = () => {
        const current = Number(minutes) || 0;
        if (current > 0) {
            setMinutes(current - 1);
        } else {
            setMinutes(59); // 0-dan əvvəl 59-a qayıt
        }
    };

    const incrementSeconds = () => {
        const current = Number(seconds) || 0;
        if (current < 59) {
            setSeconds(current + 1);
        } else {
            setSeconds(0); // 59-dan sonra 0-a qayıt
        }
    };

    const decrementSeconds = () => {
        const current = Number(seconds) || 0;
        if (current > 0) {
            setSeconds(current - 1);
        } else {
            setSeconds(59); // 0-dan əvvəl 59-a qayıt
        }
    };

    const inputClasses = `w-full p-4 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200
                            ${isDarkMode ? 'bg-gray-800 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' : 'bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`;

    const buttonClasses = `px-8 py-3 rounded-xl text-lg font-semibold transition duration-300 w-full shadow-lg
                            ${isDarkMode
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                            }`;

    const stepperButtonClasses = `w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 active:scale-95
                                     ${isDarkMode
                                         ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                                         : 'bg-gray-200 text-black hover:bg-gray-300 border border-gray-300'
                                     }`;

    const modalBgClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black';
    const overlayBgClass = isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50';
    const isValid = (Number(hours) || 0) > 0 || (Number(minutes) || 0) > 0 || (Number(seconds) || 0) > 0;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayBgClass} backdrop-blur-sm p-4`}>
            <div className={`p-6 sm:p-8 rounded-2xl shadow-2xl border ${modalBgClass} w-full sm:w-[80%] md:w-[60%] lg:w-[50%] max-w-md transform transition-all duration-300 scale-100`}>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Vaxt Təyin Et
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
                    {/* Saat */}
                    <div className="flex-1">
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Saat
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementHours}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                placeholder="00"
                                value={hours === '' ? '' : String(hours).padStart(2, '0')}
                                onChange={(e) => handleHoursChange(e.target.value)}
                                className={inputClasses}
                                maxLength={2}
                            />
                            <button
                                onClick={incrementHours}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                +
                            </button>
                        </div>
                        <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Max: 23
                        </p>
                    </div>

                    {/* Dəqiqə */}
                    <div className="flex-1">
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Dəqiqə
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementMinutes}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                placeholder="00"
                                value={minutes === '' ? '' : String(minutes).padStart(2, '0')}
                                onChange={(e) => handleMinutesChange(e.target.value)}
                                className={inputClasses}
                                maxLength={2}
                            />
                            <button
                                onClick={incrementMinutes}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                +
                            </button>
                        </div>
                        <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Max: 59
                        </p>
                    </div>

                    {/* Saniyə */}
                    <div className="flex-1">
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Saniyə
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementSeconds}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                placeholder="00"
                                value={seconds === '' ? '' : String(seconds).padStart(2, '0')}
                                onChange={(e) => handleSecondsChange(e.target.value)}
                                className={inputClasses}
                                maxLength={2}
                            />
                            <button
                                onClick={incrementSeconds}
                                className={stepperButtonClasses}
                                type="button"
                            >
                                +
                            </button>
                        </div>
                        <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Max: 59
                        </p>
                    </div>
                </div>

                {/* Hazır şablonlar */}
                <div className="mb-6 sm:mb-8">
                    <p className={`text-sm font-medium mb-2 sm:mb-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hazır Şablonlar
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                            { h: 0, m: 0, s: 30, label: '30 san' },
                            { h: 0, m: 1, s: 0, label: '1 dəq' },
                            { h: 0, m: 2, s: 30, label: '2:30' },
                            { h: 0, m: 5, s: 0, label: '5 dəq' },
                            { h: 0, m: 10, s: 0, label: '10 dəq' },
                            { h: 0, m: 15, s: 0, label: '15 dəq' },
                            { h: 0, m: 30, s: 0, label: '30 dəq' },
                            { h: 0, m: 45, s: 0, label: '45 dəq' },
                            { h: 1, m: 0, s: 0, label: '1 saat' }
                        ].map((preset) => (
                            <button
                                key={`${preset.h}-${preset.m}-${preset.s}`}
                                onClick={() => {
                                    setHours(preset.h);
                                    setMinutes(preset.m);
                                    setSeconds(preset.s);
                                }}
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isDarkMode
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                        }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Düymələr */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onClose}
                        className={`py-3 px-6 rounded-xl border-2 font-semibold transition-all duration-200 flex-1
                                        ${isDarkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                        }`}
                    >
                        Ləğv Et
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`${buttonClasses} flex-1 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Təsdiqlə
                    </button>
                </div>

                {!isValid && (
                    <p className={`text-sm mt-3 text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Minimum 1 saniyə təyin edin
                    </p>
                )}
            </div>
        </div>
    );
};

export default CustomTimeModal;