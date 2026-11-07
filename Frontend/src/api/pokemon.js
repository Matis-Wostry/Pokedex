import { authFetch } from './session';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export async function searchPokemon({ partialName = '', typeOne = '', generation = '', page = 1, size = 20 } = {}) {
    const params = new URLSearchParams({ page, size });
    if (partialName) params.append('partialName', partialName);
    if (typeOne) params.append('typeOne', typeOne);
    if (generation) params.append('generation', generation);

    const res = await authFetch(`${API}/api/pkmn/search?${params}`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la recherche');
    return data;
}

export async function getPokemon(id) {
    const res = await authFetch(`${API}/api/pkmn?id=${id}`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Pokémon non trouvé');
    return data;
}

export async function getTypes() {
    const res = await fetch(`${API}/api/pkmn/types`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
}
