import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../design/ProjectManagement.css';
import { FaDownload, FaTrash } from 'react-icons/fa';

const ProjectManagement = () => {
    const [project, setProject] = useState(null);
    const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [taskDetails, setTaskDetails] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'To-Do',
    });
    const [memberEmail, setMemberEmail] = useState('');
    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
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
                    `http://localhost:5000/api/v1/projectdetails/${projectId}`,
                    config
                );
                setProject(response.data.project);
            } catch (err) {
                console.error('Failed to fetch project:', err);
            }
        };

        fetchProject();
    }, [projectId, navigate]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found in local storage');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.put(
                'http://localhost:5000/api/v1/updateteam',
                { projectId, email: memberEmail, action: 'add' },
                config
            );

            const newMember = await axios.post(
                `http://localhost:5000/api/v1/email`,
                { email: memberEmail },
                config
            );

            const updatedProject = {
                ...response.data.project,
                createdBy: project.createdBy,
                tasks: project.tasks,
                teamMembers: [...project.teamMembers, newMember.data.user],
            };

            setProject(updatedProject);
            setMemberEmail('');
            setShowAddMemberDialog(false);
        } catch (err) {
            console.error('Failed to add member:', err);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found in local storage');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const user = await axios.get(
                `http://localhost:5000/api/v1/${userId}`,
                config
            );

            const response = await axios.put(
                'http://localhost:5000/api/v1/updateteam',
                { projectId, email: user.data.user.email, action: 'remove' },
                config
            );

            const updatedProject = {
                ...response.data.project,
                createdBy: project.createdBy,
                tasks: project.tasks,
                teamMembers: project.teamMembers.filter((member) => member._id !== userId),
            };

            setProject(updatedProject);
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found in local storage');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.post(
                'http://localhost:5000/api/v1/createtask',
                { ...taskDetails, projectId },
                config
            );
            setProject((prevProject) => ({
                ...prevProject,
                tasks: [...prevProject.tasks, response.data.task],
            }));
            setTaskDetails({
                title: '',
                description: '',
                dueDate: '',
                priority: 'Medium',
                status: 'To-Do',
            });
            setShowCreateTaskDialog(false);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const generateReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const response = await axios.get(
                `http://localhost:5000/api/v1/projectsummary/${projectId}`,
                config
            );
            const { project } = response.data;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`Project: ${project.title}`, 14, 20);
            const tableData = project.tasks.map((task) => [
                task.title,
                task.description,
                task.status,
                task.priority,
                task.assignee ? task.assignee.username : 'Unassigned',
                task.assignee ? task.assignee.email : 'N/A',
                task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
                new Date(task.createdAt).toLocaleDateString(),
            ]);

            autoTable(doc, {
                head: [['Task Title', 'Description', 'Status', 'Priority', 'Assignee', 'Email', 'Due Date', 'Created At']],
                body: tableData,
                startY: 30,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: '#007bff', textColor: '#fff' },
            });

            doc.save(`Project_Summary_${project.title}.pdf`);
        } catch (err) {
            console.error('Failed to generate report:', err);
        }
    };

    if (!project) {
        return <p>Loading...</p>;
    }

    return (
        <div className="project-management">
            <h1>Project Management</h1>
            <div className="project-card">
                <div className="project-header">
                    <h2>{project.title}</h2>
                    <div className="project-actions">
                        <button onClick={() => setShowCreateTaskDialog(true)}>Create Task</button>
                        <button onClick={() => setShowAddMemberDialog(true)}>Add Member</button>
                        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                            <FaDownload size={24} onClick={generateReport} title="Download Report" />
                        </div>
                    </div>
                </div>
                <div className="project-details">
                    <p><small>Created By: {project.createdBy.username}</small></p>
                    <p><small>Created At: {new Date(project.createdAt).toLocaleDateString()}</small></p>
                </div>
                <div className="team-members">
                    <h3>Team Members</h3>
                    <ul>
                        {project.teamMembers.map((member) => (
                            <li key={member._id}>
                                <span>{member.username}</span>
                                <span>{member.email}</span>
                                <span>{member.role}</span>
                                <button
                                    className="delete-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveMember(member._id)
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="tasks">
                    <h3>Tasks</h3>
                    <ul>
                        {project.tasks.map((task) => (
                            <li key={task._id} onClick={() => navigate(`/task/${task._id}`)}>
                                <div className="task-row">
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                    <p>Priority: {task.priority}</p>
                                    <p>Status: {task.status}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {showCreateTaskDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Create Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <input
                                type="text"
                                value={taskDetails.title}
                                onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
                                placeholder="Task Title"
                                required
                            />
                            <textarea
                                value={taskDetails.description}
                                onChange={(e) => setTaskDetails({ ...taskDetails, description: e.target.value })}
                                placeholder="Task Description"
                            />
                            <input
                                type="date"
                                value={taskDetails.dueDate}
                                onChange={(e) => setTaskDetails({ ...taskDetails, dueDate: e.target.value })}
                                placeholder="Due Date"
                                required
                                min={new Date().toISOString().split("T")[0]}
                            />
                            <select
                                value={taskDetails.priority}
                                onChange={(e) => setTaskDetails({ ...taskDetails, priority: e.target.value })}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <select
                                value={taskDetails.status}
                                onChange={(e) => setTaskDetails({ ...taskDetails, status: e.target.value })}
                            >
                                <option value="To-Do">To-Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <div className="dialog-buttons">
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setShowCreateTaskDialog(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddMemberDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Add Member</h2>
                        <form onSubmit={handleAddMember}>
                            <input
                                type="email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                placeholder="Member Email"
                                required
                            />
                            <div className="dialog-buttons">
                                <button type="submit">Add</button>
                                <button type="button" onClick={() => setShowAddMemberDialog(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;