const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function register(username, password) {
    const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
    return data;
}

export async function login(username, password) {
    const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion');
    return data;
}
