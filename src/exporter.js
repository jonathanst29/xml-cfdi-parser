import * as XLSX from 'xlsx'

const COLUMNS = ['EMISOR','RFC_EMISOR','FECHA','FACTURA','RECEPTOR','RFC_RECEPTOR','CODIGO_PRODUCTO','PRODUCTO','BOTELLAS','TOTAL','DOCUMENTO']

export function exportToExcel(rows, filename = 'COMPRAS_CFDI.xlsx') {
  if (!filename.toLowerCase().endsWith('.xlsx')) filename += '.xlsx'
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
