import { useState } from "react";
import "./css/ProjectMediaGallery.css";

function MediaGallery({ media }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const openModal = (image) => {
    setActiveImage(image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveImage(null);
  };

  return (
    <>
      {/* Media Gallery */}
      {media.length > 0 && (
        <>
          <h2>Media Gallery</h2>
          <section className="project-page__media">
            {media.length <= 6 ? (
              <div className="project-page__media-grid">
                {media.map((url, index) => (
                  <div
                    key={index}
                    className="project-page__media-item"
                    onClick={() => openModal(url)}
                  >
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="project-page__media-image"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="project-page__media-carousel">
                {media.map((url, index) => (
                  <div
                    key={index}
                    className="project-page__media-item"
                    onClick={() => openModal(url)}
                  >
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="project-page__media-image"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <img src={activeImage} alt="Enlarged view" className="modal-image" />
          </div>
        </div>
      )}
    </>
  );
}

export default MediaGallery;
