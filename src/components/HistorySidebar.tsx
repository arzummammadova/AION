import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

// TimerSession interfeysini buraya da əlavə edirik, çünki bu komponent də istifadə edəcək
interface TimerSession {
    _id: string;
    selectedDuration: number;
    startTime: string;
    endTime?: string;
    status: 'running' | 'paused' | 'completed' | 'stopped';
    elapsedTime: number;
    totalPausedTime: number;
    name?: string;
}

interface HistorySidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    timerSessions: TimerSession[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
    formatTime: (seconds: number) => string;
    handleDeleteTimer: (timerId: string) => Promise<void>;
    handleEditSessionName: (timerId: string, currentName: string) => Promise<void>;
    isDarkMode: boolean; // <-- Yeni isDarkMode prop'u
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    toggleSidebar,
    timerSessions,
    loading,
    error,
    formatTime,
    handleDeleteTimer,
    handleEditSessionName,
    isDarkMode, // <-- Prop'u qəbul edin
}) => {
    // Dark/Light mode üçün siniflər
    const sidebarBgClass = isDarkMode ? "bg-gray-900" : "bg-gray-100"; // Sidebar fonu
    const headingColorClass = isDarkMode ? "text-amber-300" : "text-purple-700"; // Başlıq rəngi
    const textColorClass = isDarkMode ? "text-white" : "text-gray-800"; // Ümumi mətn rəngi
    const mutedTextColorClass = isDarkMode ? "text-gray-400" : "text-gray-600"; // Zəif mətn rəngi
    const sessionBorderColorClass = isDarkMode ? "border-gray-700" : "border-gray-300"; // Sessiya sərhəd rəngi
    const sessionBgClass = isDarkMode ? "bg-gray-800" : "bg-white"; // Sessiya elementinin fonu
    const statusColorClass = isDarkMode ? "text-amber-400" : "text-blue-600"; // Status mətni rəngi

    // İkon rəngləri üçün dinamik funksiyalar
    const getCloseIconColor = () => isDarkMode ? "white" : "black";
    const getEditIconColor = () => isDarkMode ? "#60A5FA" : "#3B82F6"; // blue-400 / blue-500
    const getTrashIconColor = () => isDarkMode ? "#F87171" : "#EF4444"; // red-400 / red-500

    return (
        <>
            {/* Sidebar for past sessions */}
            <div
                className={`fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } w-100 p-4 z-50 overflow-y-auto shadow-lg ${sidebarBgClass}`} // Sidebar fonunu dinamik etdik
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-2xl font-bold ${headingColorClass}`}>Keçmiş Taymer Sessiyaları</h2> {/* Başlıq rəngi dinamik */}
                    <button onClick={toggleSidebar} className={`${textColorClass} hover:opacity-75`}>
                        <X size={24} color={getCloseIconColor()} /> {/* İkon rəngi dinamik */}
                    </button>
                </div>

                {loading === 'pending' && timerSessions.length === 0 && <p className={`${mutedTextColorClass} text-center`}>Sessiyalar yüklənir...</p>}
                {timerSessions.length === 0 && loading !== 'pending' && <p className={`${mutedTextColorClass} text-center`}>Hələ heç bir taymer sessiyanız yoxdur.</p>}

                <div className="space-y-4"> {/* Sessiyalar arasında boşluq */}
                    {timerSessions.map((session) => (
                        <div
                            key={session._id}
                            className={`rounded-lg p-4 shadow-md ${sessionBgClass} ${sessionBorderColorClass} border`} // Sessiya fonu və kənar xətt dinamik
                        >
                            <div>
                                <p className={`text-lg font-semibold ${textColorClass}`}>Ad: {session.name || 'Ad yoxdur'}</p>
                                <p className={`text-md ${textColorClass}`}>Müddət: {session.selectedDuration} dəqiqə</p>
                                <p className={`text-sm ${mutedTextColorClass}`}>Başlama: {new Date(session.startTime).toLocaleString('az-AZ')}</p>
                                {session.endTime && <p className={`text-sm ${mutedTextColorClass}`}>Bitmə: {new Date(session.endTime).toLocaleString('az-AZ')}</p>}
                                <p className={`text-sm ${mutedTextColorClass}`}>İşləyən Vaxt: {formatTime(session.elapsedTime)}</p>
                                {session.totalPausedTime > 0 && <p className={`text-sm ${mutedTextColorClass}`}>Fasilə Vaxtı: {formatTime(session.totalPausedTime)}</p>}
                                <p className={`text-sm font-medium ${statusColorClass}`}>Status: {session.status}</p>
                            </div>
                            <div className="flex gap-2 mt-3 justify-end"> {/* Düymələri sağa hizaladıq */}
                                {/* Edit icon for individual sessions in sidebar */}
                                <button
                                    onClick={() => handleEditSessionName(session._id, session.name || '')}
                                    className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                    title="Sessiyanı Redaktə Et"
                                >
                                    <Edit size={20} color={getEditIconColor()} /> {/* İkon rəngi dinamik */}
                                </button>
                                <button
                                    onClick={() => handleDeleteTimer(session._id)}
                                    className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                    title="Sessiyanı Sil"
                                >
                                    <Trash2 size={20} color={getTrashIconColor()} /> {/* İkon rəngi dinamik */}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};

export default HistorySidebar;