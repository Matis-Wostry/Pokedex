const User = require("../models/User");
const Trainer = require("../models/Trainers");

// Un compte resté ce nombre de jours sans connexion est supprimé. La règle est
// annoncée sur l'écran d'inscription et dans la politique de confidentialité :
// changer ce nombre ici oblige à changer ces deux textes.
const INACTIVITY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Supprime les comptes inactifs et leur profil de dresseur.
// Renvoie le nombre de comptes supprimés.
async function purgeInactiveAccounts(now = new Date()) {
    // Les comptes créés avant cette règle n'ont pas de date de dernière
    // connexion. On la fixe à aujourd'hui : ils ont 30 jours pleins devant eux,
    // au lieu d'être supprimés sans avoir été prévenus.
    await User.updateMany({ lastLoginAt: { $exists: false } }, { $set: { lastLoginAt: now } });

    const limit = new Date(now.getTime() - INACTIVITY_DAYS * DAY_MS);
    // Les comptes ADMIN sont ceux de l'exploitant du site : jamais purgés.
    const inactive = await User.find({ role: { $ne: "ADMIN" }, lastLoginAt: { $lt: limit } }).select("username");

    let deleted = 0;
    for (const { _id, username } of inactive) {
        // La condition est revérifiée à la suppression : un compte qui vient
        // de se reconnecter entre-temps n'est pas supprimé.
        const user = await User.findOneAndDelete({ _id, lastLoginAt: { $lt: limit } });
        if (!user) continue;
        await Trainer.deleteOne({ username });
        deleted += 1;
    }
    return deleted;
}

// Lance la purge tout de suite, puis une fois par jour. Renvoie le minuteur.
function startAccountPurge({ intervalMs = DAY_MS } = {}) {
    const run = async () => {
        try {
            const deleted = await purgeInactiveAccounts();
            if (deleted > 0) console.log(`🧹 ${deleted} compte(s) inactif(s) supprimé(s)`);
        } catch (err) {
            console.error("❌ Purge des comptes inactifs :", err.message);
        }
    };
    run();
    return setInterval(run, intervalMs);
}

module.exports = { purgeInactiveAccounts, startAccountPurge };
