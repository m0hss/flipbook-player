// Central list of available PDFs served from the public/ folder
// To add more, drop a PDF into public/ and add an entry here.

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

export function getPdfLibrary() {
  // Merge user-defined entries from localStorage (if any) with the base list
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pdfLibraryExtras') : null;
    const extras = raw ? JSON.parse(raw) : [];
    if (Array.isArray(extras)) {
      // Filter out duplicates by id (extras override base)
      const map = new Map(baseLibrary.map((x) => [x.id, x]));
      for (const e of extras) {
        if (e && e.id && e.title && e.file) {
          map.set(e.id, e);
        }
      }
      return Array.from(map.values());
    }
  } catch {
    // ignore parse errors and fall back
  }
  return baseLibrary;
}

const pdfLibrary = getPdfLibrary();
export { pdfLibrary };
export default pdfLibrary;
