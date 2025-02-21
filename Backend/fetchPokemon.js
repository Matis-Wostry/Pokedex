const API_URL = "http://localhost:5000/api/pkmn";
const TOKEN = "eyJhbGciOiJIUzI1..."; // Remplacez par votre token !

function fetchPokemonWithDelay(i) {
    setTimeout(() => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${i+1}`)
            .then(response => response.json())
            .then(data => {
                const types = data.types.map(type => type.type.name);
                const imagePath = data.sprites.other["official-artwork"].front_default;
                
                // Récupération des statistiques
                const hp = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
                const attack = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
                const defense = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
                const specialAttack = data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
                const specialDefense = data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
                const speed = data.stats.find(stat => stat.stat.name === 'speed').base_stat;
                
                // Nouvelles informations
                const weight = data.weight;
                const height = data.height;
                const moves = data.moves.map(move => move.move.name);
                const abilities = data.abilities.map(ability => ability.ability.name);
                const cri = data.cries?.latest || "";

                fetch(`https://pokeapi.co/api/v2/pokemon-species/${i+1}`)
                    .then(response => response.json())
                    .then(data2 => {
                        const descriptionEntry = data2.flavor_text_entries.find(entry => entry.language.name === 'fr');
                        const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/\n/g, ' ') : "Description non disponible";
                        const nameEntry = data2.names.find(entry => entry.language.name === 'fr');
                        const name = nameEntry ? nameEntry.name : data.name;
                        
                        // 🔥 **Ajout du National Dex ID**
                        const nationalDexEntry = data2.pokedex_numbers.find(entry => entry.pokedex.name === "national");
                        const nationalDexId = nationalDexEntry ? nationalDexEntry.entry_number : null;

                        if (!nationalDexId) {
                            console.warn(`⚠️ Pas de National Dex ID pour ${name}`);
                        }

                        // Détection des régions
                        const game_indices = data.game_indices;
                        const regions = {
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
                        
                        const gameRegions = game_indices.map(game => regions[game.version.name] || 'Unknown');
                        const uniqueRegions = [...new Set(gameRegions)];
                        const regionWithIndex = uniqueRegions.map(region => {
                            const gameIndex = game_indices.find(game => regions[game.version.name] === region)?.game_index || 0;
                            return { regionName: region, regionPokedexNumber: gameIndex };
                        });

                        const myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        myHeaders.append("Authorization", `Bearer ${TOKEN}`);
                        
                        const raw = JSON.stringify({
                            "name": name,
                            "nationalDexId": nationalDexId,
                            "types": types,
                            "regions": regionWithIndex,
                            "hp": hp,
                            "attack": attack,
                            "defense": defense,
                            "specialAttack": specialAttack,
                            "specialDefense": specialDefense,
                            "speed": speed,
                            "description": description,
                            "image": imagePath,
                            "weight": weight,
                            "height": height,
                            "moves": moves,
                            "abilities": abilities,
                            "cri": cri
                        });
                        
                        const requestOptions = {
                            method: "POST",
                            headers: myHeaders,
                            body: raw,
                            redirect: "follow"
                        };
                        
                        fetch(API_URL, requestOptions)
                            .then(response => response.text())
                            .then(result => console.log(`✅ ${name} ajouté avec NationalDexID: ${nationalDexId}`))
                            .catch(error => console.error(`❌ Erreur pour ${name} :`, error));
                    })
                    .catch(error => console.error("❌ Erreur lors de la récupération des espèces :", error));
            })
            .catch(error => console.error("❌ Erreur lors de la récupération du Pokémon :", error));
    }, i * 200);
}

// Lancer l'insertion pour les 1025 Pokémon
for (let i = 0; i < 1025; i++) {
    fetchPokemonWithDelay(i);
}
