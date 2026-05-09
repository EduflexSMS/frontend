import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';

const ClassCard = ({ student }) => {
  return (
    <div style={{
      width: '638px',
      height: '1011px',
      background: '#09090b',
      padding: '40px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
      color: '#ffffff',
      overflow: 'hidden',
      zIndex: 1
    }}>
      {/* Background Decorators */}
      <div style={{ position: 'absolute', top: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>

      {/* Header section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '40px', fontWeight: 900, color: 'white' }}>E</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', color: '#ffffff' }}>EDUFLEX</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 600, letterSpacing: '6px', color: '#a1a1aa', textTransform: 'uppercase' }}>Institute</p>
      </div>

      {/* ID Badge Label */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '100px',
        padding: '10px 30px',
        marginBottom: '40px'
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '3px', color: '#e4e4e7' }}>STUDENT ID</span>
      </div>

      {/* Glassmorphism Data Card */}
      <div style={{
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        flex: 1
      }}>
        {/* Name & Index */}
        <div style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          <h2 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '42px', 
            fontWeight: 800, 
            color: '#ffffff', 
            lineHeight: 1.1,
            wordBreak: 'break-word'
          }}>
            {student.name}
          </h2>
          <div style={{ 
            display: 'inline-block',
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.2)',
            padding: '8px 20px',
            borderRadius: '12px',
            marginTop: '10px'
          }}>
            <p style={{ margin: 0, fontSize: '24px', color: '#22d3ee', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {student.indexNumber}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'flex', width: '100%', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Grade</p>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#f4f4f5' }}>{student.grade}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Mobile</p>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#f4f4f5' }}>{student.mobile || 'N/A'}</p>
          </div>
        </div>

        {/* QR Code */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 'auto',
          width: '240px',
          height: '240px'
        }}>
          <QRCode value={student.indexNumber || ''} size={240} level="H" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Please present this card for attendance scanning.</p>
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
            backgroundColor: '#09090b',
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
      }, 800); 
    } catch (error) {
      console.error('Error in generateClassCard', error);
      reject(error);
    }
  });
};
