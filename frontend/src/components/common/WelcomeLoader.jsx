import React from 'react';
import { motion } from 'framer-motion';
import './WelcomeLoader.css';

const WelcomeLoader = () => {
    return (
        <motion.div 
            className="welcome-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <div className="glow-circle"></div>
            <div className="glow-circle secondary"></div>
            
            {/* Subtle Background Particles */}
            <div className="particles-container">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random() * 0.5
                    }}></div>
                ))}
            </div>

            <div className="loader-content">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <span className="loader-badge">System Initializing</span>
                </motion.div>
                
                <h1 className="loader-title">
                    Welcome to <br />
                    <span className="gradient-text">GrowthUtsav</span>
                </h1>
                
                <div className="loader-subtitle">
                    AN EVENT SERIES OF WE ALL
                </div>

                <div className="loader-progress-container">
                    <div className="loader-progress-bar"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default WelcomeLoader;
