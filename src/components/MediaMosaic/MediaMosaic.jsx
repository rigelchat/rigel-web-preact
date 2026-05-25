import { useMemo, useRef, useState, useEffect } from "preact/hooks";
import "./MediaMosaic.css";

const MAX_WIDTH = 550;
const MAX_HEIGHT = 400;

const gridItemSize = Math.round((MAX_WIDTH - 8) / 3);
const halfGridSize = Math.round((MAX_WIDTH - 4) / 2);
const halfGridHeight = Math.round((MAX_HEIGHT - 4) / 2);
const largeItemWidth = Math.round(2 * (MAX_WIDTH - 4) / 3);
const smallItemWidth = largeItemWidth / 2;

// Fonction pour déterminer si un fichier est une image
function isImage(attachment) {
    if (!attachment.contentType) return false;
    return attachment.contentType.startsWith('image/');
}

// Fonction pour déterminer si un fichier est une vidéo
function isVideo(attachment) {
    if (!attachment.contentType) return false;
    return attachment.contentType.startsWith('video/');
}

// Fonction pour déterminer si c'est un média visuel
function isVisualMedia(attachment) {
    return isImage(attachment) || isVideo(attachment);
}

// Composant pour un item média unique
function MediaItem({ attachment, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT, useFullWidth = true, isSingleItem = false, localStorage }) {
    const isImg = isImage(attachment);
    const isVid = isVideo(attachment);
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCover, setShowCover] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(() => {
        // Initialiser avec la valeur du localStorage ou 1 par défaut
        return localStorage?.getVideoVolume?.() ?? 1;
    });
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [previewTime, setPreviewTime] = useState(0);
    const [previewPosition, setPreviewPosition] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(1);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const [isMouseInVideo, setIsMouseInVideo] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
    const [bufferedPercent, setBufferedPercent] = useState(0);
    const volumeBarRef = useRef(null);
    const progressBarRef = useRef(null);

    const handlePlayVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                // Si la vidéo est terminée, la remettre au début
                if (isVideoEnded) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                    setIsVideoEnded(false);
                }
                // Désactiver le mute quand on lance la vidéo
                videoRef.current.muted = false;
                videoRef.current.play();
                setIsPlaying(true);
                setShowCover(false);
            }
        }
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    const handleVideoPlay = () => {
        setIsPlaying(true);
        setShowCover(false);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            updateBufferedPercent();
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            updateBufferedPercent();
        }
    };

    // Fonction pour calculer le pourcentage de buffer
    const updateBufferedPercent = () => {
        if (videoRef.current && videoRef.current.duration > 0) {
            const buffered = videoRef.current.buffered;
            if (buffered.length > 0) {
                // Prendre le dernier range de buffer (le plus avancé)
                const bufferedEnd = buffered.end(buffered.length - 1);
                const percent = (bufferedEnd / videoRef.current.duration) * 100;
                setBufferedPercent(Math.min(100, percent));
            }
        }
    };

    // Gestionnaire pour l'événement progress (chargement du buffer)
    const handleProgress = () => {
        updateBufferedPercent();
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        setIsVideoEnded(true);
    };

    const handleProgressBarMouseDown = (e) => {
        e.preventDefault();
        if (videoRef.current && duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = Math.max(0, Math.min(duration, percent * duration));
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            
            // Reset l'état "ended" si on navigue manuellement
            if (isVideoEnded) {
                setIsVideoEnded(false);
            }
            
            // Activer le drag-and-drop automatiquement
            setIsDraggingProgress(true);
            document.body.classList.add('dragging-progress');
        }
    };

    const handleProgressMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Empêcher la propagation vers handleProgressBarMouseDown
        setIsDraggingProgress(true);
        document.body.classList.add('dragging-progress');
    };

    const handleProgressMouseMove = (e) => {
        if (!isDraggingProgress || !progressBarRef.current || !videoRef.current || duration <= 0) return;
        
        e.preventDefault();
        const rect = progressBarRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(duration, percent * duration));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        
        // Reset l'état "ended" si on navigue manuellement
        if (isVideoEnded) {
            setIsVideoEnded(false);
        }
    };

    const handleProgressMouseUp = () => {
        setIsDraggingProgress(false);
        document.body.classList.remove('dragging-progress');
    };

    const handleVolumeChange = (newVolume) => {
        // Arrondir pour éviter les problèmes de précision
        let correctedVolume = Math.round(newVolume * 100) / 100;
        
        // Traiter les valeurs très proches de 0 comme 0
        if (correctedVolume < 0.01) {
            correctedVolume = 0;
        }

        setVolume(correctedVolume);
        // Sauvegarder le volume dans le localStorage
        if (localStorage?.setVideoVolume) {
            localStorage.setVideoVolume(correctedVolume);
        }
        if (videoRef.current) {
            videoRef.current.volume = correctedVolume;
            if (correctedVolume > 0) {
                setIsMuted(false);
                videoRef.current.muted = false;
            }
        }
    };

    const handleVolumeBarMouseDown = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        // Pour une barre verticale (rotée 270°), on utilise clientY et on inverse
        const percent = 1 - ((e.clientY - rect.top) / rect.height);
        const newVolume = Math.max(0, Math.min(1, percent));
        handleVolumeChange(newVolume);
        
        // Activer le drag-and-drop automatiquement
        setIsDraggingVolume(true);
        setShowVolumeSlider(true);
        document.body.classList.add('dragging-volume');
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                // Unmute: restaurer le volume précédent
                const volumeToRestore = previousVolume > 0 ? previousVolume : 0.5;
                handleVolumeChange(volumeToRestore);
                videoRef.current.muted = false;
                setIsMuted(false);
            } else {
                // Mute: sauvegarder le volume actuel et mettre à 0
                setPreviousVolume(volume);
                handleVolumeChange(0);
                videoRef.current.muted = true;
                setIsMuted(true);
            }
        }
    };

    const handleVolumeMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Empêcher la propagation vers handleVolumeBarMouseDown
        setIsDraggingVolume(true);
        setShowVolumeSlider(true);
        document.body.classList.add('dragging-volume');
    };

    const handleVolumeMouseMove = (e) => {
        if (!isDraggingVolume || !volumeBarRef.current) return;
        
        const rect = volumeBarRef.current.getBoundingClientRect();
        const percent = 1 - ((e.clientY - rect.top) / rect.height);
        const newVolume = Math.max(0, Math.min(1, percent));
        handleVolumeChange(newVolume);
    };

    const handleVolumeMouseUp = () => {
        setIsDraggingVolume(false);
        document.body.classList.remove('dragging-volume');
        // Fermer le slider après le drag (avec un petit délai pour éviter le flicker)
        setTimeout(() => {
            setShowVolumeSlider(false);
        }, 100);
    };

    const handleVolumeButtonEnter = () => {
        setShowVolumeSlider(true);
    };

    const handleVolumeButtonLeave = () => {
        // Ne pas cacher le slider si on est en train de drag
        if (!isDraggingVolume) {
            setShowVolumeSlider(false);
        }
    };

    const handleVolumeButtonFocus = () => {
        setShowVolumeSlider(true);
    };

    const handleVolumeButtonBlur = () => {
        // Ne pas cacher le slider si on est en train de drag
        if (!isDraggingVolume) {
            setShowVolumeSlider(false);
        }
    };

    const handleVolumeKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const step = 0.05; // 5% par pression de touche
            let newVolume = volume;
            
            if (e.key === 'ArrowUp') {
                newVolume = Math.min(1, volume + step);
            } else if (e.key === 'ArrowDown') {
                newVolume = Math.max(0, volume - step);
            }
            
            handleVolumeChange(newVolume);
            setShowVolumeSlider(true); // Montrer le slider pendant l'ajustement
            
            // Fermer le slider après un délai si plus de focus
            setTimeout(() => {
                if (document.activeElement !== e.target) {
                    setShowVolumeSlider(false);
                }
            }, 1000);
        }
    };

    // Event listeners pour le drag global du volume
    useEffect(() => {
        const handleGlobalMouseMove = (e) => handleVolumeMouseMove(e);
        const handleGlobalMouseUp = () => handleVolumeMouseUp();

        if (isDraggingVolume) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDraggingVolume]);

    // Event listeners pour le drag global de la progression
    useEffect(() => {
        const handleGlobalMouseMove = (e) => handleProgressMouseMove(e);
        const handleGlobalMouseUp = () => handleProgressMouseUp();

        if (isDraggingProgress) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDraggingProgress]);

    const toggleFullscreen = () => {
        setIsCustomFullscreen(prev => !prev);
    };

    // Gestion de la touche Échap pour sortir du fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isCustomFullscreen) {
                setIsCustomFullscreen(false);
            }
        };

        if (isCustomFullscreen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCustomFullscreen]);

    const handleVideoMouseEnter = () => {
        setIsMouseInVideo(true);
    };

    const handleVideoMouseLeave = () => {
        setIsMouseInVideo(false);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressHover = (e) => {
        if (duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const time = Math.max(0, Math.min(duration, percent * duration));
            const position = Math.max(0, Math.min(100, percent * 100));
            
            setPreviewTime(time);
            setPreviewPosition(position);
            setShowPreview(true);
        }
    };

    const handleProgressLeave = () => {
        setShowPreview(false);
    };

    if (!isImg && !isVid) {
        // Fichier non-média (document, audio, etc.)
        return (
            <div className="non-visual-media-item">
                <div className="attachment-file">
                    <div className="attachment-file-icon">📄</div>
                    <div className="attachment-file-info">
                        <div className="attachment-file-name">{attachment.filename}</div>
                        <div className="attachment-file-size">{formatFileSize(attachment.size)}</div>
                    </div>
                </div>
            </div>
        );
    }

    // URL de l'image/vidéo
    const mediaUrl = attachment.proxy_url || attachment.url;
    const originalUrl = attachment.url;

    if (isImg) {
        // Calculer les dimensions basées sur l'aspect ratio de l'image pour une image unique
        let containerStyle = {
            maxWidth: useFullWidth ? '100%' : `${maxWidth}px`,
            maxHeight: `${maxHeight}px`
        };

        let imageStyle = {
            display: 'block',
            objectFit: 'cover',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%'
        };

        // Si c'est une image unique, ajuster les dimensions pour préserver l'aspect ratio
        if (isSingleItem && attachment.width && attachment.height) {
            const aspectRatio = attachment.width / attachment.height;
            const maxWidth = MAX_WIDTH;
            const maxHeight = 400; // Hauteur max pour les images uniques
            
            let calculatedWidth, calculatedHeight;
            
            // Calculer les dimensions en préservant l'aspect ratio
            if (aspectRatio > maxWidth / maxHeight) {
                // Image large : limiter par la largeur
                calculatedWidth = Math.min(attachment.width, maxWidth);
                calculatedHeight = calculatedWidth / aspectRatio;
            } else {
                // Image haute : limiter par la hauteur
                calculatedHeight = Math.min(attachment.height, maxHeight);
                calculatedWidth = calculatedHeight * aspectRatio;
            }

            containerStyle = {
                width: `${calculatedWidth}px`,
                height: `${calculatedHeight}px`,
                maxWidth: `${maxWidth}px`,
                maxHeight: `${maxHeight}px`
            };

            imageStyle = {
                display: 'block',
                objectFit: 'contain', // Changer pour 'contain' pour éviter le rognage
                width: '100%',
                height: '100%'
            };
        }

        return (
            <div className="media-item image-content item-content-container">
                <div className="image-container">
                    <div className="image-wrapper clickable image-zoom lazy-img-container" style={containerStyle}>
                        <a 
                            className="original-link" 
                            href={originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex="-1"
                            aria-hidden="true"
                        />
                        <div className="clickable-wrapper" tabIndex="0" role="button" aria-label="Image">
                            <div className="loading-overlay">
                                <img 
                                    className="lazy-img" 
                                    src={mediaUrl} 
                                    alt={attachment.filename || "Image"}
                                    style={imageStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isVid) {
        // Calculer la largeur basée sur l'aspect ratio et la hauteur max comme Discord
        const currentMaxHeight = isSingleItem ? 350 : 200;
        const aspectRatio = attachment.width && attachment.height ? attachment.width / attachment.height : 16/9;
        const calculatedWidth = Math.min(currentMaxHeight * aspectRatio, MAX_WIDTH);
        
        const videoStyle = {
            display: 'block',
            maxHeight: 'inherit',
            margin: 'auto',
            width: `${calculatedWidth}px`,
            height: '100%'
        };
        
        return (
            <div className={`mosaic-item-discord mosaic-item-no-justify-discord mosaic-item-media-mosaic-discord hide-overflow-discord ${isCustomFullscreen ? 'custom-fullscreen' : ''}`}>
                <div className="image-wrapper image-wrapper-discord lazy-img-discord mosaic-item-content-discord" style={videoStyle}>
                    <div className="loading-overlay-discord" style={{ aspectRatio: attachment.width && attachment.height ? `${attachment.width / attachment.height}` : '16/9' }}>
                        
                        <div 
                            className="wrapper-paused-discord wrapper-discord new-mosaic-style-discord wrapper-media-mosaic-discord" 
                            data-fullscreen="false" 
                            tabIndex="0"
                            onMouseEnter={handleVideoMouseEnter}
                            onMouseLeave={handleVideoMouseLeave}
                        >
                            <video 
                                ref={videoRef}
                                className="video-discord js-parse-video-discord"
                                src={mediaUrl}
                                preload="metadata"
                                playsinline=""
                                muted={showCover}
                                height={attachment.height || 350}
                                width={calculatedWidth}
                                onClick={handlePlayVideo}
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onProgress={handleProgress}
                                onEnded={handleVideoEnded}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    maxHeight: 'inherit', 
                                    objectFit: 'contain',
                                    zIndex: 1
                                }}
                            />
                            
                            {/* Bouton play overlay */}
                            {showCover && (
                                <div className="theme-dark theme-midnight images-dark">
                                    <div 
                                        className="cover-discord active" 
                                        tabIndex="0" 
                                        aria-label="Jouer" 
                                        role="button"
                                        onClick={handlePlayVideo}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handlePlayVideo();
                                            }
                                        }}
                                        style={{ zIndex: 3 }}
                                    >
                                        <div className="icon-wrapper-discord">
                                            <svg className="icon-discord" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M9.25 3.35C7.87 2.45 6 3.38 6 4.96v14.08c0 1.58 1.87 2.5 3.25 1.61l10.85-7.04a1.9 1.9 0 0 0 0-3.22L9.25 3.35Z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contrôles vidéo Discord */}
                            {!showCover && showControls && (
                                <div className={`videoControls ${isMouseInVideo || isDraggingProgress || isDraggingVolume || showVolumeSlider || !isPlaying ? 'controlsVisible' : 'controlsHidden'}`}>
                                    <button 
                                        className="videoButton" 
                                        tabIndex="0" 
                                        aria-label={isPlaying ? "Pause" : isVideoEnded ? "Replay" : "Play"} 
                                        role="button"
                                        onClick={handlePlayVideo}
                                    >
                                        <svg className="controlIcon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                            {isPlaying ? (
                                                <path fill="currentColor" d="M6 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6ZM15 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3Z"/>
                                            ) : isVideoEnded ? (
                                                <path fill="currentColor" d="M12,5 L12,1 L7,6 L12,11 L12,7 C15.31,7 18,9.69 18,13 C18,16.31 15.31,19 12,19 C8.69,19 6,16.31 6,13 L4,13 C4,17.42 7.58,21 12,21 C16.42,21 20,17.42 20,13 C20,8.58 16.42,5 12,5 L12,5 Z"/>
                                            ) : (
                                                <path fill="currentColor" d="M9.25 3.35C7.87 2.45 6 3.38 6 4.96v14.08c0 1.58 1.87 2.5 3.25 1.61l10.85-7.04a1.9 1.9 0 0 0 0-3.22L9.25 3.35Z"/>
                                            )}
                                        </svg>
                                    </button>
                                    
                                    {/* Masquer le compteur de temps si la vidéo est trop petite */}
                                    {calculatedWidth >= 300 && (
                                        <div className="durationTimeWrapper">
                                            <span className="durationTimeDisplay">{formatTime(currentTime)}</span>
                                            <span className="durationTimeSeparator">/</span>
                                            <span className="durationTimeDisplay">{formatTime(duration)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="horizontal">
                                        <div 
                                            ref={progressBarRef}
                                            className="mediaBarInteraction" 
                                            onMouseDown={handleProgressBarMouseDown}
                                            onMouseMove={handleProgressHover}
                                            onMouseLeave={handleProgressLeave}
                                        >
                                            <div className="mediaBarWrapper fakeEdges">
                                                {/* Barre de buffer - montre jusqu'où la vidéo est chargée */}
                                                <div className="buffer fakeEdges" style={{ width: `${bufferedPercent}%`, left: "0%" }}></div>
                                                <div className="mediaBarPreview fakeEdges" style={{ width: showPreview ? `${previewPosition}%` : "0%" }}></div>
                                                <div className="mediaBarProgress fakeEdges" style={{ width: `${(currentTime / duration) * 100}%` }}>
                                                    <span 
                                                        className="mediaBarGrabber"
                                                        onMouseDown={handleProgressMouseDown}
                                                        style={{ cursor: isDraggingProgress ? 'grabbing' : 'grab' }}
                                                    ></span>
                                                </div>
                                                <div 
                                                    className="bubble" 
                                                    style={{ 
                                                        left: `${previewPosition}%`,
                                                        opacity: showPreview ? 1 : 0
                                                    }}
                                                >
                                                    {formatTime(previewTime)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex_volume">
                                        <div className="container_media">
                                            <div className={`volumeButtonSlider_media volumeSliderWrapper ${showVolumeSlider ? 'sliderVisible_media' : ''}`}>
                                                <div className="vertical">
                                                    <div 
                                                        ref={volumeBarRef}
                                                        className="mediaBarInteraction mediaBarInteractionVolume" 
                                                        onMouseDown={handleVolumeBarMouseDown}
                                                    >
                                                        <div className="mediaBarWrapper fakeEdges mediaBarWrapperVolume">
                                                            <div className="mediaBarProgress fakeEdges" style={{ width: `${volume * 100}%` }}>
                                                                <span 
                                                                    className="mediaBarGrabber"
                                                                    onMouseDown={handleVolumeMouseDown}
                                                                    style={{ cursor: isDraggingVolume ? 'grabbing' : 'grab' }}
                                                                ></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                aria-label={isMuted ? "Unmute" : "Mute"} 
                                                type="button" 
                                                className="volumeButton_media button_control lookBlank colorBrand grow"
                                                onMouseEnter={handleVolumeButtonEnter}
                                                onMouseLeave={handleVolumeButtonLeave}
                                                onFocus={handleVolumeButtonFocus}
                                                onBlur={handleVolumeButtonBlur}
                                                onKeyDown={handleVolumeKeyDown}
                                                onClick={toggleMute}
                                            >
                                                <div className="contents_control">
                                                    <svg className="controlIcon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                                                        {isMuted || volume === 0 ? (
                                                            <path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM22.7 8.3a1 1 0 0 0-1.4 0L19 10.58l-2.3-2.3a1 1 0 1 0-1.4 1.42L17.58 12l-2.3 2.3a1 1 0 0 0 1.42 1.4L19 13.42l2.3 2.3a1 1 0 0 0 1.4-1.42L20.42 12l2.3-2.3a1 1 0 0 0 0-1.4Z"/>
                                                        ) : volume <= 0.5 ? (
                                                            <path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.18 15.36c-.55.35-1.18-.12-1.18-.78v-.27c0-.36.2-.67.45-.93a2 2 0 0 0 0-2.76c-.24-.26-.45-.57-.45-.93v-.27c0-.66.63-1.13 1.18-.78a4 4 0 0 1 0 6.72Z"/>
                                                        ) : (
                                                            <>
                                                                <path fill="currentColor" d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z"/>
                                                                <path fill="currentColor" d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z"/>
                                                            </>
                                                        )}
                                                    </svg>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <button 
                                            aria-label={isCustomFullscreen ? "Exit full screen" : "Full screen"} 
                                            type="button" 
                                            className="videoButton button_control lookBlank colorBrand grow"
                                            onClick={toggleFullscreen}
                                        >
                                            <div className="contents_control lineHeightReset">
                                                <svg className="controlIcon2 controlIcon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                                                    {isCustomFullscreen ? (
                                                        <path fill="currentColor" d="M6 14a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2H8a1 1 0 0 0-1 1v2a1 1 0 1 1-2 0v-2a3 3 0 0 1 3-3ZM18 14a1 1 0 0 0-1-1h-3a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 1 0 2 0v-2a3 3 0 0 0-3-3ZM6 10a1 1 0 0 0 1 1h3a1 1 0 1 0 0-2H8a1 1 0 0 1-1-1V6a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3ZM18 10a1 1 0 0 1-1 1h-3a1 1 0 1 1 0-2h2a1 1 0 0 0 1-1V6a1 1 0 1 1 2 0v2a3 3 0 0 1-3 3Z"/>
                                                    ) : (
                                                        <path fill="currentColor" d="M4 6c0-1.1.9-2 2-2h3a1 1 0 0 0 0-2H6a4 4 0 0 0-4 4v3a1 1 0 0 0 2 0V6ZM4 18c0 1.1.9 2 2 2h3a1 1 0 1 1 0 2H6a4 4 0 0 1-4-4v-3a1 1 0 1 1 2 0v3ZM18 4a2 2 0 0 1 2 2v3a1 1 0 1 0 2 0V6a4 4 0 0 0-4-4h-3a1 1 0 1 0 0 2h3ZM20 18a2 2 0 0 1-2 2h-3a1 1 0 1 0 0 2h3a4 4 0 0 0 4-4v-3a1 1 0 1 0-2 0v3Z"/>
                                                    )}
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="play-pause-pop-discord" style={{ opacity: 0 }}>
                                <svg className="play-pause-pop-icon-discord" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                                    <path fill="var(--interactive-normal)" d="M6 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6ZM15 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3Z"></path>
                                </svg>
                            </div>
                            <div className=""></div>
                        </div>
                    </div>
                </div>
                <div className="hover-button-group-discord">
                    <a 
                        className="anchor-discord anchor-underline-on-hover-discord hover-button-discord" 
                        aria-label="Télécharger" 
                        href={originalUrl}
                        rel="noreferrer noopener" 
                        target="_blank" 
                        role="button" 
                        tabIndex="0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg className="download-hover-button-icon-discord" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v10.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1ZM3 20a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"></path>
                        </svg>
                    </a>
                    <span style={{ display: 'none' }}></span>
                </div>
                <div className="sizer-discord"></div>
            </div>
        );
    }    return null;
}

// Layout pour 1 image
function OneByOneGrid({ items, isSingleImage = false, footer = null, localStorage }) {
    const item = items[0];
    
    return (
        <div className={`one-by-one-grid-discord ${isSingleImage ? 'one-by-one-grid-single-discord' : 'one-by-one-grid-mosaic'} ${footer ? 'has-footer' : ''}`}>
            <MediaItem 
                attachment={item}
                useFullWidth={!isSingleImage}
                isSingleItem={true}
                localStorage={localStorage}
            />
            {footer && <div className="media-footer">{footer}</div>}
        </div>
    );
}

// Layout pour 2 images
function OneByTwoGrid({ items, localStorage }) {
    return (
        <div className="one-by-two-grid">
            {items.map((item, index) => (
                <div key={item.id || index} className="one-by-two-grid-item">
                    <MediaItem 
                        attachment={item}
                        maxWidth={halfGridSize}
                        maxHeight={halfGridSize}
                        localStorage={localStorage}
                    />
                </div>
            ))}
        </div>
    );
}

// Layout pour 3 images (1 grande + 2 petites)
function OneByTwoLayoutThreeGrid({ items, localStorage }) {
    return (
        <div className="one-by-two-grid one-by-two-layout-three-grid">
            <div className="one-by-two-solo-item">
                <MediaItem 
                    attachment={items[0]}
                    maxWidth={largeItemWidth}
                    localStorage={localStorage}
                />
            </div>
            <div className="one-by-two-duo-item">
                <div className="two-by-one-grid">
                    {items.slice(1).map((item, index) => (
                        <div key={item.id || index} className="two-by-one-grid-item">
                            <MediaItem 
                                attachment={item}
                                maxWidth={smallItemWidth}
                                maxHeight={halfGridHeight}
                                localStorage={localStorage}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Layout pour 4 images (2x2)
function TwoByTwoGrid({ items, localStorage }) {
    return (
        <div className="two-by-two-grid">
            {items.map((item, index) => (
                <MediaItem 
                    key={item.id || index}
                    attachment={item}
                    maxWidth={halfGridSize}
                    maxHeight={halfGridHeight}
                    localStorage={localStorage}
                />
            ))}
        </div>
    );
}

// Layout pour 5+ images (3x3+)
function ThreeByThreeGrid({ items, localStorage }) {
    return (
        <div className="three-by-three-grid">
            {items.map((item, index) => (
                <MediaItem 
                    key={item.id || index}
                    attachment={item}
                    maxWidth={gridItemSize}
                    maxHeight={gridItemSize}
                    localStorage={localStorage}
                />
            ))}
        </div>
    );
}

// Composant principal pour organiser les médias
function MediaMosaicLayout({ visualMediaItems, footer = null, localStorage }) {
    const itemCount = visualMediaItems.length;

    if (itemCount === 0) return null;

    // Footer ne s'applique qu'aux éléments uniques
    if (footer && itemCount > 1) {
        footer = null;
    }

    if (itemCount === 1) {
        return <OneByOneGrid items={visualMediaItems} isSingleImage={true} footer={footer} localStorage={localStorage} />;
    }

    if (itemCount === 2) {
        return <OneByTwoGrid items={visualMediaItems} localStorage={localStorage} />;
    }

    if (itemCount === 3) {
        return <OneByTwoLayoutThreeGrid items={visualMediaItems} localStorage={localStorage} />;
    }

    if (itemCount === 4) {
        return <TwoByTwoGrid items={visualMediaItems} localStorage={localStorage} />;
    }

    // Pour 5+ images, utiliser une combinaison de layouts
    const remainder = itemCount % 3;
    
    return (
        <>
            {remainder === 1 && (
                <OneByOneGrid items={visualMediaItems.slice(0, 1)} localStorage={localStorage} />
            )}
            {remainder === 2 && (
                <OneByTwoGrid items={visualMediaItems.slice(0, 2)} localStorage={localStorage} />
            )}
            <ThreeByThreeGrid items={visualMediaItems.slice(remainder)} localStorage={localStorage} />
        </>
    );
}

// Fonction utilitaire pour formater la taille des fichiers
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Composant principal
export default function MediaMosaic({ attachments = [], inlineForwardButton = null, localStorage }) {
    const { groupableVisualMediaItems, nonGroupableVisualMediaItems, nonVisualMediaItems } = useMemo(() => {
        // Séparer les différents types de médias
        const [visualMedia, nonVisualMedia] = attachments.reduce((acc, attachment) => {
            if (isVisualMedia(attachment)) {
                acc[0].push(attachment);
            } else {
                acc[1].push(attachment);
            }
            return acc;
        }, [[], []]);

        // Pour l'instant, on considère tous les médias visuels comme groupables
        // Dans Discord, certains types (comme les GIFs interactifs) ne sont pas groupables
        return {
            groupableVisualMediaItems: visualMedia,
            nonGroupableVisualMediaItems: [],
            nonVisualMediaItems: nonVisualMedia
        };
    }, [attachments]);

    if (!attachments.length) return null;

    return (
        <>
            {/* Médias visuels groupables */}
            {groupableVisualMediaItems.length > 0 && (
                <div className={`mosaic-container ${groupableVisualMediaItems.length === 1 ? 'single' : ''}`}>
                    {inlineForwardButton ? (
                        <>
                            <div className="visual-media-item-container visual-media-item-container-discord">
                                <MediaMosaicLayout visualMediaItems={groupableVisualMediaItems} localStorage={localStorage} />
                            </div>
                            {inlineForwardButton}
                        </>
                    ) : (
                        <div className="visual-media-item-container visual-media-item-container-discord">
                            <MediaMosaicLayout visualMediaItems={groupableVisualMediaItems} localStorage={localStorage} />
                        </div>
                    )}
                </div>
            )}

            {/* Médias visuels non-groupables (affichés individuellement) */}
            {nonGroupableVisualMediaItems.map((item, index) => (
                <div key={item.id || index} className="visual-media-item-container visual-media-item-container-discord">
                    <MediaMosaicLayout visualMediaItems={[item]} localStorage={localStorage} />
                </div>
            ))}

            {/* Médias non-visuels */}
            {nonVisualMediaItems.length > 0 && (
                <div className="non-visual-media-item-container">
                    {nonVisualMediaItems.map((item, index) => (
                        <div key={item.id || index} className="non-visual-media-item">
                            <MediaItem attachment={item} localStorage={localStorage} />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
