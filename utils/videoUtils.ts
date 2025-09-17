
/**
 * Extracts a specified number of frames from a video file and returns them as base64 encoded strings.
 * @param videoFile The video file to process.
 * @param frameCount The number of frames to extract.
 * @returns A promise that resolves to an array of base64 encoded frame strings (without the 'data:image/jpeg;base64,' prefix).
 */
export const extractFramesFromVideo = (videoFile: File, frameCount: number): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (videoFile.size === 0) {
      return reject(new Error('The provided video file is empty.'));
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames: string[] = [];
    
    if (!context) {
      return reject(new Error('Could not create canvas context. This may be due to browser limitations.'));
    }

    // Attach a comprehensive error handler early to catch loading issues.
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      let message = 'An unknown error occurred while trying to load the video.';
      // video.error can be null, so we need to check for its existence.
      if (video.error) {
        switch (video.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            message = 'The video loading was aborted. Please try uploading again.';
            break;
          case 2: // MEDIA_ERR_NETWORK
            message = 'A network error occurred. Please check your connection and try again.';
            break;
          case 3: // MEDIA_ERR_DECODE
            message = 'The video file is corrupted or in a format that cannot be decoded by your browser.';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            message = 'The video format is not supported. Please try a different format like MP4 or WebM.';
            break;
        }
      }
      reject(new Error(message));
    };

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      if (duration === 0 || !isFinite(duration)) {
        URL.revokeObjectURL(video.src);
        return reject(new Error('The video file seems to be invalid or corrupted as it has no duration.'));
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

      // Start the process
      video.play().then(() => {
          video.pause();
          captureFrame();
      }).catch(err => {
          // Fallback for browsers that don't return a promise or have autoplay issues
          setTimeout(captureFrame, 200);
      });
    };
  });
};
