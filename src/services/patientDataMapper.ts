import type { BasicPatientInfo } from '../types/patient'

/**
 * Mapeo de URIs del formulario a propiedades del BasicPatientInfo
 */
export const PATIENT_FIELD_MAPPING = {
  'http://purl.org/ontology/breast_cancer_recommendation#height': {
    getValue: (patient: BasicPatientInfo) => patient.alturaValor,
    getUnit: (patient: BasicPatientInfo) => patient.alturaUnidad
  },
  'http://purl.org/ontology/breast_cancer_recommendation#weight': {
    getValue: (patient: BasicPatientInfo) => patient.pesoValor,
    getUnit: (patient: BasicPatientInfo) => patient.pesoUnidad
  },
  'http://purl.org/ontology/breast_cancer_recommendation#age': {
    getValue: (patient: BasicPatientInfo) => calculateAge(patient.fechaNacimiento),
    getUnit: () => 'years'
  }
} as const

/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param birthDate - Fecha de nacimiento en formato YYYYMMDD (ej: "19900924")
 * @returns Edad en años
 */
export function calculateAge(birthDate: string): number {
  try {
    const year = parseInt(birthDate.substring(0, 4), 10)
    const month = parseInt(birthDate.substring(4, 6), 10) - 1 // Los meses en JS son 0-indexed
    const day = parseInt(birthDate.substring(6, 8), 10)
    
    const birth = new Date(year, month, day)
    const today = new Date()
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const dayDiff = today.getDate() - birth.getDate()
    
    // Ajustar si aún no ha cumplido años
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }
    
    return age
  } catch (error) {
    console.error('Error calculating age:', error)
    return 0
  }
}

/**
 * Obtiene los datos del paciente mapeados a las URIs del formulario
 * @param patient - Información básica del paciente
 * @returns Objeto con las URIs como keys y los valores correspondientes
 */
export function mapPatientToFormData(patient: BasicPatientInfo): Record<string, string | number> {
  const formData: Record<string, string | number> = {}
  
  for (const [uri, mapper] of Object.entries(PATIENT_FIELD_MAPPING)) {
    const value = mapper.getValue(patient)
    const unit = mapper.getUnit(patient)
    
    // Almacenar tanto el valor como la unidad
    formData[uri] = value
    formData[`${uri}_unit`] = unit
  }
  
  return formData
}

