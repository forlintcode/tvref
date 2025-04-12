import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GraphView from './pages/GraphView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/graph/:showName" element={<GraphView />} />
    </Routes>
  )
}

export default App
