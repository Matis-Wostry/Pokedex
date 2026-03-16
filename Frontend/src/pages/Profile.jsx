import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrainer, createTrainer, updateTrainer } from '../api/trainer';

const TOTAL_POKEMON = 1025;

export default function Profile() {
    const { logout } = useAuth();
    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [trainerName, setTrainerName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getTrainer()
            .then(data => {
                setTrainer(data);
                if (data) setTrainerName(data.trainerName);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    async function handleCreate(e) {
        e.preventDefault();
        if (!trainerName.trim()) return;
        setSaving(true);
        try {
            const t = await createTrainer(trainerName.trim());
            setTrainer(t);
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        if (!trainerName.trim()) return;
        setSaving(true);
        try {
            const t = await updateTrainer({ trainerName: trainerName.trim() });
            setTrainer(t);
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const seen = trainer?.pkmnSeen?.length ?? 0;
    const caught = trainer?.pkmnCatch?.length ?? 0;
    const seenPct = Math.round((seen / TOTAL_POKEMON) * 100);
    const caughtPct = Math.round((caught / TOTAL_POKEMON) * 100);

    return (
        <div className="pokedex-page">
            <header className="pokedex-header">
                <div className="pokedex-header-inner">
                    <div className="pokedex-title">
                        <img src="/pokeball.svg" alt="" className="header-logo" />
                        <h1>Profil Dresseur</h1>
                    </div>
                    <div className="header-actions">
                        <Link to="/" className="btn-secondary">← Pokédex</Link>
                        <button className="btn-logout" onClick={logout}>Déconnexion</button>
                    </div>
                </div>
            </header>

            <main className="profile-main">
                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : !trainer ? (
                    <div className="profile-card">
                        <h2>Créer ton profil dresseur</h2>
                        <form onSubmit={handleCreate} className="profile-form">
                            <input
                                type="text"
                                placeholder="Nom du dresseur"
                                value={trainerName}
                                onChange={e => setTrainerName(e.target.value)}
                                className="search-input"
                                maxLength={24}
                            />
                            {error && <p className="form-error">{error}</p>}
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Création...' : 'Créer'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <img src={trainer.imgUrl || '/pokeball.svg'} alt="avatar" />
                        </div>

                        {editing ? (
                            <form onSubmit={handleUpdate} className="profile-form">
                                <input
                                    type="text"
                                    value={trainerName}
                                    onChange={e => setTrainerName(e.target.value)}
                                    className="search-input"
                                    maxLength={24}
                                    autoFocus
                                />
                                {error && <p className="form-error">{error}</p>}
                                <div className="profile-form-actions">
                                    <button type="submit" className="btn-primary" disabled={saving}>
                                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                    <button type="button" className="btn-secondary" onClick={() => { setEditing(false); setTrainerName(trainer.trainerName); }}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-name-row">
                                <h2 className="profile-name">{trainer.trainerName}</h2>
                                <button className="btn-edit" onClick={() => setEditing(true)}>✏️</button>
                            </div>
                        )}

                        <p className="profile-date">
                            Dresseur depuis le {new Date(trainer.creationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        <div className="profile-stats">
                            <div className="stat-progress">
                                <div className="stat-progress-header">
                                    <span>Pokémon vus</span>
                                    <span>{seen} / {TOTAL_POKEMON}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill progress-seen" style={{ width: `${seenPct}%` }} />
                                </div>
                            </div>

                            <div className="stat-progress">
                                <div className="stat-progress-header">
                                    <span>Pokémon capturés</span>
                                    <span>{caught} / {TOTAL_POKEMON}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill progress-caught" style={{ width: `${caughtPct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
