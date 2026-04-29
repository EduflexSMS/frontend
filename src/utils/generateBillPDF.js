import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { setupPdfFont, formatDate } from './pdfUtils';

export const generateBillPDF = (transaction, lang = 'en') => {
    const doc = new jsPDF();
    setupPdfFont(doc, lang);

    // Header Background
    doc.setFillColor(15, 23, 42); // Dark slate header
    doc.rect(0, 0, 210, 45, 'F');

    // Title text
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("EDUFLEX INSTITUTE", 14, 22);

    doc.setFontSize(13);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.text("Payment Receipt", 14, 32);

    // Generation Date & TXN
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateStr = formatDate(new Date(), lang);
    doc.text(`Date: ${dateStr}`, 14, 40);
    doc.text(`Receipt No: ${transaction.transactionId}`, 130, 40);

    // Student Profile Section
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 52, 182, 28, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(14, 52, 182, 28, 'S');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    // Left Column
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("Student Name:", 20, 62);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(transaction.studentName || "N/A", 55, 62);

    doc.setTextColor(71, 85, 105);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("Index Number:", 20, 72);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(transaction.indexNumber || "N/A", 55, 72);

    // ── Table Data PREP ──
    const tableHeaders = [["Description", "Amount"]];
    const tableData = [];

    transaction.items.forEach(item => {
        tableData.push([
            `${item.subject} (${item.monthName})`,
            `Rs. ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
    });

    tableData.push([
        { content: `Total Amount:`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
        { content: `Rs. ${transaction.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42], fillColor: [241, 245, 249] } }
    ]);

    // ── Generate Fee Table ──
    doc.autoTable({
        startY: 90,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { 
            fillColor: [71, 85, 105], 
            textColor: 255,
            fontSize: 11,
            halign: 'center',
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica'
        },
        bodyStyles: {
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica'
        },
        styles: { 
            fontSize: 11,
            cellPadding: 7,
            lineColor: [226, 232, 240]
        },
        columnStyles: {
            0: { cellWidth: 'auto', valign: 'middle' },
            1: { cellWidth: 65, halign: 'right', valign: 'middle', fontStyle: 'bold' }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }
    });

    let currentY = doc.lastAutoTable.finalY + 25;

    // Footer - centered notice
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'italic');
    doc.text(lang === 'si' ? "මෙය පරිගණකයෙන් සැකසූ බිල්පතක් වන අතර අත්සනක් අවශ්‍ය නොවේ." : "This is a system-generated receipt and does not require a physical signature.", 105, currentY, { align: 'center' });
    
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("Thank you!", 105, currentY, { align: 'center' });

    // Page bottom border/color accent
    doc.setDrawColor(99, 102, 241); // Indigo accent line
    doc.setLineWidth(1.5);
    doc.line(14, 280, 196, 280);

    // Save
    doc.save(`Receipt_${transaction.transactionId}_${transaction.indexNumber}.pdf`);
};
