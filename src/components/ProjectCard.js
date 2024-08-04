import React from 'react';
import { Card, CardMedia, Typography, Link, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import './css/ProjectCard.css';

const ProjectCard = ({ image, title, category, timeAgo, author, slug }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        image={image}
        alt={title}
        className="card__image"
      />
      <Box className="card__overlay">
        <ul className="card__meta">
          <li>
            <Link href="#">
              <FontAwesomeIcon icon={faTag} /> {category}
            </Link>
          </li>
          <li>
            <Link href="#">
              <FontAwesomeIcon icon={faClock} /> {timeAgo}
            </Link>
          </li>
        </ul>
        <Typography
          variant="h5"
          component={Link}
          href="#"
          className="card__title"
        >
          {title}
        </Typography>
        <ul className="card__meta card__meta--last">
          <li>
            <Link href="#">
              <FontAwesomeIcon icon={faUser} /> {author}
            </Link>
          </li>
          <li>
            <Link href="#">
            {/* <FontAwesomeIcon icon="fa-brands fa-square-facebook" /> Share */}
            </Link>
          </li>
        </ul>
      </Box>
    </Card>
  );
};

export default ProjectCard;
