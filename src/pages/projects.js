import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '../components';
import { fetchProjects } from '../api/projects';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './css/projects.css';

const Projects = (props) => {
    const [projects, setProjects] = useState([]); // Initialize projects state
    const [loading, setLoading] = useState(true); // Initialize loading state
    const [page, setPage] = useState(1); // Initialize page state
    const [hasMore, setHasMore] = useState(true); // Initialize hasMore state
    const uniqueProjectIds = new Set(); // Initialize a set to store unique project IDs to avoid duplicates

    const loadProjects = async (page) => {
        try {
            setLoading(true);
            const newProjects = await fetchProjects(page);
            if (newProjects && newProjects.length > 0) {
                const filteredProjects = newProjects.filter(
                    (project) => !uniqueProjectIds.has(project.attributes.id)
                );
                filteredProjects.forEach((project) => uniqueProjectIds.add(project.attributes.id));
                setProjects((prevProjects) => [...prevProjects, ...filteredProjects]);
            } else {
                setHasMore(false);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
            setHasMore(false);
        }
    };

    useEffect(() => {
        loadProjects(page);
    }, [page]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
            return;
        }
        setPage((prevPage) => prevPage + 1);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading]);



    return (
        <div className="projects">
            <h1 className="projects-title">Projects</h1>
            <p className="projects-subtitle">
                Explore a Diverse Range of Projects I've Worked On
            </p>
            <Box sx={{ flexGrow: 1 }}>
                <CardGrid cardData={projects} />
                {loading && (
                    <Box className="loading-container">
                        <CircularProgress />
                    </Box>
                )}
                {!hasMore && !loading && (
                    <Box className="no-more-projects">
                        <p>No more projects to load.</p>
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default Projects;

// https://github.com/mayankagarwal09/dev-portfolio/blob/master/src/components/Projects.jsx