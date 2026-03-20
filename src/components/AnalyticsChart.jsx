import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const AnalyticsChart = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Mock Data for "AI Prediction"
    const data = [10, 25, 18, 40, 35, 60, 55, 90];
    const maxVal = 100;

    // Generate SVG Path
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    const polylinePoints = `0,100 ${points} 100,100`;

    return (
        <Box sx={{
            position: 'relative',
            height: 200,
            width: '100%',
            overflow: 'hidden',
            borderRadius: '16px',
            background: isDark ? alpha('#000000', 0.6) : alpha('#ffffff', 0.5),
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
            p: 3,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, zIndex: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight="700">AI Growth Projection</Typography>
                    <Typography variant="caption" color="text.secondary">Next 30 Days Forecast</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#10b981' }}>+24%</Typography>
                    <Typography variant="caption" color="text.secondary">CONFIDENCE 98%</Typography>
                </Box>
            </Box>

            {/* Chart Area */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        overflow: 'visible'
                    }}
                >
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Filled Area */}
                    <motion.polygon
                        points={polylinePoints}
                        fill="url(#chartGradient)"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ transformOrigin: 'bottom' }}
                    />

                    {/* Line Stroke */}
                    <motion.polyline
                        points={points}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Glowing Points */}
                    {data.map((val, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (val / maxVal) * 100;
                        return (
                            <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="#fff"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                            />
                        );
                    })}
                </svg>
            </Box>
        </Box>
    );
};

export default AnalyticsChart;
