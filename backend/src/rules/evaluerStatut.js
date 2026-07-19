// Seuil calibré empiriquement sur des spécimens réels (voir captures OCR
// soirée 7) : moyenne_page < 0.92 sépare les documents visiblement dégradés
// (flou, mauvaise résolution, rotation) des documents nets dans notre
// échantillon. minimum_page a été testé et écarté : il reste bas (< 0.25)
// même sur des documents parfaitement lisibles (une zone isolée du
// document, ex. micro-impression, suffit à le faire chuter) — un signal
// trop bruité pour être exploitable. Reste un paramètre arbitraire au sens
// où il n'est validé que sur un petit échantillon, pas une vérité générale ;
// la confiance OCR ne décide jamais seule du statut, elle ne fait qu'ajouter
// un motif de qualité documentaire.
const SEUIL_CONFIANCE = 0.92;

function normaliser(texte) {
  // TODO: retourner texte "nettoyé" pour comparaison (trim + majuscules),
  // pour ignorer les différences de casse/espaces produites par l'OCR.
  if(!texte) return "";
  return texte.trim().toUpperCase();
}

function champEstManquant(valeur) {
  // TODO: retourner true si valeur est null/undefined/chaîne vide après trim.
  return normaliser(valeur) === "";
}

function champFortDivergent(valeurExtraite, valeurReference) {
  // TODO: retourner true si les deux valeurs normalisées sont différentes.
  // Appelée uniquement quand le champ n'est PAS manquant.
    return normaliser(valeurExtraite) !== normaliser(valeurReference);
}

function comparerPrenoms(prenomsExtraits, prenomsReference) {
  // TODO: découper les deux chaînes sur la virgule, normaliser chaque prénom,
  // puis retourner une chaîne parmi : "conforme", "manquant", "partiel", "divergent".
  //
  // - "manquant"  : prenomsExtraits vide/absent
  // - "conforme"  : tous les prénoms de reference retrouvés dans extraction
  // - "partiel"   : au moins un prénom de reference retrouvé, mais pas tous
  // - "divergent" : aucun recouvrement entre les deux listes
  if (champEstManquant(prenomsExtraits)) {
    return "manquant";
  }

  const extraits = prenomsExtraits
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(normaliser);

  const reference = prenomsReference
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(normaliser);

  const communs = reference.filter(prenom =>
    extraits.includes(prenom)
  );

  if (communs.length === reference.length) {
    return "conforme";
  }

  if (communs.length > 0) {
    return "partiel";
  }

  return "divergent";
}

export function evaluerStatut({ extraction, confiance, reference }) {
  // 0. Document non reconnu : aucun champ d'identité exploitable.
  // Simplification MVP assumée (cf. CLAUDE.md, "Stratégie de démonstration") :
  // regroupe "hors périmètre" et "inexploitable", faute de signal pour distinguer les deux.
  const aucunChampExploitable = ["nom", "prenoms", "date_naissance"].every(
    (champ) => champEstManquant(extraction[champ])
  );
  if (aucunChampExploitable) {
    return { statut: "HORS_SUJET", motifs: ["DOCUMENT_NON_RECONNU"] };
  }

  const motifs = [];

  // 1. Champs d'identité forte : nom, date_naissance
  for (const champ of ["nom", "date_naissance"]) {
    if (champEstManquant(extraction[champ])) {
      motifs.push(`CHAMP_MANQUANT:${champ}`);
    } else if (champFortDivergent(extraction[champ], reference[champ])) {
      motifs.push(`IDENTITE_DIVERGENTE:${champ}`);
    }
  }

  // 2. Prénoms (comparaison souple)
  const resultatPrenoms = comparerPrenoms(extraction.prenoms, reference.prenoms);
  if (resultatPrenoms === "manquant") {
    motifs.push("PRENOM_MANQUANT");
  } else if (resultatPrenoms === "partiel") {
    motifs.push("PRENOM_PARTIEL");
  } else if (resultatPrenoms === "divergent") {
    motifs.push("PRENOM_DIVERGENT");
  }

  // 3. Qualité documentaire
  if (confiance.moyenne_page < SEUIL_CONFIANCE) {
    motifs.push("QUALITE_DOCUMENTAIRE_FAIBLE");
  }

  // 4. Statut final, par ordre de priorité :
  //    - un motif "IDENTITE_DIVERGENTE:*" présent => "REJETE"
  //    - sinon, motifs non vide => "A_VERIFIER"
  //    - sinon => "VALIDE"
  const identiteDivergente = motifs.some((motif) =>
    motif.startsWith("IDENTITE_DIVERGENTE")
  );

  let statut;
  if (identiteDivergente) {
    statut = "REJETE";
  } else if (motifs.length > 0) {
    statut = "A_VERIFIER";
  } else {
    statut = "VALIDE";
  }

  return { statut, motifs };
}
