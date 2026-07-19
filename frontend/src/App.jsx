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

function StatutBadge({ statut }) {
  const config = LIBELLES_STATUT[statut] ?? { label: statut, className: '' }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

function App() {
  const [health, setHealth] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

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
    const res = await fetch(`http://localhost:3001/api/scenario/${id}`)
    const data = await res.json()
    setResult(data)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('document', file)

    const res = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setResult(data)
  }

  const statutClasse = result?.statut ? result.statut.toLowerCase().replace(/_/g, '-') : ''

  return (
    <>
      <header className="topbar">
        <span className={`statut-backend ${health?.status === 'ok' ? 'is-ok' : 'is-off'}`}>
          <span className="dot" aria-hidden="true"></span>
          Backend : {health ? health.status : 'chargement...'}
        </span>
      </header>

      <section id="center">
        <h1>Contrôle documentaire assisté par IA</h1>

        <p className="bandeau-intro">
          <strong>Extraction</strong> (OCR) et <strong>décision</strong> (règles métier) sont
          volontairement séparées&nbsp;: l'IA lit le document, elle ne décide jamais seule du statut.
        </p>

        <div className="scenarios">
          <h2>Scénarios de démonstration</h2>
          <p className="scenarios-sub">
            Choisissez un scénario pour lancer l'analyse — aucun fichier à préparer.
          </p>
          <div className="scenarios-boutons">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className="scenario-bouton"
                onClick={() => lancerScenario(scenario.id)}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <details className="upload-libre">
          <summary>Tester avec votre propre document</summary>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files[0])}
            />
            <button type="submit">Analyser</button>
          </form>
        </details>

        {result && (
          <div className={`resultat statut-${statutClasse}`}>
            <div className="resultat-header">
              <h2>Résultat de l'analyse</h2>
              <StatutBadge statut={result.statut} />
            </div>

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
