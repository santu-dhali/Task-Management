import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../design/AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (shouldNavigate) {
            console.log('Navigating to dashboard...');
            navigate('/dashboard');
        }
    }, [shouldNavigate, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const endpoint = isLogin ? 'login' : 'signup';
        const payload = isLogin
            ? { email, password }
            : { username, email, password, confirmPassword };

        try {
            const response = await axios.post(`http://localhost:5000/api/v1/auth/${endpoint}`, payload);
            console.log(`${isLogin ? 'Login' : 'Signup'} successful:`, response.data);

            const token = isLogin ? response.data.existingUser?.token : response.data.user?.token;
            const userId = isLogin ? response.data.existingUser?._id : response.data.user?._id;
            const role = isLogin ? response.data.existingUser?.role : response.data.user?.role;
            
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', role);
                setShouldNavigate(true);
            } else {
                setError('Token not received from server');
            }
        } catch (err) {
            console.error('Login/Signup failed: ', err);
            setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Signup'} failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <span className="spinner"></span>
                        ) : (
                            isLogin ? 'Login' : 'Sign Up'
                        )}
                    </button>
                </form>
                <p className="toggle-auth">
                    {isLogin ? 'New Customer? ' : 'Already Signed Up? '}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;