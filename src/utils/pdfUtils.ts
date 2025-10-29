import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Xuất HTML thành PDF
 */
export const exportToPDF = async (
  elementId: string,
  filename: string = 'invoice.pdf',
  options?: {
    width?: number;
    height?: number;
    padding?: number;
  }
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const padding = options?.padding || 10;
  const pdfWidth = options?.width || 210; // A4 width in mm
  const pdfHeight = options?.height || 297; // A4 height in mm

  try {
    // Đảm bảo element đã hiển thị và sẵn sàng
    if (!element.offsetParent && element.style.display === 'none') {
      throw new Error('Element không hiển thị, không thể xuất PDF');
    }
    
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      removeContainer: false
    });

    const imgWidth = pdfWidth - (padding * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate number of pages needed
    const pdf = new jsPDF('p', 'mm', 'a4');
    const totalPages = Math.ceil(imgHeight / (pdfHeight - (padding * 2)));
    
    // Add pages
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const yPosition = -(i * (pdfHeight - (padding * 2))) + padding;
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        padding,
        yPosition,
        imgWidth,
        imgHeight
      );
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Không thể xuất PDF. Vui lòng thử lại.');
  }
};

/**
 * Format số tiền VNĐ
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format ngày tháng
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

