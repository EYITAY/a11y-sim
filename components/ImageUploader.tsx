import React, { useCallback, useState } from 'react';
import { Icon } from './Icon';

interface ImageUploaderProps {
    uploadedImage: string | null;
    onSetUploadedImage: (image: string | null) => void;
    onExtractColors: () => void;
    isExtracting: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ uploadedImage, onSetUploadedImage, onExtractColors, isExtracting }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onSetUploadedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]){
            handleFile(e.target.files[0]);
        }
    }

    if (uploadedImage) {
        return (
            <div className="space-y-3">
                <div className="relative group">
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full rounded-lg shadow-md" />
                    <button
                        onClick={() => onSetUploadedImage(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200"
                        aria-label="Remove image"
                    >
                        <Icon name="x-circle" className="w-6 h-6" />
                    </button>
                </div>
                <button
                    onClick={onExtractColors}
                    disabled={isExtracting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isExtracting ? (
                        <>
                           <Icon name="loader" className="w-5 h-5 animate-spin"/>
                           Extracting...
                        </>
                    ) : (
                        <>
                            <Icon name="wand-sparkles" className="w-5 h-5 text-blue-500"/>
                            Extract Palette
                        </>
                    )}
                </button>
            </div>
        )
    }

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'}`}
        >
            <input
                type="file"
                id="file-upload"
                className="absolute w-0 h-0 opacity-0"
                onChange={handleFileInput}
                accept="image/*"
            />
            <Icon name="upload" className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
            <label htmlFor="file-upload" className="font-semibold text-blue-600 cursor-pointer hover:underline">
                Choose a file
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or drag and drop</p>
        </div>
    );
};