import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { Outlet } from 'react-router-dom';
import './styles/MainLayout.css'; // Ensure this is used

const MainLayout = () => {
    // Centralized state for sidebar visibility
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="main-layout">
            {/* Pass setSidebarOpen to Navbar so it can toggle the sidebar */}
            <Navbar setSidebarOpen={setSidebarOpen} />

            <div className="layout-body">
                <main className="layout-content">
                    <Outlet />
                </main>
                <div className="layout-sidebar-wrapper">
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>

            </div>  

            <Footer />

            {/* Overlay for mobile view when sidebar is open */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
        </div>
    );
};

export default MainLayout;