import React, { useState } from 'react';
import { X } from 'lucide-react';
import ImageSelector from './ImageSelector'; // Ensure this path is correct

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (imageUrl: string) => void;
    currentBackgroundImage: string;
    isDarkMode: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onImageSelect,
    currentBackgroundImage,
    isDarkMode,
}) => {
    const [activeSection, setActiveSection] = useState<'background' | 'general'>('background'); // Default to background

    if (!isOpen) return null;

    const modalBgClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black';
    const borderColorClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
    const closeIconColor = isDarkMode ? "white" : "black";
    const sidebarBgClass = isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-gray-100 border-r border-gray-300';
    const activeTabClass = isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white';
    const inactiveTabClass = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200';

    const renderContent = () => {
        switch (activeSection) {
            case 'background':
                return (
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-4">Fon Şəkli Seçimləri</h3>
                        <ImageSelector
                            onImageSelect={onImageSelect}
                            currentBackgroundImage={currentBackgroundImage}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                );
            case 'general':
                return (
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-4">Ümumi Ayarlar</h3>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Burada gələcək ümumi ayarlar yerləşəcək.</p>
                        {/* Example of a future setting */}
                        {/* <div className="mt-4">
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox" />
                                <span className="ml-2">Səs Effektivlərini Aç/Bağla</span>
                            </label>
                        </div> */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-opacity-20 transition-opacity duration-300">
            <div
                className={`relative w-full max-w-4xl h-5/6 rounded-lg shadow-xl flex overflow-hidden ${modalBgClass} border ${borderColorClass}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
                >
                    <X size={24} color={closeIconColor} />
                </button>

                {/* Left Sidebar (30%) */}
                <div className={`w-1/4 min-w-[180px] ${sidebarBgClass} p-4 flex flex-col`}>
                    <h2 className="text-2xl font-bold mb-6">Ayarlar</h2>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setActiveSection('background')}
                                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 ${activeSection === 'background' ? activeTabClass : inactiveTabClass}`}
                            >
                                Fon Şəkilləri
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveSection('general')}
                                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200 ${activeSection === 'general' ? activeTabClass : inactiveTabClass}`}
                            >
                                Ümumi Ayarlar
                            </button>
                        </li>
                        {/* Add more setting sections here */}
                    </ul>
                </div>

                {/* Right Content Area (70%) */}
                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;