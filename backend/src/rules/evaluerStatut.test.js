import { evaluerStatut } from "./evaluerStatut.js";

const reference = {
  nom: "DUPONT",
  prenoms: "LUCAS, PIERRE",
  date_naissance: "1987-11-23",
  nom_usage: "DUPONT",
};

test("identité conforme et bonne qualité => VALIDE", () => {
  const extraction = {
    nom: "dupont",
    prenoms: "LUCAS, PIERRE",
    date_naissance: "1987-11-23",
    nom_usage: "DUPONT",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.9 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("VALIDE");
  expect(resultat.motifs).toEqual([]);
});

// À toi d'écrire les cas suivants, sur le même modèle :
//
// test("nom différent du référentiel => REJETE", () => { ... })
//   -> extraction.nom = "MARTIN" par exemple, tout le reste identique à reference
//   -> vérifie resultat.statut === "REJETE"
//   -> vérifie que resultat.motifs contient quelque chose comme "IDENTITE_DIVERGENTE:nom"
//

test("nom différent du référentiel => REJETE", () => {
  const extraction = {
    nom: "AUTRE",
    prenoms: "LUCAS, PIERRE",
    date_naissance: "1987-11-23",
    nom_usage: "DUPONT",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.9 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("REJETE");
  expect(resultat.motifs).toContain("IDENTITE_DIVERGENTE:nom");
});


// test("date_naissance manquante => A_VERIFIER", () => { ... })
//   -> extraction.date_naissance = "" ou null, nom/prenoms conformes
//   -> vérifie resultat.statut === "A_VERIFIER"
//   -> vérifie que resultat.motifs contient "CHAMP_MANQUANT:date_naissance"
//
test("date_naissance manquante => A_VERIFIER", () => {
  const extraction = {
    nom: "dupont",
    prenoms: "LUCAS, PIERRE",
    date_naissance: "",
    nom_usage: "DUPONT",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.9 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("A_VERIFIER");
  expect(resultat.motifs).toContain("CHAMP_MANQUANT:date_naissance");
});





// test("confiance faible mais identité conforme => A_VERIFIER", () => { ... })
//   -> confiance.moyenne_page = 0.4, extraction identique à reference
//   -> vérifie resultat.statut === "A_VERIFIER"
//   -> vérifie que resultat.motifs contient "QUALITE_DOCUMENTAIRE_FAIBLE"
test("confiance faible mais identité conforme => A_VERIFIER", () => {
  const extraction = {
    nom: "dupont",
    prenoms: "LUCAS, PIERRE",
    date_naissance: "1987-11-23",
    nom_usage: "DUPONT",
  };
  const confiance = { moyenne_page: 0.4, minimum_page: 0.9 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("A_VERIFIER");
  expect(resultat.motifs).toContain("QUALITE_DOCUMENTAIRE_FAIBLE");
});

test("prénoms séparés par un espace (sans virgule) => VALIDE", () => {
  const extraction = {
    nom: "dupont",
    prenoms: "LUCAS PIERRE",
    date_naissance: "1987-11-23",
    nom_usage: "DUPONT",
  };
  const confiance = { moyenne_page: 0.95, minimum_page: 0.9 };

  const resultat = evaluerStatut({ extraction, confiance, reference });

  expect(resultat.statut).toBe("VALIDE");
  expect(resultat.motifs).toEqual([]);
});