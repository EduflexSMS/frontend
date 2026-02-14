import React from 'react';
import { Box } from '@mui/material';
import educationBg from '../assets/education_bg.png'; // Assuming png for now, will check artifact

const Background3D = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    backgroundImage: `url(${educationBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(3px) brightness(0.6)', // Soften for text readability
                    transform: 'scale(1.05)', // Prevent edge bleeding from blur
                    zIndex: -2,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)', // Vignette
                    zIndex: -1,
                }
            }}
        />
    );
};

export default Background3D;


