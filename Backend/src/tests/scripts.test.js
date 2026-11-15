const { spawnSync } = require("child_process");
const path = require("path");

const BACKEND = path.join(__dirname, "..", "..");
const SANS_RESEAU = path.join(__dirname, "sansReseau.js");

describe("Scripts d'import", () => {
    it.each(["fetchPokemon.js", "updateFrenchNames.js"])(
        "%s s'arrête avec un message s'il n'a pas reçu de jeton",
        (script) => {
            const env = { ...process.env };
            delete env.POKEDEX_TOKEN;

            const resultat = spawnSync(process.execPath, ["--require", SANS_RESEAU, script], {
                cwd: BACKEND,
                env,
                encoding: "utf8",
                timeout: 5000,
            });

            expect(resultat.status).toBe(1);
            expect(resultat.stderr).toContain("POKEDEX_TOKEN");
        }
    );
});
