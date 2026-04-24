import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { setupPdfFont, formatDate } from './pdfUtils';

export const generateFeeReport = (student, subjectMap, stats, t, lang) => {
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
    doc.text(t('performance_analytics'), 14, 32);

    // Generation Date
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateStr = formatDate(new Date(), lang);
    doc.text(`${t('generated_on')}: ${dateStr}`, 14, 40);

    // Student Profile Section
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 52, 182, 38, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(14, 52, 182, 38, 'S');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    // Left Column
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text(`${t('student_name')}:`, 20, 62);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.name || "N/A", 52, 62);

    doc.setTextColor(71, 85, 105);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text(`${t('index_number')}:`, 20, 72);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.indexNumber || "N/A", 52, 72);

    doc.setTextColor(71, 85, 105);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("Mobile:", 20, 82);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.mobile || "N/A", 52, 82);

    // Right Column
    doc.setTextColor(71, 85, 105);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text(`${t('grade')}:`, 115, 62);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(student.grade || "N/A", 135, 62);

    doc.setTextColor(71, 85, 105);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("Overall Att:", 115, 72);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    const attColor = stats?.pct >= 75 ? [34, 197, 94] : stats?.pct >= 50 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(attColor[0], attColor[1], attColor[2]);
    doc.text(`${stats?.pct || 0}%`, 140, 72);

    // ── Table Data PREP ──
    const tableHeaders = [[t('add_subject').replace(' එක් කරන්න', '').replace('Add ', ''), t('monthly_collection')]];
    const tableData = [];
    let totalFee = 0;

    if (student.enrollments && student.enrollments.length > 0) {
        student.enrollments.forEach(enrollment => {
            const subject = subjectMap[enrollment.subject];
            const fee = subject ? subject.fee : 0;
            totalFee += fee;

            tableData.push([
                enrollment.subject,
                `Rs. ${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]);
        });

        tableData.push([
            { content: `${t('total')}:`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
            { content: `Rs. ${totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42], fillColor: [241, 245, 249] } }
        ]);
    } else {
        tableData.push([{ content: t('no_students'), colSpan: 2, styles: { halign: 'center', fontStyle: 'italic', textColor: 150 } }]);
    }

    // ── Generate Fee Table ──
    doc.autoTable({
        startY: 98,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { 
            fillColor: [71, 85, 105], 
            textColor: 255,
            fontSize: 10,
            halign: 'center',
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica'
        },
        bodyStyles: {
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica'
        },
        styles: { 
            fontSize: 10,
            cellPadding: 7,
            lineColor: [226, 232, 240]
        },
        columnStyles: {
            0: { cellWidth: 'auto', valign: 'middle' },
            1: { cellWidth: 65, halign: 'right', valign: 'middle' }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }
    });

    let currentY = doc.lastAutoTable.finalY + 14;

    // ── Graphical Performance Bar Section ──
    if (stats?.subjects && stats.subjects.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
        doc.text(t('performance_analytics'), 14, currentY + 8);
        
        currentY += 16;
        
        stats.subjects.forEach(subj => {
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
            doc.text(subj.name, 14, currentY);
            
            // Draw track
            doc.setFillColor(241, 245, 249); // Empty gray bar
            doc.rect(70, currentY - 4, 110, 6, 'F');
            
            // Draw progress
            const pct = subj.pct || 0;
            if (pct > 0) {
                const fillWidth = (pct / 100) * 110;
                // Color based on pct
                if (pct >= 75) doc.setFillColor(34, 197, 94); // Green
                else if (pct >= 50) doc.setFillColor(234, 179, 8); // Yellow
                else doc.setFillColor(239, 68, 68); // Red
                
                doc.rect(70, currentY - 4, fillWidth, 6, 'F');
            }
            
            // Percentage Text
            doc.setFontSize(9);
            doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(`${pct}%`, 184, currentY + 1);
            
            currentY += 14;
        });
    }

    // Footer - centered notice
    currentY += 15;
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'italic');
    doc.text(lang === 'si' ? "මෙය පරිගණකයෙන් සැකසූ වාර්තාවක් වන අතර අත්සනක් අවශ්‍ය නොවේ." : "This is a system-generated report and does not require a physical signature.", 105, currentY, { align: 'center' });
    
    // Page bottom border/color accent
    doc.setDrawColor(99, 102, 241); // Indigo accent line
    doc.setLineWidth(1.5);
    doc.line(14, 280, 196, 280);

    // Save
    doc.save(`Eduflex_Report_${student.indexNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
};
