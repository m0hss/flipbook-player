// Fetch PDFs from Vercel Blob via API
export async function getPdfLibrary() {
  try {
    const response = await fetch('/api/list');
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.filter(pdf => pdf && pdf.id && pdf.title && pdf.file);
    }
  } catch (error) {
    console.error('Failed to fetch PDFs:', error);
  }
  return [];
}

// For backward compatibility
const pdfLibrary = [];
export { pdfLibrary };
export default pdfLibrary;
