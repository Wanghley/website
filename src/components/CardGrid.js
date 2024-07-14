import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Card from './Card'; // Import your Card component

const CardGrid = ({ cardData }) => {
    return (
        <Grid container spacing={2}>
            {cardData?.map((data, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card
                        imageUrl={data?.attributes?.Featured?.data?.attributes?.formats?.small?.url ?? 'https://via.placeholder.com/300'}
                        title={data.attributes.Title}
                        date={data.attributes?.Start}
                        teaser={data.attributes?.Teaser}
                        category="Project"
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default CardGrid;
