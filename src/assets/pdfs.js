// Central list of available PDFs
// Base library served from the public/ folder
const baseLibrary = [
  {
    id: 'Portefeuille',
    title: 'Portefeuille',
    file: '/Portefeuille.pdf',
  },
  {
    id: 'Certificats',
    title: 'Certificats',
    file: '/Certif02.pdf',
  },
];

// Fetch custom PDFs from Vercel Blob via API
export async function getPdfLibrary() {
  try {
    const response = await fetch('/api/list');
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      // Merge base library with custom PDFs from Vercel Blob
      const customPdfs = data.data;
      const map = new Map(baseLibrary.map((x) => [x.id, x]));
      for (const pdf of customPdfs) {
        if (pdf && pdf.id && pdf.title && pdf.file) {
          map.set(pdf.id, pdf);
        }
      }
      return Array.from(map.values());
    }
  } catch (error) {
    console.error('Failed to fetch custom PDFs:', error);
  }
  return baseLibrary;
}

// For backward compatibility, export a static snapshot
// Note: This won't include custom PDFs on initial load
// Components should call getPdfLibrary() asynchronously for full list
const pdfLibrary = baseLibrary;
export { pdfLibrary };
export default pdfLibrary;
