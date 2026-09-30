import ExcelJS from 'exceljs';
import { Participant, Transaction } from '@/types/hce';

/**
 * Utility to export participants data to a highly styled Excel workbook (.xlsx)
 */
export async function exportParticipantsToExcel(participants: Participant[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HIPMI PT Telkom University';
  workbook.lastModifiedBy = 'HCE Control Center';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Data Peserta HCE 2026', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4
  });

  // 1. Report Title Banner
  worksheet.mergeCells('A1:O1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'LAPORAN DATA PESERTA & REGISTRASI - HIPMI COLLAB EXPO 2026';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF102A43' }, // HCE Dark Navy
  };
  worksheet.getRow(1).height = 36;

  // 2. Subtitle / Timestamp
  worksheet.mergeCells('A2:O2');
  const subCell = worksheet.getCell('A2');
  const exportDate = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
  subCell.value = `Dicetak otomatis dari Dashboard HCE pada: ${exportDate} | Total: ${participants.length} Peserta`;
  subCell.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  worksheet.getRow(2).height = 22;

  // Empty Spacer Row
  worksheet.getRow(3).height = 10;

  // 3. Define Table Columns
  const columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Order ID', key: 'orderId', width: 18 },
    { header: 'Nama Lengkap', key: 'name', width: 28 },
    { header: 'NIM', key: 'nim', width: 16 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'Fakultas', key: 'faculty', width: 22 },
    { header: 'Program Studi', key: 'prodi', width: 24 },
    { header: 'Kategori Tiket', key: 'ticketName', width: 22 },
    { header: 'Tipe', key: 'ticketType', width: 10 },
    { header: 'Harga (IDR)', key: 'price', width: 16 },
    { header: 'Status Pembayaran', key: 'paymentStatus', width: 20 },
    { header: 'Status Check-In', key: 'checkInStatus', width: 18 },
    { header: 'Waktu Check-In', key: 'checkInTime', width: 20 },
    { header: 'Tanggal Daftar', key: 'registeredAt', width: 20 },
  ];

  // Set columns start at Row 4
  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    worksheet.getColumn(idx + 1).width = col.width;

    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A5E61' }, // HCE Teal
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // 4. Populate Data Rows
  participants.forEach((p, index) => {
    const rowNum = index + 5;
    const row = worksheet.getRow(rowNum);
    row.height = 22;
    const isEven = index % 2 === 0;

    const rowData = [
      index + 1,
      p.orderId || '-',
      p.name || '-',
      p.nim || '-',
      p.email || '-',
      p.whatsapp || '-',
      p.faculty || '-',
      p.prodi || '-',
      p.ticketName || '-',
      p.ticketType || 'PAID',
      p.price || 0,
      p.paymentStatus === 'Paid' ? 'Pembayaran Berhasil' : p.paymentStatus === 'Pending' ? 'Menunggu Konfirmasi' : 'Pembayaran Gagal',
      p.checkInStatus || 'Not Checked In',
      p.checkInTime || '-',
      p.registeredAt ? p.registeredAt.split('T')[0] : '-',
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 9.5 };

      // Alternating row background
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      // Border
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Specific formatting per column type
      if (colIdx === 0) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colIdx === 1 || colIdx === 3) { // Order ID, NIM
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF102A43' } };
      } else if (colIdx === 10) { // Price
        cell.numFmt = '"Rp"#,##0';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colIdx === 9 || colIdx === 11 || colIdx === 12 || colIdx === 13 || colIdx === 14) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colIdx === 11) { // Payment Status
          if (p.paymentStatus === 'Paid') {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF15803D' } };
          } else if (p.paymentStatus === 'Pending') {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFB45309' } };
          } else {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFB91C1C' } };
          }
        }
        if (colIdx === 12) { // CheckIn Status
          if (p.checkInStatus === 'Checked In') {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF15803D' } };
          }
        }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Download buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `HCE_MasterData_Peserta_${dateStr}.xlsx`);
}

/**
 * Utility to export transactions data to a highly styled Excel workbook (.xlsx)
 */
export async function exportTransactionsToExcel(transactions: Transaction[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HIPMI PT Telkom University';
  workbook.lastModifiedBy = 'HCE Control Center';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Data Transaksi HCE 2026', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4
  });

  // 1. Report Title Banner
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'LAPORAN ARUS TRANSAKSI & PEMBAYARAN TIKET - HIPMI COLLAB EXPO 2026';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF102A43' },
  };
  worksheet.getRow(1).height = 36;

  // 2. Subtitle / Timestamp
  worksheet.mergeCells('A2:L2');
  const subCell = worksheet.getCell('A2');
  const exportDate = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
  const totalAmount = transactions.reduce((acc, t) => acc + (t.paymentStatus === 'Paid' ? t.amount : 0), 0);
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalAmount);
  subCell.value = `Dicetak pada: ${exportDate} | Total Transaksi: ${transactions.length} | Total Revenue Terverifikasi: ${formattedTotal}`;
  subCell.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  worksheet.getRow(2).height = 22;

  // Empty Spacer Row
  worksheet.getRow(3).height = 10;

  // 3. Define Table Columns
  const columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Order ID', key: 'orderId', width: 18 },
    { header: 'Tanggal Order', key: 'orderDate', width: 18 },
    { header: 'Nama Pembeli', key: 'participantName', width: 28 },
    { header: 'NIM', key: 'nim', width: 16 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Tiket', key: 'ticketName', width: 22 },
    { header: 'Tipe', key: 'ticketType', width: 10 },
    { header: 'Nominal (IDR)', key: 'amount', width: 18 },
    { header: 'Metode Pembayaran', key: 'paymentMethod', width: 20 },
    { header: 'Status Pembayaran', key: 'paymentStatus', width: 22 },
    { header: 'Status Tiket / Check-In', key: 'checkInStatus', width: 20 },
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    worksheet.getColumn(idx + 1).width = col.width;

    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A5E61' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // 4. Populate Data Rows
  transactions.forEach((t, index) => {
    const rowNum = index + 5;
    const row = worksheet.getRow(rowNum);
    row.height = 22;
    const isEven = index % 2 === 0;

    const rowData = [
      index + 1,
      t.orderId || '-',
      t.orderDate ? t.orderDate.split('T')[0] : '-',
      t.participantName || '-',
      t.nim || '-',
      t.email || '-',
      t.ticketName || '-',
      t.ticketType || 'PAID',
      t.amount || 0,
      t.paymentMethod || 'QRIS Instant',
      t.paymentStatus === 'Paid' ? 'Pembayaran Berhasil' : t.paymentStatus === 'Pending' ? 'Menunggu Konfirmasi' : 'Pembayaran Gagal',
      t.checkInStatus || 'Not Checked In',
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 9.5 };

      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (colIdx === 0) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colIdx === 1 || colIdx === 4) { // Order ID, NIM
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Consolas', size: 9.5, bold: true, color: { argb: 'FF102A43' } };
      } else if (colIdx === 8) { // Amount
        cell.numFmt = '"Rp"#,##0';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF0F172A' } };
      } else if (colIdx === 2 || colIdx === 7 || colIdx === 9 || colIdx === 10 || colIdx === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (colIdx === 10) { // Payment status
          if (t.paymentStatus === 'Paid') {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF15803D' } };
          } else if (t.paymentStatus === 'Pending') {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFB45309' } };
          } else {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFB91C1C' } };
          }
        }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `HCE_Transactions_Report_${dateStr}.xlsx`);
}

/**
 * Clean UTF-8 BOM CSV Exporter for Maximum Compatibility with Microsoft Excel & Google Sheets
 */
export function exportToCleanCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(sanitize).join(','),
    ...rows.map((row) => row.map(sanitize).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
