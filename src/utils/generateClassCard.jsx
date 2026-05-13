import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';

const ClassCard = ({ student }) => {
  return (
    <div style={{
      width: '1000px',
      height: '600px',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'row',
      position: 'relative',
      fontFamily: "Arial, Helvetica, sans-serif",
      color: '#09090b',
      overflow: 'hidden',
      border: '4px solid #f4f4f5',
      boxSizing: 'border-box'
    }}>
      {/* Decorative accent line on top */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}></div>

      {/* Left Section - Details */}
      <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: 'auto' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
          }}>
            <span style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>E</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '38px', fontWeight: 900, letterSpacing: '-1px', color: '#18181b' }}>EDUFLEX</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 700, letterSpacing: '4px', color: '#71717a', textTransform: 'uppercase' }}>Institute</p>
          </div>
        </div>

        {/* Student Info */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '56px', 
            fontWeight: 800, 
            color: '#09090b', 
            lineHeight: 1.1,
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {student.name}
          </h2>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#eeeeee',
            border: '3px solid #333333',
            padding: '10px 30px',
            borderRadius: '15px',
            marginBottom: '50px',
            minWidth: '200px',
            minHeight: '60px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              margin: 0, 
              fontSize: '36px', 
              color: '#000000', 
              fontWeight: '900', 
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {student.indexNumber || 'ID MISSING'}
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Grade</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#18181b' }}>{student.grade}</p>
            </div>
            <div style={{ width: '2px', background: '#e4e4e7' }}></div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>Mobile</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#18181b' }}>{student.mobile || 'N/A'}</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* Right Section - QR Code */}
      <div style={{ 
        width: '360px', 
        background: '#fafafa', 
        borderLeft: '2px dashed #e4e4e7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          padding: '12px 24px',
          borderRadius: '100px',
          marginBottom: '40px'
        }}>
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '2px', color: '#4f46e5' }}>STUDENT ID</span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e4e4e7',
          width: '240px',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QRCode value={student.indexNumber || ''} size={240} level="H" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
        </div>

        <p style={{ marginTop: '30px', fontSize: '13px', color: '#a1a1aa', textAlign: 'center', fontWeight: 500, lineHeight: 1.5 }}>
          Present this code for<br/>attendance scanning
        </p>
      </div>

    </div>
  );
};

export const generateClassCard = async (student) => {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<ClassCard student={student} />);

      // Wait for React to render and fonts to apply
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container.firstChild, {
            scale: 2, // High res
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const image = canvas.toDataURL('image/png');
          
          const link = document.createElement('a');
          link.href = image;
          link.download = `${student.name.replace(/[^a-zA-Z0-9]/g, '_')}_ID_Card.png`;
          link.click();
          
          root.unmount();
          document.body.removeChild(container);
          resolve();
        } catch (err) {
          console.error('Error generating card image', err);
          root.unmount();
          if(document.body.contains(container)) document.body.removeChild(container);
          reject(err);
        }
      }, 1500); 
    } catch (error) {
      console.error('Error in generateClassCard', error);
      reject(error);
    }
  });
};

export const generateAllClassCardsPDF = async (students, prefixName) => {
  if (!students || students.length === 0) {
    alert("No students to generate cards for.");
    return;
  }

  // Import jsPDF dynamically to avoid bloat if not used
  const { jsPDF } = await import('jspdf');

  return new Promise(async (resolve, reject) => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1000, 600]
      });

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const root = createRoot(container);

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        // Render current student
        await new Promise(r => {
          root.render(<ClassCard student={student} />);
          setTimeout(r, 800); // give it time to render and fonts to load
        });

        const canvas = await html2canvas(container.firstChild, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage([1000, 600], 'landscape');
        }
        pdf.addImage(imgData, 'PNG', 0, 0, 1000, 600);
      }

      root.unmount();
      document.body.removeChild(container);

      pdf.save(`${prefixName}_All_ID_Cards.pdf`);
      resolve();
    } catch (error) {
      console.error('Error generating batch PDF', error);
      alert("Error generating PDF cards");
      reject(error);
    }
  });
};
