import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import { evaluerStatut } from "./rules/evaluerStatut.js";
import { traduireMotifs } from "./rules/motifsLisibles.js";
import referentiel from "./data/referentiel.json" with { type: "json" };
import scenarios from "./data/scenarios.json" with { type: "json" };

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

function construireReponse({ donnees_extraites, confiance, traitement }) {
  const { statut, motifs } = evaluerStatut({
    extraction: donnees_extraites,
    confiance,
    reference: referentiel,
  });

  return {
    donnees_extraites,
    confiance,
    traitement,
    statut,
    motifs,
    motifsLisibles: traduireMotifs(motifs),
    referentiel,
  };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/scenarios", (req, res) => {
  res.json(
    scenarios.map(({ id, label, enseignement }) => ({ id, label, enseignement }))
  );
});

app.get("/api/scenario/:id", (req, res) => {
  const scenario = scenarios.find((s) => s.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ erreur: "Scénario introuvable" });
  }

  res.json({
    ...construireReponse(scenario),
    enseignement: scenario.enseignement,
  });
});

app.post("/api/analyze", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erreur: "Aucun fichier reçu" });
  }

  const formData = new FormData();
  formData.append(
    "document",
    new Blob([req.file.buffer], { type: req.file.mimetype }),
    req.file.originalname
  );

  let n8nResponse;
  try {
    n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(15000),
    });
  } catch (erreur) {
    return res.status(502).json({
      erreur:
        "Le service d'analyse est momentanément indisponible ou a mis trop de temps à répondre. Réessayez plus tard.",
    });
  }

  if (!n8nResponse.ok) {
    return res.status(502).json({
      erreur: "Le service d'analyse a renvoyé une erreur. Réessayez plus tard.",
    });
  }

  const donnees = await n8nResponse.json();

  res.json(construireReponse(donnees));
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
