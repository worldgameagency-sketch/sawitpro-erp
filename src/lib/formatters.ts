/**
 * Utility formater mata uang Rupiah dan satuan kebun (Kg, Ha)
 */

export function formatRupiah(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 'Rp 0';
  }
  const num = Math.round(Number(value));
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num).replace('IDR', 'Rp');
}

export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatKg(value: number | string | undefined | null): string {
  return `${formatNumber(value)} kg`;
}

export function formatHa(value: number | string | undefined | null): string {
  return `${formatNumber(value)} ha`;
}

export function formatDateIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getMonthYearIndo(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Parsing input teks ke angka bersih
 */
export function parseNumberInput(input: string): number {
  if (!input) return 0;
  // Hapus karakter selain angka dan titik/koma
  const clean = input.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
