function fetchPokemonWithDelay(i) {
    setTimeout(() => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${i+1}`)
            .then(response => response.json())
            .then(data => {
                const types = data.types.map(type => type.type.name);
                const imagePath = data.sprites.front_default;
                
                // Récupération des statistiques
                const hp = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
                const attack = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
                const defense = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
                const specialAttack = data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
                const specialDefense = data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
                const speed = data.stats.find(stat => stat.stat.name === 'speed').base_stat;
                
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${i+1}`)
                    .then(response => response.json())
                    .then(data2 => {
                        const descriptionEntry = data2.flavor_text_entries.find(entry => entry.language.name === 'fr');
                        const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/\n/g, ' ') : "Description non disponible";
                        const nameEntry = data2.names.find(entry => entry.language.name === 'fr');
                        const name = nameEntry ? nameEntry.name : data.name;
                        
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
                        myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2FkYTRkNzE2OWZmMjJhYmM4ZGFlYTUiLCJ1c2VybmFtZSI6IkFzaCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczOTUyODM0OH0.EmQHtqwnQbGGhyQdRuwsBYwLs0p6_7_0q5TfWQwAOpc");
                        
                        const raw = JSON.stringify({
                            "name": name,
                            "types": types,
                            "regions": regionWithIndex,
                            "hp": hp,
                            "attack": attack,
                            "defense": defense,
                            "specialAttack": specialAttack,
                            "specialDefense": specialDefense,
                            "speed": speed,
                            "description": description,
                            "image": imagePath
                        });
                        
                        const requestOptions = {
                            method: "POST",
                            headers: myHeaders,
                            body: raw,
                            redirect: "follow"
                        };
                        
                        fetch("http://localhost:3000/api/pkmn/create", requestOptions)
                            .then(response => response.text())
                            .then(result => console.log(result))
                            .catch(error => console.error(error));
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));
    }, i * 200);
}

for (let i = 0; i < 1025; i++) {
    fetchPokemonWithDelay(i);
}
