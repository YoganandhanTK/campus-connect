import React from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import { Outlet } from 'react-router-dom';
import './styles/MainLayout.css'; //  make sure this is used

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <div className="layout-body">
                <main className="layout-content">
                    <Outlet />
                </main>
                <div className="layout-sidebar-wrapper">
                    <Sidebar />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
