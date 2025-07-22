import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import BASE_URL from '../config';
import './Register.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper function for debouncing (if you want real-time validation while typing, not just on blur)
// const debounce = (func, delay) => {
//     let timeout;
//     return function(...args) {
//         const context = this;
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(context, args), delay);
//     };
// };

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
    const [modalType, setModalType] = useState(null);
    const [modalMessage, setModalMessage] = useState('');

    // State for individual field errors
    const [fieldErrors, setFieldErrors] = useState({});

    const navigate = useNavigate();

    const departmentCodeToName = {
        'CS': 'Computer Science',
        'MA': 'Maths',
        'CH': 'Chemistry',
        'PH': 'Physics',
    };

    const departmentNameToCode = {
        'Computer Science': 'CS',
        'Maths': 'MA',
        'Chemistry': 'CH',
        'Physics': 'PH',
    };

    const batchRange = () =>
        joinYear ? `${joinYear} - ${parseInt(joinYear, 10) + 3}` : '';

    const currentYear = new Date().getFullYear().toString();

    // --- Individual Field Validation Functions ---
    const validateFullName = useCallback((name) => {
        if (!name.trim()) {
            return 'Full Name is required.';
        }
        if (name.length < 4) {
            return 'Full Name must be at least 4 characters long.';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Full Name can only contain letters and spaces .';
        }
        return '';
    }, []);

    const validateCollegeId = useCallback((id, currentDept, currentYearRef) => {
        if (!id.trim()) {
            return 'College ID is required.';
        }
        const collegeIdRegex = /^(\d{4})([a-zA-Z]{2})(\d{3})$/;
        const match = id.match(collegeIdRegex);

        if (!match) {
            return 'College ID must be in YEAR-DEPARTMENT-ROLLNUMBER format (e.g., 2025CS456).';
        }

        const yearPart = match[1];
        const deptCodePart = match[2].toUpperCase();

        if (yearPart !== currentYearRef) {
            return `College ID year part '${yearPart}' must be the current year (${currentYearRef}).`;
        }

        const expectedDeptCode = departmentNameToCode[departmentCodeToName[deptCodePart]];
        if (!expectedDeptCode || deptCodePart !== expectedDeptCode) {
            return `College ID department code '${deptCodePart}' does not match auto-filled Department.`;
        }
        return '';
    }, [departmentCodeToName, departmentNameToCode]);

    const validateEmail = useCallback((email) => {
        if (!email.trim()) {
            return 'Email is required.';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Please enter a valid email address.';
        }
        return '';
    }, []);

    const validatePassword = useCallback((password) => {
        if (!password) {
            return 'Password is required.';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).';
        }
        return '';
    }, []);

    const validateConfirmPassword = useCallback((password, confirmPassword) => {
        if (!confirmPassword) {
            return 'Confirm Password is required.';
        }
        if (password !== confirmPassword) {
            return 'Passwords do not match.';
        }
        return '';
    }, []);

    // --- Handle Change and Blur Events ---

    const handleCollegeIdChange = (e) => {
        const inputCollegeId = e.target.value.toUpperCase();
        setForm(prevForm => ({ ...prevForm, collegeId: inputCollegeId }));

        const collegeIdRegex = /^(\d{4})([a-zA-Z]{2})(\d{3})$/;
        const match = inputCollegeId.match(collegeIdRegex);

        let autoFillDepartment = '';
        let autoFillJoinYear = '';

        if (match) {
            const extractedYear = match[1];
            const extractedDeptCode = match[2];

            if (extractedYear === currentYear) {
                autoFillJoinYear = extractedYear;
                const departmentName = departmentCodeToName[extractedDeptCode];
                if (departmentName) {
                    autoFillDepartment = departmentName;
                }
            }
        }
        setJoinYear(autoFillJoinYear);
        setForm(prevForm => ({ ...prevForm, department: autoFillDepartment }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
        // No validation on every keystroke, only on blur or submit
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';

        // Perform validation based on the field name
        switch (name) {
            case 'fullName':
                error = validateFullName(value);
                break;
            case 'collegeId':
                error = validateCollegeId(value, form.department, currentYear);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(form.password, value);
                break;
            default:
                break;
        }
        setFieldErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };


    // --- Form Submission Validation ---
    const validateAllFieldsOnSubmit = useCallback(() => {
        let isValid = true;
        const newErrors = {};

        const fullNameError = validateFullName(form.fullName);
        if (fullNameError) { newErrors.fullName = fullNameError; isValid = false; }

        const collegeIdError = validateCollegeId(form.collegeId, form.department, currentYear);
        if (collegeIdError) { newErrors.collegeId = collegeIdError; isValid = false; }

        const emailError = validateEmail(form.email);
        if (emailError) { newErrors.email = emailError; isValid = false; }

        const passwordError = validatePassword(form.password);
        if (passwordError) { newErrors.password = passwordError; isValid = false; }

        const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);
        if (confirmPasswordError) { newErrors.confirmPassword = confirmPasswordError; isValid = false; }

        // Additional checks for hidden fields (department and joinYear)
        if (!form.department) {
            newErrors.department = 'Department is required (derived from College ID). Please ensure your College ID is correct.';
            isValid = false;
        }
        if (!joinYear || joinYear !== currentYear) {
            newErrors.joinYear = 'Join Year is required and must be the current year (derived from College ID). Please ensure your College ID is correct.';
            isValid = false;
        }

        setFieldErrors(newErrors);
        return isValid;
    }, [form, joinYear, currentYear, validateFullName, validateCollegeId, validateEmail, validatePassword, validateConfirmPassword]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAllFieldsOnSubmit()) {
            setModalType('error');
            const allErrors = Object.values(fieldErrors).filter(msg => msg).join('\n');
            setModalMessage(allErrors || 'Please correct the highlighted errors before submitting.');
            setShowModal(true);
            return;
        }

        try {
            const nameToSend = form.fullName.trim().toLowerCase();

            await axios.post(`${BASE_URL}/Auth/register-student`, {
                ...form,
                fullName: nameToSend,
                batch: batchRange(),
            });

            setModalType('success');
            setModalMessage('Registration Successful! Your account is pending approval. You will be redirected to login shortly.');
            setShowModal(true);
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            setModalType('error');
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                'Registration failed. An unexpected error occurred. Please try again.';
            setModalMessage(msg);
            setShowModal(true);
        }
    };


    return (
        <div className="student-register-page">   

            {!showModal && (
                <>
                    <Navbar />
                    <div className="sr-content-wrapper">
                        <form className="sr-card" onSubmit={handleSubmit}>
                            <h2>Student Register</h2>
                            <p>Fill in your details to create an account</p>

                            <div className="form-group">
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={fieldErrors.fullName ? 'input-error' : ''}
                                />
                                {fieldErrors.fullName && <p className="error-text">{fieldErrors.fullName}</p>}
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    name="collegeId"
                                    placeholder={`College ID (e.g., ${currentYear}CS456)`}
                                    value={form.collegeId}
                                    onChange={handleCollegeIdChange}
                                    onBlur={handleBlur}
                                    required
                                    className={fieldErrors.collegeId ? 'input-error' : ''}
                                />
                                {fieldErrors.collegeId && <p className="error-text">{fieldErrors.collegeId}</p>}
                            </div>

                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={fieldErrors.email ? 'input-error' : ''}
                                />
                                {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
                            </div>

                            <div className="form-group">
                                <div className="sr-password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        value={form.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        className={fieldErrors.password ? 'input-error' : ''}
                                    />
                                    <span
                                        className="sr-password-toggle-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                                {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
                            </div>

                            <div className="form-group">
                                <div className="sr-password-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        className={fieldErrors.confirmPassword ? 'input-error' : ''}
                                    />
                                    <span
                                        className="sr-password-toggle-icon"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                                {fieldErrors.confirmPassword && <p className="error-text">{fieldErrors.confirmPassword}</p>}
                            </div>

                            <button type="submit" className="sr-btn-submit">
                                Register
                            </button>

                            <div className="sr-login-link">
                                Already have an account?{' '}
                                <span onClick={() => navigate('/login')}>Login</span>
                            </div>
                        </form>
                    </div>
                    <Footer />
                </>
            )}
             {showModal && (
                <div className={`sr-modal-overlay ${modalType === 'success' ? 'sr-success-bg' : 'sr-error-bg'}`}>
                    <div className="sr-modal-box">
                        <img
                            // Updated this line:
                            src={modalType === 'success' ? "https://img.icons8.com/color/96/clock.png" : "https://img.icons8.com/color/96/error--v1.png"}
                            alt={modalType === 'success' ? "pending approval" : "error"}
                            className="sr-modal-icon"
                        />
                        <h3>{modalType === 'success' ? "Success!" : "Error!"}</h3>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{modalMessage}</p>
                        {modalType === 'error' && (
                            <button className="sr-modal-btn" onClick={() => setShowModal(false)}>
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

        </div>
    );
}

export default Register;