import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/forgotpassword.css';
import BASE_URL from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const showMsg = (msg, isError = false) => {
        setError(isError ? msg : '');
        setMessage(!isError ? msg : '');
    };

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/Auth/forgot-password`, {
                email: email.trim().toLowerCase()
            });
            showMsg(res.data || '✅ OTP sent to your email.');
            setStep(2);
        } catch (err) {
            showMsg(err.response?.data || '❌ Failed to send OTP', true);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/Auth/verify-otp`, {
                email: email.trim().toLowerCase(),
                otp: otp
            });
            showMsg(res.data || '✅ OTP verified successfully');
            setStep(3);
        } catch (err) {
            showMsg(err.response?.data || '❌ Invalid or expired OTP', true);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            showMsg('Both password fields are required.', true);
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
            showMsg(err.response?.data || '❌ Failed to reset password', true);
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
        <div className="forgot-page">
            <Navbar />
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={step > 1}
                    required
                />

                {step >= 2 && (
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        readOnly={step === 3}
                        required
                    />
                )}

                {step === 3 && (
                    <>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading
                        ? 'Please wait...'
                        : step === 1
                            ? 'Send OTP'
                            : step === 2
                                ? 'Verify OTP'
                                : 'Reset Password'}
                </button>
            </form>

            {error && <p className="error-msg">{error}</p>}
            {message && <p className="success-msg">{message}</p>}
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
