import { useState, useRef, useEffect } from 'react';
import translations from '../utils/translations';

function VoiceRecorder({ onRecordingComplete, disabled, language = 'en' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceDetectionRef = useRef(null);
  const streamRef = useRef(null);

  // Get auto-stop setting from localStorage
  const autoStopEnabled = localStorage.getItem('voice_auto_stop') !== 'false'; // Default to true if not set

  // Function to detect silence in audio stream
  const setupSilenceDetection = (stream) => {
    if (!autoStopEnabled) return; // Skip if auto-stop is disabled

    try {
      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyzer node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      // Connect microphone to analyzer
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      // Variables for silence detection
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Silence detection parameters - extremely sensitive settings
      const SILENCE_DURATION = 500; // Extremely short duration (0.5 second) to stop recording very quickly
      const VOLUME_MEMORY_SIZE = 20; // Number of recent volume samples to keep
      const RELATIVE_THRESHOLD_RATIO = 0.4; // Ratio for relative threshold (40% of recent peak)
      const INACTIVITY_THRESHOLD = 0.5; // Ratio to detect inactivity (50% drop from speaking volume)

      // Variables for dynamic threshold
      let volumeHistory = [];
      let speakingVolume = 0; // Tracks the volume when user is speaking
      let backgroundVolume = 0; // Tracks the background noise level
      let silenceStart = null;
      let isSilent = false;
      let calibrationComplete = false;
      let calibrationSamples = 0;
      const CALIBRATION_SAMPLES = 10; // Number of samples to collect before calibration is complete

      // Function to update volume history and calculate dynamic thresholds
      const updateVolumeHistory = (currentVolume) => {
        // Add current volume to history
        volumeHistory.push(currentVolume);

        // Keep only the most recent samples
        if (volumeHistory.length > VOLUME_MEMORY_SIZE) {
          volumeHistory.shift();
        }

        // During calibration phase
        if (!calibrationComplete) {
          calibrationSamples++;

          // Update background noise level (average of first few samples)
          backgroundVolume = volumeHistory.reduce((sum, vol) => sum + vol, 0) / volumeHistory.length;

          // After collecting enough samples, finalize calibration
          if (calibrationSamples >= CALIBRATION_SAMPLES) {
            calibrationComplete = true;
            console.log(`Calibration complete. Background noise level: ${backgroundVolume.toFixed(2)}`);
          }
          return { threshold: backgroundVolume * 1.5 }; // Higher threshold during calibration
        }

        // After calibration, track speaking volume and continuously adapt to background noise
        const recentMax = Math.max(...volumeHistory);
        const recentMin = Math.min(...volumeHistory.slice(-5)); // Get minimum from recent samples

        // Continuously adapt background noise level (very slowly)
        // This helps adjust to changing environments during longer recordings
        if (volumeHistory.length >= 10) { // Wait until we have enough samples
          // If we detect a consistent low level, slowly adjust background noise level
          if (recentMin < backgroundVolume * 1.5 && recentMax < backgroundVolume * 2) {
            // Very slow adaptation (0.5% per sample) to avoid false triggers
            backgroundVolume = backgroundVolume * 0.995 + recentMin * 0.005;
          }
        }

        // If current volume is significantly above background, update speaking volume
        if (currentVolume > backgroundVolume * 2) {
          // Gradually adjust speaking volume (weighted average)
          speakingVolume = speakingVolume === 0 ?
            currentVolume :
            speakingVolume * 0.7 + currentVolume * 0.3;
        }

        // Calculate dynamic threshold based on both background noise and speaking volume
        let dynamicThreshold;

        if (speakingVolume > 0) {
          // If we've detected speaking, use relative threshold based on speaking volume
          dynamicThreshold = Math.max(
            backgroundVolume * 1.2, // At least 20% above background noise
            speakingVolume * INACTIVITY_THRESHOLD // 60% drop from speaking volume
          );
        } else {
          // If no speaking detected yet, use threshold based on background
          dynamicThreshold = backgroundVolume * 1.5;
        }

        return {
          threshold: dynamicThreshold,
          isSpeaking: currentVolume > dynamicThreshold,
          backgroundLevel: backgroundVolume,
          speakingLevel: speakingVolume
        };
      };

      // Start silence detection loop
      silenceDetectionRef.current = setInterval(() => {
        if (!isRecording) return;

        // Get volume data
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Update volume history and get dynamic threshold
        const { threshold, isSpeaking, backgroundLevel, speakingLevel } = updateVolumeHistory(average);

        // Check if current audio level indicates silence (below threshold)
        if (!isSpeaking) {
          // If we weren't in silence before, mark the start time
          if (!isSilent) {
            console.log(`Silence started. Audio level: ${average.toFixed(2)}, threshold: ${threshold.toFixed(2)}, ` +
                      `background: ${backgroundLevel.toFixed(2)}, speaking: ${speakingLevel.toFixed(2)}`);
            silenceStart = Date.now();
            isSilent = true;
          } else {
            const silenceDuration = Date.now() - silenceStart;

            // Only consider stopping if we've completed calibration and detected speaking before
            // Add a time-based threshold reduction - the longer we record, the more sensitive we become
            const recordingTimeAdjustment = Math.min(0.2, recordingTime * 0.01); // Up to 20% reduction after 20 seconds
            const adjustedThreshold = threshold * (1 - recordingTimeAdjustment);

            if ((silenceDuration > SILENCE_DURATION && calibrationComplete && speakingVolume > 0) ||
                (recordingTime > 5 && silenceDuration > 1000)) { // Force stop after 1 second of silence if recording > 5 seconds
              // If silence has continued for the threshold duration, stop recording
              console.log(`Silence detected for ${silenceDuration}ms, stopping recording automatically. ` +
                        `Last level: ${average.toFixed(2)}, threshold: ${adjustedThreshold.toFixed(2)}, ` +
                        `recording time: ${recordingTime}s`);
              stopRecording();
            } else if (silenceDuration % 200 === 0) { // Log every 200ms during silence
              console.log(`Silence continuing for ${silenceDuration}ms. Audio level: ${average.toFixed(2)}, ` +
                        `threshold: ${threshold.toFixed(2)}, background: ${backgroundLevel.toFixed(2)}`);
            }
          }
        } else {
          // Reset silence detection if sound is detected
          if (isSilent) {
            console.log(`Silence ended. Audio level: ${average.toFixed(2)}, threshold: ${threshold.toFixed(2)}, ` +
                      `background: ${backgroundLevel.toFixed(2)}, speaking: ${speakingLevel.toFixed(2)}`);
          }
          isSilent = false;
          silenceStart = null;
        }
      }, 50); // Check every 50ms for extremely responsive detection
    } catch (error) {
      console.error('Error setting up silence detection:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudioBlob(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        // Clean up silence detection
        if (silenceDetectionRef.current) {
          clearInterval(silenceDetectionRef.current);
          silenceDetectionRef.current = null;
        }

        // Close audio context if it exists
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(err => console.error('Error closing audio context:', err));
          audioContextRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Setup silence detection
      setupSilenceDetection(stream);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      clearInterval(timerRef.current);

      // Clear silence detection interval
      if (silenceDetectionRef.current) {
        clearInterval(silenceDetectionRef.current);
        silenceDetectionRef.current = null;
      }
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (silenceDetectionRef.current) {
        clearInterval(silenceDetectionRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error('Error closing audio context:', err));
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const processAudioBlob = async (audioBlob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1]; // Remove the data URL prefix
        onRecordingComplete(base64Audio);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get translations based on current interface language
  const t = translations[language];

  // Use a div with onClick instead of a button to avoid any form-related behavior
  return (
    <div className="voice-recorder">
      <div
        role="button"
        className={`mic-button ${isRecording ? 'recording' : ''}`}
        onClick={(e) => {
          e.preventDefault(); // Prevent any form submission
          e.stopPropagation(); // Stop event bubbling
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }}
        onKeyDown={(e) => {
          // Handle keyboard accessibility
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }
        }}
        aria-disabled={disabled ? 'true' : 'false'}
        aria-label={isRecording ? t.stopRecording : t.micButtonTitle}
        title={isRecording ? t.stopRecording : t.micButtonTitle}
        tabIndex={disabled ? -1 : 0} // Only focusable when not disabled
      >
        {isRecording ? (
          <>
            <span className="recording-icon"></span>
            <span className="recording-time-small">{formatTime(recordingTime)}</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <span className="mic-text">{t.micButton}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
