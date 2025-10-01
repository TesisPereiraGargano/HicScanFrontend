// API data type - represents the raw data structure from the API
export interface ApiFormOption {
  label: string
  uri: string
}

export interface ApiFormField {
  propLabel: string
  propUri: string
  domain: string
  range: string
  propType: string
  functional: boolean
  inverseFunctional: boolean
  options: ApiFormOption[] | null
  subForm: ApiFormField[] | null
  canBeTransparented: boolean
  shown: boolean
}

export type ApiForm = ApiFormField[]

// Domain data type - represents the processed data structure for the application
export interface FormOption {
  label: string
  uri: string
}

export interface FormField {
  propLabel: string
  propUri: string
  domain: string
  range: string
  propType: string
  functional: boolean
  inverseFunctional: boolean
  options: FormOption[] | null
  subForm: FormField[] | null
  canBeTransparented: boolean
  shown: boolean
}

export type Form = FormField[]

// Function to transform API data to domain data
const transformOption = (apiOption: ApiFormOption): FormOption => {
  return {
    label: apiOption.label,
    uri: apiOption.uri
  }
}

const transformField = (apiField: ApiFormField): FormField => {
  return {
    propLabel: apiField.propLabel,
    propUri: apiField.propUri,
    domain: apiField.domain,
    range: apiField.range,
    propType: apiField.propType,
    functional: apiField.functional,
    inverseFunctional: apiField.inverseFunctional,
    options: apiField.options ? apiField.options.map(transformOption) : null,
    subForm: apiField.subForm ? apiField.subForm.map(transformField) : null,
    canBeTransparented: apiField.canBeTransparented,
    shown: apiField.shown
  }
}

export const toDomain = (apiData: ApiForm): Form => {
  return apiData.map(transformField)
} 