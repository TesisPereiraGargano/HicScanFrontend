import type { ApiForm, Form } from '../types/form'
import { toDomain } from '../types/form'
import type {
  BasicPatientInfo,
  SubmitFormRequest,
  SubmitFormResponse
} from '../types/patient'

const API_BASE_URL = import.meta.env.VITE_HIC_SCAN_BACKEND

export class HicScanService {
  private baseUrl: string
  private ontology: string

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://179.27.97.6:8082'
    // this.baseUrl = 'http://localhost:8082'
    this.ontology = 'hicscan.rdf';
  }

  /**
   * Fetches form data from the HIC Scan API
   * @param classUri - The class URI for the form
   * @returns Promise<Form> - The transformed form data
   */
  async getFormData(classUri: string = 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C14284', riskModelUri: string = 'http://purl.org/ontology/breast_cancer_recommendation%23UY_model'): Promise<Form> {
    try {
      const url = `${this.baseUrl}/hicscan-api/config/v1/ontologies/${this.ontology}/risk-model/form?classUri=${encodeURIComponent(classUri)}&riskModelUri=${encodeURIComponent(riskModelUri)}`


      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiData: ApiForm = await response.json()
      return toDomain(apiData)
    } catch (error) {
      console.error('Error fetching form data:', error)
      throw new Error(`Failed to fetch form data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fetches all basic patient information from the HCE API
   * @returns Promise<BasicPatientInfo[]> - Array of basic patient information
   */
  async getPatients(): Promise<BasicPatientInfo[]> {
    try {
      const url = `${this.baseUrl}/HCE/obtenerTodosLosPacientesBasicos`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BasicPatientInfo[] = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching basic patients:', error)
      throw new Error(`Failed to fetch basic patients: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Submits form data to get patient recommendations
   * @param patientId - The patient ID
   * @param womanHistoryData - The form data mapping question URIs to answer URIs or values
   * @returns Promise<SubmitFormResponse> - The response from the API
   */
  async submitPatientForm(patientId: string, womanHistoryData: Record<string, string>): Promise<SubmitFormResponse> {
    const url = `${this.baseUrl}/HCE/obtenerDatosPacienteExtendidoConRecomendaciones`

    const requestBody: SubmitFormRequest = {
      id: patientId,
      womanHistoryData
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubmitFormResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error submitting form data:', error)
      throw new Error(`Failed to submit form data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export a singleton instance
export const hicScanService = new HicScanService()
