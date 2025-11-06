/**
 * app.js - Main application logic
 * Générateur de Bons de Transport - Production KRAKEN
 */

// ============================================================
// GLOBALS & STATE
// ============================================================
let comediens = [];
let lieux = [];
let sessionHistory = [];

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadData();
    initializeTabs();
    initializeVoucherForm();
    initializeComediens();
    initializeLieux();
    renderAll();
}

// ============================================================
// DATA MANAGEMENT (LocalStorage)
// ============================================================

function loadData() {
    // Load comediens
    const storedComediens = localStorage.getItem('comediens');
    comediens = storedComediens ? JSON.parse(storedComediens) : [];

    // Load lieux
    const storedLieux = localStorage.getItem('lieux');
    if (storedLieux) {
        lieux = JSON.parse(storedLieux);
    } else {
        // Initialize default locations
        lieux = [
            {
                id: generateId(),
                nom: 'Grigny - Cantine',
                adresse: 'Rue de la Grande Borne, 91350 Grigny'
            },
            {
                id: generateId(),
                nom: 'Aubervilliers - Studio',
                adresse: '12 Rue du Fort, 93300 Aubervilliers'
            },
            {
                id: generateId(),
                nom: 'Paris - Marvelous Prod',
                adresse: '85 Rue La Boétie, 75008 Paris 8e'
            }
        ];
        saveLieux();
    }
}

function saveComediens() {
    localStorage.setItem('comediens', JSON.stringify(comediens));
}

function saveLieux() {
    localStorage.setItem('lieux', JSON.stringify(lieux));
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================================
// TAB NAVIGATION
// ============================================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Render data when switching to specific tabs
    if (tabName === 'comediens') {
        renderComediens();
    } else if (tabName === 'lieux') {
        renderLieux();
    } else if (tabName === 'historique') {
        renderHistory();
    }
}

// ============================================================
// VOUCHER FORM
// ============================================================

function initializeVoucherForm() {
    // Set default date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Populate comediens dropdown
    populateComediensDropdown();

    // Populate lieux dropdowns
    populateLieuxDropdowns();

    // Comedien selection - auto-fill data
    document.getElementById('comedien').addEventListener('change', (e) => {
        const comedienId = e.target.value;
        if (comedienId) {
            const comedien = comediens.find(c => c.id === comedienId);
            if (comedien) {
                document.getElementById('telephone').value = comedien.telephone;

                // Update departure address for ALLER
                const fullAddress = `${comedien.adresse}, ${comedien.cp} ${comedien.ville}`;
                document.getElementById('depart-adresse').value = comedien.adresse;
                document.getElementById('depart-cp').value = comedien.cp;
                document.getElementById('depart-ville').value = comedien.ville;

                // Update arrival address for RETOUR
                document.getElementById('arrivee-adresse').value = comedien.adresse;
                document.getElementById('arrivee-cp').value = comedien.cp;
                document.getElementById('arrivee-ville').value = comedien.ville;
            }
        }
    });

    // Trajet type toggle
    const trajetRadios = document.querySelectorAll('input[name="trajet-type"]');
    trajetRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateTrajetSections(e.target.value);
        });
    });

    // Lieu selection - handle "Autre" option
    document.getElementById('arrivee-lieu').addEventListener('change', (e) => {
        const autreDiv = document.getElementById('arrivee-lieu-autre');
        if (e.target.value === 'autre') {
            autreDiv.style.display = 'block';
        } else {
            autreDiv.style.display = 'none';
        }
    });

    document.getElementById('depart-lieu').addEventListener('change', (e) => {
        const autreDiv = document.getElementById('depart-lieu-autre');
        if (e.target.value === 'autre') {
            autreDiv.style.display = 'block';
        } else {
            autreDiv.style.display = 'none';
        }
    });

    // Form submission - Generate PDF
    document.getElementById('voucher-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleGeneratePDF();
    });

    // Copy text button
    document.getElementById('copy-text').addEventListener('click', () => {
        handleCopyText();
    });

    // Reset form button
    document.getElementById('reset-form').addEventListener('click', () => {
        resetVoucherForm();
    });
}

function updateTrajetSections(trajetType) {
    const departAller = document.getElementById('depart-aller');
    const departRetour = document.getElementById('depart-retour');
    const arriveeAller = document.getElementById('arrivee-aller');
    const arriveeRetour = document.getElementById('arrivee-retour');

    if (trajetType === 'ALLER') {
        departAller.style.display = 'block';
        departRetour.style.display = 'none';
        arriveeAller.style.display = 'block';
        arriveeRetour.style.display = 'none';
    } else {
        departAller.style.display = 'none';
        departRetour.style.display = 'block';
        arriveeAller.style.display = 'none';
        arriveeRetour.style.display = 'block';
    }
}

function populateComediensDropdown() {
    const select = document.getElementById('comedien');
    select.innerHTML = '<option value="">Sélectionnez un comédien</option>';

    const sortedComediens = [...comediens].sort((a, b) =>
        a.nom.localeCompare(b.nom)
    );

    sortedComediens.forEach(comedien => {
        const option = document.createElement('option');
        option.value = comedien.id;
        option.textContent = `${comedien.prenom} ${comedien.nom}`;
        select.appendChild(option);
    });
}

function populateLieuxDropdowns() {
    const selects = [
        document.getElementById('arrivee-lieu'),
        document.getElementById('depart-lieu')
    ];

    const sortedLieux = [...lieux].sort((a, b) =>
        a.nom.localeCompare(b.nom)
    );

    selects.forEach(select => {
        select.innerHTML = '<option value="">Sélectionnez un lieu</option>';

        sortedLieux.forEach(lieu => {
            const option = document.createElement('option');
            option.value = lieu.id;
            option.textContent = lieu.nom;
            option.dataset.adresse = lieu.adresse;
            select.appendChild(option);
        });

        const optionAutre = document.createElement('option');
        optionAutre.value = 'autre';
        optionAutre.textContent = 'Autre...';
        select.appendChild(optionAutre);
    });
}

function getVoucherData() {
    const trajetType = document.querySelector('input[name="trajet-type"]:checked').value;
    const comedienId = document.getElementById('comedien').value;
    const comedien = comediens.find(c => c.id === comedienId);

    let departAdresse, arriveeAdresse;

    if (trajetType === 'ALLER') {
        // Departure: comedien address
        const rue = document.getElementById('depart-adresse').value;
        const cp = document.getElementById('depart-cp').value;
        const ville = document.getElementById('depart-ville').value;
        departAdresse = `${rue}, ${cp} ${ville}`;

        // Arrival: lieu
        const lieuSelect = document.getElementById('arrivee-lieu');
        const lieuValue = lieuSelect.value;
        if (lieuValue === 'autre') {
            const lieuNom = document.getElementById('arrivee-lieu-texte').value;
            const lieuAdr = document.getElementById('arrivee-lieu-adresse').value;
            arriveeAdresse = lieuNom ? `${lieuNom}\n${lieuAdr}` : lieuAdr;
        } else {
            const lieu = lieux.find(l => l.id === lieuValue);
            arriveeAdresse = lieu ? `${lieu.nom}\n${lieu.adresse}` : '';
        }
    } else {
        // Departure: lieu
        const lieuSelect = document.getElementById('depart-lieu');
        const lieuValue = lieuSelect.value;
        if (lieuValue === 'autre') {
            const lieuNom = document.getElementById('depart-lieu-texte').value;
            const lieuAdr = document.getElementById('depart-lieu-adresse').value;
            departAdresse = lieuNom ? `${lieuNom}\n${lieuAdr}` : lieuAdr;
        } else {
            const lieu = lieux.find(l => l.id === lieuValue);
            departAdresse = lieu ? `${lieu.nom}\n${lieu.adresse}` : '';
        }

        // Arrival: comedien address
        const rue = document.getElementById('arrivee-adresse').value;
        const cp = document.getElementById('arrivee-cp').value;
        const ville = document.getElementById('arrivee-ville').value;
        arriveeAdresse = `${rue}, ${cp} ${ville}`;
    }

    return {
        date: document.getElementById('date').value,
        prenom: comedien.prenom,
        nom: comedien.nom,
        telephone: document.getElementById('telephone').value,
        trajetType: trajetType,
        departAdresse: departAdresse,
        departHeure: document.getElementById('depart-heure').value,
        arriveeAdresse: arriveeAdresse,
        arriveeHeure: document.getElementById('arrivee-heure').value,
        precisions: document.getElementById('precisions').value
    };
}

function handleGeneratePDF() {
    const voucherData = getVoucherData();
    const filename = generatePDF(voucherData);

    // Add to session history
    sessionHistory.push({
        ...voucherData,
        timestamp: new Date().toISOString()
    });

    showNotification(`PDF généré : ${filename}`);
}

function handleCopyText() {
    const voucherData = getVoucherData();
    const text = generateText(voucherData);

    copyToClipboard(text).then(success => {
        if (success) {
            // Add to session history
            sessionHistory.push({
                ...voucherData,
                timestamp: new Date().toISOString()
            });

            showNotification('Texte copié dans le presse-papier !');
        } else {
            showNotification('Erreur lors de la copie', true);
        }
    });
}

function resetVoucherForm() {
    document.getElementById('voucher-form').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.querySelector('input[name="trajet-type"][value="ALLER"]').checked = true;
    updateTrajetSections('ALLER');
    document.getElementById('arrivee-lieu-autre').style.display = 'none';
    document.getElementById('depart-lieu-autre').style.display = 'none';
}

// ============================================================
// COMÉDIENS MANAGEMENT
// ============================================================

function initializeComediens() {
    // Add button
    document.getElementById('add-comedien').addEventListener('click', () => {
        openComedienModal();
    });

    // Import button
    document.getElementById('import-comediens').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    // File input
    document.getElementById('file-input').addEventListener('change', (e) => {
        handleFileImport(e.target.files[0]);
    });

    // Search
    document.getElementById('search-comedien').addEventListener('input', (e) => {
        renderComediens(e.target.value);
    });

    // Modal form
    document.getElementById('comedien-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveComedien();
    });

    // Close modal button
    document.getElementById('close-comedien-modal').addEventListener('click', () => {
        closeComedienModal();
    });

    // Close modal on background click
    document.getElementById('comedien-modal').addEventListener('click', (e) => {
        if (e.target.id === 'comedien-modal') {
            closeComedienModal();
        }
    });
}

function renderComediens(searchTerm = '') {
    const list = document.getElementById('comediens-list');

    const filtered = comediens.filter(c => {
        const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucun comédien trouvé</p>';
        return;
    }

    const sorted = [...filtered].sort((a, b) => a.nom.localeCompare(b.nom));

    list.innerHTML = sorted.map(comedien => `
        <div class="data-item">
            <div class="data-item-content">
                <h4>${comedien.prenom} ${comedien.nom}</h4>
                <p>${comedien.telephone}</p>
                <p>${comedien.adresse}, ${comedien.cp} ${comedien.ville}</p>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editComedien('${comedien.id}')">Modifier</button>
                <button class="btn btn-small btn-danger" onclick="deleteComedien('${comedien.id}')">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function openComedienModal(comedien = null) {
    const modal = document.getElementById('comedien-modal');
    const title = document.getElementById('comedien-modal-title');
    const form = document.getElementById('comedien-form');

    if (comedien) {
        title.textContent = 'Modifier un comédien';
        document.getElementById('comedien-id').value = comedien.id;
        document.getElementById('comedien-prenom').value = comedien.prenom;
        document.getElementById('comedien-nom').value = comedien.nom;
        document.getElementById('comedien-tel').value = comedien.telephone;
        document.getElementById('comedien-adresse').value = comedien.adresse;
        document.getElementById('comedien-cp').value = comedien.cp;
        document.getElementById('comedien-ville').value = comedien.ville;
    } else {
        title.textContent = 'Ajouter un comédien';
        form.reset();
    }

    modal.classList.add('active');
}

function closeComedienModal() {
    document.getElementById('comedien-modal').classList.remove('active');
}

function saveComedien() {
    const id = document.getElementById('comedien-id').value;
    const data = {
        prenom: document.getElementById('comedien-prenom').value.trim(),
        nom: document.getElementById('comedien-nom').value.trim().toUpperCase(),
        telephone: document.getElementById('comedien-tel').value.trim(),
        adresse: document.getElementById('comedien-adresse').value.trim(),
        cp: document.getElementById('comedien-cp').value.trim(),
        ville: document.getElementById('comedien-ville').value.trim()
    };

    if (id) {
        // Update existing
        const index = comediens.findIndex(c => c.id === id);
        comediens[index] = { ...comediens[index], ...data };
    } else {
        // Add new
        comediens.push({
            id: generateId(),
            ...data
        });
    }

    saveComediens();
    renderComediens();
    populateComediensDropdown();
    closeComedienModal();
    showNotification('Comédien enregistré avec succès');
}

function editComedien(id) {
    const comedien = comediens.find(c => c.id === id);
    if (comedien) {
        openComedienModal(comedien);
    }
}

function deleteComedien(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce comédien ?')) {
        comediens = comediens.filter(c => c.id !== id);
        saveComediens();
        renderComediens();
        populateComediensDropdown();
        showNotification('Comédien supprimé');
    }
}

// ============================================================
// LIEUX MANAGEMENT
// ============================================================

function initializeLieux() {
    // Add button
    document.getElementById('add-lieu').addEventListener('click', () => {
        openLieuModal();
    });

    // Modal form
    document.getElementById('lieu-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveLieu();
    });

    // Close modal button
    document.getElementById('close-lieu-modal').addEventListener('click', () => {
        closeLieuModal();
    });

    // Close modal on background click
    document.getElementById('lieu-modal').addEventListener('click', (e) => {
        if (e.target.id === 'lieu-modal') {
            closeLieuModal();
        }
    });
}

function renderLieux() {
    const list = document.getElementById('lieux-list');

    if (lieux.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucun lieu enregistré</p>';
        return;
    }

    const sorted = [...lieux].sort((a, b) => a.nom.localeCompare(b.nom));

    list.innerHTML = sorted.map(lieu => `
        <div class="data-item">
            <div class="data-item-content">
                <h4>${lieu.nom}</h4>
                <p>${lieu.adresse}</p>
            </div>
            <div class="data-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editLieu('${lieu.id}')">Modifier</button>
                <button class="btn btn-small btn-danger" onclick="deleteLieu('${lieu.id}')">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function openLieuModal(lieu = null) {
    const modal = document.getElementById('lieu-modal');
    const title = document.getElementById('lieu-modal-title');
    const form = document.getElementById('lieu-form');

    if (lieu) {
        title.textContent = 'Modifier un lieu';
        document.getElementById('lieu-id').value = lieu.id;
        document.getElementById('lieu-nom').value = lieu.nom;
        document.getElementById('lieu-adresse').value = lieu.adresse;
    } else {
        title.textContent = 'Ajouter un lieu';
        form.reset();
    }

    modal.classList.add('active');
}

function closeLieuModal() {
    document.getElementById('lieu-modal').classList.remove('active');
}

function saveLieu() {
    const id = document.getElementById('lieu-id').value;
    const data = {
        nom: document.getElementById('lieu-nom').value.trim(),
        adresse: document.getElementById('lieu-adresse').value.trim()
    };

    if (id) {
        // Update existing
        const index = lieux.findIndex(l => l.id === id);
        lieux[index] = { ...lieux[index], ...data };
    } else {
        // Add new
        lieux.push({
            id: generateId(),
            ...data
        });
    }

    saveLieux();
    renderLieux();
    populateLieuxDropdowns();
    closeLieuModal();
    showNotification('Lieu enregistré avec succès');
}

function editLieu(id) {
    const lieu = lieux.find(l => l.id === id);
    if (lieu) {
        openLieuModal(lieu);
    }
}

function deleteLieu(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
        lieux = lieux.filter(l => l.id !== id);
        saveLieux();
        renderLieux();
        populateLieuxDropdowns();
        showNotification('Lieu supprimé');
    }
}

// ============================================================
// HISTORY
// ============================================================

function renderHistory() {
    const list = document.getElementById('historique-list');

    if (sessionHistory.length === 0) {
        list.innerHTML = '<p class="empty-state">Aucun bon créé dans cette session.</p>';
        return;
    }

    // Reverse to show most recent first
    const reversed = [...sessionHistory].reverse();

    list.innerHTML = reversed.map((item, index) => `
        <div class="history-item">
            <div class="history-header">
                <h4>${item.prenom} ${item.nom}</h4>
                <span class="history-badge">${item.trajetType}</span>
            </div>
            <div class="history-details">
                ${formatDate(item.date)} - Départ: ${formatTime(item.departHeure)} / Arrivée: ${formatTime(item.arriveeHeure)}
            </div>
            <div class="history-actions">
                <button class="btn btn-small btn-primary" onclick="regeneratePDF(${sessionHistory.length - 1 - index})">Générer PDF</button>
                <button class="btn btn-small btn-secondary" onclick="recopyText(${sessionHistory.length - 1 - index})">Copier Texte</button>
            </div>
        </div>
    `).join('');
}

function regeneratePDF(index) {
    const voucherData = sessionHistory[index];
    const filename = generatePDF(voucherData);
    showNotification(`PDF régénéré : ${filename}`);
}

function recopyText(index) {
    const voucherData = sessionHistory[index];
    const text = generateText(voucherData);
    copyToClipboard(text).then(success => {
        if (success) {
            showNotification('Texte copié dans le presse-papier !');
        } else {
            showNotification('Erreur lors de la copie', true);
        }
    });
}

// ============================================================
// IMPORT EXCEL/CSV
// ============================================================

function handleFileImport(file) {
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
            parseCSV(e.target.result);
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        showNotification('Import Excel: Utilisez un fichier CSV ou ajoutez manuellement', true);
        // For full Excel support, would need SheetJS library
        // For now, recommend CSV export from Excel
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        showNotification('Fichier CSV vide ou invalide', true);
        return;
    }

    // Skip header
    const dataLines = lines.slice(1);
    let imported = 0;

    dataLines.forEach(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length >= 5 && values[0] && values[1]) {
            const [prenom, nom, telephone, adresse, ville] = values;

            // Try to extract CP from address or ville
            let cp = '';
            let cleanVille = ville;
            const cpMatch = ville.match(/\b\d{5}\b/);
            if (cpMatch) {
                cp = cpMatch[0];
                cleanVille = ville.replace(cp, '').trim();
            }

            comediens.push({
                id: generateId(),
                prenom: prenom.trim(),
                nom: nom.trim().toUpperCase(),
                telephone: telephone.trim(),
                adresse: adresse.trim(),
                cp: cp,
                ville: cleanVille
            });
            imported++;
        }
    });

    if (imported > 0) {
        saveComediens();
        renderComediens();
        populateComediensDropdown();
        showNotification(`${imported} comédien(s) importé(s) avec succès`);
    } else {
        showNotification('Aucun comédien valide trouvé dans le fichier', true);
    }

    // Reset file input
    document.getElementById('file-input').value = '';
}

// ============================================================
// UTILITIES
// ============================================================

function renderAll() {
    renderComediens();
    renderLieux();
    renderHistory();
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Make functions globally accessible for inline onclick handlers
window.editComedien = editComedien;
window.deleteComedien = deleteComedien;
window.editLieu = editLieu;
window.deleteLieu = deleteLieu;
window.regeneratePDF = regeneratePDF;
window.recopyText = recopyText;
