import React, { useState, useEffect } from 'react';
import './css/GridFeatured.css';
import { fetchProjects } from '../api/projects';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faClock, faUser, faFacebookSquare } from '@fortawesome/free-solid-svg-icons';

const GridFeatured = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data?.slice(0, 5) || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="site__wrapper">
      <div>
        <h1>Latest Projects</h1>
        <p className="subtitle">Explore the wonders of my latest creations!</p>
        <button className="btn btn--primary" onClick={() => window.location.href = '/projects'}>
          View All Projects
        </button>
      </div>
      <div className="projects-grid">
        {loading ? (
          [1, 2, 3, 4, 5].map((placeholder) => (
            <div className={`grid ${placeholder === 1 ? 'grid--large' : ''}`} key={placeholder}>
              <div className="card placeholder">
                <div className="card__image placeholder__image"></div>
                <div className="card__overlay placeholder__overlay">
                  <div className="card__overlay-content">
                    <div className="placeholder__title"></div>
                    <ul className="card__meta placeholder__meta">
                      <li></li>
                      <li></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          projects.map((project, index) => (
            <div className={`grid ${index === 0 ? 'grid--large' : ''}`} key={project?.attributes?.Title || index}>
              <div className="card">
                <div className="card__image">
                  <img 
                    src={project?.attributes?.Featured?.data?.attributes?.formats?.medium?.url || (index === 0 ? 'https://placehold.co/400x600.png' : 'https://res.cloudinary.com/wanghley/image/upload/c_crop,w_768,h_432,ar_16:9,g_auto/v1720995375/Letter-Balloons-OH-FLOCK-IM-70-16-Inch-Alphabet-Letters-Foil-Mylar-Balloon-Birthday-Party-Banner-Gold_7c65fc96-4677-4109-8d67-ac46ed45bf21.8a40faa79f80896c60f90e991f888fd8_zxpeiv.jpg')}
                    alt={project?.attributes?.Title || "Project Image"} 
                    className={index === 0 ? 'large-image' : 'standard-image'}
                  />
                  <div className={`card__overlay card__overlay--${index % 2 === 0 ? 'indigo' : 'blue'}`}>
                    <div className="card__overlay-content">
                      <ul className="card__meta">
                        <li className="card__meta-item">
                          <FontAwesomeIcon icon={faTag} />
                          <span>{project?.attributes?.Category}</span>
                        </li>
                        <li className="card__meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{project?.attributes?.Start}</span>
                        </li>
                      </ul>
                      <a href="#0" className="card__title">{project?.attributes?.Title}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="btn--mobile" onClick={() => window.location.href = '/projects'}>
          View All Projects
        </button>
    </div>
  );
};

export default GridFeatured;
