// Préchargé par scripts.test.js (node --require) : coupe le réseau, pour que
// les scripts d'import ne puissent appeler ni PokéAPI ni l'API du Pokédex
// pendant les tests.
globalThis.fetch = async () => {
    throw new Error("réseau coupé pendant les tests");
};
