import React from 'react';
import './styles/footer.css'; 
function Footer() {
    return (
        <footer className="footer">
            @{new Date().getFullYear()} Campus-Connect. All rights reserved.
        </footer>
    );
}

export default Footer;
