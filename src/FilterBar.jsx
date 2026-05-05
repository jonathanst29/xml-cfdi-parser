const FILTERS = [
  { key: 'EMISOR',          label: 'Emisor',          placeholder: 'Buscar emisor...' },
  { key: 'RFC_EMISOR',      label: 'RFC Emisor',      placeholder: 'Buscar RFC...' },
  { key: 'FACTURA',         label: 'Factura',         placeholder: 'Buscar folio...' },
  { key: 'RECEPTOR',        label: 'Receptor',        placeholder: 'Buscar receptor...' },
  { key: 'CODIGO_PRODUCTO', label: 'Código',          placeholder: 'Buscar código...' },
  { key: 'PRODUCTO',        label: 'Producto',        placeholder: 'Buscar producto...' },
]

export default function FilterBar({ filters, setFilters, total, filteredCount }) {
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const clearAll = () => setFilters({})
  const hasActive = Object.values(filters).some(v => v && v.trim() !== '')

  return (
    <div className="filter-bar">
      <div className="filter-bar-header">
        <div className="filter-bar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span>Filtrar</span>
          {hasActive && (
            <span className="filter-results">
              {filteredCount.toLocaleString('es-MX')} de {total.toLocaleString('es-MX')} filas
            </span>
          )}
        </div>
        {hasActive && (
          <button className="filter-clear" onClick={clearAll}>
            Limpiar filtros
          </button>
        )}
      </div>
      <div className="filter-inputs">
        {FILTERS.map(f => (
          <input
            key={f.key}
            type="text"
            className="filter-input"
            placeholder={f.placeholder}
            value={filters[f.key] || ''}
            onChange={e => update(f.key, e.target.value)}
          />
        ))}
      </div>
    </div>
  )
}

export function applyFilters(rows, filters) {
  const active = Object.entries(filters).filter(([_, v]) => v && v.trim() !== '')
  if (active.length === 0) return rows
  return rows.filter(row =>
    active.every(([key, val]) => {
      const cell = row[key]
      if (cell === null || cell === undefined) return false
      return String(cell).toLowerCase().includes(val.toLowerCase().trim())
    })
  )
}
