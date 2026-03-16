import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchPokemon, getTypes } from '../api/pokemon';
import { getTrainer } from '../api/trainer';
import { useAuth } from '../context/AuthContext';

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

function toIdSet(arr) {
    return new Set((arr || []).map(p => p?._id?.toString() || p?.toString()));
}

export default function Pokedex() {
    const { logout } = useAuth();
    const [pokemons, setPokemons] = useState([]);
    const [types, setTypes] = useState([]);
    const [trainer, setTrainer] = useState(null);
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
        getTrainer().then(setTrainer).catch(() => {});
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

    useEffect(() => {
        setPage(1);
        setPokemons([]);
        setHasMore(true);
        fetchPokemons(1, false);
    }, [search, selectedType, selectedGen]);

    useEffect(() => {
        if (page === 1) return;
        fetchPokemons(page, true);
    }, [page]);

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

    function extractId(url) { return url.split('id=')[1]; }

    const seenSet = toIdSet(trainer?.pkmnSeen);
    const caughtSet = toIdSet(trainer?.pkmnCatch);

    return (
        <div className="pokedex-page">
            <header className="pokedex-header">
                <div className="pokedex-header-inner">
                    <div className="pokedex-title">
                        <img src="/pokeball.svg" alt="" className="header-logo" />
                        <h1>Pokédex</h1>
                    </div>
                    <div className="header-actions">
                        <Link to="/profile" className="btn-secondary">👤 Profil</Link>
                        <button className="btn-logout" onClick={logout}>Déconnexion</button>
                    </div>
                </div>
            </header>

            <main className="pokedex-main">
                {!trainer && (
                    <p className="trainer-notice">
                        <Link to="/profile">Crée ton profil dresseur</Link> pour débloquer le mode capture !
                    </p>
                )}

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Rechercher un Pokémon..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="type-select">
                        <option value="">Tous les types</option>
                        {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select value={selectedGen} onChange={e => setSelectedGen(e.target.value)} className="type-select">
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
                        const isCaught = caughtSet.has(id);
                        const isSeen = seenSet.has(id);
                        const status = !trainer ? 'caught' : isCaught ? 'caught' : isSeen ? 'seen' : 'unseen';

                        return (
                            <Link to={`/pokemon/${id}`} key={id} className={`pokemon-card card-${status}`}>
                                {pkmn.image && (
                                    <img
                                        src={pkmn.image}
                                        alt={isSeen || isCaught ? pkmn.name : '?'}
                                        className={`card-image ${status === 'unseen' ? 'img-silhouette' : ''}`}
                                    />
                                )}
                                <span className="pokemon-number">
                                    {status !== 'unseen' ? `#${String(pkmn.nationalDexId).padStart(3, '0')}` : '???'}
                                </span>
                                <span className="pokemon-name">
                                    {status !== 'unseen' ? pkmn.name : '???'}
                                </span>
                                {isCaught && <span className="card-badge caught-badge">✓</span>}
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
