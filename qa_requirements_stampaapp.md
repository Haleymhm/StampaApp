# Matriz de QA Funcional: Requisitos, Historias de Usuario y Escenarios de Prueba — StampaApp

## 1. Requisitos Funcionales Detallados (RF)

### 1.1. Módulo del Cliente (Storefront & Canvas UI)
* **RF-CLI-01 (Navegación y Catálogo):**
  * El sistema debe permitir al usuario filtrar productos por Categoría (*Vestimenta, Gorras, Promocionales*).
  * Cada ficha de producto debe listar las variantes disponibles (Color, Talla, Capacidad) y las técnicas de personalización permitidas (*DTF, Sublimación, Bordado*).
* **RF-CLI-02 (Canvas Interactivo 2D):**
  * El lienzo debe renderizar dinámicamente el área imprimible ($X, Y, \text{Ancho}, \text{Alto}$) sobre el mockup según la zona seleccionada (ej. *Pecho, Espalda, Wrap, Frente Gorra*).
  * El editor debe soportar la carga de archivos propios en formatos **PNG, JPG y SVG** con un tamaño máximo de $15\text{ MB}$.
  * El usuario debe poder insertar elementos desde la **Galería Pública** de imágenes organizada por categorías.
  * El lienzo debe permitir transformaciones en tiempo real: traslación, escalado proporcional, rotación ($0^\circ$ a $360^\circ$), volteo (horizontal/vertical) y reordenamiento de capas (traer al frente/enviar al fondo).
* **RF-CLI-03 (Control de Calidad Pre-producción en Tiempo Real):**
  * **Cálculo de DPI Efectivos:** El sistema debe calcular continuamente la resolución del diseño en base a la escala actual sobre las dimensiones reales en milímetros ($\text{mm}$):
    $$\text{DPI Efectivo} = \left(\frac{\text{Ancho en Píxeles de la Imagen}}{(\text{Ancho Físico en mm} \times \text{Escala}) / 25.4}\right)$$
  * Si el $\text{DPI Efectivo} < 150\text{ DPI}$, el editor debe mostrar una alerta de advertencia en color amarillo (*"Calidad de Impresión Baja"*).
  * **Reglas por Gorras con Costura:** Para productos tipo Gorra de 6 Paneles, el lienzo debe dibujar una guía punteada vertical correspondiente a la costura central (`has_center_seam = true`). Si un elemento de texto o logotipo con tamaño menor a $15\text{ mm}$ cruza la costura, debe emitir una advertencia de riesgo de deformación.
  * **Reglas para Bordado:** Si la técnica seleccionada es Bordado, el editor debe restringir el texto a una altura mínima de $5\text{ mm}$ y limitar la paleta a un máximo de $8\text{ colores}$ planos.
* **RF-CLI-04 (Captura de Pedido e Inmutabilidad):**
  * El formulario de solicitud de pedido debe solicitar: *Nombre Completo, Email, Teléfono/WhatsApp, RUT/Tax ID y Dirección/Ciudad*.
  * Al confirmar la solicitud, el sistema debe generar un identificador único correlativo (ej. `#1001`) y serializar el estado del lienzo en un objeto `canvas_json_design` e información de variante en `variant_details_snapshot` dentro de la base de datos (`order_items`).
* **RF-CLI-05 (Autenticación y Diseños Guardados de Clientes):**
  * Los clientes pueden registrarse e iniciar sesión con credenciales seguras (modelo `User` con rol `customer`).
  * Los clientes autenticados pueden guardar borradores de sus personalizaciones (`SavedDesign`) con nombre y fecha, ver su galería de diseños guardados, reabrir cualquier diseño en el Canvas para continuar editándolo, o eliminarlo.

---

### 1.2. Módulo de Administración (Backoffice)
* **RF-ADM-01 (Gestión de Productos, Variantes y Técnicas):**
  * El administrador debe poder ejecutar el CRUD completo de Categorías, Productos y Variantes.
  * Debe permitir habilitar o deshabilitar de forma independiente las técnicas (**DTF, Sublimación, Bordado**) para cada producto.
* **RF-ADM-02 (Configuración Visual de Áreas Imprimibles):**
  * El administrador debe contar con una herramienta visual de dibujo (*Bounding Box*) sobre la imagen del mockup para definir las zonas imprimibles.
  * Debe poder ingresar las medidas físicas reales en milímetros ($\text{Ancho mm} \times \text{Alto mm}$) para cada área configurada.
  * Debe poder activar banderas de configuración especial: `has_center_seam` (gorras de 6 paneles) e `is_curved` (tazas, termos y vasos).
* **RF-ADM-03 (Gestión de Galería Pública):**
  * El administrador debe poder cargar imágenes públicas asignándoles categoría, título, miniatura liviana (`WebP`), versión vectorial (`SVG`) y versión de alta resolución (`PNG 300 DPI`).
* **RF-ADM-04 (Gestión de Pedidos y Generación de Assets de Producción):**
  * Tablero de control para cambiar el estado de las órdenes (`PENDING_REVIEW`, `QUOTED`, `IN_PRODUCTION`, `READY_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`).
  * **Motor de Renderizado Server-Side:** Al procesar una orden a estado `IN_PRODUCTION`, el backend debe interpretar el `canvas_json_design` y generar de forma asíncrona:
    1. Archivo PNG sin fondo a **300 DPI** en espacio de color CMYK/RGB transparente.
    2. Archivo SVG vectorial limpio (si aplica bordado).
    3. Documento PDF **Worksheet** (Hoja de Ruta de Taller) con la previsualización del mockup, datos del cliente y especificaciones físicas.
    4. Empaquetado final en archivo comprimido `.zip` disponible para descarga mediante URL firmada.
* **RF-BACK-01 (Arquitectura API-First y Validación Zod):**
  * Todas las transacciones del sistema deben operar a través de Route Handlers `/api/...` respetando el paradigma API-First.
  * Todo payload entrante a la API debe validarse con esquemas Zod; las cargas malformadas deben responder con HTTP 400 y el desglose de errores tipados antes de invocar la capa de datos.

---

## 2. Historias de Usuario (User Stories) con Criterios de Aceptación

### Módulo Cliente

#### HU-CLI-01: Personalización de Producto Multitécnica en Canvas
> **Como** cliente final,  
> **Quiero** seleccionar un producto, elegir una técnica permitida (DTF, Sublimación o Bordado) y ajustar mi diseño en el lienzo interactivo,  
> **Para** previsualizar exactamente cómo quedará el producto antes de solicitar la cotización.

* **Criterios de Aceptación:**
  * **CA-01.1:** El Canvas carga los mockups base limpios y restringe la edición estrictamente al rectángulo del área imprimible activa.
  * **CA-01.2:** Si el usuario cambia la técnica seleccionada (ej. de DTF a Bordado), el editor revalida automáticamente las capas e indica incompatibilidades si existen degradados o más de 8 colores.
  * **CA-01.3:** Permite alternar entre vistas del producto (ej: Pecho, Espalda, Lateral) conservando los cambios realizados en las otras vistas.

#### HU-CLI-02: Validación de Resolución y Alerta DPI en Tiempo Real
> **Como** cliente,  
> **Quiero** que la aplicación evalúe automáticamente la calidad de la imagen que subí,  
> **Para** evitar enviar a imprimir imágenes que resulten borrosas o pixeladas.

* **Criterios de Aceptación:**
  * **CA-02.1:** El sistema calcula el DPI efectivo en tiempo real conforme el usuario escala la imagen dentro del Canvas.
  * **CA-02.2:** Si el DPI efectivo es $\ge 150\text{ DPI}$, el indicador muestra estado verde (*"Excelente Calidad"*).
  * **CA-02.3:** Si el DPI efectivo cae entre $100\text{ DPI}$ y $149\text{ DPI}$, muestra estado amarillo (*"Calidad Aceptable"*).
  * **CA-02.4:** Si el DPI efectivo es $< 100\text{ DPI}$, muestra alerta roja (*"Baja Calidad - Se recomienda reducir tamaño"*).

#### HU-CLI-03: Solicitud de Pedido/Cotización sin Pago en Línea
> **Como** cliente,  
> **Quiero** ingresar mis datos de contacto y enviar mi diseño personalizado al taller,  
> **Para** recibir una cotización formal y confirmación de producción.

* **Criterios de Aceptación:**
  * **CA-03.1:** El formulario valida que el Email tenga formato correcto, el Teléfono contenga solo caracteres numéricos y el RUT/Tax ID sea válido.
  * **CA-03.2:** Al enviar el formulario, el sistema almacena el objeto JSON inmutable del lienzo y genera una confirmación en pantalla con el número de orden correlativo (ej. `#1024`).

---

### Módulo Administrador

#### HU-ADM-01: Configuración de Áreas Imprimibles con Escala Real ($\text{mm}$)
> **Como** Administrador del taller,  
> **Quiero** dibujar la zona imprimible sobre el mockup de un producto y declarar sus dimensiones en milímetros,  
> **Para** que la renderización a 300 DPI coincida milimétricamente con la prenda física.

* **Criterios de Aceptación:**
  * **CA-01.1:** Permite dibujar interactivamente el marco sobre la imagen base del mockup.
  * **CA-01.2:** Exige ingresar de forma obligatoria los campos `physical_width_mm` y `physical_height_mm`.
  * **CA-01.3:** Permite marcar el checkbox `has_center_seam` en gorras de 6 paneles para proyectar la línea guía central en el Canvas del cliente.

#### HU-ADM-02: Descarga del Paquete de Producción a 300 DPI
> **Como** Operador del taller / Impresor,  
> **Quiero** procesar la orden y descargar un paquete `.zip` con los PNGs a 300 DPI y la hoja de trabajo,  
> **Para** enviar los archivos directamente a la máquina DTF o software de ponchado.

* **Criterios de Aceptación:**
  * **CA-02.1:** Al presionar "Generar Assets de Producción", el sistema procesa el render en segundo plano sin congelar la interfaz.
  * **CA-02.2:** El PNG generado posee transparencia en el canal alfa, espacio de color adecuado y la resolución calculada a 300 DPI exactos según las medidas físicas registradas ($1\text{ pulgada} = 25.4\text{ mm} = 300\text{ px}$).
  * **CA-02.3:** El paquete `.zip` generado incluye la Hoja de Trabajo PDF con el mockup, datos del cliente y los PNGs por cada zona diseñada.

---

## 3. Escenarios de Prueba QA (Test Cases & BDD / Gherkin)

### 3.1. Escenarios de Prueba: Módulo Cliente

#### CP-CLI-01: Validación de Carga e Indicador DPI Efectivo
* **ID:** `TC_CLI_001`
* **Módulo:** Canvas UI / Pre-producción
* **Precondiciones:** Cliente navega en el producto "Polera Manga Corta Cotton" con área imprimible de $300\text{ mm} \times 400\text{ mm}$.

```gherkin
Escenario: El cliente escala una imagen propia provocando una caída de DPI por debajo del límite recomendado
  Dado que el cliente está en el personalizador de "Polera Manga Corta Cotton"
  Y el área "Pecho Frontal" está activa (dimensiones físicas: 300mm x 400mm)
  Cuando sube un archivo de imagen PNG con dimensiones de 500x500 píxeles
  Y escala la imagen dentro del Canvas para ocupar un ancho de 250mm
  Entonces el sistema calcula un DPI efectivo de 50.8 DPI
  Y muestra un indicador visual en color rojo con el texto "Atención: Resolución baja (50 DPI)"
  Y despliega un diálogo de advertencia informando que la impresión puede resultar pixelada.
```

#### CP-CLI-02: Personalización de Gorra de 6 Paneles con Costura Central
* **ID:** `TC_CLI_002`
* **Módulo:** Canvas UI / Reglas de Gorras
* **Precondiciones:** Producto "Gorra Snapback 6P" configurado con `has_center_seam = true`.

```gherkin
Escenario: Colocación de un texto pequeño sobre la costura central de una gorra
  Dado que el cliente selecciona la "Gorra Snapback 6P"
  Y activa la vista "Frente" (120mm x 60mm)
  Entonces el Canvas renderiza visualmente una línea vertical punteada en el centro
  Cuando el cliente agrega un texto con altura de 8mm y lo posiciona directamente sobre la línea de costura
  Entonces el editor emite una alerta preventiva: "El texto está sobre la costura central y podría deformarse al bordar o estampar"
  Y permite al cliente decidir si reubicar el elemento o continuar bajo su responsabilidad.
```

#### CP-CLI-03: Restricción de Colores para la Técnica de Bordado
* **ID:** `TC_CLI_003`
* **Módulo:** Canvas UI / Reglas por Técnica
* **Precondiciones:** Producto "Polo Piqué" con técnica "Bordado" activa (máx. 8 colores).

```gherkin
Escenario: Intento de agregar un diseño con degradado continuo para Bordado
  Dado que el cliente selecciona el "Polo Piqué" y la técnica "Bordado"
  Cuando sube una imagen que contiene degradados de color (multicolor)
  Entonces el sistema analiza los colores de la imagen
  Y muestra un mensaje de restricción: "La técnica de bordado no admite degradados de color"
  Y ofrece la opción de aplicar un filtro automático de vectorización/simplificación a colores planos.
```

#### CP-CLI-04: Confirmación e Inmutabilidad de Pedido
* **ID:** `TC_CLI_004`
* **Módulo:** Checkout / Solicitud de Pedido
* **Precondiciones:** Cliente tiene un diseño finalizado en la vista Pecho.

```gherkin
Escenario: Envío exitoso de solicitud de cotización de pedido
  Dado que el cliente completa el diseño de su "Polerón Canguro"
  Y hace clic en "Solicitar Cotización"
  Cuando completa los campos obligatorios:
    | Campo          | Valor                   |
    | Nombre         | Camila Morales          |
    | Email          | camila.m@example.com    |
    | Teléfono       | +56912345678            |
    | RUT            | 18.765.432-1            |
  Y presiona "Confirmar Pedido"
  Entonces la base de datos registra una nueva orden en estado "PENDING_REVIEW"
  Y el sistema serializa el JSON exacto del diseño en "canvas_json_design"
  Y muestra la pantalla de éxito con el número de orden correlativo "#1005".
```

---

### 3.2. Escenarios de Prueba: Módulo Administrador

#### CP-ADM-01: Configuración de Producto y Delimitación de Área Imprimible
* **ID:** `TC_ADM_001`
* **Módulo:** Backoffice / Catálogo
* **Precondiciones:** Administrador autenticado en el panel de control.

```gherkin
Escenario: Administrador configura una nueva zona imprimible en un termo promocional
  Dado que el Administrador accede a la ficha del producto "Termo Inox 750ml"
  Cuando dibuja un rectángulo sobre el mockup para definir el área "Frontal"
  Y completa las medidas físicas: "Ancho: 80 mm" y "Alto: 150 mm"
  Y marca el interruptor "Superficie Curva / Cilíndrica" (is_curved = true)
  Y guarda los cambios
  Entonces la tabla "printable_areas" registra un nuevo ítem con "physical_width_mm = 80.00" y "is_curved = true"
  Y el personalizador web renderiza la vista adaptada para productos cilíndricos.
```

#### CP-ADM-02: Generación y Validación de Renderizado a 300 DPI
* **ID:** `TC_ADM_002`
* **Módulo:** Backoffice / Render Engine
* **Precondiciones:** Existe la orden `#1005` con diseño en área de $300\text{ mm} \times 400\text{ mm}$.

```gherkin
Escenario: Procesamiento de orden y verificación de resolución en el archivo PNG final
  Dado que el Operador abre la orden #1005 en estado "PENDING_REVIEW"
  Cuando presiona el botón "Aprobar y Generar Assets de Producción"
  Entonces el servicio de backend procesa el objeto "canvas_json_design"
  Y calcula las dimensiones en píxeles requeridas para 300 DPI:
    $$\text{Píxeles Ancho} = \left(\frac{300}{25.4}\right) \times 300 = 3543.3\text{ px}$$
    $$\text{Píxeles Alto} = \left(\frac{400}{25.4}\right) \times 300 = 4724.4\text{ px}$$
  Y genera el archivo "orden_1005_pecho_300dpi.png" con transparencia alfa y dimensiones de 3543x4724 píxeles
  Y empaqueta el PNG junto con el PDF de la Hoja de Trabajo en un archivo ".zip"
  Y cambia el estado de la orden a "IN_PRODUCTION".
```

#### CP-ADM-03: Verificación de Inmutabilidad ante Cambios en el Catálogo
* **ID:** `TC_ADM_003`
* **Módulo:** Backoffice / Persistencia e Inmutabilidad
* **Precondiciones:** La orden `#1005` fue creada con el producto "Polerón Canguro - Color Negro - Talla L".

```gherkin
Escenario: Modificación del producto base en el catálogo no altera pedidos históricos
  Dado que la orden #1005 fue registrada previamente en el sistema
  Cuando el Administrador edita el catálogo y elimina la variante "Color Negro - Talla L"
  O cambia el nombre del producto de "Polerón Canguro" a "Hoodie Unisex Premium"
  Y el Operador abre el detalle de la orden #1005
  Entonces la vista de la orden continúa mostrando el nombre original "Polerón Canguro" mediante "product_name_snapshot"
  Y conserva los detalles del color "Negro" y talla "L" mediante "variant_details_snapshot"
  Y el archivo PNG renderizado a 300 DPI se genera exactamente con la imagen original sin corrupciones.
```
