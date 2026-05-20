const BASE = '/api';

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
    // for form submissions with nested body keys (legacy format)
    postForm: (path, body) => request(path, {
        method: 'POST',
        headers: {},
        body: new URLSearchParams(flattenParams(body)),
    }),
    putForm: (path, body) => request(path, {
        method: 'PUT',
        headers: {},
        body: new URLSearchParams(flattenParams(body)),
    }),
};

function flattenParams(obj, prefix = '') {
    const params = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(params, flattenParams(value, fullKey));
        } else {
            params[fullKey] = value ?? '';
        }
    }
    return params;
}
