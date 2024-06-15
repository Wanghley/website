import React, { useState, useEffect } from 'react'
import about_photo from '../assets/about.jpg'
import fetchTimeline from '../api/timeline'
import { Timeline } from 'rsuite';
import './css/About.css'

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

const About = () => {
  const [timeline, setTimeline] = useState(null);
  const getTimeline = async () => {
    try {
      const data = await fetchTimeline();
      setTimeline(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle the error as needed
    }
  };
  useEffect(() => {
    getTimeline();
  }, []);

  return (<>
    <h1 className='about-title'>About Me</h1>
    <div className='about'>
      <div className='about-text'>
        <h2 className='about-subtitle'>🎼 A Maestro of Curiosity 🚀 Crafting Tomorrow's Tech Marvels 🌟 One Ingenious Solution at a Time ⚙️ Shaping the Future, and Beyond! 🚀🔮</h2>
        <img src={about_photo} alt='Wanghley' className='about-photo-mobile lazyload' />

        <p className='about-paragraph'>I'm Wanghley, a <strong>tech wizard</strong> from Brasília, Brazil, who grew up on a pig farm 🐷. Now an <u>electrical and computer engineering</u> student at Duke University, I'm exploring computer science, electrical/biomedical engineering, and quantum computing.</p>

        <p className='about-paragraph'>As a <strong>Karsh Scholar</strong> and <strong>Líder Estudar Fellow</strong>, I blend technical, management, and soft skills – from the pig farm to <u>science, engineering, and technology</u>.</p>

        <p className='about-paragraph'>I'm also a <strong>social entrepreneur</strong> with a passion for data science, innovation, and health tech. My projects include a frequency system with computer vision and a solution for neurodegenerative diseases.</p>

        <p className='about-paragraph'>My story is one of ambition, societal impact, and the magic of a pig farm childhood, reflecting my <b>passion, problem-solving, and innovation</b>.</p>

        <button className='secondary-button about-button' onClick={() => window.location.href = '/about'}>Know me more</button>
      </div>
      <div className='about-image'>
        <div className='video-container'>
          <MediaPlayer playsInline
            title="Wanghley: Innovator by Day, AI Ninja by Night"
            src="youtube/FOkCz0W5pgw"
            layout="video"
            controls
            autoPlay

          >
            <MediaProvider />
            <DefaultVideoLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" icons={defaultLayoutIcons} />
          </MediaPlayer>
        </div>
      </div>
    </div>
  </>
  )
}

export default About