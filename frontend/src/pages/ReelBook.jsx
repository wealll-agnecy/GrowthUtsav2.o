import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause } from 'react-icons/fa';
import './ReelBook.css';
import video1 from '../assets/video1.mp4';

// Sample Data
const reels = [
    {
        id: 1,
        video: video1,
        story: "In the heart of the city, a new rhythm begins to pulse. Witness the transformation of art into movement, where every step tells a story of passion and grace. Join us in this journey of pure expression.",
        title: "City Pulse"
    },
    {
        id: 2,
        video: "https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-in-front-of-a-pink-background-40078-large.mp4",
        story: "Colors speak louder than words. A vibrant explosion of joy and energy that transcends the ordinary. Experience the magic of creativity unleashed in its most beautiful and raw form.",
        title: "Vibrant Energy"
    },
    {
        id: 3,
        video: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-and-listening-to-music-44031-large.mp4",
        story: "Late nights and bright lights. Find your frequency and let the music guide your soul. A cinematic capture of a moment where nothing else matters but the beat and the feeling of absolute freedom.",
        title: "Neon Dreams"
    }
];

const ReelBook = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const videoRef = useRef(null);
    const typewriterRef = useRef(null);

    // Robust Typewriter Effect
    useEffect(() => {
        let isMounted = true;
        let index = 0;
        const fullText = reels[currentIndex]?.story || "";
        
        // Reset state
        setDisplayedText("");
        setIsTyping(true);

        const typingInterval = setInterval(() => {
            if (!isMounted) return;

            if (index < fullText.length) {
                setDisplayedText(fullText.substring(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 40); // Slightly slower for readability

        return () => {
            isMounted = false;
            clearInterval(typingInterval);
        };
    }, [currentIndex]);

    const handleNext = () => {
        if (isFlipping) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % reels.length);
        }, 300); // Change content mid-flip

        setTimeout(() => {
            setIsFlipping(false);
        }, 800); // Full animation duration
    };

    const handlePrev = () => {
        if (isFlipping) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
        }, 300);

        setTimeout(() => {
            setIsFlipping(false);
        }, 800);
    };

    return (
        <div className="reel-book-container">
            <div className={`book-wrapper ${isFlipping ? 'page-flipping' : ''}`}>
                <div className="book-container">
                    {/* Left Page: Story */}
                    <div className="book-page left-page">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="story-content"
                        >
                            <span className="tiny-text uppercase tracking-widest text-pink mb-2 opacity-50">Discovery Chapter</span>
                            <h2 className="fw-black mb-4">{reels[currentIndex].title}</h2>
                            <p className="typewriter-text">
                                {displayedText}
                                <span className="cursor">|</span>
                            </p>
                        </motion.div>
                        
                        <div className="mt-auto d-flex justify-content-between align-items-center opacity-30">
                            <span className="small fw-bold">Chapter {currentIndex + 1}</span>
                            <span className="small fw-bold">{reels.length} Pages Total</span>
                        </div>
                    </div>

                    {/* Right Page: Reel Video */}
                    <div className="book-page right-page">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="reel-video-container"
                            >
                                <video 
                                    ref={videoRef}
                                    src={reels[currentIndex].video}
                                    className="reel-video"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                                <div className="video-overlay">
                                    <h5 className="fw-bold m-0">{reels[currentIndex].title}</h5>
                                    <p className="tiny-text opacity-70 m-0">Live Recording // Digital Reel</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="book-controls">
                    <button className="nav-btn" onClick={handlePrev}>
                        <FaChevronLeft />
                    </button>
                    <button className="nav-btn" onClick={handleNext}>
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReelBook;
