import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes, FaKey, FaTrash } from 'react-icons/fa'; // Import icons
import '../design/ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState({ username: '', email: '', role: '' });
    const [editMode, setEditMode] = useState({ username: false, email: false });
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.get(`http://localhost:5000/api/v1/profile/${userId}`, config);
                setUser(response.data.user);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.put(
                'http://localhost:5000/api/v1/updateprofile',
                { username: user.username, email: user.email },
                config
            );

            setUser(response.data.user);
            setEditMode({ username: false, email: false });
            setError('');
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.put(
                'http://localhost:5000/api/v1/profile/changepassword',
                { currentPassword, newPassword },
                config
            );

            setChangePasswordMode(false);
            setCurrentPassword('');
            setNewPassword('');
            setError('');
        } catch (err) {
            console.error('Failed to change password:', err);
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.delete('http://localhost:5000/api/v1/deleteprofile', config);

            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            navigate('/auth');
        } catch (err) {
            console.error('Failed to delete account:', err);
            setError(err.response?.data?.message || 'Failed to delete account');
        }
    };

    return (
        <div className="profile-page">
            <h1>Profile</h1>
            {error && <p className="error">{error}</p>}
            <div className="profile-details">
                <div className="profile-field">
                    <label>Username:</label>
                    {editMode.username ? (
                        <input
                            type="text"
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                        />
                    ) : (
                        <span>{user.username}</span>
                    )}
                    <button
                        className="icon-button"
                        onClick={() => setEditMode({ ...editMode, username: !editMode.username })}
                    >
                        {editMode.username ? <FaTimes /> : <FaEdit />}
                    </button>
                </div>
                <div className="profile-field">
                    <label>Email:</label>
                    {editMode.email ? (
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    ) : (
                        <span>{user.email}</span>
                    )}
                    <button
                        className="icon-button"
                        onClick={() => setEditMode({ ...editMode, email: !editMode.email })}
                    >
                        {editMode.email ? <FaTimes /> : <FaEdit />}
                    </button>
                </div>
                <div className="profile-field">
                    <label>Role:</label>
                    <span>{user.role}</span>
                </div>
                {(editMode.username || editMode.email) && (
                    <button className="save-button" onClick={handleUpdateProfile}>
                        <FaSave /> Save Changes
                    </button>
                )}
                <button
                    className="change-password-button"
                    onClick={() => setChangePasswordMode(!changePasswordMode)}
                >
                    <FaKey /> {changePasswordMode ? 'Cancel Change Password' : 'Change Password'}
                </button>
                {changePasswordMode && (
                    <div className="change-password">
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button className="save-password-button" onClick={handleChangePassword}>
                            <FaSave /> Save New Password
                        </button>
                    </div>
                )}
                <button className="delete-account-button" onClick={() => setShowDeleteDialog(true)}>
                    <FaTrash /> Delete Account
                </button>
            </div>
            {showDeleteDialog && (
                <div className="delete-dialog">
                    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                    <button className="confirm-delete" onClick={handleDeleteAccount}>
                        <FaTrash /> Confirm Delete
                    </button>
                    <button className="cancel-delete" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;