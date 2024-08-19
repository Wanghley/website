import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '../components';
import { fetchProjects } from '../api/projects';
import { fetchBlogs } from '../api/blog';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './css/projects.css';

const Blogs = (props) => {
    const [projects, setProjects] = useState([]); // Initialize projects state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [page, setPage] = useState(1); // Initialize page state
    const [hasMore, setHasMore] = useState(true); // Initialize hasMore state
    const uniqueProjectIds = new Set(); // Initialize a set to store unique project IDs to avoid duplicates

    const loadProjects = async (page) => {
        try {
            setLoading(true);
            const newProjects = await fetchBlogs(page); // Fetch projects

            if (newProjects && newProjects.length > 0) {
                const filteredProjects = newProjects.filter(
                    (project) => !uniqueProjectIds.has(project.attributes.id)
                );
                filteredProjects.forEach((project) => uniqueProjectIds.add(project.attributes.id));
                setProjects((prevProjects) => [...prevProjects, ...filteredProjects]);
                setPage(page + 1); // Increment page for the next load
            } else {
                setHasMore(false); // No more projects to load
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setHasMore(false); // Set hasMore to false on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(page);
    }, [page]);

    const handleScroll = () => {
        if (loading) return; // If already loading, do not trigger another load

        // Calculate scroll conditions
        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight;

        // Check if at the bottom
        if (isBottom && hasMore) {
            loadProjects(page); // Load next page if hasMore is true
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]); // Depend on loading and hasMore to update scroll listener

    return (
        <div className="projects">
            <h1 className="projects-title">Blog</h1>
            <p className="projects-subtitle">
                Explore the depths of my mind, you will. A collection of thoughts, this is.
            </p>
            <Box sx={{ flexGrow: 1 }}>
                <CardGrid cardData={projects} type='blog'/>
                {loading && (
                    <Box className="loading-container">
                        <CircularProgress />
                    </Box>
                )}
                {!hasMore && !loading && (
                    <Box className="no-more-projects">
                        <p>End of projects, this is. A new path, seek you must.</p>
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default Blogs;