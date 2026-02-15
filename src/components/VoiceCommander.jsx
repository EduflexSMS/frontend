import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, alpha, useTheme } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCommander = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setFeedback("Listening...");
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-clear feedback after delay
            setTimeout(() => setFeedback(''), 2000);
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            setTranscript(command);
            processCommand(command);
        };

        window.voiceRecognition = recognition; // Store for access

        return () => {
            if (isListening) recognition.stop();
        };
    }, []);

    const toggleListening = () => {
        if (!SpeechRecognition) return;
        const recognition = window.voiceRecognition;
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const processCommand = (cmd) => {
        console.log("Voice Command:", cmd);

        // Navigation Commands
        if (cmd.includes('dashboard') || cmd.includes('home')) {
            navigate('/');
            setFeedback("Navigating to Dashboard...");
        } else if (cmd.includes('student') || cmd.includes('view student')) {
            navigate('/students');
            setFeedback("Opening Students...");
        } else if (cmd.includes('report') || cmd.includes('class report')) {
            navigate('/reports');
            setFeedback("Opening Reports...");
        } else if (cmd.includes('add student')) {
            navigate('/add-student');
            setFeedback("Add Student...");
        } else if (cmd.includes('subject') || cmd.includes('add subject')) {
            navigate('/add-subject');
            setFeedback("Add Subject...");
        }
        // Actions
        else if (cmd.includes('logout') || cmd.includes('log out')) {
            sessionStorage.removeItem('userInfo');
            localStorage.removeItem('userInfo');
            navigate('/login');
            setFeedback("Logging out...");
        }
        else {
            setFeedback("Command not recognized.");
        }
    };

    if (!SpeechRecognition) return null;

    return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        style={{ overflow: 'hidden', marginRight: 8 }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                whiteSpace: 'nowrap',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                px: 1.5, py: 0.5,
                                borderRadius: '12px',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            {feedback || "Listening..."}
                        </Typography>
                    </motion.div>
                )}
            </AnimatePresence>

            <IconButton
                onClick={toggleListening}
                sx={{
                    color: isListening ? '#ef4444' : 'text.secondary',
                    bgcolor: isListening ? alpha('#ef4444', 0.1) : 'transparent',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                        bgcolor: isListening ? alpha('#ef4444', 0.2) : alpha(theme.palette.primary.main, 0.1),
                        color: isListening ? '#ef4444' : theme.palette.primary.main,
                    }
                }}
            >
                {isListening ? (
                    <>
                        <Mic />
                        {/* Pulsing Ring Animation */}
                        <Box
                            component={motion.div}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                border: '2px solid #ef4444',
                                pointerEvents: 'none'
                            }}
                        />
                    </>
                ) : (
                    <Mic sx={{ fontSize: 20 }} />
                )}
            </IconButton>
        </Box>
    );
};

export default VoiceCommander;
