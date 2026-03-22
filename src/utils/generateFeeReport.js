import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateFeeReport = (student, subjectMap) => {
    const doc = new jsPDF();

    // Header Background
    doc.setFillColor(30, 41, 59); // Dark header background
    doc.rect(0, 0, 210, 40, 'F');

    // Title text
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255); // White primary text
    doc.setFont('helvetica', 'bold');
    doc.text("Eduflex Institute", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text("Student Enrolled Classes & Fees Report", 14, 30);

    // Generation Date
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Generated on: ${date}`, 14, 38);

    // Student Profile Section
    doc.setFillColor(245, 247, 250); // Light gray profile section
    doc.rect(14, 45, 182, 35, 'F');

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    // Left Column
    doc.setFont('helvetica', 'bold');
    doc.text("Student Name:", 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name || "N/A", 50, 55);

    doc.setFont('helvetica', 'bold');
    doc.text("Index No:", 18, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(student.indexNumber || "N/A", 50, 65);

    doc.setFont('helvetica', 'bold');
    doc.text("Mobile:", 18, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(student.mobile || "N/A", 50, 75);

    // Right Column
    doc.setFont('helvetica', 'bold');
    doc.text("Grade:", 110, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(student.grade || "N/A", 142, 55);


    // Table Data preparation
    const tableHeaders = [["Class Name", "Monthly Fee (LKR)"]];
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

        // Add Total Row
        tableData.push([
            { content: 'Total Monthly Fee:', styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } },
            { content: `Rs. ${totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', textColor: [33, 150, 243] } }
        ]);
    } else {
        tableData.push([{ content: 'No classes enrolled', colSpan: 2, styles: { halign: 'center', fontStyle: 'italic', textColor: 150 } }]);
    }

    // Generate Table
    doc.autoTable({
        startY: 90,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { 
            fillColor: [30, 41, 59], // Dark blue/slate standard header 
            textColor: 255,
            fontSize: 11,
            halign: 'center'
        },
        styles: { 
            fontSize: 10,
            cellPadding: 6,
            lineColor: [220, 220, 220]
        },
        columnStyles: {
            0: { cellWidth: 'auto', valign: 'middle' },
            1: { cellWidth: 60, halign: 'right', valign: 'middle' }
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        }
    });

    // Footer - centered notice
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text("This is a system-generated report and does not require a physical signature.", 105, finalY + 15, { align: 'center' });
    
    // Page bottom border/color accent
    doc.setDrawColor(33, 150, 243); // Blue accent line
    doc.setLineWidth(1);
    doc.line(14, 280, 196, 280);

    // Save
    doc.save(`Fee_Report_${student.indexNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
};
