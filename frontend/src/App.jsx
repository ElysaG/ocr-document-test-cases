import { useEffect, useState } from 'react'
import './App.css'

const LIBELLES_STATUT = {
  VALIDE: { label: 'Validé', className: 'badge-valide' },
  A_VERIFIER: { label: 'À vérifier', className: 'badge-a-verifier' },
  REJETE: { label: 'Rejeté', className: 'badge-rejete' },
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
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'erreur' }))
  }, [])

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

  return (
    <section id="center">
      <p className="statut-backend">
        Backend : {health ? health.status : 'chargement...'}
      </p>

      <h1>Contrôle documentaire assisté par IA</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
        />
        <button type="submit">Analyser</button>
      </form>

      {result && (
        <div className="resultat">
          <h2>
            Résultat : <StatutBadge statut={result.statut} />
          </h2>

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
      )}
    </section>
  )
}

export default App
