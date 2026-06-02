import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupPdfFont } from './pdfUtils';

/**
 * Generates a Black & White Class Fee Sign Sheet PDF for a given grade.
 * @param {Array} students - List of students in the grade
 * @param {string} grade - Selected grade (e.g. "Grade 10")
 * @param {string} lang - Language ('en' or 'si')
 */
export const generateFeeSignSheetPDF = (students, grade, lang = 'en') => {
    if (!students || students.length === 0) {
        return { success: false, error: lang === 'si' ? 'මෙම ශ්‍රේණිය සඳහා සිසුන් හමු නොවීය.' : 'No students found for this grade.' };
    }

    // 1. Extract unique subjects enrolled by students in this grade
    const gradeSubjectsSet = new Set();
    students.forEach(student => {
        (student.enrollments || []).forEach(e => {
            if (e.subject) {
                gradeSubjectsSet.add(e.subject);
            }
        });
    });
    const gradeSubjects = Array.from(gradeSubjectsSet).sort();

    if (gradeSubjects.length === 0) {
        return { success: false, error: lang === 'si' ? 'මෙම ශ්‍රේණියේ කිසිදු විෂයකට ලියාපදිංචි වී ඇති සිසුන් හමු නොවීය.' : 'No active subject enrollments found in this grade.' };
    }

    // Determine layout: landscape if more than 5 subjects to fit everything nicely
    const isLandscape = gradeSubjects.length > 5;
    const doc = new jsPDF(isLandscape ? 'landscape' : 'portrait', 'mm', 'a4');
    setupPdfFont(doc, lang);

    const pageWidth = doc.internal.pageSize.width;

    // --- Header Section (B&W Style) ---
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("EDUFLEX INSTITUTE", 14, 18);

    doc.setFontSize(13);
    doc.text(lang === 'si' ? "පන්ති ගාස්තු අත්සන් පත්‍රය" : "CLASS FEE SIGN SHEET", 14, 25);

    // Dotted month space and grade info
    doc.setFontSize(10);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.text(`${lang === 'si' ? 'ශ්‍රේණිය' : 'Grade'}: ${grade}`, 14, 33);
    doc.text(`${lang === 'si' ? 'මාසය' : 'Month'}: ....................................................`, pageWidth / 2 - 30, 33);
    doc.text(`${lang === 'si' ? 'දිනය' : 'Date'}: .........................`, pageWidth - 50, 33);

    // --- Table Headers (Index No Removed) ---
    const colNo = lang === 'si' ? 'අංකය' : 'No.';
    const colName = lang === 'si' ? 'ශිෂ්‍ය නාමය' : 'Student Name';
    const headers = [colNo, colName, ...gradeSubjects];

    // Placeholder text for manual Date & Sign
    const cellPlaceholder = lang === 'si' 
        ? 'දිනය: ................\n\nඅත්සන: .............' 
        : 'Date: ................\n\nSign: .............';

    // --- Table Rows ---
    const rows = [];
    students.forEach((student, idx) => {
        const row = [idx + 1, student.name];
        gradeSubjects.forEach(subject => {
            const enrolled = (student.enrollments || []).some(e => e.subject === subject);
            row.push(enrolled ? cellPlaceholder : "N/A"); // Placeholders for enrolled, "N/A" for non-enrolled
        });
        rows.push(row);
    });

    // --- Generate Grid ---
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 38,
        theme: 'grid',
        styles: {
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica',
            fontSize: 9,
            textColor: [0, 0, 0],
            lineColor: [100, 100, 100],
            lineWidth: 0.15,
            cellPadding: 6, // Generous padding for manual writing
            minCellHeight: 20, // Ensure cells are tall enough
        },
        headStyles: {
            fillColor: [230, 230, 230], // Light gray header
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 }, // No.
            1: { cellWidth: isLandscape ? 75 : 'auto' } // Name gets more space now
        },
        didParseCell: (data) => {
            // Style active cells
            if (data.section === 'body' && data.column.index >= 2) {
                if (data.cell.raw === "N/A") {
                    data.cell.styles.halign = 'center';
                    data.cell.styles.valign = 'middle';
                    data.cell.styles.fillColor = [240, 240, 240]; // Darker gray for N/A
                    data.cell.styles.textColor = [130, 130, 130];
                } else {
                    data.cell.styles.fontSize = 8.5; // Larger text for better readability
                    data.cell.styles.halign = 'left';
                    data.cell.styles.valign = 'middle';
                    data.cell.styles.fillColor = [255, 255, 255]; // Enrolled = white blank
                }
            }
        },
        margin: { top: 38, left: 14, right: 14, bottom: 15 },
        didDrawPage: (data) => {
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text("Eduflex Institute Management System • B&W Sign Sheet", 14, doc.internal.pageSize.height - 8);
            doc.text(
                `${lang === 'si' ? 'පිටුව' : 'Page'} ${data.pageNumber} / ${doc.internal.getNumberOfPages()}`, 
                doc.internal.pageSize.width - 28, 
                doc.internal.pageSize.height - 8
            );
        }
    });

    doc.save(`Fee_Sign_Sheet_${grade.replace(/\s+/g, '_')}.pdf`);
    return { success: true };
};

/**
 * Generates a Black & White Tute Issue Sign Sheet PDF for Mathematics.
 * @param {Array} students - List of students in the grade
 * @param {string} grade - Selected grade (e.g. "Grade 10")
 * @param {string} lang - Language ('en' or 'si')
 */
export const generateTuteSignSheetPDF = (students, grade, lang = 'en') => {
    if (!students || students.length === 0) {
        return { success: false, error: lang === 'si' ? 'මෙම ශ්‍රේණිය සඳහා සිසුන් හමු නොවීය.' : 'No students found for this grade.' };
    }

    // Filter students enrolled in Mathematics
    const mathStudents = students.filter(student => {
        return (student.enrollments || []).some(e => {
            const subName = (e.subject || "").toLowerCase();
            return subName.includes("math"); // Matches Mathematics, Maths, etc.
        });
    });

    if (mathStudents.length === 0) {
        return { success: false, error: lang === 'si' ? 'මෙම ශ්‍රේණියේ ගණිතය (Mathematics) විෂයට ලියාපදිංචි වී ඇති සිසුන් හමු නොවීය.' : 'No students enrolled in Mathematics found in this grade.' };
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');
    setupPdfFont(doc, lang);

    const pageWidth = doc.internal.pageSize.width;

    // --- Header Section (B&W Style) ---
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'bold');
    doc.text("EDUFLEX INSTITUTE", 14, 18);

    doc.setFontSize(13);
    doc.text(
        lang === 'si' 
            ? "නිබන්ධන නිකුත් කිරීම් අත්සන් පත්‍රය - ගණිතය" 
            : "TUTE ISSUE SIGN SHEET - MATHEMATICS", 
        14, 
        25
    );

    // Info details
    doc.setFontSize(10);
    doc.setFont(lang === 'si' ? 'NotoSansSinhala' : 'helvetica', 'normal');
    doc.text(`${lang === 'si' ? 'ශ්‍රේණිය' : 'Grade'}: ${grade}`, 14, 33);
    doc.text(`${lang === 'si' ? 'මාසය' : 'Month'}: ....................................................`, pageWidth / 2 - 30, 33);
    doc.text(`${lang === 'si' ? 'දිනය' : 'Date'}: .........................`, pageWidth - 50, 33);

    // --- Table Headers (Index No Removed) ---
    const colNo = lang === 'si' ? 'අංකය' : 'No.';
    const colName = lang === 'si' ? 'ශිෂ්‍ය නාමය' : 'Student Name';
    
    // Customized term tute columns as requested by the user
    const tuteCols = lang === 'si' ? [
        '1 වාරය\nටියුට් 01',
        '1 වාරය\nටියුට් 02',
        '2 වාරය\nටියුට් 01',
        '2 වාරය\nටියුට් 02',
        '3 වාරය\nටියුට් 01',
        '3 වාරය\nටියුට් 02'
    ] : [
        '1st Term\nTute 01',
        '1st Term\nTute 02',
        '2nd Term\nTute 01',
        '2nd Term\nTute 02',
        '3rd Term\nTute 01',
        '3rd Term\nTute 02'
    ];

    const headers = [colNo, colName, ...tuteCols];

    // Placeholder text for manual Sign only
    const cellPlaceholder = lang === 'si' 
        ? '\nඅත්සන: ................\n' 
        : '\nSign: ................\n';

    // --- Table Rows ---
    const rows = [];
    mathStudents.forEach((student, idx) => {
        const row = [idx + 1, student.name, cellPlaceholder, cellPlaceholder, cellPlaceholder, cellPlaceholder, cellPlaceholder, cellPlaceholder];
        rows.push(row);
    });

    // --- Generate Grid ---
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 38,
        theme: 'grid',
        styles: {
            font: lang === 'si' ? 'NotoSansSinhala' : 'helvetica',
            fontSize: 9,
            textColor: [0, 0, 0],
            lineColor: [100, 100, 100],
            lineWidth: 0.15,
            cellPadding: 6, // Generous padding for signature or ticks
            minCellHeight: 20, // Taller cells for easy signing
        },
        headStyles: {
            fillColor: [230, 230, 230], // Light gray header
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            fontSize: 8.5 // Slightly smaller to fit vertical text
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 }, // No.
            1: { cellWidth: 'auto' }, // Student Name gets remaining space
            2: { cellWidth: 20 }, // 1st Term Tute 01
            3: { cellWidth: 20 }, // 1st Term Tute 02
            4: { cellWidth: 20 }, // 2nd Term Tute 01
            5: { cellWidth: 20 }, // 2nd Term Tute 02
            6: { cellWidth: 20 }, // 3rd Term Tute 01
            7: { cellWidth: 20 }  // 3rd Term Tute 02
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index >= 2) {
                data.cell.styles.fontSize = 8; // Larger text
                data.cell.styles.halign = 'left';
                data.cell.styles.valign = 'middle';
            }
        },
        margin: { top: 38, left: 14, right: 14, bottom: 15 },
        didDrawPage: (data) => {
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text("Eduflex Institute Management System • B&W Tute Sheet", 14, doc.internal.pageSize.height - 8);
            doc.text(
                `${lang === 'si' ? 'පිටුව' : 'Page'} ${data.pageNumber} / ${doc.internal.getNumberOfPages()}`, 
                doc.internal.pageSize.width - 28, 
                doc.internal.pageSize.height - 8
            );
        }
    });

    doc.save(`Tute_Sign_Sheet_${grade.replace(/\s+/g, '_')}.pdf`);
    return { success: true };
};
