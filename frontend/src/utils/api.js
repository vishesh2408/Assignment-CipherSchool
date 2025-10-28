import { DEFAULT_USER_ID } from '../constants/defaults';

const API_BASE = 'http://localhost:5000/api/projects';

export const fetchApi = async (endpoint, data) => {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, userId: DEFAULT_USER_ID }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || `API call failed with status ${response.status}`);
    }
    return result;
};