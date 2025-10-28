import React, { useState, useEffect } from 'react';

const ConfigModal = ({ isOpen, onClose, config, onConfigSave, setError }) => {
    const [dependencies, setDependencies] = useState(config.dependenciesJson);
    const [error, setErrorState] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setDependencies(config.dependenciesJson);
            setErrorState(null);
        }
    }, [isOpen, config]);

    const handleSave = () => {
        try {
            JSON.parse(dependencies);
            onConfigSave({
                dependenciesJson: dependencies,
                options: config.options,
            });
            onClose();
            setError("Configuration saved successfully.");
        } catch {
            setErrorState("Invalid JSON format for Dependencies.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Configuration</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition text-2xl">
                        &times;
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            NPM Dependencies (JSON):
                        </label>
                        <textarea
                            className="w-full p-2 border dark:border-gray-600 rounded-lg font-mono text-sm h-32 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            value={dependencies}
                            onChange={(e) => setDependencies(e.target.value)}
                            spellCheck="false"
                            placeholder='{"react-markdown": "latest"}'
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Key is package name, value is version (e.g., `"axios": "latest"`).
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 p-2 bg-red-100 dark:bg-red-900 rounded-lg">{error}</p>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-600 flex justify-end bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
                    >
                        Save Configuration & Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigModal;

