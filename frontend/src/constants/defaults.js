export const DEFAULT_PROJECT_ID = 'my-first-cipher-project';
export const DEFAULT_USER_ID = 'vishesh-2408';

export const DEFAULT_FILES = {
    '/App.js': {
        code: `import React from 'react';
import Title from './src/components/Title';
import './styles.css';

export default function App() {
  return (
    <div className="p-8 text-center h-screen">
      <Title text="Live!" />
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        This is a full-stack IDE demo using Node.js/MongoDB persistence.
      </p>
    </div>
  );
}`,
        hidden: false,
    },
    '/styles.css': {
        code: `.title {
  color: #4f46e5;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}`,
        hidden: false,
    },
    '/src/components/Title.js': {
        code: `import React from 'react';

export default function Title({ text }) {
  return <h1 className="title">{text}</h1>;
}`,
        hidden: false,
    },
};

export const DEFAULT_CONFIG = {
    dependenciesJson: JSON.stringify({}, null, 2),
    options: {
        showConsole: true,
        showTabs: false,
        showLineNumbers: true
    }
};