import { useEffect, useState } from 'react'
import './App.css'

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

const APERCU_SCENARIO = {
  conforme: '/specimens/cni-recto-test.png',
  qualite_degradee: '/specimens/cni-recto-test-floue.jpg',
  champ_manquant: '/specimens/cni-recto-test-50pmanquant.jpg',
  divergence_identite: '/specimens/cni-recto-test2.jpg',
}

function StatutBadge({ statut }) {
  const config = LIBELLES_STATUT[statut] ?? { label: statut, className: '' }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

function App() {
  const [health, setHealth] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [scenarioActif, setScenarioActif] = useState(null)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'erreur' }))

    fetch('http://localhost:3001/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => setScenarios([]))
  }, [])

  const lancerScenario = async (id) => {
    setErreur(null)
    const res = await fetch(`http://localhost:3001/api/scenario/${id}`)
    const data = await res.json()
    setScenarioActif(id)
    setResult(data)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) return

    setErreur(null)
    setResult(null)

    const formData = new FormData()
    formData.append('document', file)

    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
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
        <span className={`statut-backend ${health?.status === 'ok' ? 'is-ok' : 'is-off'}`}>
          <span className="dot" aria-hidden="true"></span>
          Backend : {health ? health.status : 'chargement...'}
        </span>
      </header>

      <section id="center">
        <p className="kicker">Portfolio — cheffe de projet IA</p>
        <h1>Contrôle documentaire assisté par IA</h1>

        <p className="bandeau-intro">
          <strong>Extraction</strong> (OCR) et <strong>décision</strong> (règles métier) sont
          volontairement séparées&nbsp;: l'IA lit le document, elle ne décide jamais seule du statut.
        </p>

        <div className="scenarios">
          <p className="scenarios-eyebrow">Mode de démonstration</p>
          <h2>Scénarios réels capturés</h2>
          <p className="scenarios-sub">
            Chaque bouton rejoue une vraie réponse Mistral OCR, déjà capturée — aucun fichier à préparer.
          </p>
          <div className="scenarios-boutons">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`scenario-bouton ${scenarioActif === scenario.id ? 'is-actif' : ''}`}
                onClick={() => lancerScenario(scenario.id)}
              >
                <span
                  className={`scenario-puce puce-${CATEGORIE_SCENARIO[scenario.id] ?? 'neutral'}`}
                  aria-hidden="true"
                ></span>
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <details className="upload-libre">
          <summary>Tester avec votre propre document</summary>
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
          {erreur && <p className="erreur">{erreur}</p>}
        </details>

        {result && (
          <div className={`resultat statut-${statutClasse}`}>
            <div className="resultat-header">
              <h2>Résultat de l'analyse</h2>
              <StatutBadge statut={result.statut} />
            </div>

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
                    <h3>Pourquoi ce statut ?</h3>
                    <ul>
                      {result.motifsLisibles.map((motif) => (
                        <li key={motif}>{motif}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {result.enseignement && (
              <div className="enseignement">
                <span className="enseignement-tag">À retenir</span>
                <p>{result.enseignement}</p>
              </div>
            )}
          </div>
        )}

        <details className="comment-ca-marche">
          <summary>Comment ça marche ?</summary>
          <ul>
            <li>L'IA (OCR) extrait les données du document, elle ne prend aucune décision.</li>
            <li>Un score de confiance OCR est un signal de qualité, jamais un critère de décision à lui seul.</li>
            <li>Chaque statut est justifié par des motifs explicites et traçables, générés par des règles métier.</li>
            <li>Les cas incertains ou dégradés sont orientés vers un contrôle humain plutôt que décidés automatiquement.</li>
          </ul>
        </details>
      </section>
    </>
  )
}

export default App
