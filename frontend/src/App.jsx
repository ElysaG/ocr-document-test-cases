import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'erreur' }))
  }, [])

  return (
    <section id="center">
      <h1>Statut du backend</h1>
      <p>{health ? JSON.stringify(health) : 'Chargement...'}</p>
    </section>
  )
}

export default App
