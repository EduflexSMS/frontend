import React from 'react';
import { Box } from '@mui/material';

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
                background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)', // Slate 800 to Slate 900
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%)', // Royal Blue Glow
                    zIndex: -1,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 40%)', // Gold Glow
                    zIndex: -1,
                }
            }}
        />
    );
};

export default Background3D;


