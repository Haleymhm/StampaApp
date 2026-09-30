# Constitución del Proyecto: StampaApp

## Visión General y Propósito
**StampaApp** es un software y plataforma interactiva de personalización de productos (textiles, promocionales y gorras) y gestión de pedidos para producción multitécnica de alta calidad (**DTF, Sublimación y Bordado**).

El software prioriza la **fidelidad gráfica**, la **autonomía administrativa** y la **simplicidad en la captura de pedidos**, operando bajo un modelo de cotización/pedido directo sin pasarela de pago integrada en la fase inicial.

---

## 1. Principios Arquitectónicos

### 1.1. Desacoplamiento Gráfico y Lógica de Dominio
* La lógica de interacción en el lienzo (**Canvas UI**) debe mantenerse totalmente aislada del procesamiento de alta resolución en el servidor (**Print Renderer**).
* El cliente solo transmite la definición vectorial/estructural del diseño en formato **JSON estructurado** (coordenadas, escala, rotación, capas, IDs de recursos, técnica seleccionada).
* Ningún archivo rasterizado final para producción debe ser generado exclusivamente por el cliente; la generación de assets a **300 DPI** es responsabilidad del Backend de StampaApp.

### 1.2. Configuración Dinámica impulsada por el Administrador (Data-Driven UI)
* Ningún parámetro físico (áreas de impresión, coordenadas, productos, variantes, técnicas permitidas o límites de resolución) debe estar codificado de manera fija (*hardcoded*) en el Frontend.
* El canvas debe renderizarse dinámicamente en función de la metainformación provista por el backend (`PrintableAreas` con límites $X, Y, \text{Ancho}, \text{Alto}$, presencia de costuras centrales o tipo de curvatura).

### 1.3. Integridad y Calidad de Producción
* Todo recurso subido por el cliente debe ser validado antes y después de la transmisión.
* **Control de Calidad Pre-producción:** La aplicación debe calcular los **DPI efectivos** del diseño según el tamaño físico configurado y emitir advertencias si la resolución cae por debajo de 150 DPI.
* Todos los archivos generados para imprenta deben procesarse con canal alfa transparente (PNG de alta densidad) o formato vectorial adecuado para producción/ponchado.

### 1.4. Arquitectura API-First y Validación Estricta con Zod
* **Enfoque API-First:** Todas las operaciones y reglas del backend deben residir detrás de contratos de API RESTful estructurados (`/api/...`), permitiendo que el Storefront del cliente, el Backoffice administrativo y futuros clientes consuman los mismos endpoints de manera agnóstica y predecible.
* **Validación Universal con Zod:** La validación de tipos y esquemas de datos en tiempo de ejecución debe ser obligatoria mediante **Zod**. Ningún payload (solicitud de pedido, mutaciones de catálogo, coordenadas de áreas o JSON del canvas) debe alcanzar la capa de persistencia o el motor de renderizado sin superar la validación de su respectivo esquema tipado.

---

## 2. Reglas Específicas por Técnica de Personalización

| Técnica | Formato de Salida Backend | Requisitos Gráficos y Validaciones |
| :--- | :--- | :--- |
| **DTF (Direct-to-Film)** | PNG a 300 DPI (CMYK) con canal alfa transparente | Soporta sin límites degradados, transparencias y alto nivel de detalle en textiles de algodón o poliéster. |
| **Sublimación** | PNG / PDF a 300 DPI en espacio CMYK | Diseñado para poleras de poliéster claras, tazas, termos, vasos y gorras trucker. **No imprime color blanco** (el blanco del diseño se asume como el fondo del producto). |
| **Bordado** | Vectorial (SVG / PDF) + Vista previa de mapa de hilos | Aplicable a polos, gorras estructuradas y chaquetas. Exige límite de colores (paleta de hilos predefinida), restricción de grosor mínimo de trazo ($\ge 1\text{ mm}$) y altura mínima de texto ($\ge 5\text{ mm}$). Requiere generación posterior de matriz de bordado (ponchado). |

---

## 3. Especificaciones para Gorras y Productos Curvos / Con Costura

### 3.1. Tipología y Delimitación de Áreas en Gorras
Las gorras deben categorizarse según su construcción para limitar visual y técnicamente lo que el cliente puede diseñar en StampaApp:

1. **Gorras Trucker / Malla (5 Paneles):** Frente plano acolchado de poliéster sin costura central.
   * *Técnicas admitidas:* DTF, Sublimación, Bordado.
   * *Área máxima sugerida:* $120\text{ mm} \times 65\text{ mm}$ (Frente).
2. **Gorras Acrílicas / Drill / Snapback (6 Paneles):** Frente estructurado con costura central vertical.
   * *Técnicas admitidas:* DTF, Bordado. *(Sublimación deshabilitada por interferencia de la costura).*
   * *Área máxima sugerida:* $120\text{ mm} \times 60\text{ mm}$.
   * *Advertencia visual:* El canvas de StampaApp debe renderizar la **Línea de Costura Virtual** cuando el producto sea de 6 paneles para prevenir la ubicación de textos o detalles muy finos sobre la costura.
3. **Zonas Complementarias:**
   * **Laterales (Izquierdo / Derecho):** Máximo $50\text{ mm} \times 30\text{ mm}$.
   * **Posterior (Sobre el cierre):** Máximo $60\text{ mm} \times 25\text{ mm}$.

### 3.2. Productos Cilíndricos y Curvos (Tazas, Termos, Vasos)
* El editor debe soportar la configuración de plantilla de **Wrap Completo (Envolvente)** o **Vistas Frontal / Posterior**.
* En vistas panorámicas de productos cilíndricos, el Canvas debe mostrar guías de margen de seguridad para evitar colocar elementos importantes cerca de las asas (en el caso de tazas) o en los bordes de la curvatura.

---

## 4. Roles y Matriz de Control de Acceso (RBAC)

### 4.1. Perfil Cliente Invitado (Guest / Unauthenticated)
* **Alcance:** Acceso al catálogo de productos, personalizador interactivo (Canvas), selección de técnica permitida por producto, galería pública de diseños, carga de archivos propios y generación de solicitudes de pedido directas.
* **Restricciones:** No requiere registro. No puede almacenar borradores persistentes en la nube para continuar después sin registrarse.

### 4.2. Perfil Cliente Registrado (Role: `customer`)
* **Alcance:** Todo lo del cliente invitado, sumado a la capacidad de **guardar borradores de sus diseños** (`SavedDesign`), editarlos, eliminarlos y continuar su personalización en sesiones futuras. Historial y seguimiento de sus solicitudes de pedido.

### 4.3. Perfil Operador de Taller (Role: `operator`)
* **Alcance:** Tablero Kanban de pedidos, cambio de estados operacionales (`PENDING_REVIEW` $\rightarrow$ `IN_PRODUCTION` $\rightarrow$ `READY_FOR_DELIVERY`), ejecución del motor de renderizado y descarga del **Paquete de Producción** (PNG 300 DPI + Hoja de ruta / Worksheet).

### 4.4. Perfil Administrador (Role: `admin`)
* **Alcance:** Control total sobre el sistema: gestión de usuarios y roles, catálogo (CRUD de productos, colores, tallas/capacidades), configuración de mockups, técnica permitida por producto, calibración de zonas imprimibles (`PrintableAreas`) y gestión de la Galería Pública.

---

## 5. Estándares Técnicos y Arquitectura de Datos

### 5.1. Esquema JSON Canónico del Diseño (`StampaApp Design Schema`)

```json
{
  "system": "StampaApp",
  "productId": "uuid",
  "variantId": "uuid",
  "selectedTechnique": "dtf|sublimation|embroidery",
  "views": [
    {
      "areaId": "front_panel",
      "dimensionsMm": { "width": 120, "height": 65 },
      "hasCenterSeam": true,
      "layers": [
        {
          "type": "image",
          "sourceType": "user_upload|gallery",
          "fileUrl": "https://storage.../raw_image.png",
          "transform": {
            "x": 30.0,
            "y": 15.0,
            "scaleX": 1.0,
            "scaleY": 1.0,
            "rotation": 0
          }
        }
      ]
    }
  ]
}
```

### 5.2. Validación de Contratos con Zod
* Toda entidad de entrada y salida, incluyendo el `StampaApp Design Schema`, debe tener un esquema Zod correspondiente (`z.object({...})`) en `/src/lib/validations/`.
* Los Route Handlers (`/api/...`) deben validar el `body`, `query` y `params` usando `.safeParse()` o equivalentes de Zod, retornando errores 400 formateados ante cualquier inconsistencia antes de ejecutar lógica de base de datos o renderizado.