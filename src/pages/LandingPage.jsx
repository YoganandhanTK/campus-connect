import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="landing-page">
            <Navbar />
            <div className="hero">
                <div className="hero-content">
                    <h1>Connect, Explore, and Thrive on Campus</h1>
                    <p>
                        Join Campus Connect to discover groups, clubs, and events that match your interests.
                        Make new friends and stay informed about campus life.
                    </p>
                    <button onClick={() => navigate('/login')} className="get-started">Get Started</button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LandingPage;
