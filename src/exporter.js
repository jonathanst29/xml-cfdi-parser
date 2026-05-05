import * as XLSX from 'xlsx'

const COLUMNS = ['DISTRIBUIDOR','FECHA','FACTURA','SUCURSAL','RFC','CDC','CODSAP','PRODUCTO','BOTELLAS','TOTAL','DOCUMENTO']

export function exportToExcel(rows, filename = 'COMPRAS_CFDI.xlsx') {
  const data = rows.map(r => ({
    ...r,
    FECHA: r.FECHA instanceof Date
      ? r.FECHA.toISOString().slice(0, 10)
      : (r.FECHA || ''),
  }))

  const ws = XLSX.utils.json_to_sheet(data, { header: COLUMNS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'COMPRAS_CFDI')
  XLSX.writeFile(wb, filename)
}
