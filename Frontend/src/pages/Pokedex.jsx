import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchPokemon, getTypes } from '../api/pokemon';
import { useAuth } from '../context/AuthContext';

const TYPE_COLORS = {
    NORMAL: '#A8A878', FIRE: '#F08030', WATER: '#6890F0', GRASS: '#78C850',
    ELECTRIC: '#F8D030', ICE: '#98D8D8', FIGHTING: '#C03028', POISON: '#A040A0',
    GROUND: '#E0C068', FLYING: '#A890F0', PSYCHIC: '#F85888', BUG: '#A8B820',
    ROCK: '#B8A038', GHOST: '#705898', DRAGON: '#7038F8', DARK: '#705848',
    STEEL: '#B8B8D0', FAIRY: '#EE99AC',
};

const GENERATIONS = [
    { value: '1', label: 'Génération I — Kanto' },
    { value: '2', label: 'Génération II — Johto' },
    { value: '3', label: 'Génération III — Hoenn' },
    { value: '4', label: 'Génération IV — Sinnoh' },
    { value: '5', label: 'Génération V — Unova' },
    { value: '6', label: 'Génération VI — Kalos' },
    { value: '7', label: 'Génération VII — Alola' },
    { value: '8', label: 'Génération VIII — Galar' },
    { value: '9', label: 'Génération IX — Paldea' },
];

const SIZE = 20;

export default function Pokedex() {
    const { logout } = useAuth();
    const [pokemons, setPokemons] = useState([]);
    const [types, setTypes] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGen, setSelectedGen] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef(null);

    useEffect(() => {
        getTypes().then(data => setTypes(data.data || [])).catch(() => {});
    }, []);

    const fetchPokemons = useCallback(async (currentPage, append) => {
        setLoading(true);
        try {
            const data = await searchPokemon({ partialName: search, typeOne: selectedType, generation: selectedGen, page: currentPage, size: SIZE });
            const results = data.results || [];
            setPokemons(prev => append ? [...prev, ...results] : results);
            setTotal(data.count || 0);
            setHasMore(results.length === SIZE);
        } catch {
            if (!append) setPokemons([]);
        } finally {
            setLoading(false);
        }
    }, [search, selectedType, selectedGen]);

    // Reset when filters change
    useEffect(() => {
        setPage(1);
        setPokemons([]);
        setHasMore(true);
        fetchPokemons(1, false);
    }, [search, selectedType, selectedGen]);

    // Load next page when page increases
    useEffect(() => {
        if (page === 1) return;
        fetchPokemons(page, true);
    }, [page]);

    // Intersection observer on sentinel
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading && hasMore) {
                setPage(p => p + 1);
            }
        }, { threshold: 0.1 });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loading, hasMore]);

    function handleSearch(e) {
        setSearch(e.target.value);
    }

    function handleType(e) {
        setSelectedType(e.target.value);
    }

    function handleGen(e) {
        setSelectedGen(e.target.value);
    }

    function extractId(url) {
        return url.split('id=')[1];
    }

    return (
        <div className="pokedex-page">
            <header className="pokedex-header">
                <div className="pokedex-header-inner">
                    <div className="pokedex-title">
                        <img src="/pokeball.svg" alt="" className="header-logo" />
                        <h1>Pokédex</h1>
                    </div>
                    <button className="btn-logout" onClick={logout}>Déconnexion</button>
                </div>
            </header>

            <main className="pokedex-main">
                <div className="filters">
                    <input
                        type="text"
                        placeholder="Rechercher un Pokémon..."
                        value={search}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <select value={selectedType} onChange={handleType} className="type-select">
                        <option value="">Tous les types</option>
                        {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select value={selectedGen} onChange={handleGen} className="type-select">
                        <option value="">Toutes les générations</option>
                        {GENERATIONS.map(gen => (
                            <option key={gen.value} value={gen.value}>{gen.label}</option>
                        ))}
                    </select>
                </div>

                <p className="results-count">{total} Pokémon trouvé{total !== 1 ? 's' : ''}</p>

                <div className="pokemon-grid">
                    {pokemons.map(pkmn => {
                        const id = extractId(pkmn.url);
                        return (
                            <Link to={`/pokemon/${id}`} key={id} className="pokemon-card">
                                {pkmn.image && (
                                    <img src={pkmn.image} alt={pkmn.name} className="card-image" />
                                )}
                                <span className="pokemon-number">#{String(pkmn.nationalDexId).padStart(3, '0')}</span>
                                <span className="pokemon-name">{pkmn.name}</span>
                            </Link>
                        );
                    })}
                    {!loading && pokemons.length === 0 && (
                        <p className="no-results">Aucun Pokémon trouvé.</p>
                    )}
                </div>

                <div ref={sentinelRef} style={{ height: 40 }} />

                {loading && <div className="loading">Chargement...</div>}
            </main>
        </div>
    );
}
