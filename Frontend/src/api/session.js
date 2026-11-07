// fetch() pour les routes qui exigent d'être connecté.
// Si l'API refuse le jeton (401 : jeton expiré, ou clé secrète du serveur
// changée), on le jette et on renvoie vers la connexion. Sans ça, l'ancien
// jeton restait dans le navigateur et le Pokédex restait vide.
export async function authFetch(url, options) {
    const res = await fetch(url, options);
    if (res.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.assign('/login');
    }
    return res;
}
