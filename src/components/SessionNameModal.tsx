import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface SessionNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    currentName: string;
}

const SessionNameModal: React.FC<SessionNameModalProps> = ({ isOpen, onClose, onConfirm, currentName }) => {
    const [sessionNameInput, setSessionNameInput] = useState(currentName);

    // Modal açıldığında inputu cari adla doldur
    useEffect(() => {
        setSessionNameInput(currentName);
    }, [currentName, isOpen]);

    const handleConfirm = () => {
        if (sessionNameInput.trim() !== '') {
            onConfirm(sessionNameInput.trim());
            onClose(); // Təsdiqdən sonra modalı bağla
        } else {
            alert("Zəhmət olmasa bir sessiya adı daxil edin.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#1e1e1e8f]  bg-opacity-75 flex items-center justify-center z-[100] p-4">
            <div className="bg-gradient-to-b from-[#eeecf2] to-[#E7D8FF] rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-amber-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                    title="Bağla"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl text-black font-semibold mb-6 text-center">Sessiyaya Ad Ver</h2>

                {/* Input for Timer Session Name with improved design */}
                <div className="relative w-full mb-8">
                    <input
                        type="text"
                        placeholder="Taymer sessiyasının adını daxil edin"
                        value={sessionNameInput}
                        onChange={(e) => setSessionNameInput(e.target.value)}
                        className="
                            w-full bg-transparent border-b-2 border-gray-600 text-black
                            py-2 px-0 focus:outline-none focus:border-amber-400
                            transition-all duration-300 peer
                        "
                    />
                    <div className="
                        absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300
                        peer-focus:w-full peer-focus:left-0
                        peer-not-placeholder-shown:w-full peer-not-placeholder-shown:left-0
                    "></div>
                    {/* <label className="
                        absolute left-0 -top-6 text-gray-600 text-sm transition-all duration-300
                        peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                        peer-focus:-top-6 peer-focus:text-amber-200 peer-focus:text-sm
                        peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-amber-200 peer-not-placeholder-shown:text-sm
                    ">Sessiya adı</label> */}
                </div>

                {/* Confirm Name Button */}
                <button
                    onClick={handleConfirm}
                    disabled={sessionNameInput.trim() === ''}
                    className="
                        w-full px-5 py-3 rounded-xl text-lg font-semibold
                        bg-black text-[white]
                        hover:bg-amber-300 transition duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    Adı Təsdiqlə
                </button>
            </div>
        </div>
    );
};

export default SessionNameModal;