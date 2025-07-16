// src/components/ImageUploadButton.tsx
import React, { useRef, ChangeEvent } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageUploadButtonProps {
    onImageUpload: (imageUrl: string) => void;
    isDarkMode: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onImageUpload, isDarkMode }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                onImageUpload(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const iconColor = isDarkMode ? "white" : "black";
    const tabInactiveBgClass = isDarkMode ? 'border-white text-white' : 'border-black text-black';

    return (
        <div className="flex flex-col items-center group">
            <div className={`border opacity-0 group-hover:opacity-100 rounded-2xl px-3 py-2 text-sm whitespace-nowrap ${tabInactiveBgClass}`}>
                Şəkil Yüklə
            </div>
            <ImageIcon
                className='cursor-pointer'
                onClick={triggerFileInput}
                size={28}
                color={iconColor}
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ImageUploadButton;