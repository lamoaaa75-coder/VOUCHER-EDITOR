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

// Format date to DD/MM (without year)
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

// Format time to HH:MM
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

/**
 * Generate PDF for transport voucher - SIMPLIFIED FORMAT
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

    let yPos = margin + 10;
    const lineHeight = 8;

    // Draw border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (2 * margin) + 10);

    // Optional title
    if (voucherData.includeTitle !== false && voucherData.customTitle) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(voucherData.customTitle, margin, yPos);
        yPos += lineHeight + 3;
    }

    // Content
    doc.setFontSize(12);

    // Passenger
    doc.setFont(undefined, 'bold');
    doc.text('Passager: ', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${voucherData.prenom} ${voucherData.nom}`, margin + 25, yPos);
    yPos += lineHeight;

    // Contact
    doc.setFont(undefined, 'bold');
    doc.text('Contact: ', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(voucherData.telephone, margin + 25, yPos);
    yPos += lineHeight;

    // Departure
    doc.setFont(undefined, 'bold');
    doc.text('Départ: ', margin, yPos);
    doc.setFont(undefined, 'normal');
    const departText = `${formatDateShort(voucherData.date)} à ${formatTime(voucherData.departHeure)} au ${voucherData.departAdresse.replace(/\n/g, ', ')}`;
    const departLines = doc.splitTextToSize(departText, contentWidth - 25);
    doc.text(departLines[0], margin + 25, yPos);
    yPos += lineHeight;
    if (departLines.length > 1) {
        for (let i = 1; i < departLines.length; i++) {
            doc.text(departLines[i], margin + 25, yPos);
            yPos += lineHeight;
        }
    }

    // Arrival
    doc.setFont(undefined, 'bold');
    doc.text('Arrivée: ', margin, yPos);
    doc.setFont(undefined, 'normal');
    let arriveeText;
    if (voucherData.arriveeHeure) {
        arriveeText = `${formatDateShort(voucherData.date)} à ${formatTime(voucherData.arriveeHeure)} au ${voucherData.arriveeAdresse.replace(/\n/g, ', ')}`;
    } else {
        arriveeText = voucherData.arriveeAdresse.replace(/\n/g, ', ');
    }
    const arriveeLines = doc.splitTextToSize(arriveeText, contentWidth - 25);
    doc.text(arriveeLines[0], margin + 25, yPos);
    yPos += lineHeight;
    if (arriveeLines.length > 1) {
        for (let i = 1; i < arriveeLines.length; i++) {
            doc.text(arriveeLines[i], margin + 25, yPos);
            yPos += lineHeight;
        }
    }

    // Special instructions
    if (voucherData.precisions && voucherData.precisions.trim()) {
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
 * Generate text version for clipboard - SIMPLIFIED FORMAT
 */
function generateText(voucherData) {
    let text = '';

    // Optional title
    if (voucherData.includeTitle !== false && voucherData.customTitle) {
        text += voucherData.customTitle + '\n\n';
    }

    text += `Passager: ${voucherData.prenom} ${voucherData.nom}\n`;
    text += `Contact: ${voucherData.telephone}\n`;

    // Departure
    text += `Départ: ${formatDateShort(voucherData.date)} à ${formatTime(voucherData.departHeure)} au ${voucherData.departAdresse.replace(/\n/g, ', ')}\n`;

    // Arrival
    if (voucherData.arriveeHeure) {
        text += `Arrivée: ${formatDateShort(voucherData.date)} à ${formatTime(voucherData.arriveeHeure)} au ${voucherData.arriveeAdresse.replace(/\n/g, ', ')}`;
    } else {
        text += `Arrivée: ${voucherData.arriveeAdresse.replace(/\n/g, ', ')}`;
    }

    if (voucherData.precisions && voucherData.precisions.trim()) {
        text += `\n${voucherData.precisions}`;
    }

    return text;
}

/**
 * Generate PDF for multiple trips (batch) - SIMPLIFIED FORMAT
 */
function generateBatchPDF(vouchersData) {
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

    vouchersData.forEach((voucherData, index) => {
        if (index > 0) {
            doc.addPage();
        }

        let yPos = margin + 10;
        const lineHeight = 8;

        // Draw border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (2 * margin) + 10);

        // Optional title
        if (voucherData.includeTitle !== false && voucherData.customTitle) {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(voucherData.customTitle, margin, yPos);
            yPos += lineHeight + 3;
        }

        // Content
        doc.setFontSize(12);

        // Passenger
        doc.setFont(undefined, 'bold');
        doc.text('Passager: ', margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${voucherData.prenom} ${voucherData.nom}`, margin + 25, yPos);
        yPos += lineHeight;

        // Contact
        doc.setFont(undefined, 'bold');
        doc.text('Contact: ', margin, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(voucherData.telephone, margin + 25, yPos);
        yPos += lineHeight;

        // Departure
        doc.setFont(undefined, 'bold');
        doc.text('Départ: ', margin, yPos);
        doc.setFont(undefined, 'normal');
        const departText = `${formatDateShort(voucherData.date)} à ${formatTime(voucherData.departHeure)} au ${voucherData.departAdresse.replace(/\n/g, ', ')}`;
        const departLines = doc.splitTextToSize(departText, contentWidth - 25);
        doc.text(departLines[0], margin + 25, yPos);
        yPos += lineHeight;
        if (departLines.length > 1) {
            for (let i = 1; i < departLines.length; i++) {
                doc.text(departLines[i], margin + 25, yPos);
                yPos += lineHeight;
            }
        }

        // Arrival
        doc.setFont(undefined, 'bold');
        doc.text('Arrivée: ', margin, yPos);
        doc.setFont(undefined, 'normal');
        let arriveeText;
        if (voucherData.arriveeHeure) {
            arriveeText = `${formatDateShort(voucherData.date)} à ${formatTime(voucherData.arriveeHeure)} au ${voucherData.arriveeAdresse.replace(/\n/g, ', ')}`;
        } else {
            arriveeText = voucherData.arriveeAdresse.replace(/\n/g, ', ');
        }
        const arriveeLines = doc.splitTextToSize(arriveeText, contentWidth - 25);
        doc.text(arriveeLines[0], margin + 25, yPos);
        yPos += lineHeight;
        if (arriveeLines.length > 1) {
            for (let i = 1; i < arriveeLines.length; i++) {
                doc.text(arriveeLines[i], margin + 25, yPos);
                yPos += lineHeight;
            }
        }

        // Special instructions
        if (voucherData.precisions && voucherData.precisions.trim()) {
            const precisionLines = doc.splitTextToSize(voucherData.precisions, contentWidth);
            precisionLines.forEach(line => {
                doc.text(line, margin, yPos);
                yPos += lineHeight;
            });
        }
    });

    // Generate filename
    const dateForFile = vouchersData[0].date.replace(/-/g, '');
    const filename = `Bons_Transport_${dateForFile}_${vouchersData.length}trajets.pdf`;

    // Save PDF
    doc.save(filename);

    return filename;
}

/**
 * Generate text version for multiple trips (batch)
 */
function generateBatchText(vouchersData) {
    let text = '';

    vouchersData.forEach((voucherData, index) => {
        if (index > 0) {
            text += '\n\n' + '='.repeat(60) + '\n\n';
        }

        text += generateText(voucherData);
    });

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
