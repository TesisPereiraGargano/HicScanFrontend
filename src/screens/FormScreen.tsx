import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { hicScanService } from '../services/hicScanService'
import type { Form, FormField } from '../types/form'
import type { BasicPatientInfo } from '../services/hicScanService'
import { mapPatientToFormData } from '../services/patientDataMapper'
import { colors } from '../themes'

const FormScreen: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [missingFieldsCount, setMissingFieldsCount] = useState(0)
  const [patient, setPatient] = useState<BasicPatientInfo | null>(null)

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await hicScanService.getFormData()
        setForm(data)
        setLoading(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load form data. Please try again later.')
        setLoading(false)
      }
    }

    fetchFormData()
  }, [])

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        try {
          const patients = await hicScanService.getPatients()
          const patientIndex = parseInt(patientId, 10)
          if (patients[patientIndex]) {
            const loadedPatient = patients[patientIndex]
            setPatient(loadedPatient)
            
            // Pre-cargar datos del paciente en el formulario
            const patientFormData = mapPatientToFormData(loadedPatient)
            setFormData(prev => ({
              ...prev,
              ...patientFormData
            }))
          }
        } catch (error) {
          console.error('Error fetching patients:', error)
        }
      }
    }

    fetchPatient()
  }, [patientId])

  // Calcular campos faltantes cuando cambie el formData
  useEffect(() => {
    if (!form) return

    const requiredFields: string[] = []
    const collectRequiredFields = (fields: FormField[]) => {
      fields.forEach(field => {
        if (field.subForm && field.subForm.length > 0) {
          // Los campos con subforms no se validan como inputs, solo sus subforms
          collectRequiredFields(field.subForm)
        } else if (field.shown) {
          // Solo agregar campos que se muestran y no tienen subforms
          requiredFields.push(field.propUri)
        }
      })
    }
    
    collectRequiredFields(form)
    
    const missingFields = requiredFields.filter(fieldUri => {
      const value = formData[fieldUri]
      return value === undefined || value === '' || value === null
    })
    
    setMissingFieldsCount(missingFields.length)
  }, [formData, form])

  const handleInputChange = (fieldUri: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldUri]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que todos los campos estén completos
    if (!form) {
      alert('Error: No se pudo cargar el formulario')
      return
    }

    const requiredFields: string[] = []
    const collectRequiredFields = (fields: FormField[]) => {
      fields.forEach(field => {
        if (field.subForm && field.subForm.length > 0) {
          // Los campos con subforms no se validan como inputs, solo sus subforms
          collectRequiredFields(field.subForm)
        } else if (field.shown) {
          // Solo agregar campos que se muestran y no tienen subforms
          requiredFields.push(field.propUri)
        }
      })
    }
    
    collectRequiredFields(form)
    
    const missingFields = requiredFields.filter(fieldUri => {
      const value = formData[fieldUri]
      return value === undefined || value === '' || value === null
    })
    
    if (missingFields.length > 0) {
      alert(`Por favor complete todos los campos obligatorios. Faltan ${missingFields.length} campos.`)
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      // Transform formData to the format expected by the API
      // Remove _unit keys and filter out non-form fields
      const womanHistoryData: Record<string, string> = {}
      for (const [key, value] of Object.entries(formData)) {
        // Skip _unit fields
        if (!key.endsWith('_unit')) {
          // Convert value to string if it's not already
          womanHistoryData[key] = String(value)
        }
      }

      console.log('Submitting form data:', womanHistoryData)

      // Convertir patientId a número, sumarle 1 y convertirlo de vuelta a string
      const patientIdNumber = Number(patientId || '1')
      const updatedPatientId = String(patientIdNumber + 1)

      const response = await hicScanService.submitPatientForm(
        updatedPatientId,
        womanHistoryData
      )
      
      console.log('Form submitted successfully:', response)
      
      // Navigate to results screen with the response data
      navigate('/results', { state: { data: response } })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el formulario'
      console.error('Error submitting form:', error)
      setError(errorMessage)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const getFieldType = (field: FormField): string => {
    if (field.options && field.options.length > 0) return 'select'
    if (field.propType === 'string' || field.propType === 'Data Prop') return 'text'
    if (field.propType === 'number' || field.propType === 'integer' || field.propType === 'decimal') return 'number'
    if (field.propType === 'boolean') return 'checkbox'
    if (field.propType === 'Object Prop') return 'select' // Los Object Props pueden tener opciones
    return 'text'
  }

  const renderField = (field: FormField, level: number = 0, sectionId?: string): React.ReactNode => {
    const fieldType = getFieldType(field)
    const hasSubForm = field.subForm && field.subForm.length > 0
    
    // Si el campo no se muestra y no tiene subforms, no mostrar nada
    if (!field.shown && !hasSubForm) return null

    // Si el campo tiene subforms, mostrar como sección colapsable
    if (hasSubForm) {
      const sectionId = field.propUri
      const isExpanded = !expandedSections.has(sectionId)
      
      return (
        <div key={field.propUri} style={{
          marginBottom: '25px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div 
            onClick={() => toggleSection(sectionId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: isExpanded ? '20px' : '0',
              padding: '10px 0',
              borderBottom: isExpanded ? `2px solid ${colors.border.light}` : 'none'
            }}
          >
            <h3 style={{
              color: colors.text.primary,
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
              fontWeight: '600',
              margin: '0'
            }}>
              {field.propLabel}
            </h3>
            <div style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              fontSize: '1.2rem',
              color: colors.primary.main
            }}>
              ▼
            </div>
          </div>
          
          {isExpanded && (
            <div style={{ paddingLeft: '0' }}>
              {field.subForm?.map((subField) => renderField(subField, level + 1, sectionId))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={field.propUri} style={{
        marginBottom: '20px',
        padding: level > 0 ? '15px' : '0',
        background: level > 0 ? 'rgba(248, 249, 250, 0.8)' : 'transparent',
        borderRadius: level > 0 ? '8px' : '0',
        border: level > 0 ? `1px solid ${colors.border.light}` : 'none',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Líneas verticales removidas */}
        
        <label style={{
          marginBottom: '8px',
          fontWeight: '600',
          color: colors.text.primary,
          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
          wordBreak: 'break-word',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Todos los campos son obligatorios */}
          <span style={{ 
            color: colors.status.error,
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            *
          </span>
          {field.propLabel}
        </label>

        {fieldType === 'select' ? (
          <div style={{ position: 'relative' }}>
            <select
              value={String(formData[field.propUri] || '')}
              onChange={(e) => {
                if (e.target.value !== 'no-options') {
                  handleInputChange(field.propUri, e.target.value)
                }
              }}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: '12px 16px',
                border: `2px solid ${colors.border.light}`,
                borderRadius: '8px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                backgroundColor: 'white',
                color: colors.text.primary,
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
                paddingRight: '40px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.main
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.light
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">Seleccionar opción</option>
              {field.options && field.options.length > 0 ? (
                field.options.map((option) => (
                  <option key={option.uri} value={option.uri}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="no-options" disabled>
                  No hay opciones disponibles
                </option>
              )}
            </select>
          </div>
        ) : fieldType === 'text' ? (
          <input
            type="text"
            value={String(formData[field.propUri] || '')}
            onChange={(e) => handleInputChange(field.propUri, e.target.value)}
            placeholder={`Ingrese ${field.propLabel.toLowerCase()}`}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '12px 16px',
              border: `2px solid ${colors.border.light}`,
              borderRadius: '8px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              backgroundColor: 'white',
              color: colors.text.primary,
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary.main
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light
              e.target.style.boxShadow = 'none'
            }}
          />
        ) : fieldType === 'number' ? (
          <input
            type="number"
            value={Number(formData[field.propUri]) || ''}
            onChange={(e) => handleInputChange(field.propUri, Number(e.target.value))}
            placeholder={`Ingrese ${field.propLabel.toLowerCase()}`}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '12px 16px',
              border: `2px solid ${colors.border.light}`,
              borderRadius: '8px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              backgroundColor: 'white',
              color: colors.text.primary,
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary.main
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light
              e.target.style.boxShadow = 'none'
            }}
          />
        ) : fieldType === 'checkbox' ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 16px',
            background: 'white',
            border: `2px solid ${colors.border.light}`,
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={Boolean(formData[field.propUri])}
              onChange={(e) => handleInputChange(field.propUri, e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                flexShrink: 0,
                accentColor: colors.primary.main,
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              color: colors.text.primary,
              fontWeight: '500'
            }}>
              {field.propLabel}
            </span>
          </div>
        ) : (
          <textarea
            value={String(formData[field.propUri] || '')}
            onChange={(e) => handleInputChange(field.propUri, e.target.value)}
            rows={4}
            placeholder={`Ingrese ${field.propLabel.toLowerCase()}`}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '12px 16px',
              border: `2px solid ${colors.border.light}`,
              borderRadius: '8px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              backgroundColor: 'white',
              color: colors.text.primary,
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary.main
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light
              e.target.style.boxShadow = 'none'
            }}
          />
        )}

        {field.subForm && field.subForm.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(248, 249, 250, 0.5)',
            borderRadius: '8px'
          }}>
            {field.subForm.map((subField) => renderField(subField, level + 1, sectionId))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        width: '100vw',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.border.light}`,
            borderTop: `4px solid ${colors.primary.main}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{
            color: colors.text.primary,
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            wordBreak: 'break-word',
            fontWeight: '500'
          }}>
            Cargando formulario...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        width: '100vw',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '500px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '4rem',
            color: colors.status.error,
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h2 style={{
            color: colors.status.error,
            marginBottom: '20px',
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontWeight: '600'
          }}>
            Error al cargar el formulario
          </h2>
          <p style={{
            color: colors.text.primary,
            marginBottom: '30px',
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            wordBreak: 'break-word',
            lineHeight: '1.5'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
              color: 'white',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '25px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              maxWidth: '300px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            Volver a la lista de pacientes
          </button>
        </div>
      </div>
    )
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
        width: '100vw',
        margin: '0',
        background: 'transparent',
        borderRadius: '0',
        padding: '20px clamp(20px, 5vw, 40px)',
        boxShadow: 'none',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
            gap: '20px'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                color: colors.text.primary,
                marginBottom: '10px',
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                fontWeight: '700',
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Formulario de Evaluación
              </h1>
              {patient && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    fontWeight: '600'
                  }}>
                    👤 {patient.nombre}
                  </div>
                  <div style={{
                    background: colors.border.light,
                    color: colors.text.primary,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    fontWeight: '500',
                    border: `1px solid ${colors.border.medium}`
                  }}>
                    {patient.genero === 'M' ? '👨' : '👩'} {patient.edad} años
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: `linear-gradient(135deg, ${colors.secondary.main}, ${colors.primary.main})`,
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '25px',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(118, 75, 162, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(118, 75, 162, 0.3)'
              }}
            >
              <span>←</span>
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {form && form.map((field) => renderField(field))}
          
          {/* Submit Buttons */}
          <div style={{
            marginTop: '50px',
            paddingTop: '30px',
            borderTop: `2px solid ${colors.border.light}`,
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            justifyContent: 'center',
            gap: '20px',
            width: '100%'
          }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: colors.border.medium,
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                cursor: 'pointer',
                fontWeight: '600',
                width: window.innerWidth < 768 ? '100%' : 'auto',
                minWidth: '150px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={missingFieldsCount > 0 || loading}
              style={{
                background: missingFieldsCount > 0 || loading
                  ? `linear-gradient(135deg, ${colors.border.medium}, #9ca3af)`
                  : `linear-gradient(135deg, ${colors.status.success}, #10b981)`,
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                cursor: missingFieldsCount > 0 || loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                width: window.innerWidth < 768 ? '100%' : 'auto',
                minWidth: '150px',
                transition: 'all 0.2s ease',
                boxShadow: missingFieldsCount > 0 || loading
                  ? '0 4px 15px rgba(156, 163, 175, 0.3)'
                  : '0 4px 15px rgba(16, 185, 129, 0.3)',
                opacity: missingFieldsCount > 0 || loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (missingFieldsCount === 0 && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (missingFieldsCount === 0 && !loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {loading 
                ? 'Enviando...' 
                : missingFieldsCount > 0 
                ? `Completar ${missingFieldsCount} campos restantes`
                : 'Enviar Formulario'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormScreen