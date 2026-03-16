import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPokemon } from '../api/pokemon';

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
    const max = 255;
    const pct = Math.round((value / max) * 100);
    return (
        <div className="stat-row">
            <span className="stat-label">{STAT_LABELS[name] || name}</span>
            <span className="stat-value">{value}</span>
            <div className="stat-bar-bg">
                <div
                    className="stat-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: pct > 60 ? '#4caf50' : pct > 30 ? '#ff9800' : '#f44336' }}
                />
            </div>
        </div>
    );
}

export default function PokemonDetail() {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        getPokemon(id)
            .then(setPokemon)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading centered">Chargement...</div>;
    if (error) return <div className="error centered">{error}</div>;
    if (!pokemon) return null;

    const mainType = pokemon.types[0]?.type.name.toUpperCase();
    const bgColor = TYPE_COLORS[mainType] || '#888';

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">← Retour au Pokédex</Link>

            <div className="detail-card" style={{ '--type-color': bgColor }}>
                <div className="detail-header" style={{ backgroundColor: bgColor }}>
                    <div className="detail-header-info">
                        <p className="detail-dex-id">#{String(pokemon.nationalDexId).padStart(3, '0')}</p>
                        <h1 className="detail-name">{pokemon.name}</h1>
                        <div className="detail-types">
                            {pokemon.types.map(t => (
                                <span
                                    key={t.type.name}
                                    className="type-badge"
                                    style={{ backgroundColor: TYPE_COLORS[t.type.name.toUpperCase()] || '#888' }}
                                >
                                    {TYPE_FR[t.type.name] || t.type.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    {pokemon.image && (
                        <img src={pokemon.image} alt={pokemon.name} className="detail-image" />
                    )}
                </div>

                <div className="detail-body">
                    <div className="detail-specs">
                        <div className="spec">
                            <span className="spec-label">Taille</span>
                            <span className="spec-value">{(pokemon.height / 10).toFixed(1)} m</span>
                        </div>
                        <div className="spec">
                            <span className="spec-label">Poids</span>
                            <span className="spec-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
                        </div>
                    </div>

                    <section className="detail-section">
                        <h2>Statistiques</h2>
                        {pokemon.stats.map(s => (
                            <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                        ))}
                    </section>

                    <section className="detail-section">
                        <h2>Talents</h2>
                        <div className="tag-list">
                            {pokemon.abilities.map(a => (
                                <span key={a.ability.name} className="tag">{formatName(a.ability.name)}</span>
                            ))}
                        </div>
                    </section>

                    <section className="detail-section">
                        <h2>Attaques ({pokemon.moves.length})</h2>
                        <div className="tag-list">
                            {pokemon.moves.slice(0, 20).map(m => (
                                <span key={m.move.name} className="tag">{formatName(m.move.name)}</span>
                            ))}
                            {pokemon.moves.length > 20 && (
                                <span className="tag tag-more">+{pokemon.moves.length - 20} autres</span>
                            )}
                        </div>
                    </section>

                    {pokemon.cri && (
                        <section className="detail-section">
                            <h2>Cri</h2>
                            <audio controls src={pokemon.cri} className="audio-player" />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
