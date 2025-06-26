// src/utils/exportUtils.ts

import { Order } from '@/types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value instanceof Date) {
          return `"${value.toLocaleString('id-ID')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const htmlContent = `
    <table>
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => 
          `<tr>
            ${headers.map(header => {
              const value = row[header];
              if (value instanceof Date) {
                return `<td>${value.toLocaleString('id-ID')}</td>`;
              }
              if (typeof value === 'object' && value !== null) {
                return `<td>${JSON.stringify(value)}</td>`;
              }
              return `<td>${value || ''}</td>`;
            }).join('')}
          </tr>`
        ).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.click();
  URL.revokeObjectURL(url);
};

// --- FUNGSI TEMPLATE UNTUK BAHAN ---
export const generateIngredientTemplate = () => {
  const templateData = [
    {
      name: 'Contoh Ayam Potong',
      category: 'Daging',
      unit: 'potong',
      currentStock: 50,
      minStock: 10,
    },
  ];
  exportToCSV(templateData, 'template_import_bahan.csv');
};

// --- FUNGSI TEMPLATE UNTUK PRODUK ---
export const generateProductTemplate = () => {
  const templateData = [
    {
      name: 'Contoh Ayam Goreng',
      category: 'Menu Utama',
      unit: 'porsi',
      minStock: 5,
    },
  ];
  exportToCSV(templateData, 'template_import_produk.csv');
};