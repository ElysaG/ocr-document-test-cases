import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const GITHUB_URL = 'https://github.com/ElysaG/ocr-document-test-cases'
const LINKEDIN_URL = 'https://www.linkedin.com/in/elisa-gomez-IA'

const LIBELLES_STATUT = {
  VALIDE: { label: 'Validé', className: 'badge-valide' },
  A_VERIFIER: { label: 'À vérifier', className: 'badge-a-verifier' },
  REJETE: { label: 'Rejeté', className: 'badge-rejete' },
  HORS_SUJET: { label: 'Hors sujet', className: 'badge-hors-sujet' },
}

const CHAMPS_COMPARES = [
  { cle: 'nom', label: 'Nom' },
  { cle: 'prenoms', label: 'Prénoms' },
  { cle: 'date_naissance', label: 'Date de naissance' },
]

const CATEGORIE_SCENARIO = {
  conforme: 'success',
  qualite_degradee: 'warning',
  champ_manquant: 'warning',
  divergence_identite: 'danger',
  hors_sujet: 'neutral',
}

const DESCRIPTION_SCENARIO = {
  conforme: 'Identité conforme et qualité suffisante.',
  qualite_degradee: 'Identité conforme, mais qualité incertaine.',
  champ_manquant: "Un champ obligatoire n'a pas pu être lu.",
  divergence_identite: 'Identité extraite non conforme au référentiel.',
  hors_sujet: 'Aucune information exploitable extraite.',
}

const APERCU_SCENARIO = {
  conforme: '/specimens/cni-recto-test.jpg',
  qualite_degradee: '/specimens/cni-recto-test-floue.jpg',
  champ_manquant: '/specimens/cni-recto-test-50pmanquant.jpg',
  divergence_identite: '/specimens/cni-recto-test2.jpg',
}

const PIPELINE_ETAPES = [
  { id: 'document', label: 'Document', description: "Une pièce d'identité (ou un spécimen fictif) est transmise." },
  { id: 'ocr', label: 'OCR (IA)', description: "Mistral lit le document et extrait les champs — elle ne décide de rien." },
  { id: 'regles', label: 'Moteur de règles', description: "Le code compare l'extraction au référentiel et évalue la qualité." },
  { id: 'decision', label: 'Décision explicable', description: 'Un statut est produit, toujours accompagné de motifs vérifiables.' },
]

const SCENARIO_RECOMMANDE = 'qualite_degradee'

const ENSEIGNEMENTS = [
  "Le choix du modèle est important, mais la valeur d'un projet IA repose surtout sur les règles de décision construites autour de lui.",
  "Un score de confiance élevé n'est qu'un signal de qualité — jamais, à lui seul, un critère de décision.",
  'Les cas limites se définissent dès la conception, pas après coup.',
  "Automatiser n'est pas l'objectif : savoir quand transmettre la décision à un humain en est un tout autant.",
  "L'explicabilité est une exigence métier, pas un confort technique.",
]

const ETAT_BACKEND_LABEL = {
  connexion: 'Connexion en cours…',
  pret: 'Backend prêt',
  indisponible: 'Backend indisponible',
}

function StatutBadge({ statut }) {
  const config = LIBELLES_STATUT[statut] ?? { label: statut, className: '' }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

function Pipeline() {
  return (
    <div className="pipeline">
      {PIPELINE_ETAPES.map((etape, index) => (
        <div className="pipeline-item" key={etape.id}>
          <div className="pipeline-etape">
            <span className="pipeline-num">{String(index + 1).padStart(2, '0')}</span>
            <span className="pipeline-label">{etape.label}</span>
            <p className="pipeline-desc">{etape.description}</p>
          </div>
          {index < PIPELINE_ETAPES.length - 1 && (
            <span className="pipeline-fleche" aria-hidden="true">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [scenarios, setScenarios] = useState([])
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [scenarioActif, setScenarioActif] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [etatBackend, setEtatBackend] = useState('connexion')

  useEffect(() => {
    fetch(`${API_URL}/api/scenarios`)
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => setScenarios([]))

    fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(75000) })
      .then((res) => setEtatBackend(res.ok ? 'pret' : 'indisponible'))
      .catch(() => setEtatBackend('indisponible'))
  }, [])

  const lancerScenario = async (id) => {
    setErreur(null)
    try {
      const res = await fetch(`${API_URL}/api/scenario/${id}`)
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.erreur ?? 'Une erreur est survenue.')
        return
      }

      setScenarioActif(id)
      setResult(data)
    } catch {
      setErreur('Impossible de contacter le serveur. Réessayez plus tard.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) return

    setErreur(null)
    setResult(null)

    const formData = new FormData()
    formData.append('document', file)

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.erreur ?? 'Une erreur est survenue.')
        return
      }

      setScenarioActif(null)
      setResult(data)
    } catch {
      setErreur('Impossible de contacter le serveur. Réessayez plus tard.')
    }
  }

  const statutClasse = result?.statut ? result.statut.toLowerCase().replace(/_/g, '-') : ''
  const apercu = APERCU_SCENARIO[scenarioActif]

  return (
    <>
      <header className="topbar">
        <span className={`statut-backend etat-${etatBackend}`}>
          <span className="dot" aria-hidden="true"></span>
          {ETAT_BACKEND_LABEL[etatBackend]}
        </span>
      </header>

      <section id="center">
        <p className="kicker">PROJET D’EXPLORATION • IA & DÉCISION MÉTIER</p>
        <h1>Contrôle documentaire assisté par IA</h1>
        <p className="sous-titre">De l'extraction IA à la décision métier explicable</p>

        <div className="pourquoi">
          <p className="section-eyebrow">Le problème</p>
          <p className="pourquoi-texte">
            Lors d'un contrôle documentaire, valider une mauvaise identité ou rejeter un document
            valide a un <strong>coût opérationnel réel</strong>.
          </p>
          <p className="pourquoi-texte">
            Or, un OCR peut extraire une information <strong>erronée mais plausible</strong>,
            parfois accompagnée d'un score de confiance élevé. L'extraction ne peut donc{' '}
            <strong>jamais être considérée comme une vérité</strong>.
          </p>
          <p className="pourquoi-texte">
            Dans ce projet, l'IA extrait l'information mais{' '}
            <strong>ne remplace jamais le référentiel de référence</strong>. Un moteur de règles
            explicables compare les deux sources et justifie chaque décision.
          </p>
        </div>

        <div className="comment-ca-marche">
          <p className="section-eyebrow">Comment ça marche</p>
          <h2>De l'extraction à la décision</h2>
          <Pipeline />
        </div>

        <div className="scenarios">
          <p className="section-eyebrow">Mode de démonstration</p>
          <h2>Scénarios réels capturés</h2>
          <p className="scenarios-sub">
            Chaque carte rejoue une vraie réponse Mistral OCR, déjà capturée — aucun fichier à préparer.
          </p>
          {etatBackend === 'connexion' && (
            <p className="backend-attente">
              Réveil du serveur, ça peut prendre jusqu'à une minute — hébergement gratuit.
            </p>
          )}
          {etatBackend === 'indisponible' && (
            <p className="backend-attente backend-attente-erreur">
              Le service est actuellement indisponible. Réessayez dans quelques instants.
            </p>
          )}
          <div className="scenarios-boutons">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                disabled={etatBackend !== 'pret'}
                className={`scenario-bouton ${scenarioActif === scenario.id ? 'is-actif' : ''}`}
                onClick={() => lancerScenario(scenario.id)}
              >
                {scenarioActif === scenario.id && (
                  <span className="scenario-check" aria-hidden="true">✓</span>
                )}
                {scenario.id === SCENARIO_RECOMMANDE && (
                  <span className="scenario-recommande">Commencer ici</span>
                )}
                <span
                  className={`scenario-puce puce-${CATEGORIE_SCENARIO[scenario.id] ?? 'neutral'}`}
                  aria-hidden="true"
                ></span>
                <span className="scenario-texte">
                  <span className="scenario-label">{scenario.label}</span>
                  <span className="scenario-desc">{DESCRIPTION_SCENARIO[scenario.id]}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {erreur && <p className="erreur">{erreur}</p>}

        {result && (
          <div className={`resultat statut-${statutClasse}`}>
            <div className="resultat-etape resultat-verdict">
              <p className="section-eyebrow">01 — Verdict</p>
              <StatutBadge statut={result.statut} />
            </div>

            {result.enseignement && (
              <div className="resultat-etape resultat-pourquoi">
                <p className="section-eyebrow">02 — Pourquoi</p>
                <p className="verdict-texte">{result.enseignement}</p>
              </div>
            )}

            <div className="resultat-etape resultat-preuves">
              <p className="section-eyebrow">03 — Preuves détaillées</p>
              <div className="resultat-corps">
                {apercu && (
                  <img
                    className="resultat-apercu"
                    src={apercu}
                    alt="Aperçu du document analysé"
                    loading="lazy"
                  />
                )}

                <div className="resultat-donnees">
                  <table className="comparaison">
                    <thead>
                      <tr>
                        <th>Champ</th>
                        <th>Extrait du document</th>
                        <th>Référence attendue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHAMPS_COMPARES.map(({ cle, label }) => (
                        <tr key={cle}>
                          <td>{label}</td>
                          <td>{result.donnees_extraites?.[cle] || '—'}</td>
                          <td>{result.referentiel?.[cle] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {result.motifsLisibles?.length > 0 && (
                    <div className="motifs">
                      <h3>Motifs</h3>
                      <ul>
                        {result.motifsLisibles.map((motif) => (
                          <li key={motif}>{motif}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="enseignements">
          <p className="section-eyebrow">Enseignements</p>
          <h2>Principes de conception</h2>
          <div className="enseignements-grille">
            {ENSEIGNEMENTS.map((texte, index) => (
              <div className="enseignement-carte" key={texte}>
                <span className="enseignement-num">{String(index + 1).padStart(2, '0')}</span>
                <p>{texte}</p>
              </div>
            ))}
          </div>
        </div>

        <details className="upload-libre">
          <summary>Tester avec votre propre document</summary>
          <p className="avertissement">
            ⚠️ N'utilisez jamais une vraie pièce d'identité. Testez uniquement avec un document
            fictif ou un spécimen de démonstration —{' '}
            <a href={`${GITHUB_URL}/tree/main/frontend/public/specimens`} target="_blank" rel="noreferrer">
              des exemples sont disponibles ici
            </a>.
          </p>
          <form onSubmit={handleSubmit}>
            <label className="fichier-label">
              <input
                type="file"
                className="fichier-input"
                onChange={(event) => setFile(event.target.files[0])}
              />
              <span>{file ? file.name : 'Choisir un fichier'}</span>
            </label>
            <button type="submit" className="fichier-analyser">Analyser</button>
          </form>
        </details>

        <footer className="a-propos">
          <p className="section-eyebrow">À propos de ce projet</p>
          <p className="a-propos-texte">
            Projet personnel réalisé dans le cadre de ma reconversion vers les métiers de l'IA.
          </p>
          <p className="a-propos-texte">
            À travers ce cas d'usage documentaire, j'ai cherché à explorer une question simple :
          </p>
          <p className="a-propos-question">
            Comment intégrer une IA dans un processus métier tout en conservant une décision
            explicable, traçable et gouvernable&nbsp;?
          </p>
          <div className="pied-de-page">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <span className="pied-de-page-separateur" aria-hidden="true">·</span>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </footer>
      </section>
    </>
  )
}

export default App
