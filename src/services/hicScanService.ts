import type { ApiForm, Form } from '../types/form'
import { toDomain } from '../types/form'

const API_BASE_URL = import.meta.env.VITE_HIC_SCAN_BACKEND

export interface Patient {
  id: string
  name: string
  cedula: string
}

// Hardcoded patients data
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    cedula: '12345678'
  },
  {
    id: '2',
    name: 'María González',
    cedula: '87654321'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    cedula: '11223344'
  },
  {
    id: '4',
    name: 'Ana Martínez',
    cedula: '44332211'
  },
  {
    id: '5',
    name: 'Luis Fernández',
    cedula: '55667788'
  }
]

export class HicScanService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL || 'http://179.27.97.6:8082'
  }

  /**
   * Fetches form data from the HIC Scan API
   * @param classUri - The class URI for the form
   * @returns Promise<Form> - The transformed form data
   */
  async getFormData(classUri: string = 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C14284'): Promise<Form> {
    try {
      const url = `${this.baseUrl}/hicscan-api/config/v1/ontologies/ontoforms.rdf/classes/form?classUri=${encodeURIComponent(classUri)}`
      
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
   * Gets the list of mock patients
   * @returns Patient[] - Array of patients
   */
  getPatients(): Patient[] {
    return mockPatients
  }

  /**
   * Gets a specific patient by ID
   * @param id - Patient ID
   * @returns Patient | undefined - The patient or undefined if not found
   */
  getPatientById(id: string): Patient | undefined {
    return mockPatients.find(patient => patient.id === id)
  }
}

// Export a singleton instance
export const hicScanService = new HicScanService()
