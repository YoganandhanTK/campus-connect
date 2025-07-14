import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import './Register.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Register() {
    const [form, setForm] = useState({
        collegeId: '',
        fullName: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [joinYear, setJoinYear] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const batchRange = () =>
        joinYear ? `${joinYear} - ${parseInt(joinYear, 10) + 3}` : '';

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!joinYear) return toast.warn('Please select a join year');
        if (form.password !== form.confirmPassword)
            return toast.warn('Passwords do not match');

        try {
            await axios.post(`${BASE_URL}/Auth/register-student`, {
                ...form,
                batch: batchRange(),
            });

            setShowModal(true);
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                'Registration failed';
            toast.error(msg);
        }
    };

    return (
        <div className="registerpage">
            {!showModal ? (
                <>
                    <Navbar />
                    <div className="register-page">
                        <form className="register-card" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <h2>Student Register</h2>
                            <p>Fill in your details to create an account</p>


                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="collegeId"
                                placeholder="College ID"
                                value={form.collegeId}
                                onChange={handleChange}
                                required
                            />

                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Maths">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                            </select>

                            <select
                                name="joinYear"
                                value={joinYear}
                                onChange={(e) => setJoinYear(e.target.value)}
                                required
                            >
                                <option value="">Select Join Year</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                            </select>
                                                        
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>

                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>

                            <button type="submit" className="reg-btn-submit">
                                Register
                            </button>

                            <div className="login-link">
                                Already have an account?{' '}
                                <span onClick={() => navigate('/login')}>Login</span>
                            </div>
                        </form>
                    </div>
                    <Footer />
                    <ToastContainer position="top-center" autoClose={3000} />
                </>
            ) : (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <img
                            src="https://img.icons8.com/color/96/ok--v1.png"
                            alt="success"
                            className="modal-icon"
                        />
                        <h3>Registration Successful!</h3>
                        <p>Wait for the Confirmation from Your Faculty .</p>
                        <button className="modal-btn" onClick={() => navigate('/login')}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Register;
