import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../utils/api';
import { DEFAULT_USER_ID } from '../constants/defaults';

const ProjectListModal = ({ isOpen, onClose, onProjectLoad, setError }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi('list', {});
            setProjects(data.map(p => ({
                id: p.projectId,
                updatedAt: new Date(p.updatedAt).toLocaleString(),
            })));
        } catch (e) {
            console.error("Error fetching projects: ", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [setError]);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen, fetchProjects]);

    const handleDelete = async (projectId) => {
        if (!window.confirm(`Are you sure you want to delete project: ${projectId}?`)) return;

        try {
            await fetchApi('delete', { projectId });
            setError(`Project ${projectId} deleted.`);
            fetchProjects();
        } catch (e) {
            console.error("Error deleting project: ", e);
            setError(e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Load/Manage Projects</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition text-2xl">
                        &times;
                    </button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {isLoading && <p className="text-center text-indigo-500">Loading...</p>}
                    {!isLoading && projects.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">No projects saved yet for user: {DEFAULT_USER_ID}</p>
                    )}
                    <ul className="space-y-3">
                        {projects.map(project => (
                            <li key={project.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate" title={project.id}>{project.id}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last saved: {project.updatedAt}
                                    </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => onProjectLoad(project.id)}
                                        className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectListModal;