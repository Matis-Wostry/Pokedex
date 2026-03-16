import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { saveToken } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setLoading(true);
        try {
            await register(username, password);
            const data = await login(username, password);
            saveToken(data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/pokeball.svg" alt="Pokédex" />
                </div>
                <h1>Pokédex</h1>
                <h2>Créer un compte</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Choisissez un identifiant"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Choisissez un mot de passe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm">Confirmer le mot de passe</label>
                        <input
                            id="confirm"
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="Répétez le mot de passe"
                            required
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>
                <p className="auth-link">
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}
