# XML · CFDI Parser

Convierte facturas electrónicas mexicanas (CFDI 4.0 del SAT) a Excel directamente desde el navegador.

**Privacidad por diseño:** todo el procesamiento ocurre localmente. Tus XMLs nunca se envían a ningún servidor.

## Características

- 🔒 **100% local** — sin backend, sin cookies, sin tracking
- 📂 **Drag & drop múltiple** — carga decenas de XMLs a la vez
- 🔁 **Acumulativo** — agrega XMLs en varias cargas, omite duplicados por UUID
- 📊 **Editor Excel-like** — Univer integrado: filtros, fórmulas, formato, ordenamiento
- 📥 **Descarga en .xlsx** — con el formato estándar de columnas
- 🌐 **En español** — UI y locale configurados para México

## Columnas extraídas

| Columna | Origen en el CFDI |
|---|---|
| `EMISOR` | `cfdi:Emisor/@Nombre` |
| `RFC_EMISOR` | `cfdi:Emisor/@Rfc` |
| `FECHA` | `cfdi:Comprobante/@Fecha` |
| `FACTURA` | `@Serie` + `@Folio` |
| `RECEPTOR` | `cfdi:Receptor/@Nombre` |
| `RFC_RECEPTOR` | `cfdi:Receptor/@Rfc` |
| `CODIGO_PRODUCTO` | `cfdi:Concepto/@NoIdentificacion` |
| `PRODUCTO` | `cfdi:Concepto/@Descripcion` |
| `BOTELLAS` | `cfdi:Concepto/@Cantidad` |
| `TOTAL` | `cfdi:Concepto/@Importe` |
| `DOCUMENTO` | `tfd:TimbreFiscalDigital/@UUID` |

Una fila por concepto del CFDI (un CFDI con N productos genera N filas).

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- [Univer](https://univer.ai/) (Apache 2.0) — editor de hojas estilo Excel
- [SheetJS](https://sheetjs.com/) (`xlsx`) — generación del archivo descargable
- Estilo inspirado en [SAP Fiori](https://experience.sap.com/fiori-design-web/)

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Privacidad

Los CFDIs contienen información fiscal sensible (RFCs, montos, productos, sellos digitales).
Por eso esta herramienta fue diseñada para que **nada salga de tu computadora**:

- No hay servidor que reciba archivos
- El parseo se hace con `DOMParser` del navegador
- El Excel se genera y descarga 100% local
- No se usan cookies ni servicios de analítica que rastreen usuarios

Aviso completo disponible dentro de la app.

## Licencia

Proyecto personal de uso libre.
