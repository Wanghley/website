import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from './Card';
import BlogCard from './BlogCard';

const CardGrid = ({ cardData, type }) => {
    return (
        <Box sx={{ width: '100%', padding: '0.5rem' }}>
            <Grid 
                container 
                spacing={2} // Changed from 4 to 2
                justifyContent="center"
                alignItems="stretch"
            >
                {cardData?.map((data, index) => {
                    const commonProps = {
                        imageUrl: data?.attributes?.Featured?.data?.attributes?.formats?.small?.url ?? 'https://via.placeholder.com/300',
                        title: data.attributes.Title,
                        slug: data.attributes?.slug,
                    };

                    if (type === 'project') {
                        return (
                            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
                                <Card
                                    {...commonProps}
                                    category="Project"
                                    sourceURL={data.attributes?.Github}
                                    demoURL={data.attributes?.Demo}
                                    date={data.attributes?.Start}
                                    teaser={data.attributes?.Teaser}
                                    sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                                />
                            </Grid>
                        );
                    }

                    if (type === 'blog') {
                        return (
                            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
                                <BlogCard
                                    {...commonProps}
                                    content={data.attributes?.Content}
                                    categories={data.attributes?.Categories || []}
                                    date={data.attributes?.published}
                                    teaser={data.attributes?.Excerpt}
                                    sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                                />
                            </Grid>
                        );
                    }

                    return null;
                })}
            </Grid>
        </Box>
    );
};

CardGrid.propTypes = {
    cardData: PropTypes.array.isRequired,
    type: PropTypes.oneOf(['project', 'blog']).isRequired,
};

export default CardGrid;
