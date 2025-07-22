import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/forgotpassword.css';
import BASE_URL from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const showMsg = (msg, isError = false) => {
        setError(isError ? msg : '');
        setMessage(!isError ? msg : '');
        setPasswordError('');
    };

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Password must contain at least one special character.';
        }
        return '';
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(prev => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        showMsg('');
        try {
            const res = await axios.post(`${BASE_URL}/Auth/forgot-password`, {
                email: email.trim().toLowerCase()
            });
            showMsg(res.data || '✅ OTP sent to your email.');
            setStep(2);
        } catch (err) {
            showMsg(err.response?.data || '❌ Failed to send OTP. Please check your email.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        showMsg('');
        try {
            const res = await axios.post(`${BASE_URL}/Auth/verify-otp`, {
                email: email.trim().toLowerCase(),
                otp
            });
            showMsg(res.data || '✅ OTP verified successfully.');
            setStep(3);
        } catch (err) {
            showMsg(err.response?.data || '❌ Invalid or expired OTP.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        showMsg('');
        setPasswordError('');

        if (!newPassword || !confirmPassword) {
            showMsg('Both password fields are required.', true);
            return;
        }

        const validationErr = validatePassword(newPassword);
        if (validationErr) {
            setPasswordError(validationErr);
            return;
        }

        if (newPassword !== confirmPassword) {
            showMsg('❌ Passwords do not match.', true);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/Auth/reset-password`, {
                email: email.trim().toLowerCase(),
                newPassword,
                confirmPassword
            });
            showMsg(res.data || '✅ Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error("Reset password error:", err);
            showMsg(err.response?.data || '❌ Failed to reset password. Please try again.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (step === 1) await handleSendOtp();
        else if (step === 2) await handleVerifyOtp();
        else await handleResetPassword();
    };

    return (
        <div className="forgot-password-page">
            <Navbar />
            <div className="forgot-password-wrapper">
                <h2 className="forgot-password-title">Forgot Password</h2>
                <form className="forgot-password-form" onSubmit={handleSubmit}>
                    {/* Render content based on current step */}

                    {step === 1 && (
                        <>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="forgot-password-btn" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button type="submit" className="forgot-password-btn" disabled={loading}>
                                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="password-input-group">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (step === 3) {
                                            setPasswordError(validatePassword(e.target.value));
                                        }
                                    }}
                                    required
                                />
                                <span className="password-toggle-icon" onClick={toggleNewPasswordVisibility}>
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            {passwordError && <p className="forgot-password-error password-validation-error">{passwordError}</p>}

                            <div className="password-input-group">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <button type="submit" className="forgot-password-btn" disabled={loading}>
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </>
                    )}
                </form>

                {error && <p className="forgot-password-error">{error}</p>}
                {message && <p className="forgot-password-success">{message}</p>}
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;