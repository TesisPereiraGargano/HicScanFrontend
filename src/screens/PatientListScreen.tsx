import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hicScanService } from '../services/hicScanService'
import type { BasicPatientInfo } from '../services/hicScanService'
import { colors } from '../themes'

const PatientListScreen: React.FC = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<BasicPatientInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const data = await hicScanService.getPatients()
        setPatients(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patients')
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const handlePatientClick = (index: number) => {
    navigate(`/form/${index}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      fontFamily: 'Arial, sans-serif',
      width: '100vw',
      overflowX: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        background: 'transparent',
        borderRadius: '0',
        padding: '20px',
        boxShadow: 'none',
        minHeight: '100vh'
      }}>
        <h1 style={{
          color: colors.text.white,
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 'bold',
          padding: '0 10px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          Lista de Pacientes
        </h1>

        {loading && (
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
            Cargando pacientes...
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            color: '#ff4444', 
            fontSize: '1.1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '10px',
            maxWidth: '600px',
            margin: '20px auto'
          }}>
            Error: {error}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginTop: '30px',
          padding: '0 20px',
          width: '100%',
          maxWidth: '800px',
          margin: '30px auto 0'
        }}>
          {patients.map((patient, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Contenido principal */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <div>
                  <h3 style={{
                    color: colors.text.primary,
                    marginBottom: '8px',
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    marginTop: '0'
                  }}>
                    {patient.nombre}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      background: colors.secondary.main,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {patient.genero === 'M' ? '👨' : '👩'} {patient.edad} años
                    </div>
                    <span style={{ 
                      color: colors.text.secondary, 
                      fontSize: '0.95rem',
                      fontWeight: '400'
                    }}>
                      {patient.alturaValor} {patient.alturaUnidad} - {patient.pesoValor} {patient.pesoUnidad}
                    </span>
                  </div>
                </div>
                
                {/* Botón de seleccionar */}
                <button
                  onClick={() => handlePatientClick(index)}
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    border: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <span>Seleccionar</span>
                  <span style={{ fontSize: '1.1rem' }}>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatientListScreen
