import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PatientListScreen from './screens/PatientListScreen'
import FormScreen from './screens/FormScreen'
import './App.css'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<PatientListScreen />} />
          <Route path="/form/:patientId" element={<FormScreen />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App