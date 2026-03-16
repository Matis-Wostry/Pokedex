const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function getTrainer() {
    const res = await fetch(`${API}/api/trainer`, { headers: authHeaders() });
    if (res.status === 404) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
}

export async function createTrainer(trainerName) {
    const res = await fetch(`${API}/api/trainer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ trainerName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data.trainer;
}

export async function updateTrainer(updates) {
    const res = await fetch(`${API}/api/trainer`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data.trainer;
}

export async function markPokemon(pkmnID, isCaptured) {
    const res = await fetch(`${API}/api/trainer/mark`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pkmnID, isCaptured }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data.trainer;
}
