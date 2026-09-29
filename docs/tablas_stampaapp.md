# Especificación de Base de Datos - StampaApp

Este documento contiene la especificación completa y detallada de la estructura de base de datos para **StampaApp**, diseñada bajo un modelo híbrido relacional-documental (PostgreSQL) con soporte estricto para inmutabilidad de pedidos y personalización multitécnica (**DTF, Sublimación y Bordado**).

---

## 1. Resumen de Tablas y Entidades

| Nombre de la Tabla | Descripción / Propósito | Clave Primaria |
| :--- | :--- | :--- |
| `categories` | Categorías principales de productos (Vestimenta, Gorras, Promocionales). | `id` (UUID) |
| `products` | Definición general del producto base sin variantes. | `id` (UUID) |
| `techniques` | Catálogo global de técnicas de impresión y personalización. | `id` (String) |
| `product_techniques` | Tabla pivote N:M entre productos y técnicas permitidas. | (`product_id`, `technique_id`) |
| `printable_areas` | Zonas o lienzos imprimibles configurados sobre los productos. | `id` (UUID) |
| `product_variants` | Variantes del producto por color, talla/capacidad y mockup base. | `id` (UUID) |
| `image_categories` | Categorías para organizar la galería pública de vectores/cliparts. | `id` (UUID) |
| `gallery_images` | Imágenes públicas de libre uso para los clientes en el Canvas. | `id` (UUID) |
| `customers` | Registro de datos de contacto de clientes para cotización y envío. | `id` (UUID) |
| `orders` | Encabezado del pedido/cotización y gestión de estados. | `id` (UUID) |
| `order_items` | Detalle del producto personalizado, JSON del Canvas y snapshot inmutable. | `id` (UUID) |

---

## 2. Definición Detallada de Tablas

### A. Módulo de Catálogo y Productos

#### 1. Tabla: `categories`
Almacena las categorías principales de productos.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador único de la categoría. |
| `name` | `VARCHAR(100)` | No | | Nombre visible (ej: "Gorras", "Vestimenta"). |
| `slug` | `VARCHAR(100)` | No | `UNIQUE` | Identificador URL-friendly. |
| `description` | `TEXT` | Sí | | Descripción opcional de la categoría. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha y hora de creación. |

---

#### 2. Tabla: `products`
Almacena los productos generales de la plataforma.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador único del producto. |
| `category_id` | `UUID` | No | `FOREIGN KEY` -> `categories(id)` | Categoría a la que pertenece el producto. |
| `name` | `VARCHAR(150)` | No | | Nombre del producto (ej: "Polera Manga Corta"). |
| `slug` | `VARCHAR(150)` | No | `UNIQUE` | Identificador de URL del producto. |
| `description` | `TEXT` | Sí | | Descripción detallada o especificaciones. |
| `is_active` | `BOOLEAN` | No | `true` | Estado de visibilidad en el catálogo. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de última actualización. |

---

#### 3. Tabla: `techniques`
Catálogo maestro de técnicas de personalización.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(30)` | No | `PRIMARY KEY` | Clave técnica (ej: `'dtf'`, `'sublimation'`, `'embroidery'`). |
| `name` | `VARCHAR(50)` | No | | Nombre legible de la técnica. |
| `description` | `TEXT` | Sí | | Explicación o requerimientos de la técnica. |
| `requires_vector`| `BOOLEAN` | No | `false` | Indica si exige formato vectorial (ej: Bordado). |
| `max_colors` | `INT` | Sí | `NULL` | Límite máximo de colores (`NULL` para ilimitado en DTF). |

---

#### 4. Tabla: `product_techniques`
Matriz de compatibilidad entre productos y técnicas.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `product_id` | `UUID` | No | `FOREIGN KEY` -> `products(id)` (`ON DELETE CASCADE`) | Referencia al producto. |
| `technique_id` | `VARCHAR(30)` | No | `FOREIGN KEY` -> `techniques(id)` (`ON DELETE RESTRICT`) | Referencia a la técnica. |

* **Clave Primaria Compuesta:** (`product_id`, `technique_id`)

---

#### 5. Tabla: `printable_areas`
Configuración de zonas de diseño y restricciones físicas del canvas.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador de la zona imprimible. |
| `product_id` | `UUID` | No | `FOREIGN KEY` -> `products(id)` (`ON DELETE CASCADE`) | Producto asociado. |
| `name` | `VARCHAR(80)` | No | | Nombre visible (ej: "Pecho Frontal", "Frente Gorra"). |
| `area_key` | `VARCHAR(50)` | No | | Identificador interno (ej: `"front_panel"`). |
| `physical_width_mm`| `NUMERIC(8,2)`| No | | Ancho real de la zona en milímetros. |
| `physical_height_mm`| `NUMERIC(8,2)`| No | | Alto real de la zona en milímetros. |
| `bounding_box_json`| `JSONB` | No | | Coordenadas/escala del área sobre el mockup `{x, y, width, height}`. |
| `has_center_seam` | `BOOLEAN` | No | `false` | Indica si la zona tiene costura central (ej: Gorras de 6 paneles). |
| `is_curved` | `BOOLEAN` | No | `false` | Indica si es una superficie curva/cilíndrica (ej: Tazas, termos). |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |

---

#### 6. Tabla: `product_variants`
Variantes de color, tamaño/capacidad e imagen base para el canvas.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador único de la variante. |
| `product_id` | `UUID` | No | `FOREIGN KEY` -> `products(id)` (`ON DELETE CASCADE`) | Producto asociado. |
| `color_name` | `VARCHAR(50)` | No | | Nombre del color (ej: "Blanco", "Negro"). |
| `color_hex` | `VARCHAR(7)` | No | | Código de color HEX (ej: `"#FFFFFF"`). |
| `size_or_capacity`| `VARCHAR(20)`| Sí | | Talla o capacidad (ej: "S", "XL", "11oz", "750ml"). |
| `sku` | `VARCHAR(100)`| Sí | `UNIQUE` | Código de inventario / SKU. |
| `mockup_image_url`| `TEXT` | No | | URL CDN de la imagen base/mockup sin estampado. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |

---

### B. Módulo de Galería Pública

#### 7. Tabla: `image_categories`
Categorías de la galería pública de vectores y cliparts.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador de la categoría de imagen. |
| `name` | `VARCHAR(100)` | No | | Nombre (ej: "Anime", "Deportes", "Empresas"). |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |

---

#### 8. Tabla: `gallery_images`
Recursos gráficos disponibles públicamente en el Canvas.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador único del recurso gráfico. |
| `category_id` | `UUID` | Sí | `FOREIGN KEY` -> `image_categories(id)` (`ON DELETE SET NULL`) | Categoría asociada. |
| `title` | `VARCHAR(100)` | No | | Título del diseño o ilustración. |
| `thumbnail_url` | `TEXT` | No | | Miniatura liviana para la web. |
| `vector_svg_url` | `TEXT` | Sí | | Vector limpio para bordado o corte. |
| `high_res_png_url`| `TEXT` | No | | Archivo PNG en alta resolución (300 DPI). |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |

---

### C. Módulo de Clientes y Pedidos

#### 9. Tabla: `customers`
Datos de contacto del cliente recolectados durante la solicitud de pedido.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador del cliente. |
| `full_name` | `VARCHAR(150)` | No | | Nombre completo. |
| `email` | `VARCHAR(150)` | No | | Correo electrónico de contacto. |
| `phone` | `VARCHAR(30)` | No | | Teléfono / WhatsApp. |
| `tax_id` | `VARCHAR(30)` | Sí | | RUT / DNI / NIF para cotización/factura. |
| `address_street` | `VARCHAR(255)`| Sí | | Dirección de despacho. |
| `city` | `VARCHAR(100)` | Sí | | Ciudad o región. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de registro. |

---

#### 10. Tabla: `orders`
Encabezado de orden/cotización de pedido.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador de la orden. |
| `order_number` | `SERIAL` | No | `UNIQUE` | Número correlativo visible (ej: `#1001`). |
| `customer_id` | `UUID` | No | `FOREIGN KEY` -> `customers(id)` (`ON DELETE RESTRICT`) | Cliente que realiza el pedido. |
| `status` | `ENUM` | No | `'pending_review'` | Estado de la orden (`pending_review`, `quoted`, `in_production`, `ready_for_delivery`, `completed`, `cancelled`). |
| `notes` | `TEXT` | Sí | | Observaciones del cliente o del taller. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de emisión. |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de actualización de estado. |

---

#### 11. Tabla: `order_items`
Detalle individual de cada ítem personalizado con preservación inmutable del diseño.

| Columna | Tipo de Dato | Nulo | Restricciones / Valor por Defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Identificador del ítem. |
| `order_id` | `UUID` | No | `FOREIGN KEY` -> `orders(id)` (`ON DELETE CASCADE`) | Orden a la que pertenece. |
| `product_id` | `UUID` | Sí | `FOREIGN KEY` -> `products(id)` (`ON DELETE SET NULL`) | Referencia opcional al catálogo. |
| `variant_id` | `UUID` | Sí | `FOREIGN KEY` -> `product_variants(id)` (`ON DELETE SET NULL`) | Referencia opcional a la variante. |
| `technique_id` | `VARCHAR(30)` | No | `FOREIGN KEY` -> `techniques(id)` (`ON DELETE RESTRICT`) | Técnica elegida (`dtf`, `sublimation`, `embroidery`). |
| `quantity` | `INT` | No | `CHECK (quantity > 0)` | Cantidad solicitada. |
| `product_name_snapshot` | `VARCHAR(150)` | No | | Snapshot inmutable del nombre del producto. |
| `variant_details_snapshot` | `JSONB` | No | | Snapshot inmutable del color, talla y SKU. |
| `canvas_json_design` | `JSONB` | No | | Definición en JSON de las capas y coordenadas del Canvas. |
| `production_files_json` | `JSONB` | Sí | | Rutas de los archivos generados a 300 DPI por el Backend. |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | Fecha de creación. |

---

## 3. Relaciones y Reglas de Integridad Referencial

1. **Inmutabilidad del Pedido:** La tabla `order_items` conserva copias exactas (`product_name_snapshot`, `variant_details_snapshot` y `canvas_json_design`). Si un administrador borra o modifica un producto del catálogo posteriormente, el pedido histórico no pierde su información.
2. **Cascadas de Borrado (`ON DELETE CASCADE`):** Se aplican en estructuras secundarias asociadas al catálogo (`product_variants`, `printable_areas`, `product_techniques`).
3. **Restricción de Borrado (`ON DELETE RESTRICT`):** Se aplica en datos de pedidos o técnicas asociadas para prevenir la eliminación accidental de registros operacionales vigentes.
