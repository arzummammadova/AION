// src/components/ImageSelector.tsx
import React from 'react';
import ImageUploadButton from './ImageUploadButton'; // Make sure this path is correct

interface ImageSelectorProps {
    onImageSelect: (imageUrl: string) => void;
    currentBackgroundImage: string;
    isDarkMode: boolean;
}

const predefinedImages = [
    '/images/aionbg.png', // Default image
    '/images/aion_2.jpg',
    '/images/aion_3.jpg',
    // Add more predefined image paths as needed
];

const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelect, currentBackgroundImage, isDarkMode }) => {
    const tabActiveBgClass = isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black';
    const tabInactiveBgClass = isDarkMode ? 'border-white text-white' : 'border-black text-black';
    const textColorClass = isDarkMode ? "text-white" : "text-black";

    return (
        <div className="flex flex-col items-center mt-8">
            {/* <h3 className={`text-xl font-semibold mb-4 ${textColorClass}`}>Arxa Fon Şəkli Seçin</h3> */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {predefinedImages.map((imagePath, index) => (
                    <div
                        key={index}
                        className={`w-24 h-24 cursor-pointer border-2 rounded-lg overflow-hidden
                            ${currentBackgroundImage === imagePath ? 'border-blue-500 ring-2 ring-blue-500' : 'border-transparent hover:border-gray-400'}
                            transition-all duration-200`}
                        onClick={() => onImageSelect(imagePath)}
                        title={`Öncədən Yüklənmiş Şəkil ${index + 1}`}
                    >
                        <img
                            src={imagePath}
                            alt={`Background option ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            <p className={`mb-4 ${textColorClass}`}>və ya öz şəklinizi yükləyin:</p>
            <ImageUploadButton onImageUpload={onImageSelect} isDarkMode={isDarkMode} />
        </div>
    );
};

export default ImageSelector;