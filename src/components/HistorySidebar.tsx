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
}) => {
    return (
        <>
            {/* Sidebar for past sessions */}
            <div
                className={`fixed top-0 left-0 h-full bg-[#2a2a2a] transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
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
                                <p className='text-lg text-white'>Ad: {session.name || 'Ad yoxdur'}</p>
                                <p className="text-md font-semibold text-white">Müddət: {session.selectedDuration} dəqiqə</p>
                                <p className="text-sm text-gray-300">Başlama: {new Date(session.startTime).toLocaleString('az-AZ')}</p> {/* Lokalizasiya əlavə edildi */}
                                {session.endTime && <p className="text-sm text-gray-300">Bitmə: {new Date(session.endTime).toLocaleString('az-AZ')}</p>} {/* Lokalizasiya əlavə edildi */}
                                <p className="text-sm text-gray-300">İşləyən Vaxt: {formatTime(session.elapsedTime)}</p>
                                {session.totalPausedTime > 0 && <p className="text-sm text-gray-300">Fasilə Vaxtı: {formatTime(session.totalPausedTime)}</p>}
                                <p className="text-sm text-amber-300">Status: {session.status}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {/* Edit icon for individual sessions in sidebar */}
                                <button
                                    onClick={() => handleEditSessionName(session._id, session.name || '')}
                                    className="text-blue-400 hover:text-blue-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Sessiyanı Redaktə Et"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTimer(session._id)}
                                    className="text-red-400 hover:text-red-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                    title="Sessiyanı Sil"
                                >
                                    <Trash2 size={20} />
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