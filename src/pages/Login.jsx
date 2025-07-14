import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
//import { toast, ToastContainer } from 'react-toastify';
import BASE_URL from '../config';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ collegeId: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); 

        try {
            const response = await axios.post(`${BASE_URL}/Auth/login`, formData);
            console.log('Login response:', response.data);

            const {
                token,
                userId,
                userName,
                userRole,
                role, // fallback
                department
            } = response.data;

            const usersRole = (userRole || role || '').toLowerCase();

            if (!usersRole) {
                setError('Login failed: Role missing in response');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userName);
            localStorage.setItem('userRole', usersRole);
            localStorage.setItem('department', department || '');

            if (usersRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (usersRole === 'faculty') {
                navigate('/faculty/dashboard');
            } else {
                navigate('/student/dashboard');
            }

        } catch (err) {
            console.error('Login error:', err);

            const status = err?.response?.status;
            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                'Login failed. Please try again.';

            if (status === 401 && message.toLowerCase().includes('pending')) {
                //toast.warn('Your account is pending approval by faculty.');
                setError('Your account is pending approval by faculty.');

            } else if (status === 401) {
                //toast.error('Invalid College ID or Password.');
                setError('Invalid College ID or Password.');
            } else {
                //toast.error(message);
                setError(message);
            }
                } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="loginpage">
            <Navbar />
            <div className="login-page">
                <form className="login-card" onSubmit={handleSubmit}>
                    <h2>Login</h2>

                    {error && <div className="error-msg">{error}</div>}

                    <input
                        type="text"
                        name="collegeId"
                        placeholder="College ID"
                        value={formData.collegeId}
                        onChange={handleChange}
                        required
                    />

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>

                    <div className="forgot-password" onClick={() => navigate('/forgot-password')}>
                        Forgot Password?
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="signup-link">
                        Don't have an account? <span onClick={() => navigate('/register')}>Sign Up</span>
                    </div>
                </form>
            </div>
            <Footer />
           
        </div>
    );
}

export default Login;
