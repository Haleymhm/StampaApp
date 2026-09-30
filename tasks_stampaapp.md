# Plan de Trabajo y Lista de Tareas — StampaApp

Este documento contiene la hoja de ruta detallada paso a paso para la construcción e implementación completa de **StampaApp** (Next.js, Tailwind CSS, Prisma ORM, PostgreSQL y Canvas Engine).

---

## Fase 1: Configuración del Entorno y Base de Datos

### 1.1. Inicialización del Proyecto Next.js
- [ ] **TAREA-101:** Crear la aplicación Next.js (App Router) con TypeScript, Tailwind CSS y `pnpm` (`pnpm create next-app@latest`).
- [ ] **TAREA-102:** Configurar la estructura de carpetas estándar (`/src/app`, `/src/components`, `/src/lib`, `/src/hooks`, `/src/types`).
- [ ] **TAREA-103:** Configurar variables de entorno (`.env.local`) para conexión a BD (`DATABASE_URL`) y credenciales de Storage S3/Cloud Storage.
- [ ] **TAREA-103B:** Instalar **Zod** (`pnpm add zod`) y crear la arquitectura de contratos/validaciones en `/src/lib/validations/` para soportar el diseño **API-First** (validación de payloads de entrada, esquemas de diseño y respuestas estandarizadas).

### 1.2. Configuración del ORM y Base de Datos
- [ ] **TAREA-104:** Instalar e inicializar **Prisma ORM** (`pnpm add @prisma/client`, `pnpm add -D prisma`).
- [ ] **TAREA-105:** Copiar el esquema `schema.prisma` diseñado y ejecutar la migración inicial (`pnpm prisma migrate dev --name init`).
- [ ] **TAREA-106:** Crear script de *seeding* (`prisma/seed.ts`) para poblar categorías maestro, técnicas base (`dtf`, `sublimation`, `embroidery`) e imágenes iniciales de la galería pública.

---

## Fase 2: Panel de Administración (Backoffice)

### 2.1. Autenticación y Layout Administrativo
- [ ] **TAREA-201:** Configurar sistema de autenticación RBAC con NextAuth.js / Auth.js o JWT basado en el modelo `User` (roles `admin`, `operator` y `customer`).
- [ ] **TAREA-202:** Diseñar el layout base del Admin (`/src/app/admin/layout.tsx`) con barra lateral de navegación para Catálogo, Galería y Pedidos.

### 2.2. CRUD de Catálogo
- [ ] **TAREA-203:** Crear módulo de gestión de **Categorías** (Listar, Crear, Editar, Eliminar).
- [ ] **TAREA-204:** Crear módulo de gestión de **Productos Base** con asignación de categorías y selección de técnicas permitidas (`DTF`, `Sublimación`, `Bordado`).
- [ ] **TAREA-205:** Crear módulo de **Variantes de Producto** (Cargar mockups limpios por color, definir tallas/capacidades y asignar SKU único).

### 2.3. Herramienta de Delimitación de Áreas Imprimibles (`Printable Areas`)
- [ ] **TAREA-206:** Desarrollar interfaz interactiva (Canvas/SVG) para dibujar el Bounding Box ($X, Y, \text{Ancho}, \text{Alto}$) sobre la imagen del mockup.
- [ ] **TAREA-207:** Añadir campos de entrada numéricos obligatorios para dimensiones físicas reales en milímetros (`physical_width_mm`, `physical_height_mm`).
- [ ] **TAREA-208:** Implementar toggles de configuración especial: `has_center_seam` (línea guía para gorras de 6 paneles) e `is_curved` (productos cilíndricos/tazas).

### 2.4. Gestión de Galería Pública
- [ ] **TAREA-209:** Crear módulo para subir recursos gráficos públicos (Carga de versión WebP/PNG para previsualización web y SVG/PNG a 300 DPI para producción).

---

## Fase 3: Editor Interactivo de Personalización (Frontend Canvas)

### 3.1. Estructura y Carga del Canvas UI
- [ ] **TAREA-301:** Integrar librería de Canvas 2D (Fabric.js o Konva.js) en un componente de React (`/src/components/canvas/Editor.tsx`).
- [ ] **TAREA-302:** Renderizar dinámicamente el mockup del producto y restringir la zona editable al Bounding Box configurado.
- [ ] **TAREA-303:** Implementar selector de vistas (Pecho, Espalda, Lateral, Wrap) y alternancia de variantes/colores conservando las capas.

### 3.2. Herramientas de Edición e Interacción
- [ ] **TAREA-304:** Desarrollar módulo para subir imágenes propias (PNG, JPG, SVG) y modal de selección de la Galería Pública.
- [ ] **TAREA-305:** Implementar controles de capa: Mover, escalar proporcionalmente, rotar ($0^\circ\text{--}360^\circ$), duplicar, eliminar y reordenar (traer al frente/enviar al fondo).

### 3.3. Algoritmos de Validaciones Técnicas y Pre-producción
- [ ] **TAREA-306:** Crear cálculo automático de **DPI Efectivos** en tiempo real e integrar semáforo visual de calidad (Verde $\ge 150$, Amarillo $100\text{--}149$, Rojo $< 100$).
- [ ] **TAREA-307:** Proyectar la línea guía central punteada cuando `has_center_seam = true` en gorras de 6 paneles y emitir advertencia si hay elementos sobre la costura.
- [ ] **TAREA-308:** Aplicar restricciones para la técnica de **Bordado** (alerta de altura mínima de texto $\ge 5\text{ mm}$ y advertencia ante degradados).
- [ ] **TAREA-309:** Implementar persistencia de **Diseños Guardados** (`SavedDesign`): Endpoints API-First `/api/designs` (GET, POST, PUT, DELETE) con validación Zod, modal/botón "Guardar Diseño" en el Canvas y visor de diseños guardados para clientes autenticados.

---

## Fase 4: Proceso de Pedido y Checkout (Sin Pasarela de Pago)

### 4.1. Resumen y Formulario de Cotización
- [ ] **TAREA-401:** Crear componente modal/pantalla con el resumen visual de la personalización por cada vista diseñada.
- [ ] **TAREA-402:** Construir el formulario de captura de datos del cliente (Nombre Completo, Email, Teléfono/WhatsApp, RUT/Tax ID, Dirección).

### 4.2. Persistencia Inmutable de la Orden
- [ ] **TAREA-403:** Crear Endpoint API-First `/api/orders` (Next.js Route Handler) con validación estricta de payload mediante esquema Zod (`createOrderSchema`), manejo de errores 400 normalizados y persistencia en base de datos.
- [ ] **TAREA-404:** Serializar el estado completo del canvas a `canvas_json_design` guardando los snapshots estáticos del producto y variantes en `order_items`.
- [ ] **TAREA-405:** Generar pantalla de confirmación exitosa desplegando el número de pedido correlativo único (ej. `#1001`).

---

## Fase 5: Motor de Renderizado de Producción (Backend Engine)

### 5.1. Render Server-Side a 300 DPI
- [ ] **TAREA-501:** Desarrollar servicio de renderizado server-side (utilizando Canvas Node / Sharp) que procese el objeto `canvas_json_design`.
- [ ] **TAREA-502:** Calcular la resolución exacta en píxeles a partir de las dimensiones físicas en $\text{mm}$ ($\text{px} = \frac{\text{mm}}{25.4} \times 300$).
- [ ] **TAREA-503:** Exportar imagen final en fondo transparente (PNG a 300 DPI) por cada zona personalizada.

### 5.2. Generación de Hoja de Ruta y Empaquetado
- [ ] **TAREA-504:** Crear plantilla PDF (**Worksheet de Taller**) que resuma datos del cliente, mockup impreso y especificaciones físicas de la técnica.
- [ ] **TAREA-505:** Compilar el paquete `.zip` conteniendo los PNGs a 300 DPI, archivo vectorial (si aplica) y la Worksheet en PDF.
- [ ] **TAREA-506:** Subir el archivo `.zip` generado a Storage privado y asociar la URL firmada al registro de la orden.

---

## Fase 6: Tablero de Control de Pedidos y Pruebas QA

### 6.1. Gestión de Pedidos en Backoffice
- [ ] **TAREA-601:** Construir vista de lista/Kanban de pedidos en el Admin con filtro por estado (`PENDING_REVIEW`, `QUOTED`, `IN_PRODUCTION`, `READY_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`).
- [ ] **TAREA-602:** Integrar botón "Generar Assets de Producción" que ejecute el motor de renderizado a 300 DPI y habilite el botón de descarga del `.zip`.

### 6.2. Pruebas y Control de Calidad
- [ ] **TAREA-603:** Ejecutar los casos de prueba BDD/Gherkin definidos en `qa_requirements_stampaapp.md` para los módulos de cliente y administrador.
- [ ] **TAREA-604:** Realizar pruebas físicas de impresión/estampado con los archivos generados a 300 DPI para validar precisión milimétrica y fidelidad de color.
