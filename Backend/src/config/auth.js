// Durée de vie d'un jeton de connexion. Passé ce délai, il faut se reconnecter,
// ce qui remet aussi à jour la date de dernière connexion du compte.
const TOKEN_LIFETIME = "7d";

module.exports = { TOKEN_LIFETIME };
