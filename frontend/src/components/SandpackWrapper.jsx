import React, { useMemo, useEffect, useState } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark, githubLight } from '@codesandbox/sandpack-themes';

const SandpackWrapper = React.memo(({ files, activeFile, theme, projectConfig }) => {
    const [hasWorkerError, setHasWorkerError] = useState(false);
    const sandpackKey = useMemo(() => JSON.stringify({ files, activeFile, projectConfig }), [files, activeFile, projectConfig]);

    const sandpackFiles = useMemo(() => {
        const normalized = {};
        Object.keys(files).forEach(path => {
            normalized[path] = {
                code: files[path].code,
                hidden: files[path].hidden,
                readOnly: files[path].readOnly,
            };
        });

        normalized['/index.js'] = {
            code: `import { createRoot } from 'react-dom/client';
import App from './App';
const root = createRoot(document.getElementById('root'));
root.render(<App />);`,
            hidden: true,
        };

        return normalized;
    }, [files]);

    const customSetup = useMemo(() => {
        let dependencies = {};
        try {
            dependencies = JSON.parse(projectConfig.dependenciesJson || '{}');
        } catch (e) {
            console.error("Failed to parse dependencies JSON:", e);
            dependencies = {};
        }

        
        if (!dependencies || Object.keys(dependencies).length === 0) {
            return undefined;
        }

        return {
            dependencies: { ...dependencies },
            entry: '/App.js',
            mainFile: '/App.js',
        };
    }, [projectConfig.dependenciesJson]);

    const options = useMemo(() => ({
        ...projectConfig.options,
        activeFile: activeFile,
        editorWidthPercentage: 55,
    }), [projectConfig.options, activeFile]);

    const selectedTheme = theme === 'dark' ? atomDark : githubLight;

    useEffect(() => {
        const handler = (ev) => {
            try {
                const msg = ev && (ev.message || '');
                const filename = ev && (ev.filename || '');
               
                if (msg.includes('importScripts') || filename.includes('codesandbox.io') || filename.includes('browserfs.min.js')) {
                    setHasWorkerError(true);
                }
            } catch {
                // ignore
            }
        };

        window.addEventListener('error', handler);
        return () => window.removeEventListener('error', handler);
    }, []);

    if (hasWorkerError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="max-w-lg p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg text-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Preview blocked by browser/extension</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">An external Sandpack worker script failed to load (commonly blocked by ad‑blockers or tracking prevention). This prevents the preview from running.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Quick fixes: disable ad/tracker extensions for <span className="font-mono">localhost</span>, open the page in an Incognito window with extensions disabled, or allowlist <span className="font-mono">codesandbox.io</span> / the blocked CDN.</p>
                </div>
            </div>
        );
    }

    return (
        <Sandpack
            key={sandpackKey}
            template="react"
            theme={selectedTheme}
            files={sandpackFiles}
            customSetup={customSetup}
            options={options}
            className="w-full h-full"
            style={{ height: '100%' }}
        />
    );
});

export default SandpackWrapper;