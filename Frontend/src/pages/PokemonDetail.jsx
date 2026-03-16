import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPokemon } from '../api/pokemon';
import { getTrainer, markPokemon } from '../api/trainer';

const TYPE_COLORS = {
    NORMAL: '#A8A878', FIRE: '#F08030', WATER: '#6890F0', GRASS: '#78C850',
    ELECTRIC: '#F8D030', ICE: '#98D8D8', FIGHTING: '#C03028', POISON: '#A040A0',
    GROUND: '#E0C068', FLYING: '#A890F0', PSYCHIC: '#F85888', BUG: '#A8B820',
    ROCK: '#B8A038', GHOST: '#705898', DRAGON: '#7038F8', DARK: '#705848',
    STEEL: '#B8B8D0', FAIRY: '#EE99AC',
};

const TYPE_FR = {
    normal: 'Normal', fire: 'Feu', water: 'Eau', grass: 'Plante',
    electric: 'Électrik', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
    ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
    rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
    steel: 'Acier', fairy: 'Fée',
};

function formatName(name) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const STAT_LABELS = {
    hp: 'PV', attack: 'Attaque', defense: 'Défense',
    'special-attack': 'Att. Spé.', 'special-defense': 'Déf. Spé.', speed: 'Vitesse',
};

function StatBar({ name, value }) {
    const pct = Math.round((value / 255) * 100);
    return (
        <div className="stat-row">
            <span className="stat-label">{STAT_LABELS[name] || name}</span>
            <span className="stat-value">{value}</span>
            <div className="stat-bar-bg">
                <div className="stat-bar-fill" style={{ width: `${pct}%`, backgroundColor: pct > 60 ? '#4caf50' : pct > 30 ? '#ff9800' : '#f44336' }} />
            </div>
        </div>
    );
}

function randomZone() {
    const size = 10 + Math.random() * 25; // largeur entre 10% et 35%
    const min = 5 + Math.random() * (90 - size); // position aléatoire dans la barre
    return { min, max: min + size };
}

function CaptureGame({ onResult }) {
    const [result, setResult] = useState(null);
    const catchZone = useRef(randomZone());
    const indicatorRef = useRef(null);
    const animRef = useRef(null);
    const posRef = useRef(Math.random() * 100);
    const velRef = useRef((Math.random() > 0.5 ? 1 : -1) * (0.07 + Math.random() * 0.07));
    const lastTsRef = useRef(null);
    const nextChangeRef = useRef(0);

    useEffect(() => {
        function animate(ts) {
            const delta = lastTsRef.current ? Math.min(ts - lastTsRef.current, 50) : 16;
            lastTsRef.current = ts;

            // Déplacement
            posRef.current += velRef.current * delta;

            // Rebond sur les bords
            if (posRef.current <= 0) {
                posRef.current = 0;
                velRef.current = Math.abs(velRef.current);
            } else if (posRef.current >= 100) {
                posRef.current = 100;
                velRef.current = -Math.abs(velRef.current);
            }

            // Changement aléatoire de vitesse/direction
            if (ts >= nextChangeRef.current) {
                const speed = 0.07 + Math.random() * 0.09;
                velRef.current = (Math.random() > 0.5 ? 1 : -1) * speed;
                nextChangeRef.current = ts + 500 + Math.random() * 1000;
            }

            // Mise à jour DOM directe (évite les re-renders à 60fps)
            if (indicatorRef.current) {
                indicatorRef.current.style.left = `calc(${posRef.current}% - 10px)`;
            }

            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    function stop() {
        cancelAnimationFrame(animRef.current);
        const { min, max } = catchZone.current;
        const success = posRef.current >= min && posRef.current <= max;
        setResult(success ? 'caught' : 'seen');
        setTimeout(() => onResult(success), 1200);
    }

    if (result) {
        return (
            <div className="game-result">
                {result === 'caught'
                    ? <p className="result-caught">✓ Pokémon capturé !</p>
                    : <p className="result-seen">Le Pokémon s'est enfui... mais tu l'as vu !</p>
                }
            </div>
        );
    }

    return (
        <div className="capture-game">
            <p className="game-hint">Arrêtez la Pokéball dans la zone verte !</p>
            <div className="catch-bar">
                <div className="catch-zone" style={{ left: `${catchZone.current.min}%`, width: `${catchZone.current.max - catchZone.current.min}%` }} />
                <div ref={indicatorRef} className="catch-indicator" />
            </div>
            <button className="btn-throw" onClick={stop}>⚪ Stop !</button>
        </div>
    );
}

export default function PokemonDetail() {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [trainer, setTrainer] = useState(undefined); // undefined = loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showGame, setShowGame] = useState(false);

    useEffect(() => {
        setLoading(true);
        setShowGame(false);
        Promise.all([getPokemon(id), getTrainer()])
            .then(([pkmn, trainerData]) => {
                setPokemon(pkmn);
                setTrainer(trainerData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleGameResult(captured) {
        try {
            const updated = await markPokemon(pokemon.id, captured);
            setTrainer(updated);
        } catch {}
        setShowGame(false);
    }

    if (loading) return <div className="loading centered">Chargement...</div>;
    if (error) return <div className="error centered">{error}</div>;
    if (!pokemon) return null;

    const mainType = pokemon.types[0]?.type.name.toUpperCase();
    const bgColor = TYPE_COLORS[mainType] || '#888';

    const toIdSet = (arr) => new Set((arr || []).map(p => p?._id?.toString() || p?.toString()));
    const isCaught = trainer ? toIdSet(trainer.pkmnCatch).has(pokemon.id?.toString()) : false;
    const isSeen = trainer ? toIdSet(trainer.pkmnSeen).has(pokemon.id?.toString()) : false;

    // Si pas de trainer, tout afficher normalement
    const status = !trainer ? 'caught' : isCaught ? 'caught' : isSeen ? 'seen' : 'unseen';

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">← Retour au Pokédex</Link>

            <div className="detail-card" style={{ '--type-color': bgColor }}>
                <div className="detail-header" style={{ backgroundColor: status === 'unseen' ? '#333' : bgColor }}>
                    <div className="detail-header-info">
                        <p className="detail-dex-id">
                            {status !== 'unseen' ? `#${String(pokemon.nationalDexId).padStart(3, '0')}` : '???'}
                        </p>
                        <h1 className="detail-name">
                            {status !== 'unseen' ? pokemon.name : '???'}
                        </h1>
                        {status !== 'unseen' && (
                            <div className="detail-types">
                                {pokemon.types.map(t => (
                                    <span key={t.type.name} className="type-badge" style={{ backgroundColor: TYPE_COLORS[t.type.name.toUpperCase()] || '#888' }}>
                                        {TYPE_FR[t.type.name] || t.type.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className={`detail-image ${status === 'unseen' ? 'img-silhouette' : ''}`}
                    />
                </div>

                <div className="detail-body">
                    {/* ÉTAT : NON VU */}
                    {status === 'unseen' && (
                        <div className="encounter-section">
                            <p className="encounter-text">⚠️ Un Pokémon sauvage apparaît !</p>
                            {showGame
                                ? <CaptureGame onResult={handleGameResult} />
                                : <button className="btn-throw" onClick={() => setShowGame(true)}>Lancer la Pokéball !</button>
                            }
                        </div>
                    )}

                    {/* ÉTAT : VU */}
                    {status === 'seen' && (
                        <>
                            {pokemon.description && <p className="detail-description">{pokemon.description}</p>}
                            <div className="encounter-section">
                                <p className="encounter-text">Tu as déjà vu ce Pokémon — essaie de le capturer !</p>
                                {showGame
                                    ? <CaptureGame onResult={handleGameResult} />
                                    : <button className="btn-throw" onClick={() => setShowGame(true)}>Lancer la Pokéball !</button>
                                }
                            </div>
                        </>
                    )}

                    {/* ÉTAT : CAPTURÉ */}
                    {status === 'caught' && (
                        <>
                            {pokemon.description && <p className="detail-description">{pokemon.description}</p>}

                            <div className="detail-specs">
                                <div className="spec"><span className="spec-label">Taille</span><span className="spec-value">{(pokemon.height / 10).toFixed(1)} m</span></div>
                                <div className="spec"><span className="spec-label">Poids</span><span className="spec-value">{(pokemon.weight / 10).toFixed(1)} kg</span></div>
                            </div>

                            <section className="detail-section">
                                <h2>Statistiques</h2>
                                {pokemon.stats.map(s => <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />)}
                            </section>

                            <section className="detail-section">
                                <h2>Talents</h2>
                                <div className="tag-list">
                                    {pokemon.abilities.map(a => <span key={a.ability.name} className="tag">{formatName(a.ability.name)}</span>)}
                                </div>
                            </section>

                            <section className="detail-section">
                                <h2>Attaques ({pokemon.moves.length})</h2>
                                <div className="tag-list">
                                    {pokemon.moves.slice(0, 20).map(m => <span key={m.move.name} className="tag">{formatName(m.move.name)}</span>)}
                                    {pokemon.moves.length > 20 && <span className="tag tag-more">+{pokemon.moves.length - 20} autres</span>}
                                </div>
                            </section>

                            {pokemon.cri && (
                                <section className="detail-section">
                                    <h2>Cri</h2>
                                    <audio controls src={pokemon.cri} className="audio-player" />
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
