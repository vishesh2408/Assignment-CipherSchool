import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_PROJECT_ID, DEFAULT_FILES, DEFAULT_CONFIG } from './constants/defaults';
import { fetchApi } from './utils/api';
import SandpackWrapper from './components/SandpackWrapper';
import ProjectListModal from './components/ProjectListModal';
import ConfigModal from './components/ConfigModal';
import CustomFileManager from './components/CustomFileManager';

function App() {
    const [isDark, setIsDark] = useState(true);
    const [files, setFiles] = useState(DEFAULT_FILES);
    const [activeFile, setActiveFile] = useState('/App.js');
    const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID);
    const [statusMessage, setStatusMessage] = useState('Loading project...');
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [projectConfig, setProjectConfig] = useState(DEFAULT_CONFIG);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const filesRef = useRef(files);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    // Project Loading
    const loadProject = useCallback(async (loadId) => {
        const idToLoad = loadId || projectId;
        setStatusMessage(`Loading project ${idToLoad}...`);

        try {
            const data = await fetchApi('load', { projectId: idToLoad });
            setFiles(data.files);
            setProjectConfig(data.config || DEFAULT_CONFIG);
            setProjectId(data.projectId);
            setActiveFile('/App.js');
            setStatusMessage(`Project ${data.projectId} loaded successfully.`);
        } catch (e) {
            console.error("Error loading project: ", e);
            setStatusMessage(e.message);
            setFiles(DEFAULT_FILES);
            setProjectConfig(DEFAULT_CONFIG);
            setProjectId(DEFAULT_PROJECT_ID);
        }
    }, [projectId]);

    // Project Saving
    const saveProject = useCallback(async () => {
        setStatusMessage(`Saving project ${projectId}...`);

        try {
            const result = await fetchApi('save', {
                projectId,
                files,
                config: projectConfig,
            });
            setStatusMessage(`Project ${result.project.projectId} saved successfully!`);
        } catch (e) {
            console.error("Error saving project:", e);
            setStatusMessage(e.message);
        }
    }, [files, projectId, projectConfig]);

    // Autosave
    useEffect(() => {
        if (autoSaveEnabled) {
            const timer = setInterval(() => {
                const currentFiles = filesRef.current;
                const hash = JSON.stringify(currentFiles).length;
                if (hash > 1000) {
                    saveProject();
                }
            }, 5000);

            return () => clearInterval(timer);
        }
    }, [autoSaveEnabled, saveProject]);

    // Initial load
    useEffect(() => {
        loadProject(DEFAULT_PROJECT_ID);
    }, []); 

    
    useEffect(() => {
        if (statusMessage && !statusMessage.startsWith('Loading')) {
            const timer = setTimeout(() => setStatusMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    // File operations
    const handleNewFile = (path, type) => {
        if (files[path]) {
            setStatusMessage(`Error: File/Folder ${path} already exists.`);
            return;
        }

        const newFiles = { ...files };

        if (type === 'file') {
            newFiles[path] = { code: `// New file created at ${path}`, hidden: false };
            setActiveFile(path);
            setStatusMessage(`File ${path} created.`);
        } else if (type === 'folder') {
            const placeholderPath = `${path}/README.md`.replace(/\/\//g, '/');
            newFiles[placeholderPath] = { code: `# Folder: ${path}\n\nFolder created for organization.`, hidden: false };
            setActiveFile(placeholderPath);
            setStatusMessage(`Folder ${path} created with placeholder.`);
        }

        setFiles(newFiles);
    };

    const handleDelete = (path, type) => {
        const pathsToDelete = type === 'file'
            ? [path]
            : Object.keys(files).filter(p => p.startsWith(path + '/'));

        if (pathsToDelete.length === 0) return;

        const protectedPaths = ['/App.js', '/styles.css', '/index.js', '/package.json', '/src/components/Title.js'];

        if (pathsToDelete.some(p => protectedPaths.includes(p))) {
            setStatusMessage("Cannot delete core project files.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${type === 'folder' ? 'folder ' + path + ' and all its contents' : 'file ' + path}?`)) {
            return;
        }

        const newFiles = { ...files };
        pathsToDelete.forEach(p => delete newFiles[p]);

        if (pathsToDelete.includes(activeFile)) {
            setActiveFile('/App.js');
        }

        setFiles(newFiles);
        setStatusMessage(`${type === 'folder' ? 'Folder' : 'File'} deleted: ${path}`);
    };

    const handleRename = (oldPath, newName) => {
        const newFiles = {};
        let newActiveFile = activeFile;
        const baseDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
        const newPath = baseDir + '/' + newName;

        if (newPath === oldPath || files[newPath]) {
            setStatusMessage('Invalid or existing new path.');
            return;
        }

        Object.keys(files).forEach(path => {
            if (path.startsWith(oldPath)) {
                const remainingPath = path.substring(oldPath.length);
                const newFullPath = newPath + remainingPath;
                newFiles[newFullPath] = files[path];
                if (path === activeFile) {
                    newActiveFile = newFullPath;
                }
            } else {
                newFiles[path] = files[path];
            }
        });

        setFiles(newFiles);
        setActiveFile(newActiveFile);
        setStatusMessage(`${oldPath} renamed to ${newPath}`);
    };

    const refreshProject = () => {
        setFiles(prev => ({ ...prev }));
        setStatusMessage("Preview refreshed manually.");
    };

    const toggleTheme = () => setIsDark(prev => !prev);
    const containerBg = isDark ? 'bg-gray-900' : 'bg-gray-100';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const headerBg = isDark ? 'bg-gray-800' : 'bg-white';
    const statusBg = isDark ? 'bg-indigo-700' : 'bg-indigo-500';

    return (
        <div className={`flex flex-col h-screen overflow-hidden ${containerBg} ${textColor} font-sans`}>
            {statusMessage && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl bg-opacity-90 backdrop-blur-sm ${statusBg} text-white text-sm transition-all duration-300 flex items-center space-x-2`}>
                    <span className="animate-pulse">●</span>
                    <span>{statusMessage}</span>
                </div>
            )}

            <header className={`flex items-center justify-between px-6 py-4 shadow-lg ${headerBg}`}>
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                        CipherStudio
                    </h1>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                        {projectId}
                    </span>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                        <input
                            type="checkbox"
                            id="autosave"
                            checked={autoSaveEnabled}
                            onChange={(e) => {
                                setAutoSaveEnabled(e.target.checked);
                                setStatusMessage(e.target.checked ? "Autosave enabled (5s interval)" : "Autosave disabled");
                            }}
                            className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="autosave" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Autosave
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsConfigModalOpen(true)}
                            title="Configuration (Dependencies)"
                            className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </button>

                        <button
                            onClick={() => setIsLoadModalOpen(true)}
                            title="Load Project"
                            className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                            </svg>
                        </button>

                        <button
                            onClick={saveProject}
                            title="Save Project"
                            className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                            </svg>
                        </button>

                        <button
                            onClick={toggleTheme}
                            title="Toggle Theme"
                            className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-all"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
                    <CustomFileManager
                        files={files}
                        isDark={isDark}
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        handleNewFile={handleNewFile}
                        handleDelete={handleDelete}
                        handleRename={handleRename}
                        refreshProject={refreshProject}
                    />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="md:hidden p-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {activeFile} <span className="float-right">▼</span>
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden absolute top-[8.5rem] left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
                            <CustomFileManager
                                files={files}
                                isDark={isDark}
                                activeFile={activeFile}
                                setActiveFile={(file) => {
                                    setActiveFile(file);
                                    setIsMobileMenuOpen(false);
                                }}
                                handleNewFile={handleNewFile}
                                handleDelete={handleDelete}
                                handleRename={handleRename}
                                refreshProject={refreshProject}
                            />
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                        <SandpackWrapper
                            files={files}
                            activeFile={activeFile}
                            theme={isDark ? 'dark' : 'light'}
                            projectConfig={projectConfig}
                        />
                    </div>
                </div>
            </div>

            <ProjectListModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                onProjectLoad={(id) => {
                    loadProject(id);
                    setIsLoadModalOpen(false);
                }}
                setError={setStatusMessage}
            />
            <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                config={projectConfig}
                onConfigSave={setProjectConfig}
                setError={setStatusMessage}
            />
        </div>
    );
}

export default App;
