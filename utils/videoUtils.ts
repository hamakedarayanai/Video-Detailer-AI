
/**
 * Extracts a specified number of frames from a video file and returns them as base64 encoded strings.
 * @param videoFile The video file to process.
 * @param frameCount The number of frames to extract.
 * @returns A promise that resolves to an array of base64 encoded frame strings (without the 'data:image/jpeg;base64,' prefix).
 */
export const extractFramesFromVideo = (videoFile: File, frameCount: number): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];
    
    if (!context) {
      return reject(new Error('Could not create canvas context.'));
    }

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      if (duration === 0 || !isFinite(duration)) {
        URL.revokeObjectURL(video.src);
        return reject(new Error('Video has no duration or is invalid.'));
      }
      
      const interval = duration / (frameCount + 1);
      let currentTime = interval;
      let capturedFrames = 0;

      const captureFrame = () => {
        if (currentTime > duration || capturedFrames >= frameCount) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // Remove the prefix "data:image/jpeg;base64,"
        frames.push(dataUrl.split(',')[1]);
        capturedFrames++;
        currentTime += interval;
        captureFrame();
      };
      
      video.onerror = (e) => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Error loading video file. It may be corrupt or in an unsupported format.'));
      }

      // Start the process
      video.play().then(() => {
          video.pause();
          captureFrame();
      }).catch(err => {
          // Fallback for browsers that don't return a promise or have autoplay issues
          setTimeout(captureFrame, 100);
      });
    };
  });
};
