import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Xuất HTML thành PDF với chất lượng cao
 */
export const exportToPDF = async (
  elementId: string,
  filename: string = 'invoice.pdf',
  options?: {
    width?: number;
    height?: number;
    padding?: number;
    scale?: number;
  }
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const padding = options?.padding || 10;
  const pdfWidth = options?.width || 210; // A4 width in mm
  const pdfHeight = options?.height || 297; // A4 height in mm
  const scale = options?.scale || 2; // ✅ Tăng scale để có chất lượng tốt hơn

  try {
    // Đảm bảo element đã hiển thị và sẵn sàng
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    
    // Tạm thời đảm bảo element hiển thị
    element.style.display = 'block';
    element.style.visibility = 'visible';
    
    // Scroll về đầu để capture toàn bộ nội dung
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);
    
    // Đợi một chút để đảm bảo DOM đã render xong (quan trọng cho phần phụ tùng)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert HTML to canvas với chất lượng cao
    const canvas = await html2canvas(element, {
      scale: scale, // ✅ Scale cao hơn để có chất lượng tốt
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      removeContainer: false,
      windowWidth: element.scrollWidth, // ✅ Capture toàn bộ chiều rộng
      windowHeight: element.scrollHeight, // ✅ Capture toàn bộ chiều cao (bao gồm phần phụ tùng)
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // ✅ Đảm bảo cloned element cũng hiển thị đúng
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
        }
      }
    });

    // Khôi phục style gốc
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
    window.scrollTo(0, originalScrollY);

    const imgWidth = pdfWidth - (padding * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate number of pages needed
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdfHeight - (padding * 2);
    const totalPages = Math.ceil(imgHeight / pageHeight) || 1;
    
    // ✅ Logic pagination đơn giản và chính xác
    const imgData = canvas.toDataURL('image/png', 1.0); // ✅ Chất lượng cao
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Tính yPosition: di chuyển ảnh lên trên để hiển thị phần tương ứng
      const yPosition = padding - (i * pageHeight);
      
      pdf.addImage(
        imgData,
        'PNG',
        padding,
        yPosition,
        imgWidth,
        imgHeight,
        undefined,
        'FAST' // ✅ Tối ưu tốc độ render
      );
    }

    // Save PDF
    pdf.save(filename);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(error.message || 'Không thể xuất PDF. Vui lòng thử lại.');
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

