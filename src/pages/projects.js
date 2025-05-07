import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from '../components';
import { fetchProjects } from '../api/projects';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './css/projects.css';
import { Helmet } from 'react-helmet';

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
            <Helmet>
                <title>Wanghley's Projects</title>
                <meta name="description" content="Explore a diverse range of projects I've worked on, showcasing my skills and expertise." />
                <link rel="canonical" href="https://wanghley.com/projects" />
                <meta name="keywords" content="Projects, Wanghley, Portfolio, Skills, Experience" />
                <meta name="author" content="Wanghley" />
                <meta name="robots" content="index, follow" />

                <meta property="og:title" content="Wanghley's Projects" />
                <meta property="og:description" content="Explore a diverse range of projects I've worked on, showcasing my skills and expertise." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://wanghley.com/projects" />
                <meta property="og:image" content="https://res.cloudinary.com/wanghley/image/upload/v1740099778/projects/large_e851a845_4eab_40ea_adc8_11bb99b908e8_fcd76cabf2.jpg" />
                <meta property="og:site_name" content="Wanghley – Sci&Tech" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:locale:alternate" content="pt_BR" />
            </Helmet>
            <h1 className="projects-title">Projects</h1>
            <p className="projects-subtitle">
                Explore a Diverse Range of Projects I've Worked On
            </p>
            <Box sx={{ flexGrow: 1 }}>
                <CardGrid cardData={projects} type='project' />
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

export default Projects;