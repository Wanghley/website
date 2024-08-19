import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Card from './Card'; // Import your Card component
import BlogCard from './BlogCard'; // Import your BlogCard component

const CardGrid = ({ cardData, type }) => {
    return (
        <Grid container spacing={2}>
            {cardData?.map((data, index) => {
                const commonProps = {
                    imageUrl: data?.attributes?.Featured?.data?.attributes?.formats?.small?.url ?? 'https://via.placeholder.com/300',
                    title: data.attributes.Title,
                    slug: data.attributes?.slug,
                };

                if (type === 'project') {
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card
                                {...commonProps}
                                category="Project"
                                sourceURL={data.attributes?.Github}
                                demoURL={data.attributes?.Demo}
                                date={data.attributes?.Start}
                                teaser={data.attributes?.Teaser}
                            />
                        </Grid>
                    );
                }

                if (type === 'blog') {
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <BlogCard
                                {...commonProps}
                                content={data.attributes?.Content}
                                categories={data.attributes?.Categories || []}
                                date={data.attributes?.published}
                                teaser={data.attributes?.Excerpt}
                            />
                        </Grid>
                    );
                }

                return null; // In case of an unknown type, don't render anything
            })}
        </Grid>
    );
};

CardGrid.propTypes = {
    cardData: PropTypes.array.isRequired,
    type: PropTypes.oneOf(['project', 'blog']).isRequired,
};

export default CardGrid;
