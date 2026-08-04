import React from 'react';
import { Box } from '@mui/material';
import instituteMainBg from '../assets/institute-main-bg.png';

const Background3D = () => {
    return (
        <Box
            className="institute-bg-container"
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
                backgroundImage: `url(${instituteMainBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(circle at 50% 10%, rgba(6, 8, 20, 0.55) 0%, rgba(6, 8, 20, 0.88) 70%, #060814 100%)'
                            : 'radial-gradient(circle at 50% 10%, rgba(244, 246, 255, 0.6) 0%, rgba(244, 246, 255, 0.88) 70%, #f4f6ff 100%)',
                    zIndex: 1,
                    transition: 'background 0.5s ease',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '60vw',
                    height: '60vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 207, 255, 0.12) 0%, rgba(108, 95, 255, 0.05) 50%, transparent 80%)',
                    filter: 'blur(80px)',
                    zIndex: 2,
                    animation: 'pulseGlow 12s ease-in-out infinite alternate',
                }
            }}
        />
    );
};

export default Background3D;



