import { sinhalaFont } from '../assets/sinhalaFont';

/**
 * Registers the Sinhala font with jsPDF and sets it as the active font if the current language is Sinhala.
 * @param {jsPDF} doc - The jsPDF instance.
 * @param {string} lang - The current language ('si' or 'en').
 */
export const setupPdfFont = (doc, lang) => {
    if (lang === 'si') {
        doc.addFileToVFS('NotoSansSinhala.ttf', sinhalaFont);
        doc.addFont('NotoSansSinhala.ttf', 'NotoSansSinhala', 'normal');
        doc.setFont('NotoSansSinhala');
    } else {
        doc.setFont('helvetica');
    }
};

/**
 * Returns the translated month name.
 * @param {number} monthIndex - 0-11
 * @param {Function} t - The translation function.
 */
export const getTranslatedMonth = (monthIndex, t) => {
    const monthKeys = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    return t(monthKeys[monthIndex]);
};

/**
 * Formats a date string in the local format.
 * @param {Date} date 
 * @param {string} lang 
 */
export const formatDate = (date, lang) => {
    return date.toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US');
};
