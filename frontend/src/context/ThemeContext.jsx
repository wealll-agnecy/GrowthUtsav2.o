import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const theme = 'light';
    const toggleTheme = () => {}; // No-op as dark mode is removed

    useEffect(() => {
        const body = document.body;
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isMobile: true }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
