import fetchAbout from '../api/about';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './css/About.css';
import style from './css/markdown-styles.module.css';

const AboutText = () => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAbout = async () => {
        try {
            const data = await fetchAbout();
            setAbout(data.data.attributes.about);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load content');
            setLoading(false);
        }
    };

    useEffect(() => {
        getAbout();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className={style.error}>{error}</p>;
    }

    return (
        <div className={style.container}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className={style.ReactMarkdown}
            >
                {about}
            </ReactMarkdown>
        </div>
    );
};

export default AboutText;
