/**
 * Met à jour les noms français des talents et attaques pour tous les Pokémon déjà en base.
 * Usage : node updateFrenchNames.js
 */
const API_URL = "http://localhost:3000/api/pkmn";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThkZTNkNzVmOWQ4YjNiYzRlOWYxODUiLCJ1c2VybmFtZSI6Ik1hdGlzIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczNjU4MjMwfQ.Smtpg3ArhkPR40wt7pHRU6S-dCCbohi4FVdntRsO_vs"; // Remplacez par votre token !

const abilityCache = {};
const moveCache = {};

async function getFrenchName(url, cache) {
    if (cache[url]) return cache[url];
    try {
        const res = await fetch(url);
        const data = await res.json();
        const frEntry = data.names?.find(n => n.language.name === 'fr');
        const name = frEntry ? frEntry.name : data.name;
        cache[url] = name;
        return name;
    } catch {
        return null;
    }
}

async function getAllPokemons() {
    const res = await fetch(`${API_URL}/search?size=1100`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    return data.results || [];
}

async function updatePokemon(id, abilities, moves) {
    const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ id, abilities, moves })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur mise à jour');
    }
}

async function run() {
    console.log("🔄 Récupération des Pokémon en base...");
    const pokemons = await getAllPokemons();
    console.log(`📋 ${pokemons.length} Pokémon à mettre à jour`);

    for (const pkmn of pokemons) {
        const id = pkmn.url.split('id=')[1];
        const nationalId = pkmn.nationalDexId;

        try {
            const [pkmnRes] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${nationalId}`)
            ]);
            const data = await pkmnRes.json();

            const abilities = await Promise.all(
                data.abilities.map(a => getFrenchName(a.ability.url, abilityCache))
            );
            const moves = await Promise.all(
                data.moves.map(m => getFrenchName(m.move.url, moveCache))
            );

            await updatePokemon(id, abilities.filter(Boolean), moves.filter(Boolean));
            console.log(`✅ ${pkmn.name} mis à jour`);
        } catch (err) {
            console.error(`❌ Erreur pour ${pkmn.name} :`, err.message);
        }

        await new Promise(r => setTimeout(r, 400));
    }

    console.log("✅ Mise à jour terminée !");
}

run();
