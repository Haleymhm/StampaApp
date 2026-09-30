# Documento de Requisitos de Software: StampaApp

## Visión General del Producto
**StampaApp** es una plataforma SaaS/Web interactiva de personalización textil y promocional junto a un sistema de gestión de pedidos para producción en taller. El sistema permite a clientes finales personalizar productos (franelas, polerones, polos, gorras, tazas, termos y vasos) mediante múltiples técnicas de estampado (**DTF, Sublimación y Bordado**) y generar solicitudes de cotización/pedido directamente sin pasarela de pago obligatoria en la fase inicial.

---

## 1. Requisitos Funcionales (RF)

### RF-01: Catálogo Navegable y Reglas por Producto
* **RF-01.1:** El sistema debe permitir al usuario explorar productos organizados por categorías (*Vestimenta*, *Gorras*, *Promocionales*).
* **RF-01.2:** Cada producto debe mostrar sus variantes disponibles (colores, tallas o capacidades) y las técnicas de personalización habilitadas (**DTF, Sublimación, Bordado**).
* **RF-01.3:** El sistema debe restringir las opciones del editor visual según las capacidades de la técnica seleccionada (ej. limitar paleta de colores para Bordado o deshabilitar Sublimación en gorras de 6 paneles con costura central).

### RF-02: Editor Interactivo (Canvas UI)
* **RF-02.1:** El usuario debe ser capaz de seleccionar y visualizar distintas áreas imprimibles por producto (ej. Pecho Frontal, Espalda, Lateral Gorra, Wrap Taza).
* **RF-02.2:** El editor debe permitir agregar imágenes desde la galería pública del sistema o mediante la carga de archivos propios (PNG, JPG, SVG).
* **RF-02.3:** El usuario debe poder escalar, rotar, mover, alinear y ordenar capas dentro de los límites del área imprimible.
* **RF-02.4:** El editor debe calcular en tiempo real la resolución efectiva ($\text{DPI}$) de las imágenes subidas y emitir una alerta visual si es inferior a $150\text{ DPI}$.
* **RF-02.5:** Para gorras de 6 paneles, el editor debe superponer visualmente la línea de costura central y advertir sobre el riesgo de colocar elementos pequeños sobre ella.

### RF-03: Checkout y Generación de Pedido (Sin Pasarela de Pago)
* **RF-03.1:** El cliente debe poder completar una solicitud de pedido indicando datos de contacto (Nombre, Email, Teléfono/WhatsApp, RUT/Tax ID y Dirección).
* **RF-03.2:** El sistema debe registrar la orden en estado `PENDING_REVIEW` y generar un número de orden correlativo único (`#1001`).
* **RF-03.3:** El sistema debe guardar un *snapshot* inmutable del diseño en formato `JSONB` junto con el nombre del producto, variantes y la técnica seleccionada.

### RF-04: Panel de Administración y Configuración (Backoffice)
* **RF-04.1:** Autenticación segura para administradores mediante correo/contraseña o JWT con renovación de token.
* **RF-04.2:** Gestión completa (CRUD) de Categorías, Productos, Variantes de Color/Talla/Capacidad y asignación de Técnicas Permitidas.
* **RF-04.3:** Editor visual de delimitación de áreas imprimibles sobre mockups con calibración en milímetros ($\text{mm}$) e indicadores de costura/curvatura.
* **RF-04.4:** Gestión (CRUD) y categorización de la Galería Pública de imágenes (vectores SVG y PNGs en alta resolución).
* **RF-04.5:** Tablero Kanban / Gestor de Pedidos con actualización de estados (`PENDING_REVIEW`, `QUOTED`, `IN_PRODUCTION`, `READY_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`).
* **RF-04.6:** Motor de procesamiento de imágenes para la generación asíncrona de archivos de producción a $300\text{ DPI}$ y empaquetado en archivos `.zip`.

### RF-05: Arquitectura API-First y Validación Estricta con Zod
* **RF-05.1 (Enfoque API-First):** Toda interacción entre el cliente (Storefront o Admin) y el servidor debe estructurarse mediante endpoints RESTful explícitos en `/api/...` (Next.js Route Handlers), desacoplando por completo la interfaz visual de las reglas de negocio y persistencia.
* **RF-05.2 (Validación de Entrada con Zod):** Todas las solicitudes HTTP entrantes (POST, PUT, PATCH, DELETE, query params) deben validarse obligatoriamente con esquemas de **Zod** antes de ser consumidas por los servicios internos o el ORM.
* **RF-05.3 (Respuesta Estandarizada y Tipado Seguro):** Las respuestas de la API deben retornar estructuras JSON consistentes (`{ success: true, data: ... }` o `{ success: false, error: ... }`) con inferencia de tipos TypeScript compartida a partir de los esquemas Zod (`z.infer<typeof Schema>`).

### RF-06: Módulo de Usuarios, Autenticación y Diseños Guardados
* **RF-06.1 (Modelo de Usuarios y Roles):** El sistema debe gestionar usuarios autenticados mediante el modelo `User`, con roles diferenciados: `ADMIN`, `OPERATOR` y `CUSTOMER`.
* **RF-06.2 (Autenticación y Seguridad):** Registro de clientes e inicio de sesión para administradores, operadores y clientes, con contraseñas hasheadas (`bcrypt` o `argon2`) y control de sesiones mediante JWT / NextAuth.
* **RF-06.3 (Gestión de Diseños Guardados - `SavedDesign`):** Los usuarios registrados con rol `CUSTOMER` deben poder guardar borradores de sus diseños creados en el Canvas (`canvas_json_design`), listarlos, editarlos, descargarlos y eliminarlos desde su panel personal.
* **RF-06.4 (Compatibilidad con Invitados):** Los clientes que no deseen registrarse pueden seguir utilizando el editor interactivo y enviando pedidos directamente como invitados sin fricción.

---

## 2. Historias de Usuario (User Stories) - Módulo Administrativo

### ÉPICA: Mantenimiento de Catálogo y Productos

#### HU-ADM-01: Gestión de Categorías y Productos Base
> **Como** Administrador del sistema,  
> **Quiero** crear, editar y desactivar productos en el catálogo especificando su nombre, categoría y descripción,  
> **Para** mantener la oferta de productos actualizada para los clientes.

* **Criterios de Aceptación:**
  * **CA-01:** El Administrador puede crear un producto asignándole una categoría existente.
  * **CA-02:** Puede marcar un producto como `is_active = false` para ocultarlo instantáneamente del frontend de clientes sin borrar su historial.
  * **CA-03:** El sistema genera automáticamente el `slug` amigable para la URL del producto.

#### HU-ADM-02: Configuración de Variantes (Colores, Tallas/Capacidades y Mockups)
> **Como** Administrador,  
> **Quiero** agregar variantes de color, tallas o capacidades a un producto y cargar la imagen base (mockup),  
> **Para** que el cliente vea exactamente sobre qué prenda u objeto está diseñando.

* **Criterios de Aceptación:**
  * **CA-01:** Permite ingresar nombre de color, código hexadecimal (`#HEX`), talla o capacidad (ej: "XL", "11oz") y SKU.
  * **CA-02:** Exige la carga de la imagen del mockup limpio en fondo transparente o neutro.
  * **CA-03:** Valida que el SKU sea único en todo el catálogo.

#### HU-ADM-03: Asignación de Técnicas Permitidas por Producto
> **Como** Administrador,  
> **Quiero** definir qué técnicas de personalización (DTF, Sublimación, Bordado) están permitidas para cada producto,  
> **Para** evitar que un cliente pida una técnica incompatible (ej: Sublimación sobre polera 100% algodón negro).

* **Criterios de Aceptación:**
  * **CA-01:** Interfaz con checkboxes para activar/desactivar cada una de las 3 técnicas globales.
  * **CA-02:** Si se selecciona Bordado, permite configurar el límite máximo de colores permitidos (ej. máx 6 u 8 hilos).
  * **CA-03:** El Canvas de clientes se ajustará dinámicamente mostrando solo las pestañas de las técnicas habilitadas para ese producto.

---

### ÉPICA: Editor de Zonas Imprimibles (Printable Areas Setup)

#### HU-ADM-04: Delimitación Visual de Áreas e Ingreso de Medidas Reales
> **Como** Administrador,  
> **Quiero** dibujar sobre la imagen del mockup un recuadro delimitador y especificar su tamaño real en milímetros ($\text{mm}$),  
> **Para** que el sistema pueda calcular la escala exacta y la resolución DPI de los diseños de los clientes.

* **Criterios de Aceptación:**
  * **CA-01:** Herramienta interactiva de arrastrar y soltar (drag-and-drop) sobre el mockup para definir el Bounding Box ($X, Y, \text{Ancho}, \text{Alto}$).
  * **CA-02:** Campos numéricos obligatorios para especificar el tamaño físico en el mundo real (ej: Ancho: $300\text{ mm}$, Alto: $400\text{ mm}$).
  * **CA-03:** El sistema calcula la relación de aspectos píxeles/milímetros automáticamente para la exportación a 300 DPI.

#### HU-ADM-05: Marcado de Propiedades Especiales (Costuras Centrales y Curvatura)
> **Como** Administrador,  
> **Quiero** marcar si una zona imprimible posee costura central (gorras de 6 paneles) o es una superficie cilíndrica (tazas/termos),  
> **Para** que el cliente reciba advertencias y guías visuales adecuadas durante la personalización.

* **Criterios de Aceptación:**
  * **CA-01:** Toggle `has_center_seam`: Al activarse, permite ubicar una línea guía vertical editable en la zona para alertar al usuario en el Canvas.
  * **CA-02:** Toggle `is_curved`: Al activarse para tazas/termos, habilita la vista envolvente (Wrap) y guías de seguridad laterales.

---

### ÉPICA: Gestión de Galería Pública de Diseños

#### HU-ADM-06: Carga y Categorización de Vectores/Cliparts
> **Como** Administrador,  
> **Quiero** subir ilustraciones y vectores organizados por categorías (Deportes, Anime, Logos, etc.),  
> **Para** nutrir la biblioteca de recursos gráficos disponibles de libre uso para los usuarios.

* **Criterios de Aceptación:**
  * **CA-01:** Carga simultánea del archivo liviano WebP/PNG para previsualización y el archivo vectorial limpio (`.svg`) o PNG de alta densidad (`300 DPI`).
  * **CA-02:** Clasificación por categoría de imagen y asignación de etiquetas (tags) para búsqueda rápida en el frontend.

---

### ÉPICA: Gestión de Pedidos y Descarga para Producción

#### HU-ADM-07: Tablero de Control de Pedidos y Cambio de Estados
> **Como** Operador del taller,  
> **Quiero** visualizar un listado/tablero de pedidos recibidos con filtros por estado, fecha o cliente,  
> **Para** gestionar el flujo de trabajo desde la revisión inicial hasta la entrega final.

* **Criterios de Aceptación:**
  * **CA-01:** Listado ordenado cronológicamente mostrando ID correlativo (`#1001`), Cliente, Producto, Técnica y Estado actual.
  * **CA-02:** Selector de estado de orden con actualización inmediata: `PENDING_REVIEW` $\rightarrow$ `QUOTED` $\rightarrow$ `IN_PRODUCTION` $\rightarrow$ `READY_FOR_DELIVERY` $\rightarrow$ `COMPLETED` (o `CANCELLED`).
  * **CA-03:** Vista detallada de la orden que muestra el formulario de datos del cliente y los *snapshots* estáticos del diseño.

#### HU-ADM-08: Procesamiento Backend y Descarga del Paquete de Producción
> **Como** Operador de impresión / RIP,  
> **Quiero** generar y descargar el paquete de producción en un archivo comprimido (`.zip`),  
> **Para** enviar las imágenes directamente a la máquina de DTF, impresora de Sublimación o software de ponchado.

* **Criterios de Aceptación:**
  * **CA-01:** Botón "Generar Assets de Producción": Desencadena un trabajo en background (Worker/Serverless Function) que procesa el JSON del Canvas.
  * **CA-02:** Genera un PNG sin fondo a exactamente $300\text{ DPI}$ con las dimensiones físicas reales ($\text{mm}$) configuradas en la zona.
  * **CA-03:** El paquete `.zip` descargable contiene:
    1. Archivos PNG a $300\text{ DPI}$ por cada vista personalizada.
    2. Archivos SVG/vectores (si la técnica es Bordado).
    3. Una hoja de ruta en PDF (**Worksheet**) con el resumen del pedido, datos del cliente y muestra visual con el mockup.

---

## 3. Escenarios de Prueba BDD Administrativos (Gherkin)

### Escenario 01: Configuración de Área Imprimible para Gorras de 6 Paneles
```gherkin
Escenario: El Administrador configura la zona frontal de una Gorra Snapback de 6 Paneles
  Dado que el Administrador está en el panel creando la zona imprimible "Frente" para el producto "Gorra Snapback 6P"
  Cuando dibuja el rectángulo de área imprimible sobre el mockup de la gorra
  Y especifica un ancho de 120 mm y un alto de 60 mm
  Y activa el interruptor "Tiene Costura Central" (has_center_seam = true)
  Y guarda la configuración de la zona
  Entonces el sistema almacena las coordenadas en "bounding_box_json"
  Y cuando un cliente abre el Canvas para esa gorra, el editor renderiza automáticamente la línea punteada de la costura central.
```
### Escenario 02: Descarga del Paquete de Producción DTF
```gherkin
Escenario: El operador del taller procesa una orden para impresión DTF
  Dado que la orden #1024 está en estado "IN_PRODUCTION" y la técnica seleccionada es "DTF"
  Y el producto posee un diseño en la zona "Pecho Frontal" de 300mm x 400mm
  Cuando el Operador presiona "Descargar Paquete de Producción (.zip)"
  Entonces el backend calcula las dimensiones en píxeles (3543px x 4724px a 300 DPI)
  Y genera el archivo "orden_1024_pecho_frontal_300dpi.png" con transparencia alfa
  Y descarga un archivo ZIP con el PNG de alta resolución y el PDF de la hoja de trabajo.
```

### Escenario 03: Validación de Resolución de Imagen en Canvas
```gherkin
Escenario: El usuario sube una imagen de baja resolución al editor
  Dado que el cliente está en el editor personalizando un "Polerón Canguro"
  Y el área de impresión seleccionada es "Pecho Frontal" (300mm x 400mm)
  Cuando sube un archivo de imagen con dimensiones de 200x200 píxeles
  Y escala la imagen para ocupar el 80% del área imprimible
  Entonces el sistema debe calcular un DPI efectivo inferior a 150 DPI
  Y debe mostrar una alerta amarilla indicando "Advertencia: Calidad de impresión baja"
  Y debe bloquear la confirmación del pedido hasta que el usuario confirme haber visto la advertencia.
```

### Escenario 04: Restricción de Técnica de Bordado
```gherkin
Escenario: Selección de técnica de Bordado en un Polo
  Dado que el cliente selecciona un producto "Poland Polo Piqué"
  Y selecciona la técnica "Bordado"
  Cuando intenta agregar una imagen con más de 8 colores o con degradados continuos
  Entonces el editor debe mostrar un mensaje informando que el bordado requiere colores planos
  Y debe aplicar un filtro de simplificación de paleta o requerir confirmación de ajuste para ponchado.
```

### Escenario 05: Inmutabilidad del Pedido Generado
```gherkin
Escenario: Modificación del catálogo posterior a una solicitud de pedido
  Dado que el cliente "Juan Pérez" realizó la orden #1005 de una "Gorra Snapback"
  Cuando el administrador modifica el precio o elimina la variante de color "Negro" del catálogo
  Entonces la orden #1005 en el panel administrativo debe continuar mostrando exactamente la variante "Negro"
  Y el JSON del diseño guardado en "order_items.canvas_json_design" debe mantenerse idéntico sin sufrir alteraciones.
```

### Escenario 06: Generación y Descarga de Archivo de Producción DTF
```gherkin
Escenario: Administrador procesa orden enviada a producción
  Dado que existe la orden #1010 en estado "PENDING_REVIEW"
  Cuando el administrador presiona el botón "Generar Assets de Producción"
  Entonces el servicio de backend debe procesar el canvas JSON a 300 DPI en fondo transparente
  Y debe actualizar el campo "production_files_json" con la URL firmada del archivo PNG
  Y el administrador debe poder descargar el paquete .zip de producción correctamente.
```

### Escenario 07: Procesar Orden
```gherkin
Escenario: Crear y procesar una orden compleja
  Dado que el cliente ha personalizado un producto
  Cuando envía la orden al sistema
  Entonces el sistema guarda la orden y genera el paquete de producción.
  Y el administrador puede ver la orden en el tablero de control.
  Y el operador puede descargar el paquete de producción.
```

### Escenario 08: Carga de Diseño
```gherkin
Escenario: El usuario sube una imagen de baja resolución al editor
  Dado que el cliente está en el editor personalizando un "Polerón Canguro"
  Y el área de impresión seleccionada es "Pecho Frontal" (300mm x 400mm)
  Cuando sube un archivo de imagen con dimensiones de 200x200 píxeles
  Y escala la imagen para ocupar el 80% del área imprimible
  Entonces el sistema debe calcular un DPI efectivo inferior a 150 DPI
  Y debe mostrar una alerta amarilla indicando "Advertencia: Calidad de impresión baja"
  Y debe bloquear la confirmación del pedido hasta que el usuario confirme haber visto la advertencia.
```

### Escenario 10: Carga de Diseño
```gherkin
Escenario: El usuario intenta subir un archivo no permitido
  Dado que el cliente está en el editor personalizando un producto
  Cuando intenta subir un archivo con extensión .exe
  Entonces el sistema debe rechazar la carga y mostrar un error "Tipo de archivo no permitido"
```


### Escenario 11: Edición de Diseño
```gherkin
Escenario: El usuario edita un diseño existente
  Dado que el cliente ha creado un diseño personalizado
  Cuando el cliente modifica el diseño
  Entonces el sistema debe actualizar el diseño en base de datos.
  Y el cliente puede ver el diseño actualizado en el editor.
  Y el cliente puede descargar el diseño actualizado.
```

### Escenario 12: Guardar Diseño
```gherkin
Escenario: El usuario guarda un diseño para continuar después
  Dado que el cliente ha creado un diseño personalizado
  Cuando el cliente guarda el diseño
  Entonces el sistema debe guardar el diseño en base de datos.
  Y el cliente puede ver el diseño guardado en el editor.
  Y el cliente puede descargar el diseño guardado.
```

### Escenario 13: Eliminar Diseño
```gherkin
Escenario: El usuario elimina un diseño personalizado
  Dado que el cliente ha creado un diseño personalizado
  Cuando el cliente elimina el diseño
  Entonces el sistema debe eliminar el diseño de base de datos.
  Y el cliente no puede ver el diseño eliminado en el editor.
  Y el cliente no puede descargar el diseño eliminado.
```
### Escenario 14: 
```gherkin
```
### Escenario 15: 
```gherkin
```
### Escenario 16: 
```gherkin
```
### Escenario 17: 
```gherkin
```