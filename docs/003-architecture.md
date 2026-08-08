# Mariana OS — Software Architecture

> *"La arquitectura no define únicamente cómo se construye el software; define cómo podrá evolucionar durante los próximos años sin perder su identidad."*

---

# 1. Propósito

Este documento describe la arquitectura de alto nivel de Mariana OS.

Su objetivo es establecer la organización del sistema, las responsabilidades de cada módulo y las relaciones entre sus componentes principales.

No pretende documentar detalles de implementación ni decisiones técnicas específicas. Dichas decisiones serán registradas mediante Architecture Decision Records (ADR) en `009-decisions.md`.

La arquitectura presentada aquí responde a los principios definidos en:

- `000-product-vision.md`
- `001-product-principles.md`
- `002-roadmap.md`

---

# 2. Objetivos Arquitectónicos

La arquitectura de Mariana OS debe cumplir los siguientes objetivos:

- Facilitar la evolución del producto.
- Favorecer una alta cohesión y bajo acoplamiento.
- Mantener independencia entre dominio e infraestructura.
- Permitir incorporar nuevas aplicaciones sin modificar el núcleo del sistema.
- Garantizar reutilización mediante Web Components.
- Mantener una experiencia de usuario consistente.
- Ser fácilmente mantenible.
- Servir como referencia para futuras decisiones técnicas.

---

# 3. Drivers Arquitectónicos

Los siguientes factores impulsan las decisiones arquitectónicas del proyecto.

| Driver | Impacto |
|---------|----------|
| Escalabilidad | Nuevas aplicaciones deberán incorporarse sin modificar el Core. |
| Mantenibilidad | Código organizado por responsabilidades. |
| Modularidad | Cada aplicación funciona como un módulo independiente. |
| Reutilización | Componentes compartidos mediante Design System. |
| Rendimiento | Carga progresiva y componentes ligeros. |
| Experiencia | Las decisiones técnicas nunca deben perjudicar la narrativa. |

---

# 4. Principios Arquitectónicos

## A1. Core First

El núcleo del sistema siempre será independiente de las aplicaciones.

Las aplicaciones utilizan servicios del sistema, pero el sistema no depende de ellas.

---

## A2. Modularidad

Cada aplicación representa un módulo independiente.

Las dependencias entre módulos deben minimizarse.

---

## A3. Independencia Tecnológica

El dominio no dependerá de tecnologías específicas.

Las capas externas podrán cambiar sin afectar la lógica de negocio.

---

## A4. Responsabilidad Única

Cada componente, servicio o módulo tendrá una única responsabilidad claramente definida.

---

## A5. Evolución Continua

La arquitectura deberá permitir incorporar nuevas aplicaciones durante años sin requerir una reestructuración significativa.

---

# 5. Visión General

Mariana OS se concibe como una plataforma compuesta por un núcleo (Core) y un conjunto de aplicaciones que se ejecutan sobre él.

```text
                 Mariana OS

      ┌────────────────────────────┐
      │         Applications        │
      ├────────────────────────────┤
      │ Photos                     │
      │ Letters                    │
      │ Timeline                   │
      │ Dreams                     │
      │ Music                      │
      │ Settings                   │
      └────────────▲───────────────┘
                   │
      ┌────────────┴───────────────┐
      │       System Services      │
      ├────────────────────────────┤
      │ Window Manager             │
      │ Theme Manager              │
      │ Notification Center        │
      │ Search                     │
      │ State Store                │
      │ Router                     │
      └────────────▲───────────────┘
                   │
      ┌────────────┴───────────────┐
      │        OS Kernel           │
      └────────────────────────────┘
```

---

# 6. Arquitectura Lógica

La arquitectura lógica se divide en cinco grandes bloques.

## 6.1 OS Kernel

Representa el núcleo del sistema.

Responsabilidades:

- Inicialización.
- Configuración global.
- Registro de aplicaciones.
- Ciclo de vida.
- Dependencias del sistema.

---

## 6.2 System Services

Servicios compartidos disponibles para todas las aplicaciones.

Incluye:

- Window Manager
- Theme Engine
- Notification Service
- Search Engine
- Router
- Global State
- File Explorer
- Clipboard

---

## 6.3 Native Applications

Cada aplicación implementa una funcionalidad específica.

Ejemplos:

- Photos.app
- Letters.app
- Timeline.app
- Dreams.app
- Music.app
- Settings.app

Todas utilizan los servicios del sistema.

---

## 6.4 Shared Platform

Componentes reutilizables.

Incluye:

- Design System
- Iconografía
- Tipografía
- Tokens
- Componentes base
- Utilidades

---

## 6.5 Backend Services

Responsables de la persistencia de datos.

Implementados mediante:

- ASP.NET Core
- Entity Framework Core
- PostgreSQL

---

# 7. Arquitectura del Frontend

Tecnologías:

- Lit
- TypeScript
- Web Components
- Vite
- CSS nativo
- Motion One

Organización conceptual:

```
Frontend

├── Core
├── Apps
├── Shared
├── Design System
├── Infrastructure
└── Assets
```

---

# 8. Arquitectura del Backend

El backend seguirá los principios de Clean Architecture.

```text
Presentation

↓

Application

↓

Domain

↓

Infrastructure
```

Cada capa dependerá únicamente de las capas internas.

---

# 9. Comunicación

La comunicación seguirá un modelo desacoplado.

```text
Application

↓

System API

↓

Core Service

↓

Backend API

↓

Database
```

Las aplicaciones nunca accederán directamente a la base de datos.

---

# 10. Gestión de Estado

El estado se divide en tres niveles.

## Global

Información compartida por todo el sistema.

Ejemplo:

- Tema
- Usuario
- Idioma
- Configuración

---

## Application

Estado propio de cada aplicación.

Ejemplo:

- Fotografías abiertas.
- Carta seleccionada.
- Música actual.

---

## Local

Estado interno de un componente.

---

# 11. Organización del Repositorio

```text
mariana-os/

docs/

frontend/

backend/

docker/

.github/
```

El detalle de cada carpeta será documentado posteriormente.

---

# 12. Flujo General

```mermaid
flowchart TD

A[Browser]

↓

B[Mariana OS]

↓

C[OS Kernel]

↓

D[System Services]

↓

E[Applications]

↓

F[Backend API]

↓

G[(PostgreSQL)]
```

---

# 13. Patrones Arquitectónicos

El proyecto utilizará principalmente:

- Clean Architecture
- Component-Based Architecture
- Feature-Based Organization
- Repository Pattern
- Dependency Injection
- Event-Driven Communication
- Composition over Inheritance

---

# 14. Consideraciones de Escalabilidad

La arquitectura permitirá:

- nuevas aplicaciones;
- nuevos módulos;
- nuevos servicios del sistema;
- múltiples temas;
- internacionalización;
- sincronización futura;
- integración con servicios externos.

Sin necesidad de modificar el núcleo.

---

# 15. Riesgos Arquitectónicos

| Riesgo | Mitigación |
|----------|------------|
| Acoplamiento excesivo | Interfaces bien definidas |
| Crecimiento desordenado | Organización por dominio |
| Duplicación | Componentes compartidos |
| Complejidad innecesaria | ADR obligatorias |

---

# 16. Referencias

- `000-product-vision.md`
- `001-product-principles.md`
- `002-roadmap.md`
- `004-design-system.md`
- `005-component-library.md`
- `007-domain-model.md`
- `009-decisions.md`