import { useEffect, useRef } from 'react'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEsES from '@univerjs/preset-sheets-core/locales/es-ES'
import '@univerjs/preset-sheets-core/lib/index.css'

import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import UniverPresetSheetsFilterEsES from '@univerjs/preset-sheets-filter/locales/es-ES'
import '@univerjs/preset-sheets-filter/lib/index.css'

const COLUMNS = ['EMISOR','RFC_EMISOR','FECHA','FACTURA','RECEPTOR','RFC_RECEPTOR','CODIGO_PRODUCTO','PRODUCTO','BOTELLAS','TOTAL','DOCUMENTO']

const fmtDate = (d) => {
  if (!d) return ''
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d)
}

function rowsToSheetData(rows) {
  const cellData = {}

  // Fila 0: encabezados
  cellData[0] = {}
  COLUMNS.forEach((c, i) => {
    cellData[0][i] = {
      v: c,
      s: { bg: { rgb: '#f5f6f7' }, bl: 1, cl: { rgb: '#6a6d70' } },
    }
  })

  // Filas de datos
  rows.forEach((r, rIdx) => {
    const rowNum = rIdx + 1
    cellData[rowNum] = {}
    COLUMNS.forEach((col, cIdx) => {
      let value = r[col]
      if (col === 'FECHA') value = fmtDate(value)
      if (value === null || value === undefined) value = ''
      cellData[rowNum][cIdx] = { v: value }
    })
  })

  return {
    id: 'cfdi-sheet',
    sheetOrder: ['s1'],
    name: 'CFDIs',
    sheets: {
      s1: {
        id: 's1',
        name: 'COMPRAS_CFDI',
        cellData,
        rowCount: Math.max(rows.length + 50, 100),
        columnCount: COLUMNS.length,
        defaultColumnWidth: 120,
        columnData: {
          0: { w: 220 }, // EMISOR
          3: { w: 160 }, // FACTURA
          4: { w: 220 }, // RECEPTOR
          7: { w: 280 }, // PRODUCTO
          10: { w: 280 }, // DOCUMENTO (UUID)
        },
      },
    },
  }
}

export default function UniverSheet({ rows }) {
  const containerRef    = useRef(null)
  const univerRef       = useRef(null)
  const apiRef          = useRef(null)

  // Inicializar Univer una sola vez
  useEffect(() => {
    if (!containerRef.current || univerRef.current) return

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.ES_ES,
      locales: {
        [LocaleType.ES_ES]: mergeLocales(UniverPresetSheetsCoreEsES, UniverPresetSheetsFilterEsES),
      },
      presets: [
        UniverSheetsCorePreset({ container: containerRef.current }),
        UniverSheetsFilterPreset(),
      ],
    })

    univerRef.current = univer
    apiRef.current    = univerAPI

    return () => {
      try { univer.dispose() } catch (e) { /* ignore */ }
      univerRef.current = null
      apiRef.current    = null
    }
  }, [])

  // Cuando cambien los rows, recrear el workbook
  useEffect(() => {
    if (!apiRef.current) return
    const api = apiRef.current

    // Borrar workbooks existentes
    try {
      const existing = api.getActiveWorkbook?.()
      if (existing) api.disposeUnit(existing.getId())
    } catch (e) { /* ignore */ }

    api.createWorkbook(rowsToSheetData(rows))

    // Activar AutoFilter sobre encabezados + datos
    try {
      const wb    = api.getActiveWorkbook()
      const sheet = wb.getActiveSheet()
      const lastCol = String.fromCharCode(64 + COLUMNS.length) // A=65 → K para 11 cols
      const lastRow = rows.length + 1
      const range   = sheet.getRange(`A1:${lastCol}${lastRow}`)
      const existingFilter = sheet.getFilter?.()
      if (existingFilter) existingFilter.remove()
      range.createFilter()
    } catch (e) {
      console.warn('No se pudo activar AutoFilter:', e)
    }
  }, [rows])

  return <div ref={containerRef} className="univer-container" />
}
