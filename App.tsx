
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { Loader } from './components/Loader';
import { describeVideoFrames } from './services/geminiService';
import { extractFramesFromVideo } from './utils/videoUtils';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setDescription('');
    setError(null);
  };

  const handleDescribeVideo = useCallback(async () => {
    if (!videoFile) {
      setError('Please upload a video first.');
      return;
    }

    setIsLoading(true);
    setDescription('');
    setError(null);

    try {
      const frames = await extractFramesFromVideo(videoFile, 5);
      if (frames.length === 0) {
        throw new Error("Could not extract any frames from the video. The file might be corrupted or in an unsupported format.");
      }
      
      const generatedDescription = await describeVideoFrames(frames);
      setDescription(generatedDescription);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate description: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [videoFile]);
  
  const handleRemoveVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setDescription('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Video Uploader and Player */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col space-y-6 h-full">
            <h2 className="text-2xl font-bold text-indigo-400">1. Upload Your Video</h2>
            {!videoUrl ? (
              <VideoUploader onVideoUpload={handleVideoUpload} />
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <video ref={videoRef} src={videoUrl} controls className="w-full h-full object-contain"></video>
                </div>
                <div className="text-center text-sm text-gray-400 truncate px-4">{videoFile?.name}</div>
                <button
                  onClick={handleRemoveVideo}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Remove Video
                </button>
              </div>
            )}
             <div className="flex-grow"></div>
             <div>
                <h2 className="text-2xl font-bold text-indigo-400 mb-4">2. Generate Description</h2>
                <button
                onClick={handleDescribeVideo}
                disabled={!videoFile || isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <>
                        <Loader />
                        <span>Analyzing...</span>
                        </>
                    ) : (
                        <span>Describe Video</span>
                    )}
                </button>
             </div>
          </div>

          {/* Right Column: Description Output */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-indigo-400 mb-4">3. AI Generated Description</h2>
            <div className="bg-gray-900/50 rounded-lg p-4 flex-grow h-96 min-h-[24rem] overflow-y-auto custom-scrollbar">
              {isLoading && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Loader />
                    <p className="mt-4 text-lg">AI is watching your video...</p>
                    <p className="text-sm">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-full text-red-400">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">An Error Occurred</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
              )}
              {!isLoading && !error && !description && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>The video description will appear here.</p>
                </div>
              )}
              {description && (
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #1f2937; /* bg-gray-800 */
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4f46e5; /* bg-indigo-600 */
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #4338ca; /* bg-indigo-700 */
            }
        `}</style>
      </main>
    </div>
  );
};

export default App;
