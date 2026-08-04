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
                transform: 'scale(1.02)',
                transition: 'all 0.5s ease',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(circle at 50% 20%, rgba(10, 14, 30, 0.35) 0%, rgba(6, 8, 20, 0.65) 60%, rgba(4, 6, 14, 0.8) 100%)'
                            : 'radial-gradient(circle at 50% 20%, rgba(244, 246, 255, 0.35) 0%, rgba(244, 246, 255, 0.65) 60%, rgba(244, 246, 255, 0.8) 100%)',
                    zIndex: 1,
                    transition: 'background 0.5s ease',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '50vw',
                    height: '50vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 207, 255, 0.18) 0%, rgba(108, 95, 255, 0.1) 40%, transparent 70%)',
                    filter: 'blur(70px)',
                    zIndex: 2,
                    animation: 'pulseGlow 10s ease-in-out infinite alternate',
                }
            }}
        />
    );
};

export default Background3D;




