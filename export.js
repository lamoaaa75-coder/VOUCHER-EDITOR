/**
 * export.js - PDF and Text generation for Transport Vouchers
 * Production KRAKEN
 */

// Format date to DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format time to HH:MM
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

/**
 * Generate PDF for transport voucher
 * Format: A5 Landscape (210mm x 148mm)
 */
function generatePDF(voucherData) {
    const { jsPDF } = window.jspdf;

    // A5 Landscape dimensions in mm
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5'
    });

    const pageWidth = 210;
    const pageHeight = 148;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    let yPos = margin;
    const lineHeight = 7;
    const sectionGap = 5;

    // Draw border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (2 * margin) + 10);

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('BON DE TRANSPORT COMÉDIEN', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Production KRAKEN', margin, yPos);
    yPos += lineHeight + sectionGap;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += sectionGap;

    // Date
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Date : ', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(formatDate(voucherData.date), margin + 20, yPos);
    yPos += lineHeight + sectionGap;

    // Passenger info
    doc.setFont(undefined, 'bold');
    doc.text('PASSAGER : ', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${voucherData.prenom} ${voucherData.nom}`, margin + 30, yPos);
    yPos += lineHeight;

    doc.setFont(undefined, 'bold');
    doc.text('Contact  : ', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(voucherData.telephone, margin + 30, yPos);
    yPos += lineHeight + sectionGap;

    // Departure info
    doc.setFont(undefined, 'bold');
    doc.text('DÉPART   : ', margin, yPos);
    doc.setFont(undefined, 'normal');
    const departDateTime = `${formatDate(voucherData.date)} à ${formatTime(voucherData.departHeure)}`;
    doc.text(departDateTime, margin + 30, yPos);
    yPos += lineHeight;

    // Departure address (split into multiple lines if needed)
    const departLines = doc.splitTextToSize(voucherData.departAdresse, contentWidth - 30);
    departLines.forEach(line => {
        doc.text(line, margin + 30, yPos);
        yPos += lineHeight;
    });
    yPos += sectionGap;

    // Arrival info
    doc.setFont(undefined, 'bold');
    doc.text('ARRIVÉE  : ', margin, yPos);
    doc.setFont(undefined, 'normal');
    const arriveeDateTime = `${formatDate(voucherData.date)} à ${formatTime(voucherData.arriveeHeure)}`;
    doc.text(arriveeDateTime, margin + 30, yPos);
    yPos += lineHeight;

    // Arrival address (split into multiple lines if needed)
    const arriveeLines = doc.splitTextToSize(voucherData.arriveeAdresse, contentWidth - 30);
    arriveeLines.forEach(line => {
        doc.text(line, margin + 30, yPos);
        yPos += lineHeight;
    });
    yPos += sectionGap;

    // Special instructions
    if (voucherData.precisions && voucherData.precisions.trim()) {
        doc.setFont(undefined, 'bold');
        doc.text('PRÉCISIONS :', margin, yPos);
        yPos += lineHeight;

        doc.setFont(undefined, 'normal');
        const precisionLines = doc.splitTextToSize(voucherData.precisions, contentWidth);
        precisionLines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += lineHeight;
        });
    }

    // Generate filename
    const dateForFile = voucherData.date.replace(/-/g, '');
    const filename = `Bon_Transport_${voucherData.nom}_${dateForFile}.pdf`;

    // Save PDF
    doc.save(filename);

    return filename;
}

/**
 * Generate text version for clipboard
 */
function generateText(voucherData) {
    let text = 'BON DE TRANSPORT - KRAKEN\n';
    text += `Date: ${formatDate(voucherData.date)}\n\n`;

    text += `Passager: ${voucherData.prenom} ${voucherData.nom}\n`;
    text += `Contact: ${voucherData.telephone}\n\n`;

    text += `TRAJET ${voucherData.trajetType}\n`;

    text += `Départ: ${formatDate(voucherData.date)} à ${formatTime(voucherData.departHeure)}\n`;
    text += `        ${voucherData.departAdresse}\n\n`;

    text += `Arrivée: ${formatDate(voucherData.date)} à ${formatTime(voucherData.arriveeHeure)}\n`;
    text += `         ${voucherData.arriveeAdresse}\n`;

    if (voucherData.precisions && voucherData.precisions.trim()) {
        text += `\nPrécisions:\n${voucherData.precisions}\n`;
    }

    return text;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}
