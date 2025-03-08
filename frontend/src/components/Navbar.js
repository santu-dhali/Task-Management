import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../design/Navbar.css';

const Navbar = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.post('http://localhost:5000/api/v1/notifications', {}, config);
                setNotifications(response.data.notifications);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();
    }, [navigate]);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        navigate('/auth');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.notifications') && !event.target.closest('.profile')) {
                setShowNotifications(false);
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <span className="navbar-brand">User Dashboard</span>
            </div>

            <div className="navbar-right">
                <div className="notifications">
                    <button className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                        <i className="fas fa-bell"></i>
                        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                    </button>
                    {showNotifications && (
                        <div className="notifications-dropdown">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div key={notification._id} className="notification-item">
                                        <p>{notification.message}</p>
                                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No new notifications.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="profile">
                    <button className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <i className="fas fa-user-circle"></i>
                    </button>
                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <button onClick={() => navigate('/profile')}>Profile</button>
                            {role === 'Admin' && (
                                <button onClick={() => navigate('/adminportal')}>Admin</button>
                            )}
                            <button onClick={handleSignOut}>Sign Out</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
