import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { Loader } from './components/Loader';
import { describeVideoFrames, VideoDescription } from './services/geminiService';
import { extractFramesFromVideo } from './utils/videoUtils';
import { DescriptionDisplay } from './components/DescriptionDisplay';
import { CheckIcon, ClipboardIcon } from './components/icons';
import { DescriptionSkeleton } from './components/DescriptionSkeleton';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<VideoDescription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setDescription(null);
    setError(null);
  };

  const handleDescribeVideo = useCallback(async () => {
    if (!videoFile) {
      setError('Please upload a video first.');
      return;
    }

    setIsLoading(true);
    setDescription(null);
    setError(null);

    try {
      const frames = await extractFramesFromVideo(videoFile, 5);
      if (frames.length === 0) {
        throw new Error("Could not extract any frames from the video. The file might be corrupted or in an unsupported format.");
      }
      
      const timeoutPromise = new Promise<VideoDescription>((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timed out after 30 seconds. Please check your connection or try again later.')), 30000)
      );
      
      const generatedDescription = await Promise.race([
        describeVideoFrames(frames),
        timeoutPromise,
      ]);

      setDescription(generatedDescription);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
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
    setDescription(null);
    setError(null);
  };
  
  const formatDescriptionForCopying = (desc: VideoDescription): string => {
    let text = `Summary:\n${desc.summary}\n\n`;
    text += `Setting:\n${desc.setting}\n\n`;
    if (desc.keyElements && desc.keyElements.length > 0) {
        text += `Key Elements:\n- ${desc.keyElements.join('\n- ')}\n\n`;
    }
    if (desc.sequenceOfEvents && desc.sequenceOfEvents.length > 0) {
        text += `Sequence of Events:\n${desc.sequenceOfEvents.map((event, index) => `${index + 1}. ${event}`).join('\n')}`;
    }
    return text.trim();
  };

  const handleCopyToClipboard = () => {
    if (!description) return;

    const textToCopy = formatDescriptionForCopying(description);
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Revert after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy description to clipboard.');
    });
  };


  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Video Uploader and Player */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 shadow-xl p-6 flex flex-col space-y-6 h-full transition-all duration-300 hover:shadow-indigo-500/20">
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
                  className="w-full bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 shadow-xl p-6 flex flex-col transition-all duration-300 hover:shadow-indigo-500/20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-400">3. AI Generated Description</h2>
                {description && !isLoading && (
                    <button
                        onClick={handleCopyToClipboard}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center transition-colors duration-200 ${
                            isCopied
                            ? 'bg-green-600/80 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        aria-label={isCopied ? 'Copied to clipboard' : 'Copy description to clipboard'}
                    >
                        {isCopied ? (
                            <CheckIcon className="h-4 w-4 mr-1.5" />
                        ) : (
                            <ClipboardIcon className="h-4 w-4 mr-1.5" />
                        )}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
            <div className="bg-black/20 rounded-lg flex-grow h-96 min-h-[24rem] overflow-y-auto custom-scrollbar">
              {isLoading && <DescriptionSkeleton />}
              {error && (
                <div className="flex items-center justify-center h-full text-red-400 p-4">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">An Error Occurred</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
              )}
              {!isLoading && !error && !description && (
                <div className="flex items-center justify-center h-full text-gray-500 p-4">
                  <p>The video description will appear here.</p>
                </div>
              )}
              {description && (
                <div className="p-4">
                    <DescriptionDisplay description={description} />
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`
            body {
                background-color: #030712;
                background-image: radial-gradient(at 27% 37%, hsla(215, 98%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 97% 21%, hsla(135, 98%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 52% 99%, hsla(355, 98%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 10% 29%, hsla(256, 96%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 97% 96%, hsla(38, 96%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 33% 50%, hsla(222, 97%, 43%, 0.1) 0px, transparent 50%),
                                  radial-gradient(at 79% 53%, hsla(343, 97%, 43%, 0.1) 0px, transparent 50%);
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4f46e5;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #4338ca;
            }
        `}</style>
      </main>
    </div>
  );
};

export default App;