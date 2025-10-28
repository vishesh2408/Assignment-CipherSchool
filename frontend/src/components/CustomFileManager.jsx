import React, { useState, useMemo } from 'react';
import { DEFAULT_USER_ID } from '../constants/defaults';

const FileTreeItem = ({
    name, path, type, depth, isDark,
    activeFile, setActiveFile, handleRename,
    handleDelete, isExpanded, handleFolderToggle
}) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const isFile = type === 'file';
    const indent = depth * 16;
    const isCoreFile = ['/App.js', '/index.js', '/styles.css', '/package.json'].includes(path);
    const isActive = activeFile === path;

    const baseClasses = "flex items-center w-full cursor-pointer rounded-md transition duration-150";
    const bgClasses = isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : isDark
            ? 'text-gray-200 hover:bg-gray-700'
            : 'text-gray-700 hover:bg-gray-200';

    const renderIcon = isFile
        ? <span>&#128196;</span>
        : <span className="mr-1"></span>;

    const handleItemClick = () => {
        if (isFile) {
            setActiveFile(path);
        } else {
            handleFolderToggle(path);
        }
    };

    const startRename = (e) => {
        e.stopPropagation();
        if (isCoreFile) return;
        setIsRenaming(true);
    };

    const finishRename = (e) => {
        e.preventDefault();
        setIsRenaming(false);
        if (newName && newName !== name) {
            handleRename(path, newName);
        }
    };

    return (
        <li className="list-none">
            <div
                className={`${baseClasses} ${bgClasses} group px-2 py-1 text-sm`}
                style={{ paddingLeft: indent + 8 }}
                onClick={handleItemClick}
            >
                <div className={`flex items-center flex-1 ${!isFile ? 'font-semibold' : ''}`} style={{ marginLeft: !isFile ? '-4px' : '0px' }}>
                    {renderIcon}
                    {isRenaming ? (
                        <form onSubmit={finishRename} className="flex-1">
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={finishRename}
                                className="bg-transparent border-b border-indigo-300 w-full text-sm outline-none px-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </form>
                    ) : (
                        <span className="ml-1 truncate">{name}</span>
                    )}
                </div>

                {/* Actions (Hover) */}
                <div className={`flex space-x-1 ml-auto ${isRenaming ? 'hidden' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                    {!isCoreFile && (
                        <button
                            onClick={startRename}
                            title="Rename"
                            className={`p-1 rounded text-xs ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                        >
                            &#9998;
                        </button>
                    )}

                    {!isCoreFile && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(path, type); }}
                            title={isFile ? "Delete File" : "Delete Folder and Contents"}
                            className={`p-1 rounded text-red-500 text-xs ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
};

const CustomFileManager = ({
    files,
    isDark,
    activeFile,
    setActiveFile,
    handleNewFile,
    handleDelete,
    handleRename,
    refreshProject
}) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [currentNewPath, setCurrentNewPath] = useState('');
    const [newCreationType, setNewCreationType] = useState('file');

    const fileTree = useMemo(() => {
        const buildFileTree = (fileMap) => {
            const root = { type: 'folder', name: 'root', path: '/', children: [] };
            const nodes = { '/': root };
            const sortedPaths = Object.keys(fileMap).sort();

            for (const path of sortedPaths) {
                if (path === '/') continue;

                const parts = path.substring(1).split('/');
                let currentPath = '';
                let parentNode = root;

                for (let i = 0; i < parts.length; i++) {
                    const name = parts[i];
                    const isFile = i === parts.length - 1 && fileMap[path];
                    const nodePath = currentPath + '/' + name;

                    if (!nodes[nodePath]) {
                        const newNode = {
                            type: isFile ? 'file' : 'folder',
                            name: name,
                            path: nodePath,
                            children: isFile ? undefined : [],
                            isExpanded: expandedFolders.has(nodePath),
                            ...fileMap[path]
                        };
                        nodes[nodePath] = newNode;
                        parentNode.children.push(newNode);
                    }
                    parentNode = nodes[nodePath];
                    currentPath = nodePath;
                }
            }

            const filterHidden = (node) => {
                if (node.type === 'file' && node.hidden) {
                    return false;
                }
                if (node.children) {
                    node.children = node.children.filter(filterHidden);
                }
                return true;
            };

            root.children = root.children.filter(filterHidden);
            return root.children;
        };
        return buildFileTree(files);
    }, [files, expandedFolders]);

    const handleFolderToggle = (path) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const handleCollapseAll = () => {
        setExpandedFolders(new Set());
    };

    const startNewCreation = (type) => {
        setNewCreationType(type);
        setIsCreating(true);
        setCurrentNewPath(type === 'file' ? 'NewFile.jsx' : 'NewFolder');
    };

    const containerClasses = isDark
        ? 'bg-gray-800 border-r border-gray-700 text-white'
        : 'bg-white border-r border-gray-200 text-gray-900';
    const headerClasses = isDark
        ? 'bg-gray-900 border-b border-gray-700 text-gray-300'
        : 'bg-gray-100 border-b border-gray-200 text-gray-600';

    return (
        <div className={`flex flex-col w-64 ${containerClasses} h-full`}>
            <div className={`flex items-center justify-between p-3 text-xs uppercase font-bold ${headerClasses}`}>
                <span>Explorer</span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => startNewCreation('file')}
                        title="New File"
                        className="text-gray-400 hover:text-white dark:hover:text-white transition"
                    >
                        📄
                    </button>
                    <button
                        onClick={() => startNewCreation('folder')}
                        title="New Folder"
                        className="text-gray-400 hover:text-white dark:hover:text-white transition"
                    >
                        📁
                    </button>
                    <button
                        onClick={refreshProject}
                        title="Refresh Preview"
                        className="text-gray-400 hover:text-white dark:hover:text-white transition"
                    >
                        🔄
                    </button>
                    <button
                        onClick={handleCollapseAll}
                        title="Collapse All Folders"
                        className="text-gray-400 hover:text-white dark:hover:text-white transition"
                    >
                        &#9650;
                    </button>
                </div>
            </div>

            <ul className="flex-grow overflow-y-auto p-2 space-y-1">
                {isCreating && !currentNewPath.includes('/') && (
                    <li className="py-1">
                        <form onSubmit={(e) => { e.preventDefault(); handleNewFile(currentNewPath, newCreationType); setIsCreating(false); }} className="flex items-center text-sm px-2">
                            <span className="mr-1">{newCreationType === 'file' ? '📄' : '📁'}</span>
                            <input
                                autoFocus
                                type="text"
                                value={currentNewPath}
                                onChange={(e) => setCurrentNewPath(e.target.value)}
                                onBlur={() => setIsCreating(false)}
                                className="bg-transparent border-b border-indigo-300 w-full text-sm outline-none px-1 text-gray-900 dark:text-white"
                                placeholder={`New ${newCreationType} name...`}
                            />
                        </form>
                    </li>
                )}

                {fileTree.map(item => (
                    <FileTreeItem
                        key={item.path}
                        {...item}
                        depth={0}
                        isDark={isDark}
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        handleRename={handleRename}
                        handleDelete={handleDelete}
                        isExpanded={expandedFolders.has(item.path)}
                        handleFolderToggle={handleFolderToggle}
                    />
                ))}
            </ul>

            <div className={`p-3 text-xs ${headerClasses}`}>
                <p className="font-mono truncate">User ID: {DEFAULT_USER_ID}</p>
                <p className="font-mono truncate">Backend Status: OK</p>
            </div>
        </div>
    );
};

export default CustomFileManager;