import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw } from 'lucide-react';
import '../../styles/components/NaturalVoicePodcast.css';

export default function NaturalVoicePodcast({ content, title = "AI Podcast" }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const utteranceRef = useRef(null);
    const intervalRef = useRef(null);
  const { t } = useTranslation(["sandbox"]);

    // Optimized Natural Voice Selection
    const getOptimizedVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        
        // Priority 1: Google voices (premium quality)
        const googleVoice = voices.find(v => 
            v.lang.startsWith('id') && v.voiceURI.includes('Google')
        );
        if (googleVoice) return googleVoice;

        // Priority 2: Premium OS voices for Indonesian
        const premiumVoice = voices.find(v => 
            v.lang.startsWith('id') && (v.localService === false || v.name.includes('Premium'))
        );
        if (premiumVoice) return premiumVoice;

        // Priority 3: Any Indonesian voice
        const idVoice = voices.find(v => v.lang.startsWith('id'));
        if (idVoice) return idVoice;

        // Fallback: Default voice
        return voices[0];
    }, []);

    // Calculate estimated duration (rough estimation: ~150 words per minute)
    useEffect(() => {
        if (content) {
            const wordCount = content.split(/\s+/).length;
            const estimatedSeconds = (wordCount / 150) * 60;
            setDuration(estimatedSeconds);
        }
    }, [content]);

    // Play/Pause Handler
    const handlePlayPause = useCallback(() => {
        if (!content) return;

        if (isPlaying) {
            // Pause
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        } else {
            // Play
            const utterance = new SpeechSynthesisUtterance(content);
            
            // Voice optimization
            const optimizedVoice = getOptimizedVoice();
            if (optimizedVoice) {
                utterance.voice = optimizedVoice;
            }
            
            // Natural voice settings
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;  // Slightly slower for clarity
            utterance.pitch = 1.05; // Slightly higher for warmth
            utterance.volume = 1.0;

            // Event handlers
            utterance.onstart = () => {
                setIsPlaying(true);
                setCurrentTime(0);
                
                // Progress tracking
                intervalRef.current = setInterval(() => {
                    setCurrentTime(prev => {
                        const newTime = prev + 0.1;
                        setProgress((newTime / duration) * 100);
                        return newTime;
                    });
                }, 100);
            };

            utterance.onend = () => {
                setIsPlaying(false);
                setProgress(100);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsPlaying(false);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);

            // OPTIONAL: ElevenLabs API Integration Point
            // If you want to upgrade to premium AI voices in the future, 
            // replace the above speechSynthesis.speak() with:
            /*
            const fetchElevenLabsAudio = async () => {
                const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID', {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': 'YOUR_API_KEY'
                    },
                    body: JSON.stringify({
                        text: content,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                });
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                // Add audio event listeners for progress tracking
            };
            fetchElevenLabsAudio();
            */
        }
    }, [content, isPlaying, duration, getOptimizedVoice]);

    // Reset Handler
    const handleReset = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!content) {
        return (
            <div className="podcast-player-empty">
                <div className="podcast-empty-icon">🎙️</div>
                <p>{t("sandbox:podcastEmptyTitle")}</p>
                <p className="podcast-empty-hint">{t("sandbox:podcastEmptySubtitle")}</p>
            </div>
        );
    }

    return (
        <div className="podcast-player-container">
            <div className="podcast-player-card">
                {/* Album Art / Visual */}
                <div className="podcast-album-art">
                    <div className={`podcast-sound-wave ${isPlaying ? 'playing' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Podcast Info */}
                <div className="podcast-info">
                    <h3 className="podcast-title">{title}</h3>
                    <p className="podcast-subtitle">AI-Generated Audio</p>
                    <p className="podcast-duration">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="podcast-progress-container">
                    <div className="podcast-progress-track">
                        <div 
                            className="podcast-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="podcast-controls">
                    <button 
                        className="podcast-control-btn secondary"
                        onClick={handleReset}
                        disabled={!isPlaying && progress === 0}
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button 
                        className="podcast-control-btn primary"
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>

                    <div className="podcast-control-spacer" />
                </div>

                {/* Voice Info */}
                <div className="podcast-voice-info">
                    <span className="podcast-voice-badge">
                        Natural Voice • Indonesian
                    </span>
                </div>
            </div>
        </div>
    );
}
