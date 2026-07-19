import { evaluerStatut } from "./evaluerStatut.js";

const reference = {
  nom: "MARTIN",
  prenoms: "ÉLISE, CAMILLE",
  date_naissance: "1992-05-12",
  nom_usage: "MARTIN",
};

test("identité conforme et bonne qualité => VALIDE", () => {
  const extraction = {
    nom: "martin",
    prenoms: "ÉLISE, CAMILLE",
    date_naissance: "1992-05-12",
    nom_usage: "MARTIN",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("VALIDE");
  expect(resultat.motifs).toEqual([]);
});

test("nom différent du référentiel => REJETE", () => {
  const extraction = {
    nom: "AUTRE",
    prenoms: "ÉLISE, CAMILLE",
    date_naissance: "1992-05-12",
    nom_usage: "MARTIN",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("REJETE");
  expect(resultat.motifs).toContain("IDENTITE_DIVERGENTE:nom");
});

test("date_naissance manquante => A_VERIFIER", () => {
  const extraction = {
    nom: "martin",
    prenoms: "ÉLISE, CAMILLE",
    date_naissance: "",
    nom_usage: "MARTIN",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("A_VERIFIER");
  expect(resultat.motifs).toContain("CHAMP_MANQUANT:date_naissance");
});

test("confiance faible mais identité conforme => A_VERIFIER", () => {
  const extraction = {
    nom: "martin",
    prenoms: "ÉLISE, CAMILLE",
    date_naissance: "1992-05-12",
    nom_usage: "MARTIN",
  };
  const confiance = { moyenne_page: 0.4, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("A_VERIFIER");
  expect(resultat.motifs).toContain("QUALITE_DOCUMENTAIRE_FAIBLE");
});

test("aucun champ d'identité exploitable => HORS_SUJET", () => {
  const extraction = {
    nom: "",
    prenoms: "",
    date_naissance: "",
    nom_usage: "",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("HORS_SUJET");
  expect(resultat.motifs).toEqual(["DOCUMENT_NON_RECONNU"]);
});

test("prénoms séparés par un espace (sans virgule) => VALIDE", () => {
  const extraction = {
    nom: "martin",
    prenoms: "CAMILLE ÉLISE",
    date_naissance: "1992-05-12",
    nom_usage: "MARTIN",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.2 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("VALIDE");
  expect(resultat.motifs).toEqual([]);
});
