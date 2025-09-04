import { useState, useEffect } from "react";
import "./css/ProjectMediaGallery.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faExpand } from '@fortawesome/free-solid-svg-icons';

function MediaGallery({ media }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Maximum number of images to show in grid before "see more" option
  const MAX_GRID_IMAGES = media?.length > 9 ? 8 : media?.length;

  const openModal = (index) => {
    setActiveImageIndex(index);
    setModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveImageIndex(0);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setActiveImageIndex((prev) => (prev + 1) % media.length);
    } else {
      setActiveImageIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!modalOpen) return;
    
    if (e.key === 'ArrowRight') {
      navigateImage('next');
    } else if (e.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };

  // Add event listener for keyboard navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

  if (!media || media.length === 0) return null;

  return (
    <section className="project-page__media">
      <h2>Project Gallery</h2>
      
      {/* Grid layout for fewer images */}
      {media.length <= 12 ? (
        <div className="project-page__media-grid">
          {media.slice(0, MAX_GRID_IMAGES).map((url, index) => (
            <div
              key={index}
              className="project-page__media-item"
              onClick={() => openModal(index)}
              data-index={`${index + 1}/${media.length}`}
            >
              <img
                src={url}
                alt={`Project media ${index + 1}`}
                className="project-page__media-image"
                loading="lazy"
              />
              <div className="project-page__media-overlay">
                <FontAwesomeIcon icon={faExpand} />
              </div>
            </div>
          ))}
          
          {/* "View more" tile if we have more images than shown in the grid */}
          {media.length > MAX_GRID_IMAGES && (
            <div 
              className="project-page__media-item project-page__media-more"
              onClick={() => openModal(MAX_GRID_IMAGES)}
            >
              <span>+{media.length - MAX_GRID_IMAGES} more</span>
            </div>
          )}
        </div>
      ) : (
        // Carousel for many images
        <div className="project-page__media-carousel">
          {media.map((url, index) => (
            <div
              key={index}
              className="project-page__media-item"
              onClick={() => openModal(index)}
              data-index={`${index + 1}/${media.length}`}
            >
              <img
                src={url}
                alt={`Project media ${index + 1}`}
                className="project-page__media-image"
                loading="lazy"
              />
              <div className="project-page__media-overlay">
                <FontAwesomeIcon icon={faExpand} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Modal with navigation */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <img 
              src={media[activeImageIndex]} 
              alt={`Enlarged view ${activeImageIndex + 1}`}
              className="modal-image"
            />

            {/* Navigation buttons */}
            {media.length > 1 && (
              <>
                <button className="modal-nav modal-nav--left" onClick={() => navigateImage('prev')}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className="modal-nav modal-nav--right" onClick={() => navigateImage('next')}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <div className="modal-counter">
                  {activeImageIndex + 1} / {media.length}
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
