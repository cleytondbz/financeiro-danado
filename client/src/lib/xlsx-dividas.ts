import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './helpers';

export interface DebtExportData {
  id: string;
  personName: string;
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  paidAmount?: number;
}

export function exportDividasXLSX(debts: DebtExportData[]) {
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Header
  XLSX.utils.sheet_add_aoa(ws, [
    ['Dívidas - Relatório Completo'],
    [],
  ], { origin: 'A1' });

  // Merge title cell
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  // Summary section
  const totalPending = debts.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0);
  const totalPaid = debts.filter(d => d.paid).reduce((s, d) => s + (d.paidAmount || d.amount), 0);

  XLSX.utils.sheet_add_aoa(ws, [
    ['Total Pendente', formatCurrency(totalPending)],
    ['Total Pago', formatCurrency(totalPaid)],
    [],
  ], { origin: 'A3' });

  // Column headers
  const headers = ['Pessoa', 'Descrição', 'Valor', 'Data', 'Status', 'Valor Pago'];
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A7' });

  // Data rows
  const rows = debts.map(debt => [
    debt.personName,
    debt.description,
    debt.amount,
    debt.date,
    debt.paid ? 'Pago' : 'Pendente',
    debt.paidAmount || (debt.paid ? debt.amount : 0),
  ]);
  XLSX.utils.sheet_add_aoa(ws, rows, { origin: 'A8' });

  // Column widths
  ws['!cols'] = [
    { wch: 15 }, // Pessoa
    { wch: 20 }, // Descrição
    { wch: 12 }, // Valor
    { wch: 12 }, // Data
    { wch: 12 }, // Status
    { wch: 12 }, // Valor Pago
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

  const summaryStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'FFF0F0F0' } },
  };

  // Apply title styling
  ws['A1'].s = titleStyle;

  // Apply summary styling
  for (let i = 0; i < 2; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2 + i, c: 0 });
    ws[cellRef].s = summaryStyle;
  }

  // Apply header styling
  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c: i });
    ws[cellRef].s = headerStyle;
  }

  // Color pending/paid rows
  for (let i = 0; i < rows.length; i++) {
    const debt = debts[i];
    const rowColor = debt.paid ? 'FFC8E6C9' : 'FFFFCDD2'; // Green for paid, red for pending
    for (let j = 0; j < headers.length; j++) {
      const cellRef = XLSX.utils.encode_cell({ r: 7 + i, c: j });
      ws[cellRef].s = {
        fill: { fgColor: { rgb: rowColor } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }

  // Create workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dívidas');
  XLSX.writeFile(wb, `dividas-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function importDividasXLSX(
  file: File
): Promise<Array<Omit<DebtExportData, 'id'>>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

        const result: Array<Omit<DebtExportData, 'id'>> = [];

        // Skip title, summary and header rows (first 7 rows)
        for (let i = 7; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) break; // Stop at empty row

          const personName = row[0]?.toString().trim() || '';
          if (!personName) break;

          const description = row[1]?.toString().trim() || '';
          const amount = parseFloat(row[2]?.toString().replace(',', '.') || '0') || 0;
          const date = row[3]?.toString() || new Date().toISOString().split('T')[0];
          const status = row[4]?.toString().toLowerCase() || 'pendente';
          const paidAmount = parseFloat(row[5]?.toString().replace(',', '.') || '0') || 0;

          result.push({
            personName,
            description,
            amount,
            date,
            paid: status === 'pago',
            paidAmount: status === 'pago' ? paidAmount : undefined,
          });
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
