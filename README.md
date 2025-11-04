# HicScanFrontend

Aplicación web frontend para la gestión y evaluación de pacientes mediante formularios dinámicos. Esta aplicación permite visualizar pacientes, completar formularios de evaluación médica y obtener recomendaciones basadas en los datos ingresados.

## ¿Qué hace esta aplicación?

HicScanFrontend es una interfaz de usuario desarrollada con React y TypeScript que permite:

- **Lista de Pacientes**: Visualizar una lista de pacientes con su información básica (nombre, edad, género, altura, peso)
- **Formulario de Evaluación**: Completar formularios dinámicos de evaluación médica para cada paciente seleccionado
- **Resultados**: Visualizar recomendaciones y resultados después de enviar el formulario

La aplicación se conecta a un backend API para obtener los datos de pacientes, la configuración de formularios y enviar las respuestas para generar recomendaciones.

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio o navega a la carpeta del proyecto:
```bash
cd HicScanFrontend
```

2. Instala las dependencias:
```bash
npm install
```

## Ejecutar la Aplicación

### Modo Desarrollo

Para ejecutar la aplicación en modo desarrollo con hot-reload:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne automáticamente).

### Compilar para Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

### Vista Previa de Producción

Para previsualizar la versión compilada:

```bash
npm run preview
```

## Configuración

La aplicación se conecta a un backend API. La URL del backend se configura mediante la variable de entorno `VITE_HIC_SCAN_BACKEND`. Si no está configurada, la aplicación usará por defecto: `http://179.27.97.6:8082`

Para configurar una URL personalizada, crea un archivo `.env` en la raíz del proyecto:

```
VITE_HIC_SCAN_BACKEND=http://tu-backend-url:puerto
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Previsualiza la versión compilada
- `npm run lint` - Ejecuta el linter para verificar el código

## Tecnologías Utilizadas

- **React 19** - Biblioteca para construir la interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción y desarrollo
- **React Router DOM** - Enrutamiento para aplicaciones React
- **ESLint** - Linter para mantener la calidad del código

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes reutilizables
  ├── screens/      # Pantallas principales de la aplicación
  │   ├── PatientListScreen.tsx
  │   ├── FormScreen.tsx
  │   └── ResultsScreen.tsx
  ├── services/       # Servicios para comunicación con API
  ├── types/          # Definiciones de tipos TypeScript
  └── themes/         # Configuración de temas y colores
```