# Projet portfolio : contrôle documentaire assisté par IA

## Contexte

Je suis Lisa, développeuse et cheffe de projet IA en apprentissage. Ce projet personnel de portfolio transpose des enseignements tirés d'un prototype n8n professionnel (OCR Mistral sur pièces administratives). Il ne reproduit pas le projet client : aucune donnée, aucun nom, aucune référence au contexte professionnel.

Objectif : une mini-application démontrant l'OCR assisté par IA, le contrôle documentaire, la comparaison avec des données de référence et la production d'un statut métier explicable.

## Enseignements fondateurs (issus de mes campagnes de tests OCR)

Ces principes sont des contraintes d'architecture, pas des suggestions :

1. L'OCR peut halluciner des valeurs plausibles. Les scores OCR ne suffisent jamais pour décider.
2. Extraction et décision sont strictement séparées. L'IA extrait, le code métier décide.
3. Les données OCR n'écrasent JAMAIS les données de référence.
4. Toute décision produit une explication traçable (règles déclenchées).

## Architecture à trois couches (validée, ne pas remettre en cause)

- Frontend : React + Vite. Upload du document, affichage extraction vs référence, badge statut, explication de la décision.
- Backend : Node.js + Express. Reçoit le fichier, appelle le webhook n8n, détient le référentiel de données (JSON mocké), applique les règles métier, produit le statut. Les règles vivent ici pour être testables et versionnées.
- Automatisation : n8n. Webhook → appel Mistral OCR → parsing/normalisation du JSON → réponse. n8n fait de l'extraction uniquement, aucune règle métier, aucun accès au référentiel.

Flux : React → POST /api/analyze (Express) → webhook n8n → Mistral OCR → JSON d'extraction → Express (comparaison + règles) → statut + explication → React.

Statuts métier : VALIDE, A_VERIFIER, REJETE, HORS_SUJET.

## Contraintes

- Documents de test : uniquement des spécimens officiels ou des documents fictifs. Jamais de vraie CNI ni de vrai permis (RGPD).
- Clés API et URL n8n dans un .env jamais commité. Rien de sensible côté frontend.
- Tests : Jest sur les règles métier, introduits progressivement à la soirée 5. Je débute en tests, y aller doucement.
- J'ai un workflow n8n existant (Appel-OCR4-Jalon Tests : Manual Trigger → Edit Fields → HTTP Request Mistral → Code Parsing → Code Règles métier). Le node HTTP Mistral et le parsing sont réutilisables. Le trigger devient un Webhook. Les règles métier migrent vers Express.

## Plan de réalisation (soirées d'environ 2h)

1. Squelette : Vite + React, Express, GET /api/health, le front affiche la réponse du back.
2. Upload : formulaire React, réception fichier dans Express, réponse mockée.
3. Adaptation du workflow n8n : Webhook + Respond to Webhook, test au curl.
4. Chaîne complète sur un document net : upload → statut affiché.
5. Référentiel mock + moteur de règles + statuts dans Express, premiers tests Jest.
6. UI de résultats : extraction vs référence, badge statut, explication.
7. Cas dégradés : flou, hors sujet, erreurs Mistral, timeouts.
8. Finitions : README, schéma d'architecture, jeu de spécimens, vidéo de démo.

Chaque soirée se termine par un livrable qui fonctionne. Si ça déborde, on coupe le périmètre, pas la vérification.

## Mode de travail attendu (rôle de mentor technique)

- Réponds en français.
- Ne génère jamais le projet entier d'un coup. Une étape à la fois, en petits incréments.
- Pour chaque étape : explique d'abord pourquoi on la fait, décris ce qu'on va construire, puis code le minimum nécessaire.
- Vérifie ma compréhension avant de passer à l'étape suivante, avec une ou deux questions ouvertes.
- Privilégie l'apprentissage sur la vitesse. Laisse-moi écrire du code moi-même quand c'est formateur : propose "à toi d'écrire cette partie" sur les morceaux simples.
- Explique les concepts nouveaux au moment où on les rencontre (multer, CORS, variables d'environnement, etc.), brièvement.
- Commits Git petits et fréquents, avec des messages clairs. Explique-moi la logique des commits au début.
