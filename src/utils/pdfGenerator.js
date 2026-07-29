import jsPDF from 'jspdf';

export const generateModulePDF = (moduleData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkBg = [15, 23, 42];      // #0f172a
  const goldColor = [217, 119, 6];   // #d97706
  const textDark = [30, 41, 59];     // #1e293b
  const textLight = [248, 250, 252]; // #f8fafc

  // --- CAPA / COVER PAGE ---
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Gold Line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1.5);
  doc.line(margin, 35, pageWidth - margin, 35);

  // Badge
  doc.setFillColor(...goldColor);
  doc.rect(margin, 45, 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(moduleData.badge.toUpperCase(), margin + 4, 50.5);

  // Main Title
  doc.setTextColor(...textLight);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');

  const titleLines = doc.splitTextToSize(moduleData.fullTitle, contentWidth);
  doc.text(titleLines, margin, 70);

  // Subtitle / Description
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const descLines = doc.splitTextToSize(moduleData.description, contentWidth);
  doc.text(descLines, margin, 100);

  // Metadata Box
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, 150, contentWidth, 30, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...goldColor);
  doc.text(`CATEGORIA: ${moduleData.category.toUpperCase()}`, margin + 10, 162);
  doc.setTextColor(...textLight);
  doc.text(`TOTAL DE CAPÍTULOS: ${moduleData.chapters.length}  |  LEITURA ESTIMADA: ${moduleData.readingTime}`, margin + 10, 172);

  // Cover Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('AURA PRO — PLATAFORMA INTEGRADA DE EVOLUÇÃO MASCULINA', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // --- CHAPTERS PAGES ---
  moduleData.chapters.forEach((chapter, index) => {
    doc.addPage();

    // Header bar
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(...goldColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`AURA PRO  |  ${moduleData.title.toUpperCase()}`, margin, 12);
    doc.text(`CAPÍTULO ${index + 1}`, pageWidth - margin, 12, { align: 'right' });

    let currentY = 30;

    // Chapter Title
    doc.setTextColor(...textDark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const chapTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chapTitleLines, margin, currentY);
    currentY += chapTitleLines.length * 8 + 5;

    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Process Chapter Content Body
    const cleanContent = chapter.content
      .replace(/^#\s+.*$/gm, '') // Remove main h1 duplicates
      .replace(/^###\s+(.*$)/gm, '\n[SUBHEADING] $1')
      .replace(/^##\s+(.*$)/gm, '\n[HEADING] $1')
      .replace(/^\-\s+(.*$)/gm, '• $1');

    const lines = cleanContent.split('\n');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        currentY += 4;
        return;
      }

      if (trimmed.startsWith('[HEADING]')) {
        currentY += 4;
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = 25;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...goldColor);
        doc.text(trimmed.replace('[HEADING]', '').trim(), margin, currentY);
        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
      } else if (trimmed.startsWith('[SUBHEADING]')) {
        currentY += 3;
        if (currentY > pageHeight - 25) {
          doc.addPage();
          currentY = 25;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(trimmed.replace('[SUBHEADING]', '').trim(), margin, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
      } else {
        const wrapped = doc.splitTextToSize(trimmed, contentWidth);
        wrapped.forEach((wLine) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = 25;
          }
          doc.text(wLine, margin, currentY);
          currentY += 5;
        });
      }
    });

    // Page Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  });

  // Save PDF
  const filename = `${moduleData.id}_Ebook_AuraPro.pdf`;
  doc.save(filename);
};
