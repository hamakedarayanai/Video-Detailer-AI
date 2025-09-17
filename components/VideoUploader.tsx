
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (files[0].type.startsWith('video/')) {
        onVideoUpload(files[0]);
      } else {
        alert('Please upload a valid video file.');
      }
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].type.startsWith('video/')) {
        onVideoUpload(files[0]);
      } else {
        alert('Please upload a valid video file.');
      }
    }
  }, [onVideoUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      className={`relative w-full h-64 border-2 border-dashed rounded-lg flex flex-col justify-center items-center p-4 text-center transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-500'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="video-upload"
      />
      <div className="flex flex-col items-center text-gray-400 pointer-events-none">
        <UploadIcon className="w-12 h-12 mb-4" />
        <p className="font-semibold">
          <span className="text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm mt-1">MP4, MOV, WebM, etc.</p>
      </div>
    </div>
  );
};
