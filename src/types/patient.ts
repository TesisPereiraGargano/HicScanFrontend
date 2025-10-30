// Patient data types
export interface BasicPatientInfo {
  id: string
  nombre: string
  genero: 'M' | 'F'
  fechaNacimiento: string
  estadoCivil: string | null
  raza: string | null
  lugarNacimiento: string | null
  alturaValor: string
  alturaUnidad: string
  pesoValor: string
  pesoUnidad: string
  edad: number
}

export interface BasicPatientData {
  nombre: string
  genero: string
  fechaNacimiento: string
  estadoCivil: string | null
  raza: string | null
  lugarNacimiento: string | null
  alturaValor: string
  alturaUnidad: string
  pesoValor: string
  pesoUnidad: string
  edad: number
}

// Types for form submission
export interface SubmitFormRequest {
  id: string
  womanHistoryData: Record<string, string>
}

export interface DrugCode {
  snomedCT: string
  rxnorm: string
  cui: string
}

export interface Drug {
  codigos: DrugCode
  nombre: string
}

export interface Medication {
  name: string
  doseQuantityUnit: string | null
  doseQuantityValue: string | null
  periodAdministrationValue: string | null
  periodAdministrationUnit: string | null
  drugs: Drug[]
}

export interface ClassifiedMedications {
  diureticos: Medication[]
  noDiureticos: Medication[]
}

export interface Medications {
  clasificados: ClassifiedMedications
  noClasificados: Medication[]
}

export interface PatientData {
  datosBasicosPaciente: BasicPatientData
  medicamentos: Medications
}

export interface ReasoningResult {
  derivedStatements: string[]
  derivations: unknown[]
  totalStatements: number
  success: boolean
  errorMessage: string | null
}

export interface SubmitFormResponse {
  datosPaciente: PatientData
  reasoningResult: ReasoningResult
}

