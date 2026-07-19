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

## Stratégie de démonstration (portfolio)

Le projet ne se limite pas à un pipeline OCR fonctionnel : l'objectif portfolio est de démontrer un système de **gouvernance documentaire** où extraction IA et décision métier sont volontairement séparées. Un recruteur passe 60 à 90 secondes sur un portfolio et ne fournira jamais ses propres documents de test — la démonstration doit donc être immédiate, sans préparation.

- **Mode de démonstration principal : scénarios prédéfinis capturés.** Chaque scénario correspond à un document réellement passé une fois dans le pipeline ; la réponse Mistral (`donnees_extraites`, `confiance`, `traitement`) est capturée et rejouée à la demande — aucun appel réseau à n8n/Mistral au clic, donc aucune dépendance à l'infrastructure ni coût récurrent. Le moteur de règles (`evaluerStatut`) s'exécute toujours en direct sur la donnée rejouée : ce qui compte pour la démo (la décision et sa traçabilité) reste 100 % réel.
- **Upload libre : mode secondaire**, toujours disponible, pour qui veut tester avec son propre document.
- **5 scénarios cibles** : document conforme (VALIDE), prénom manquant/partiel (A_VERIFIER), qualité documentaire dégradée malgré une identité conforme (A_VERIFIER — démontre que la confiance seule ne valide ni ne rejette jamais rien), divergence d'identité (REJETE), document hors sujet (HORS_SUJET).
- **HORS_SUJET est une simplification assumée du MVP**, à documenter explicitement dans le README (pas à cacher) : un système réel distinguerait "document hors périmètre" (facture, photo...) et "document inexploitable" (trop dégradé pour être lu), mais on ne dispose pas aujourd'hui d'un signal fiable pour les séparer proprement. Le MVP les regroupe sous un seul statut.
- **L'enseignement sur les scores de confiance dépasse Mistral** : la littérature OCR/document-IA converge sur le même constat (signal utile, jamais suffisant seul pour décider). Le README et au moins un scénario doivent le présenter comme un enseignement général de gouvernance documentaire, pas comme une limite propre à un fournisseur.
- **Les enseignements doivent être visibles dans l'application elle-même**, pas seulement dans le README (beaucoup de visiteurs ne le liront jamais) :
  - un bandeau d'introduction permanent (séparation extraction/décision, en une phrase) ;
  - un encart pédagogique contextuel, différent pour chaque scénario, affiché à côté du résultat au moment où il se produit — transforme chaque scénario en enseignement concret, pas en simple cas de test ;
  - un accordéon "Comment ça marche ?", replié par défaut, pour qui veut aller plus loin.

## Plan de réalisation (soirées d'environ 2h)

1. Squelette : Vite + React, Express, GET /api/health, le front affiche la réponse du back.
2. Upload : formulaire React, réception fichier dans Express, réponse mockée.
3. Adaptation du workflow n8n : Webhook + Respond to Webhook, test au curl.
4. Chaîne complète sur un document net : upload → statut affiché.
5. Référentiel mock + moteur de règles + statuts dans Express, premiers tests Jest.
6. UI de résultats : extraction vs référence, badge statut, explication.
7. Scénarios de démonstration capturés (5 cas, cf. Stratégie de démonstration) + statut HORS_SUJET + robustesse technique (timeout/erreur n8n) sur le chemin d'upload libre.
8. Finitions : README (format Problème → Solution → Impact + section Enseignements), schéma d'architecture, bandeau/encarts pédagogiques et accordéon "Comment ça marche ?" dans l'UI, vidéo de démo.

Chaque soirée se termine par un livrable qui fonctionne. Si ça déborde, on coupe le périmètre, pas la vérification.

## Mode de travail attendu (rôle de mentor technique)

- Réponds en français.
- Ne génère jamais le projet entier d'un coup. Une étape à la fois, en petits incréments.
- Pour chaque étape : explique d'abord pourquoi on la fait, décris ce qu'on va construire, puis code le minimum nécessaire.
- Vérifie ma compréhension avant de passer à l'étape suivante, avec une ou deux questions ouvertes.
- Privilégie l'apprentissage sur la vitesse. Laisse-moi écrire du code moi-même quand c'est formateur : propose "à toi d'écrire cette partie" sur les morceaux simples.
- Explique les concepts nouveaux au moment où on les rencontre (multer, CORS, variables d'environnement, etc.), brièvement.
- Commits Git petits et fréquents, avec des messages clairs. Explique-moi la logique des commits au début.
