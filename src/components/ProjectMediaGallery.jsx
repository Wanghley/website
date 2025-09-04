import { useState, useEffect, useCallback } from "react";
import "./css/ProjectMediaGallery.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

function MediaGallery({ media }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Maximum number of images to show in grid before using carousel
  const MAX_GRID_IMAGES = 12;
  
  // Determine if we should use grid or carousel layout
  const useGridLayout = media.length <= MAX_GRID_IMAGES;
  
  // Visible images in grid (show fewer initially on mobile)
  const initialVisibleCount = window.innerWidth < 768 ? 6 : 8;
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialVisibleCount, media.length)
  );
  
  const openModal = useCallback((index) => {
    setActiveImageIndex(index);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const navigateImage = useCallback((direction) => {
    if (direction === 'next') {
      setActiveImageIndex((prev) => (prev + 1) % media.length);
    } else {
      setActiveImageIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  }, [media.length]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalOpen) return;
      
      if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, navigateImage, closeModal, toggleFullscreen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newInitialCount = window.innerWidth < 768 ? 6 : 8;
      setVisibleCount(Math.min(newInitialCount, media.length));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [media.length]);

  const showMoreImages = () => {
    setVisibleCount(prev => Math.min(prev + 8, media.length));
  };

  if (!media || media.length === 0) return null;

  return (
    <section className="project-page__media">
      <h2 className="project-page__gallery-title">Project Gallery</h2>
      
      {useGridLayout ? (
        <div className="project-page__gallery-wrapper">
          <div className="project-page__media-grid">
            {media.slice(0, visibleCount).map((url, index) => (
              <div
                key={index}
                className="project-page__media-item"
                onClick={() => openModal(index)}
                data-index={`${index + 1}/${media.length}`}
              >
                <div className="project-page__media-inner">
                  <img
                    src={url}
                    alt={`Project media ${index + 1}`}
                    className="project-page__media-image"
                    loading="lazy"
                  />
                  <div className="project-page__media-overlay">
                    <FontAwesomeIcon icon={faExpand} className="project-page__media-icon" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {visibleCount < media.length && (
            <button className="project-page__load-more" onClick={showMoreImages}>
              Show More Images ({media.length - visibleCount} remaining)
            </button>
          )}
        </div>
      ) : (
        <div className="project-page__carousel-wrapper">
          <button className="carousel-nav carousel-nav--prev" onClick={() => navigateImage('prev')}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <div className="project-page__media-carousel">
            {media.map((url, index) => (
              <div
                key={index}
                className={`project-page__carousel-item ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => openModal(index)}
              >
                <img
                  src={url}
                  alt={`Project media ${index + 1}`}
                  className="project-page__carousel-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          
          <button className="carousel-nav carousel-nav--next" onClick={() => navigateImage('next')}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          
          <div className="carousel-indicators">
            {media.map((_, index) => (
              <button 
                key={index} 
                className={`carousel-indicator ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Modal with zoom controls */}
      {modalOpen && (
        <div className={`modal-overlay ${isFullscreen ? 'fullscreen' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-controls">
              <button className="modal-control modal-fullscreen" onClick={toggleFullscreen}>
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>
              <button className="modal-control modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-image-container">
              <img 
                src={media[activeImageIndex]} 
                alt={`Enlarged view ${activeImageIndex + 1}`}
                className={`modal-image ${isFullscreen ? 'fullscreen' : ''}`}
              />
            </div>

            {media.length > 1 && (
              <>
                <button className="modal-nav modal-nav--left" onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className="modal-nav modal-nav--right" onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <div className="modal-counter">
                  {activeImageIndex + 1} / {media.length}
                </div>
                
                <div className="modal-thumbnails">
                  {media.map((url, index) => (
                    <div 
                      key={index}
                      className={`modal-thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={url} alt={`Thumbnail ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default MediaGallery;
