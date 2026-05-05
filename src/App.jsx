import { useState, useCallback } from 'react'
import { parseFiles } from './cfdiParser'
import { exportToExcel } from './exporter'
import './App.css'

const PREVIEW_COLS = ['DISTRIBUIDOR','FECHA','FACTURA','RFC','CODSAP','PRODUCTO','BOTELLAS','TOTAL']

export default function App() {
  const [rows, setRows]         = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [filename, setFilename] = useState('COMPRAS_CFDI.xlsx')

  const processFiles = useCallback(async (files) => {
    const xmlFiles = [...files].filter(f => f.name.toLowerCase().endsWith('.xml'))
    if (!xmlFiles.length) return
    setLoading(true)
    const parsed = await parseFiles(xmlFiles)
    setRows(prev => {
      const existing = new Set(prev.map(r => r.DOCUMENTO?.toUpperCase()))
      return [...prev, ...parsed.filter(r => !existing.has(r.DOCUMENTO?.toUpperCase()))]
    })
    setLoading(false)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const fmt = (d) => {
    if (!d) return ''
    if (d instanceof Date) return d.toISOString().slice(0, 10)
    return String(d)
  }

  const totalBotellas = rows.reduce((s, r) => s + (r.BOTELLAS || 0), 0)
  const totalImporte  = rows.reduce((s, r) => s + (r.TOTAL    || 0), 0)
  const proveedores   = new Set(rows.map(r => r.DISTRIBUIDOR)).size

  return (
    <>
      <div className="shell-header">
        <span className="shell-logo">SAP<span>•</span></span>
        <span className="shell-sep">|</span>
        <span className="shell-title">CFDI Parser</span>
      </div>

    <div className="app">
      <div className="page-header">
        <h1>Importar Facturas XML</h1>
        <p>Carga XMLs de CFDI 4.0 del SAT y exporta los conceptos a Excel con el formato estándar de distribuidores</p>
      </div>

      <div className="upload-card">
        <div className="upload-card-header">Cargar archivos</div>
        <div
          className={`dropzone${dragging ? ' dragging' : ''}`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p>{loading ? 'Procesando…' : 'Arrastra tus archivos XML aquí o haz clic para seleccionar'}</p>
        <span>Solo .xml · Duplicados omitidos automáticamente</span>
          <input id="fileInput" type="file" accept=".xml" multiple onChange={e => processFiles(e.target.files)} />
        </div>
      </div>

      {rows.length > 0 && (
        <>
          <div className="stats">
            {[
              { value: rows.length.toLocaleString('es-MX'), label: 'Conceptos' },
              { value: proveedores, label: 'Proveedores' },
              { value: totalBotellas.toLocaleString('es-MX'), label: 'Botellas' },
              { value: `$${totalImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, label: 'Total MXN' },
            ].map(s => (
              <div className="stat" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="toolbar">
            <input
              className="filename-input"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="nombre-archivo.xlsx"
            />
            <button className="btn-export" onClick={() => exportToExcel(rows, filename)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar Excel
            </button>
            <button className="btn-clear" onClick={() => setRows([])}>Limpiar</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>{PREVIEW_COLS.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.DISTRIBUIDOR}</td>
                    <td>{fmt(r.FECHA)}</td>
                    <td>{r.FACTURA}</td>
                    <td>{r.RFC}</td>
                    <td>{r.CODSAP}</td>
                    <td className="col-producto">{r.PRODUCTO}</td>
                    <td className="num">{r.BOTELLAS}</td>
                    <td className="num">${r.TOTAL?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
    </>
  )
}
