import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { getDesignTokens } from '../theme';

export const ThemeContext = createContext({
    toggleColorMode: () => { },
    mode: 'dark',
});

export const ThemeContextProvider = ({ children }) => {
    // Check local storage for theme preference, default to dark
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? savedMode : 'dark';
    });

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const nextMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', nextMode);
                    return nextMode;
                });
            },
            mode,
        }),
        [mode],
    );

    const theme = useMemo(() => {
        let t = createTheme(getDesignTokens(mode));
        t = responsiveFontSizes(t);
        return t;
    }, [mode]);

    // Apply the theme mode to body data attribute for CSS selectors
    useEffect(() => {
        document.body.setAttribute('data-theme', mode);
    }, [mode]);

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
