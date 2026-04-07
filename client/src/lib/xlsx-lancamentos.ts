import * as XLSX from 'xlsx';
import { formatCurrency } from './helpers';
import type { Category } from './types';

export interface LancamentosExportData {
  year: number;
  month: number;
  monthName: string;
  categories: Category[];
  entries: Array<{
    date: string;
    day: number;
    values: Record<string, number>;
    total: number;
  }>;
}

export function exportLancamentosXLSX(data: LancamentosExportData) {
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Header
  XLSX.utils.sheet_add_aoa(ws, [
    [`Lançamentos - ${data.monthName} ${data.year}`],
    [],
  ], { origin: 'A1' });

  // Merge title cell
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: data.categories.length + 1 } }];

  // Column headers
  const headers = ['Data', 'Dia', ...data.categories.map(c => c.name), 'Total'];
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A3' });

  // Data rows
  const rows = data.entries.map(entry => [
    entry.date,
    entry.day.toString(),
    ...data.categories.map(c => entry.values[c.id] || 0),
    entry.total,
  ]);
  XLSX.utils.sheet_add_aoa(ws, rows, { origin: 'A4' });

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 8 },  // Dia
    ...data.categories.map(() => ({ wch: 14 })),
    { wch: 14 }, // Total
  ];

  // Styling
  const headerStyle = {
    fill: { fgColor: { rgb: 'FF2563EB' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const titleStyle = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  // Apply header styling
  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: i });
    ws[cellRef].s = headerStyle;
  }

  // Apply title styling
  ws['A1'].s = titleStyle;

  // Create workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos');
  XLSX.writeFile(wb, `lancamentos-${data.monthName.toLowerCase()}-${data.year}.xlsx`);
}

export function importLancamentosXLSX(
  file: File,
  categories: Category[]
): Promise<Record<string, Record<string, number>>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

        const result: Record<string, Record<string, number>> = {};
        const catMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

        // Skip title and header rows (first 3 rows)
        for (let i = 3; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) break; // Stop at empty row

          const dateStr = row[0]?.toString() || '';
          if (!dateStr) break;

          const values: Record<string, number> = {};
          
          // Parse category values
          for (let j = 2; j < row.length - 1; j++) {
            const catName = rows[2]?.[j]?.toString().toLowerCase() || '';
            const catId = catMap.get(catName);
            if (catId) {
              const val = parseFloat(row[j]?.toString().replace(',', '.') || '0') || 0;
              values[catId] = val;
            }
          }

          result[dateStr] = values;
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}
