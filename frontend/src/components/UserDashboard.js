import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { FaTrash } from 'react-icons/fa';
import '../design/Dashboard.css';

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [taskBoardTasks, setTaskBoardTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('assigned');
    const [userRole, setUserRole] = useState('');
    const [filters, setFilters] = useState({
        priority: '',
        assignee: '',
        status: '',
    });
    const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const userId = localStorage.getItem('userId');
                if (!userId) {
                    console.error('User ID not found in local storage');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                let assignedTasks = [];
                try {
                    const assignedTasksResponse = await axios.get(
                        `https://task-management-m7aa.onrender.com/api/v1/gettasks/${userId}`,
                        config
                    );
                    assignedTasks = assignedTasksResponse.data.tasks || [];
                } catch (err) {
                    console.error('Failed to fetch assigned tasks:', err);
                }
                setTasks(assignedTasks);

                let taskBoardTasks = [];
                try {
                    const userResponse = await axios.get(
                        `https://task-management-m7aa.onrender.com/api/v1/${userId}`,
                        config
                    );
                    const projectIds = userResponse.data.user.projects;
                    const role = userResponse.data.user.role;
                    setUserRole(role);

                    const allTasks = [];
                    for (const projectId of projectIds) {
                        try {
                            const tasksResponse = await axios.get(
                                `https://task-management-m7aa.onrender.com/api/v1/gettasks/${projectId}`,
                                config
                            );
                            allTasks.push(...tasksResponse.data.tasks);
                        } catch (err) {
                            console.error(`No tasks found for project ${projectId}:`, err);
                        }
                    }
                    taskBoardTasks = Array.from(new Set(allTasks.map((task) => task._id))).map((id) =>
                        allTasks.find((task) => task._id === id)
                    );
                } catch (err) {
                    console.error('Failed to fetch task board tasks:', err);
                }
                setTaskBoardTasks(taskBoardTasks);

                try {
                    const projectsResponse = await axios.get(
                        `https://task-management-m7aa.onrender.com/api/v1/projectdetails/getprojects`,
                        config
                    );
                    setProjects(projectsResponse.data.projects);
                } catch (err) {
                    console.error('Failed to fetch projects:', err);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();
    }, [navigate]);

    const handleTaskClick = (taskId) => {
        navigate(`/task/${taskId}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleCreateProject = async (e) => {
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
                'https://task-management-m7aa.onrender.com/api/v1/createproject',
                { title },
                config
            );
            setProjects([...projects, response.data.project]);
            setTitle('');
            setShowCreateProjectDialog(false);
        } catch (err) {
            console.error('Failed to create project:', err);
        }
    };

    const handleDeleteTask = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.delete(`https://task-management-m7aa.onrender.com/api/v1/deletetask/${taskToDelete}`, config);
            setTaskBoardTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskToDelete));
            setShowDeleteDialog(false);
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const filteredTasks = taskBoardTasks.filter((task) => {
        return (
            (filters.priority === '' || task.priority === filters.priority) &&
            (filters.assignee === '' || task.assignee?.username === filters.assignee) &&
            (filters.status === '' || task.status === filters.status)
        );
    });

    return (
        <div>
            <Navbar />
            <div className="dashboard">
                <div className="tabs">
                    <button
                        className={activeTab === 'assigned' ? 'active' : ''}
                        onClick={() => setActiveTab('assigned')}
                    >
                        Assigned Tasks
                    </button>
                    <button
                        className={activeTab === 'taskboard' ? 'active' : ''}
                        onClick={() => setActiveTab('taskboard')}
                    >
                        Task Board
                    </button>
                    <button
                        className={activeTab === 'projects' ? 'active' : ''}
                        onClick={() => setActiveTab('projects')}
                    >
                        Projects
                    </button>
                </div>

                {activeTab === 'assigned' && (
                    <div className="tasks">
                        <h2>Assigned Tasks</h2>
                        {tasks.length > 0 ? (
                            <ul>
                                {tasks.map((task) => (
                                    <li key={task._id} onClick={() => handleTaskClick(task._id)}>
                                        <div className="task-row">
                                            <h3>{task.title}</h3>
                                            <p className="projectName">{task.project.title}</p>
                                            <p className="status">Status: {task.status}</p>
                                            <p className="priority">Priority: {task.priority}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <h2>No tasks assigned.</h2>
                        )}
                    </div>
                )}

                {activeTab === 'taskboard' && (
                    <div className="tasks">
                        <h2>Task Board</h2>
                        {(userRole === 'Admin' || userRole === 'Manager') && (
                            <div className="filters">
                                <select
                                    name="priority"
                                    value={filters.priority}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <select
                                    name="assignee"
                                    value={filters.assignee}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Assignees</option>
                                    {Array.from(new Set(taskBoardTasks.map((task) => task.assignee?.username))).map(
                                        (username, index) => (
                                            <option key={index} value={username}>
                                                {username || 'Unassigned'}
                                            </option>
                                        )
                                    )}
                                </select>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="To-Do">To-Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        )}
                        {(userRole === 'Admin' || userRole === 'Manager' ? filteredTasks : taskBoardTasks).length > 0 ? (
                            <ul>
                                {(userRole === 'Admin' || userRole === 'Manager' ? filteredTasks : taskBoardTasks).map((task) => (
                                    <li key={task._id}>
                                        <div className="task-row" onClick={() => handleTaskClick(task._id)}>
                                            <h3>{task.title}</h3>
                                            <p className="projectName">{task.project.title}</p>
                                            <p className="status">Status: {task.status}</p>
                                            <p className="priority">Priority: {task.priority}</p>
                                            <button
                                                className="delete-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTaskToDelete(task._id);
                                                    setShowDeleteDialog(true);
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <h2>No tasks found.</h2>
                        )}
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="projects">
                        <div className="projects-header">
                            <h2>Projects</h2>
                            <button onClick={() => setShowCreateProjectDialog(true)}>Create Project</button>
                        </div>
                        {projects.length > 0 ? (
                            <div className="project-list">
                                {projects.map((project) => (
                                    <div key={project._id} className="project-card" onClick={() => navigate(`/project/${project._id}`)}>
                                        <div className="project-details">
                                            <h3>{project.title}</h3>
                                            <p>Owned By: {project.createdBy.username}</p>
                                            <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <h2>No projects found.</h2>
                        )}
                    </div>
                )}
            </div>

            {showCreateProjectDialog && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h2>Create Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Project Title"
                                required
                            />
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setShowCreateProjectDialog(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteDialog && (
                <div className="delete-dialog-overlay">
                    <div className="delete-dialog">
                        <h3>Confirm Delete Task?</h3>
                        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                        <div className="delete-dialog-buttons">
                            <button onClick={handleDeleteTask}>Confirm Delete</button>
                            <button onClick={() => setShowDeleteDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;