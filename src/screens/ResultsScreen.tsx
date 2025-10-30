import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SubmitFormResponse } from '../types/patient'
import { colors } from '../themes'

const ResultsScreen: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const data: SubmitFormResponse = location.state?.data

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>No se encontraron datos</h2>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'white',
              color: colors.primary.main,
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const { datosPaciente, reasoningResult } = data
  const { medicamentos } = datosPaciente

  // Extract contraindications from reasoning result
  const extractContraindications = () => {
    const contraindications: string[] = []
    reasoningResult.derivedStatements.forEach(statement => {
      if (statement.includes('hasContraindication')) {
        const match = statement.match(/#([^,\]]+)/g)
        if (match && match.length >= 2) {
          contraindications.push(match[match.length - 1].replace('#', ''))
        }
      }
    })
    return contraindications.map(uri => {
      // Convert URI to readable text
      if (uri.includes('Magnetic_resonance') || uri.includes('magnetic_resonance')) {
        return 'Resonancia Magnética'
      }
      // Add more mappings as needed
      return uri.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })
  }

  const contraindications = extractContraindications()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        background: 'white',
        borderRadius: '20px',
        padding: 'clamp(16px, 4vw, 40px) clamp(16px, 6vw, 200px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: colors.text.primary,
          background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Resultados del Análisis
        </h1>

        {/* Información del Paciente */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: colors.border.light,
          borderRadius: '10px'
        }}>
          <h2 style={{ marginBottom: '15px', color: colors.text.primary }}>Paciente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><strong>Nombre:</strong> {datosPaciente.datosBasicosPaciente.nombre}</div>
            <div><strong>Edad:</strong> {datosPaciente.datosBasicosPaciente.edad} años</div>
            <div><strong>Género:</strong> {datosPaciente.datosBasicosPaciente.genero === 'M' ? '👨 Masculino' : '👩 Femenino'}</div>
            <div><strong>Altura:</strong> {datosPaciente.datosBasicosPaciente.alturaValor} {datosPaciente.datosBasicosPaciente.alturaUnidad}</div>
            <div><strong>Peso:</strong> {datosPaciente.datosBasicosPaciente.pesoValor} {datosPaciente.datosBasicosPaciente.pesoUnidad}</div>
          </div>
        </div>

        {/* Contraindicaciones */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            marginBottom: '15px', 
            color: '#dc2626',
            paddingBottom: '10px',
            borderBottom: '3px solid #dc2626'
          }}>
            ⚠️ Contraindicaciones ({contraindications.length})
          </h2>
          <div style={{ 
            background: '#fef2f2', 
            padding: '20px', 
            borderRadius: '10px',
            borderLeft: '4px solid #dc2626'
          }}>
            {contraindications.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {contraindications.map((contraindication, index) => (
                  <li key={index} style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: 'white',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    color: '#dc2626',
                    fontWeight: '600'
                  }}>
                    ⚠️ {contraindication}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: colors.text.secondary, fontSize: '1rem' }}>
                No se detectaron contraindicaciones
              </div>
            )}
          </div>
        </div>

        {/* Medicamentos Diuréticos */}
        {medicamentos.clasificados.diureticos.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              marginBottom: '15px', 
              color: colors.primary.main,
              paddingBottom: '10px',
              borderBottom: `3px solid ${colors.primary.main}`
            }}>
              💊 Medicamentos Diuréticos ({medicamentos.clasificados.diureticos.length})
            </h2>
            {medicamentos.clasificados.diureticos.map((med, index) => (
              <div
                key={index}
                style={{
                  background: colors.border.light,
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                  {med.name}
                </div>
                {med.doseQuantityValue && (
                  <div style={{ color: colors.text.secondary }}>
                    Dosis: {med.doseQuantityValue} {med.doseQuantityUnit || ''}
                  </div>
                )}
                {med.periodAdministrationValue && (
                  <div style={{ color: colors.text.secondary }}>
                    Frecuencia: Cada {med.periodAdministrationValue} {med.periodAdministrationUnit || 'horas'}
                  </div>
                )}
                {med.drugs.map((drug, idx) => (
                  <div key={idx} style={{ marginTop: '5px', fontSize: '0.9rem', color: colors.text.secondary }}>
                    {drug.nombre}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Medicamentos No Diuréticos */}
        {medicamentos.clasificados.noDiureticos.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              marginBottom: '15px', 
              color: colors.secondary.main,
              paddingBottom: '10px',
              borderBottom: `3px solid ${colors.secondary.main}`
            }}>
              💊 Medicamentos No Diuréticos ({medicamentos.clasificados.noDiureticos.length})
            </h2>
            {medicamentos.clasificados.noDiureticos.map((med, index) => (
              <div
                key={index}
                style={{
                  background: colors.border.light,
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                  {med.name}
                </div>
                {med.doseQuantityValue && (
                  <div style={{ color: colors.text.secondary }}>
                    Dosis: {med.doseQuantityValue} {med.doseQuantityUnit || ''}
                  </div>
                )}
                {med.periodAdministrationValue && (
                  <div style={{ color: colors.text.secondary }}>
                    Frecuencia: Cada {med.periodAdministrationValue} {med.periodAdministrationUnit || 'horas'}
                  </div>
                )}
                {med.drugs.map((drug, idx) => (
                  <div key={idx} style={{ marginTop: '5px', fontSize: '0.9rem', color: colors.text.secondary }}>
                    {drug.nombre}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Medicamentos No Clasificados */}
        {medicamentos.noClasificados.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              marginBottom: '15px', 
              color: '#9ca3af',
              paddingBottom: '10px',
              borderBottom: '3px solid #9ca3af'
            }}>
              📋 Medicamentos No Clasificados ({medicamentos.noClasificados.length})
            </h2>
            {medicamentos.noClasificados.map((med, index) => (
              <div
                key={index}
                style={{
                  background: colors.border.light,
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                  {med.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsScreen

