const LIBELLES = {
  "IDENTITE_DIVERGENTE:nom":
    "Le nom indiqué sur le document ne correspond pas au nom attendu.",
  "IDENTITE_DIVERGENTE:date_naissance":
    "La date de naissance indiquée sur le document ne correspond pas à celle attendue.",
  "CHAMP_MANQUANT:nom":
    "Le nom n'apparaît pas clairement sur le document, il n'a pas pu être vérifié.",
  "CHAMP_MANQUANT:date_naissance":
    "La date de naissance n'apparaît pas clairement sur le document, elle n'a pas pu être vérifiée.",
  PRENOM_MANQUANT: "Les prénoms ne sont pas lisibles sur le document.",
  PRENOM_PARTIEL:
    "Seule une partie des prénoms attendus a été retrouvée sur le document.",
  PRENOM_DIVERGENT:
    "Les prénoms indiqués sur le document ne correspondent pas à ceux attendus.",
  QUALITE_DOCUMENTAIRE_FAIBLE:
    "La qualité du document ne permet pas de garantir une lecture fiable.",
};

export function traduireMotifs(motifs) {
  return motifs.map((code) => LIBELLES[code] ?? code);
}
