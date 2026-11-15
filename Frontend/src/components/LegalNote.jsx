// Statut du projet et crédit des marques, en bas de chaque écran.
// Le lien dit aux pages légales, communes à tous les sites, de proposer le retour au Pokédex.
export default function LegalNote() {
    return (
        <p className="legal-note">
            Projet de démonstration non officiel, sans but commercial. Pokémon et les noms de
            Pokémon sont des marques de Nintendo, Creatures Inc. et GAME FREAK inc.{' '}
            <a
                href="https://matis-wostry.com/mentions-legales.html?from=pokedex"
                target="_blank"
                rel="noopener"
            >
                Mentions légales
            </a>
        </p>
    );
}
