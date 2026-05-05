import { useEffect } from 'react'

export default function WelcomeDialog({ onClose, onShowFull }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2>Tu información es privada</h2>
        </div>

        <div className="dialog-body">
          <p>
            Antes de empezar, queremos que sepas cómo funciona esta herramienta:
          </p>

          <ul className="dialog-list">
            <li>
              <strong>Procesamiento 100% local</strong> — todo ocurre en tu navegador
            </li>
            <li>
              <strong>Sin servidor</strong> — no hay backend que reciba tus archivos
            </li>
            <li>
              <strong>Sin cookies, sin tracking</strong> — no se identifican usuarios
            </li>
            <li>
              <strong>Tus XMLs nunca se transmiten</strong> — ni se almacenan en ningún lado
            </li>
            <li>
              <strong>El Excel se genera en tu computadora</strong> — y se descarga directo
            </li>
          </ul>

          <p className="dialog-note">
            Los CFDIs contienen información fiscal sensible (RFCs, montos, productos).
            Por eso esta herramienta fue diseñada para que <strong>nada salga de tu equipo</strong>.
          </p>
        </div>

        <div className="dialog-footer">
          <button className="btn-clear" onClick={onShowFull}>
            Ver aviso completo
          </button>
          <button className="btn-export" onClick={onClose}>
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  )
}
