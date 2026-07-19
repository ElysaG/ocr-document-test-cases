import { useEffect, useState } from 'react'
import './App.css'

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
      <h1>Statut du backend</h1>
      <p>{health ? JSON.stringify(health) : 'Chargement...'}</p>

      <h2>Analyse d'un document</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
        />
        <button type="submit">Analyser</button>
      </form>
      {result && <p>{JSON.stringify(result)}</p>}
    </section>
  )
}

export default App
