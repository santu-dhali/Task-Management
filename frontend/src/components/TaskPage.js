import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../design/TaskPage.css';
import Navbar from './Navbar';

const TaskPage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [status, setStatus] = useState('');
    const [assigneeEmail, setAssigneeEmail] = useState('');
    const [commentText, setCommentText] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.get(
                    `http://localhost:5000/api/v1/task/${taskId}`,
                    config
                );
                setTask(response.data.task);
                setStatus(response.data.task.status);
            } catch (err) {
                console.error('Failed to fetch task:', err);
            }
        };

        fetchTask();
    }, [taskId, navigate]);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.put(
                'http://localhost:5000/api/v1/status',
                { taskId, status: newStatus },
                config
            );
            console.log('Status updated:', response.data);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleAssignTask = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const userResponse = await axios.post(
                `http://localhost:5000/api/v1/email`,
                { email: assigneeEmail },
                config
            );

            const newAssigneeId = userResponse.data.user._id;
            const assignResponse = await axios.put(
                'http://localhost:5000/api/v1/reassigntask',
                { newUserId: newAssigneeId, taskId },
                config
            );

            console.log('Task assigned/reassigned:', assignResponse.data);

            setTask((prevTask) => ({
                ...prevTask,
                assignee: {
                    _id: newAssigneeId,
                    username: userResponse.data.user.username,
                    email: userResponse.data.user.email,
                },
            }));
            setAssigneeEmail('');
            setShowDialog(false);
        } catch (err) {
            console.error('Failed to assign/reassign task:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.post(
                'http://localhost:5000/api/v1/comment',
                { taskId, text: commentText },
                config
            );

            console.log('Comment added:', response.data);

            setTask((prevTask) => ({
                ...prevTask,
                comments: [...prevTask.comments, response.data.comment],
            }));
            setCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    if (!task) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar />
            <div className="task-page">
                <div className="task-card">
                    <div className="task-header">
                        <h1>{task.title}</h1>
                        <div className="task-meta">
                            <select value={status} onChange={handleStatusChange}>
                                <option value="To-Do">To-Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <span>Priority: {task.priority}</span>
                        </div>
                    </div>
                    <div className="task-description">
                        <p>{task.description}</p>
                    </div>
                    <div className="task-assignee">
                        <p>Reporter: {task.reporter?.username} ({task.reporter.email})</p>
                        <div className="assignee-section">
                            {task.assignee ? (
                                <div className="assignee-info">
                                    <p>Assignee: {task.assignee?.username} ({task.assignee?.email})</p>
                                    <div className="assignee-actions">
                                        <span className="assign-icon" onClick={() => setShowDialog(true)}>
                                            <i className="fas fa-user-edit"></i>
                                        </span>
                                        {showDialog && (
                                            <div className="assign-dialog">
                                                <input
                                                    type="email"
                                                    placeholder="Reassign by email"
                                                    value={assigneeEmail}
                                                    onChange={(e) => setAssigneeEmail(e.target.value)}
                                                />
                                                <button onClick={handleAssignTask}>Reassign</button>
                                                <button onClick={() => setShowDialog(false)}>Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="assignee-actions">
                                    <span className="assign-icon" onClick={() => setShowDialog(true)}>
                                        <i className="fas fa-user-plus"></i>
                                    </span>
                                    {showDialog && (
                                        <div className="assign-dialog">
                                            <input
                                                type="email"
                                                placeholder="Assign by email"
                                                value={assigneeEmail}
                                                onChange={(e) => setAssigneeEmail(e.target.value)}
                                            />
                                            <button onClick={handleAssignTask}>Assign</button>
                                            <button onClick={() => setShowDialog(false)}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="comments">
                        <h2>Comments</h2>
                        {task.comments?.length > 0 ? (
                            <ul>
                                {task.comments.map((comment) => (
                                    <li key={comment._id}>
                                        <p>{comment.text}</p>
                                        <small>By: {comment.createdBy?.username} ({comment.createdBy?.email})</small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments yet.</p>
                        )}
                        <form onSubmit={handleAddComment}>
                            <textarea
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            />
                            <button type="submit">Add Comment</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;