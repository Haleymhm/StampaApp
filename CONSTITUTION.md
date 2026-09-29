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

### 4.1. Perfil Cliente (Unauthenticated / Public User)
* **Alcance:** Acceso al catálogo de productos, personalizador interactivo (Canvas), selección de técnica permitida por producto, galería pública de diseños, carga de archivos propios y generación de solicitudes de pedido.
* **Restricciones:** No requiere autenticación previa. No puede acceder a datos de otros pedidos ni a los archivos fuente en alta resolución de la galería.

### 4.2. Perfil Administrador (Authenticated Staff)
* **Alcance:** Control total sobre el catálogo (CRUD de productos, colores, tallas/capacidades), configuración de mockups, técnica permitida por producto y delimitación de zonas imprimibles (incluyendo marcas de costuras o superficies curvas).
* Gestión de la Galería Pública (carga y categorización de cliparts/vectores).
* Gestión de pedidos, cambio de estados operacionales y descarga del **Paquete de Producción** (imágenes a 300 DPI + Hoja de ruta / Worksheet de producción).

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