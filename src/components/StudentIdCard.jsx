import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import logo from '../assets/logo.jpg';

// Styled as a standard business card (3.5" x 2") at 300DPI
// 1050x600 pixels provides high quality for printing
const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;

const StudentIdCard = forwardRef(({ student }, ref) => {
    if (!student) return null;

    return (
        <Box
            ref={ref}
            sx={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                // This component should only be rendered off-screen or scaled down visually
                boxSizing: 'border-box',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                display: 'flex',
                boxShadow: 'none',
                /* Business Card Bleed Border */
                border: '4px solid #f8fafc',
            }}
        >
            {/* Left Section - Dark Blue Branding */}
            <Box sx={{
                width: '35%',
                height: '100%',
                background: 'linear-gradient(135deg, #0f52ba 0%, #0a3d91 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
                zIndex: 2,
            }}>
                <Box
                    component="img"
                    src={logo}
                    alt="Eduflex Logo"
                    sx={{
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        border: '6px solid rgba(255,255,255,0.2)',
                        mb: 3,
                        backgroundColor: '#fff',
                        objectFit: 'cover'
                    }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '2px', textAlign: 'center', mb: 1 }}>
                    EDUFLEX
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: '4px', opacity: 0.8, fontSize: '0.9rem' }}>
                    INSTITUTE
                </Typography>

                {/* Decorative Elements */}
                <Box sx={{ position: 'absolute', top: 30, left: -20, width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.05)' }} />
            </Box>

            {/* Right Section - Student Details & QR */}
            <Box sx={{
                width: '65%',
                height: '100%',
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
            }}>

                {/* Background Watermark/Pattern */}
                <Box sx={{
                    position: 'absolute', right: -50, top: -100, opacity: 0.03, zIndex: 0
                }}>
                    <QRCode value={student.indexNumber} size={500} fgColor="#0f52ba" />
                </Box>

                <Box sx={{ zIndex: 1 }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                        Student Identity Card
                    </Typography>

                    <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.1, mb: 1 }}>
                        {student.name}
                    </Typography>

                    <Typography sx={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.5rem', fontFamily: 'monospace' }}>
                        {student.indexNumber}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                    <Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Grade</Typography>
                            <Typography sx={{ color: '#0f172a', fontSize: '1.3rem', fontWeight: 700 }}>{student.grade}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact</Typography>
                            <Typography sx={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 600 }}>{student.mobile}</Typography>
                        </Box>
                    </Box>

                    {/* QR Code */}
                    <Box sx={{
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}>
                        <QRCode
                            value={student.indexNumber}
                            size={160}
                            level="H"
                            fgColor="#0f172a"
                            bgColor="#f8fafc"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
});

export default StudentIdCard;
