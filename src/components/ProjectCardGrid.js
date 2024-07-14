import React from 'react';
import { Grid, Container } from '@mui/material';
import ProjectCard from './ProjectCard';

const ProjectCardGrid = ({ projects }) => {
  return (
    <Container>
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ProjectCard {...project} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProjectCardGrid;
