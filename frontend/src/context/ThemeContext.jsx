import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const isMobile = () => window.innerWidth < 992; // lg breakpoint in bootstrap

    const [theme, setTheme] = useState(() => {
        if (isMobile()) return 'light';
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        const handleResize = () => {
            if (isMobile()) {
                setTheme('light');
            }
        };

        window.addEventListener('resize', handleResize);
        
        const body = document.body;
        if (theme === 'dark' && !isMobile()) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            if (!isMobile()) localStorage.setItem('theme', 'light');
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [theme]);

    const toggleTheme = () => {
        if (isMobile()) return; // Disable toggling on mobile
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isMobile: isMobile() }}>
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
