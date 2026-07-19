import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import { evaluerStatut } from "./rules/evaluerStatut.js";
import referentiel from "./data/referentiel.json" with { type: "json" };

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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

  const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    body: formData,
  });
  const donnees = await n8nResponse.json();

  const { statut, motifs } = evaluerStatut({
    extraction: donnees.donnees_extraites,
    confiance: donnees.confiance,
    reference: referentiel,
  });

  res.json({ ...donnees, statut, motifs });
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
