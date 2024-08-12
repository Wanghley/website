import React, { useState, useEffect } from 'react';
import './css/FeaturedBlogGrid.css'; // Update file name if necessary
import { fetchBlogs } from '../api/blog'; // Update import path as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const FeaturedBlogGrid = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBlogs();
        setBlogPosts(data?.slice(0, 5) || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="featured-blog-grid__wrapper">

      <div className="featured-blog-grid__container">
        {loading ? (
          [1, 2, 3, 4, 5].map((placeholder) => (
            <div className={`featured-blog-grid__item ${placeholder === 1 ? 'featured-blog-grid__item--large' : ''}`} key={placeholder}>
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
          blogPosts.map((post, index) => (
            <div className={`featured-blog-grid__item ${index === 0 ? 'featured-blog-grid__item--large' : ''}`} key={post?.attributes?.slug || index}>
              <div className="card">
                <a href={`/blog/${post?.attributes?.slug}`} className="card__title">
                  <div className="card__image">
                    <img 
                      src={post?.attributes?.Featured?.data?.attributes?.formats?.medium?.url || (index === 0 ? 'https://placehold.co/400x600.png' : 'https://res.cloudinary.com/wanghley/image/upload/c_crop,w_768,h_432,ar_16:9,g_auto/v1720995375/Letter-Balloons-OH-FLOCK-IM-70-16-Inch-Alphabet-Letters-Foil-Mylar-Balloon-Birthday-Party-Banner-Gold_7c65fc96-4677-4109-8d67-ac46ed45bf21.8a40faa79f80896c60f90e991f888fd8_zxpeiv.jpg')}
                      alt={post?.attributes?.Title || "Blog Post Image"} 
                      className={index === 0 ? 'large-image' : 'standard-image'}
                    />
                    <div className={`card__overlay card__overlay--${index % 2 === 0 ? 'indigo' : 'blue'}`}>
                      <div className="card__overlay-content">
                        <ul className="card__meta">
                          <li className="card__meta-item">
                            <FontAwesomeIcon icon={faTag} />
                            <span>{post?.attributes?.Categories[0]}</span>
                          </li>
                          <li className="card__meta-item">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{formatDate(post?.attributes?.publishedAt)}</span>
                          </li>
                        </ul>
                        <a href={`/blog/${post?.attributes?.slug}`} className="card__title">{post?.attributes?.Title}</a>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
      <div className='featured-blog-text'>
        <h1>Latest Blog Posts</h1>
        <p className="subtitle">Discover the latest insights and stories from my blog!</p>
        <button className="btn btn--primary" onClick={() => window.location.href = '/blogs'}>
          View All Posts
        </button>
      </div>
      <button className="btn--mobile" onClick={() => window.location.href = '/blogs'}>
          View All Posts
        </button>
    </div>
  );
};

// format date to human readable format yyyy-mm-dd to Month dd, yyyy
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

export default FeaturedBlogGrid;
