import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze", upload.single("document"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erreur: "Aucun fichier reçu" });
  }

  res.json({
    fichier: {
      nom: req.file.originalname,
      taille: req.file.size,
    },
    statut: "A_VERIFIER",
    explication: "Réponse mockée : le moteur de règles arrive à la soirée 5.",
  });
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
