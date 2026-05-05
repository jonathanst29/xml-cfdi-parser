import { useState, useCallback, useEffect } from 'react'
import { parseFiles } from './cfdiParser'
import { exportToExcel } from './exporter'
import UniverSheet from './UniverSheet'
import Privacy from './Privacy'
import WelcomeDialog from './WelcomeDialog'
import './App.css'

const WELCOME_KEY = 'cfdi-parser:welcome-seen'

export default function App() {
  const [rows, setRows]         = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [filename, setFilename] = useState('COMPRAS_CFDI.xlsx')
  const [view, setView]         = useState('home')
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(WELCOME_KEY)) setShowWelcome(true)
  }, [])

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1')
    setShowWelcome(false)
  }

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

  const totalBotellas = rows.reduce((s, r) => s + (r.BOTELLAS || 0), 0)
  const totalImporte  = rows.reduce((s, r) => s + (r.TOTAL    || 0), 0)
  const proveedores   = new Set(rows.map(r => r.EMISOR)).size

  return (
    <>
      {showWelcome && (
        <WelcomeDialog
          onClose={dismissWelcome}
          onShowFull={() => { dismissWelcome(); setView('privacy') }}
        />
      )}

      <div className="shell-header">
        <span className="shell-logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
          XML · CFDI Parser
        </span>
      </div>

      {view === 'privacy' ? (
        <Privacy onBack={() => setView('home')} />
      ) : (
    <div className="app">
      <div className="privacy-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.045-.51-3.97-1.407-5.658" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.352 0-2.657.177-3.898.507A12.006 12.006 0 003.598 6" />
        </svg>
        <span>
          <strong>Tu información es privada.</strong> Los archivos XML se procesan directamente en tu navegador —
          ningún dato se envía ni se almacena en servidores externos. Todo ocurre en tu computadora.
        </span>
      </div>

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
        <span>
          Solo .xml · Los archivos se <strong>acumulan</strong> en cada carga (duplicados omitidos por UUID).
          {rows.length > 0 && ' Usa "Limpiar" para empezar desde cero.'}
        </span>
          <input id="fileInput" type="file" accept=".xml" multiple onChange={e => processFiles(e.target.files)} />
        </div>
      </div>

      {rows.length === 0 && (
        <div className="how-to-card">
          <div className="how-to-header">¿Cómo se usa?</div>
          <div className="how-to-body">
            <ol className="how-to-steps">
              <li>
                <span className="step-num">1</span>
                <div>
                  <strong>Consigue tus archivos XML</strong>
                  <p>
                    Cada factura del SAT trae un PDF y un XML. Aquí necesitas el <strong>XML</strong>
                    {' '}(el archivo que termina en <code>.xml</code>). El PDF no sirve para esto.
                  </p>
                  <p className="step-hint">
                    💡 Si solo tienes el PDF, búscalo en tu correo: el proveedor te envió ambos archivos juntos.
                    También puedes descargarlos del portal del SAT.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <strong>Arrástralos al recuadro de arriba</strong>
                  <p>
                    Selecciona uno o varios archivos XML desde tu Finder/Explorador y arrástralos
                    al recuadro punteado. También puedes hacer clic ahí y seleccionarlos manualmente.
                  </p>
                  <p className="step-hint">
                    💡 Puedes cargar varios lotes — los archivos se acumulan. Si arrastras el mismo XML
                    dos veces, no se duplica.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <strong>Revisa y edita en la hoja</strong>
                  <p>
                    Aparecerá una hoja de cálculo igual que Excel con todos los productos extraídos.
                    Puedes ordenar, filtrar (clic en las flechitas ▼ del encabezado), aplicar fórmulas o editar celdas.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-num">4</span>
                <div>
                  <strong>Descarga el Excel</strong>
                  <p>
                    Escribe el nombre que quieras para tu archivo y haz clic en{' '}
                    <strong>Descargar Excel</strong>. Si no le pones <code>.xlsx</code> al final,
                    se agrega solo. El archivo se guarda en tu carpeta de Descargas.
                  </p>
                </div>
              </li>
            </ol>

            <div className="how-to-faq">
              <strong>Preguntas frecuentes</strong>
              <details>
                <summary>¿Mis facturas se guardan en algún servidor?</summary>
                <p>
                  No. Todo ocurre dentro de tu navegador. Los archivos nunca se envían a Internet.
                  Si cierras la pestaña, todo se borra de la memoria.
                </p>
              </details>
              <details>
                <summary>¿Funciona con CFDI 3.3 (versión vieja)?</summary>
                <p>
                  Por ahora solo soporta <strong>CFDI 4.0</strong> (la versión obligatoria desde 2023).
                  Si tienes facturas más viejas en 3.3, puede que no las lea correctamente.
                </p>
              </details>
              <details>
                <summary>¿Puedo cargar facturas de notas de crédito o pagos?</summary>
                <p>
                  Sí, cualquier CFDI 4.0 funciona (Ingreso, Egreso, Pago, Traslado, Nómina).
                  Solo ten en cuenta que las columnas <code>BOTELLAS</code> y <code>TOTAL</code>{' '}
                  pueden no tener sentido en algunos tipos (ej. en una nómina, "BOTELLAS" sería 1).
                </p>
              </details>
              <details>
                <summary>¿Hay límite de archivos?</summary>
                <p>
                  No hay límite impuesto, pero entre más archivos cargues, más memoria usará tu
                  navegador. Hemos probado con 200+ XMLs sin problema.
                </p>
              </details>
              <details>
                <summary>¿Por qué a veces hay varias filas con el mismo folio?</summary>
                <p>
                  Porque cada fila representa <strong>un producto</strong> de la factura.
                  Si una factura trae 5 productos diferentes, aparecerán 5 filas con el mismo folio
                  pero distinto producto. Así puedes filtrar y sumar por producto fácilmente.
                </p>
              </details>
            </div>
          </div>
        </div>
      )}

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

          <div className="sheet-wrap">
            <UniverSheet rows={rows} />
          </div>
        </>
      )}
    </div>
      )}

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">XML · CFDI Parser</span>
          <span className="footer-sep">·</span>
          <span className="footer-tag">Sin servidor · Sin cookies · Analítica anónima</span>
          <span className="footer-sep">·</span>
          <button className="footer-link" onClick={() => setView('privacy')}>
            Aviso de Privacidad
          </button>
        </div>
      </footer>
    </>
  )
}
