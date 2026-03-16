const API_URL = "https://pokedex.matis-wostry.com/api/pkmn/create";
const TOKEN = "";
// Cache pour éviter de refetcher les mêmes talents/attaques
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

const REGIONS = {
    'red': 'Kanto', 'blue': 'Kanto', 'yellow': 'Kanto',
    'gold': 'Johto', 'silver': 'Johto', 'crystal': 'Johto',
    'ruby': 'Hoenn', 'sapphire': 'Hoenn', 'emerald': 'Hoenn',
    'firered': 'Kanto', 'leafgreen': 'Kanto',
    'diamond': 'Sinnoh', 'pearl': 'Sinnoh', 'platinum': 'Sinnoh',
    'heartgold': 'Johto', 'soulsilver': 'Johto',
    'black': 'Unova', 'white': 'Unova', 'black-2': 'Unova', 'white-2': 'Unova',
    'x': 'Kalos', 'y': 'Kalos',
    'omega-ruby': 'Hoenn', 'alpha-sapphire': 'Hoenn',
    'sun': 'Alola', 'moon': 'Alola', 'ultra-sun': 'Alola', 'ultra-moon': 'Alola',
    "let's-go-pikachu": 'Kanto', "let's-go-eevee": 'Kanto',
    'sword': 'Galar', 'shield': 'Galar',
    'brilliant-diamond': 'Sinnoh', 'shining-pearl': 'Sinnoh',
    'legends-arceus': 'Hisui', 'scarlet': 'Paldea', 'violet': 'Paldea'
};

async function fetchPokemon(index) {
    const id = index + 1;
    const [pkmnRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    ]);
    const data = await pkmnRes.json();
    const data2 = await speciesRes.json();

    const types = data.types.map(t => t.type.name);
    const imagePath = data.sprites.other["official-artwork"].front_default;
    const hp = data.stats.find(s => s.stat.name === 'hp').base_stat;
    const attack = data.stats.find(s => s.stat.name === 'attack').base_stat;
    const defense = data.stats.find(s => s.stat.name === 'defense').base_stat;
    const specialAttack = data.stats.find(s => s.stat.name === 'special-attack').base_stat;
    const specialDefense = data.stats.find(s => s.stat.name === 'special-defense').base_stat;
    const speed = data.stats.find(s => s.stat.name === 'speed').base_stat;
    const weight = data.weight;
    const height = data.height;
    const cri = data.cries?.latest || "";

    // Noms français des talents
    const abilities = await Promise.all(
        data.abilities.map(a => getFrenchName(a.ability.url, abilityCache))
    );

    // Noms français des attaques
    const moves = await Promise.all(
        data.moves.map(m => getFrenchName(m.move.url, moveCache))
    );

    const descriptionEntry = data2.flavor_text_entries.find(e => e.language.name === 'fr');
    const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/\n/g, ' ') : "Description non disponible";
    const nameEntry = data2.names.find(e => e.language.name === 'fr');
    const name = nameEntry ? nameEntry.name : data.name;

    const nationalDexEntry = data2.pokedex_numbers.find(e => e.pokedex.name === "national");
    const nationalDexId = nationalDexEntry ? nationalDexEntry.entry_number : null;

    if (!nationalDexId) console.warn(`⚠️ Pas de National Dex ID pour ${name}`);

    const gameRegions = data.game_indices.map(g => REGIONS[g.version.name] || 'Unknown');
    const uniqueRegions = [...new Set(gameRegions)];
    const regionWithIndex = uniqueRegions.map(region => {
        const gameIndex = data.game_indices.find(g => REGIONS[g.version.name] === region)?.game_index || 0;
        return { regionName: region, regionPokedexNumber: gameIndex };
    });

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            name, nationalDexId, types, regions: regionWithIndex,
            hp, attack, defense, specialAttack, specialDefense, speed,
            description, image: imagePath, weight, height,
            moves: moves.filter(Boolean),
            abilities: abilities.filter(Boolean),
            cri
        })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erreur insertion');
    console.log(`✅ ${name} ajouté (#${nationalDexId})`);
}

async function run() {
    for (let i = 0; i < 1025; i++) {
        try {
            await fetchPokemon(i);
        } catch (err) {
            console.error(`❌ Erreur pour #${i + 1} :`, err.message);
        }
        // Délai pour ne pas surcharger PokeAPI
        await new Promise(r => setTimeout(r, 300));
    }
    console.log("✅ Import terminé !");
}

run();
