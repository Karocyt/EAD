/* ==========================================================================
   SCRIPT.JS
   Logique de l'application :
   - Chargement/Sauvegarde
   - Génération du HTML
   - Calculs des notes
   - Gestion des règles spécifiques (hasMajorBlock)
   ========================================================================== */

const BASE_STORAGE_KEY = "simu_droit_v4_";
const SELECTED_CURR_KEY = "simu_droit_v4_selected_curriculum";

let currentCurriculumId = 'l1_ead'; // Valeur par défaut
let activeSubjects = [];
let currentGrades = {};
let currentBonuses = {}; 

// ==========================================
// 1. INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    populateCurriculumSelect();
    
    // Charger le dernier cursus sélectionné
    const savedCurr = localStorage.getItem(SELECTED_CURR_KEY);
    if(savedCurr && CURRICULUMS[savedCurr]) {
        currentCurriculumId = savedCurr;
        document.getElementById('curriculum-select').value = savedCurr;
    }

    initInterface();
    loadData();
    
    // Afficher l'interface
    document.getElementById('loading-msg').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('footer-app').style.display = 'flex';
    
    calculate();
});

function populateCurriculumSelect() {
    const select = document.getElementById('curriculum-select');
    Object.keys(CURRICULUMS).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = CURRICULUMS[key].name;
        select.appendChild(opt);
    });
}

function changeCurriculum() {
    const select = document.getElementById('curriculum-select');
    currentCurriculumId = select.value;
    localStorage.setItem(SELECTED_CURR_KEY, currentCurriculumId);
    
    document.getElementById('rattrapage-box').style.display = 'none';
    
    initInterface();
    loadData();
    calculate();
}

// Génère le HTML pour les matières
function initInterface() {
    document.getElementById('container-s1').innerHTML = '';
    document.getElementById('container-s2').innerHTML = '';
    document.getElementById('resit-list').innerHTML = '';
    
    activeSubjects = CURRICULUMS[currentCurriculumId].subjects;

    activeSubjects.forEach(sub => {
        // 1. Ajout dans les cartes Semestres
        const container = document.getElementById('container-s' + sub.sem);
        if(!container) return; 

        const div = document.createElement('div');
        div.className = 'subject';
        
        let badges = `<span class="badge badge-coef">Coef ${sub.coef}</span>`;
        if(sub.isMajor) badges += ` <span class="badge badge-major">Majeure</span>`;

        let inputsHtml = '';
        if (sub.bonusMax) {
            inputsHtml = `
                <div class="input-wrapper" style="flex:2">
                    <label>Examen (/20)</label>
                    <input type="number" id="grade_${sub.id}" min="0" max="20" step="0.25" placeholder="Note">
                </div>
                <div class="input-wrapper" style="flex:1">
                    <label>DM (/${sub.bonusMax})</label>
                    <input type="number" id="bonus_${sub.id}" min="0" max="${sub.bonusMax}" step="0.25" placeholder="Bonus">
                </div>
            `;
        } else {
            inputsHtml = `
                <div class="input-wrapper">
                    <label>Note (/20)</label>
                    <input type="number" id="grade_${sub.id}" min="0" max="20" step="0.25" placeholder="Note">
                </div>
            `;
        }

        div.innerHTML = `
            <div class="sub-header">
                <span>${sub.name}</span>
                <div class="badges">${badges}</div>
            </div>
            <div class="inputs-row">
                ${inputsHtml}
                <div class="final-note" id="total_${sub.id}">-</div>
            </div>
        `;
        container.appendChild(div);

        // 2. Ajout dans la liste (cachée) des rattrapages
        const resitContainer = document.getElementById('resit-list');
        const resitDiv = document.createElement('div');
        resitDiv.className = 'resit-item hidden';
        resitDiv.id = `resit_item_${sub.id}`;
        
        resitDiv.innerHTML = `
            <div class="resit-top-row">
                <input type="checkbox" id="resit_check_${sub.id}">
                <div class="resit-info">
                    <strong>${sub.name}</strong> 
                    <span style="color:#777;font-size:0.8rem">(Coef ${sub.coef})</span>
                    <span id="resit_bonus_display_${sub.id}" class="resit-bonus-display"></span>
                </div>
            </div>
            <div class="resit-controls-row">
                <input type="range" class="resit-slider" id="resit_slider_${sub.id}" min="0" max="20" step="0.25" value="10" disabled>
                <input type="number" class="resit-input" id="resit_grade_${sub.id}" placeholder="-" min="0" max="20" step="0.25" disabled>
            </div>
        `;
        resitContainer.appendChild(resitDiv);
    });

    updateVisibilityBasedOnCurriculum();
}

function updateVisibilityBasedOnCurriculum() {
    const hasMajorBlock = CURRICULUMS[currentCurriculumId].hasMajorBlock;
    
    const majorElements = [
        document.getElementById('row-maj-s1'),
        document.getElementById('row-maj-s2'),
        document.getElementById('footer-maj-stat'),
        document.getElementById('resit-maj-col-year'),
        document.getElementById('resit-maj-col-s1'),
        document.getElementById('resit-maj-col-s2')
    ];

    majorElements.forEach(el => {
        if(el) {
            if(hasMajorBlock) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
}

// Écouteurs globaux
document.body.addEventListener('input', (e) => {
    if(e.target.tagName === 'INPUT') {
        const targetId = e.target.id;
        
        // Synchronisation Slider -> Input
        if (targetId.startsWith('resit_slider_')) {
            const subId = targetId.replace('resit_slider_', '');
            const input = document.getElementById('resit_grade_' + subId);
            if (input) {
                input.value = e.target.value;
            }
        }
        
        // Synchronisation Input -> Slider
        if (targetId.startsWith('resit_grade_')) {
            const subId = targetId.replace('resit_grade_', '');
            const slider = document.getElementById('resit_slider_' + subId);
            if (slider && e.target.value !== '') {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 20) {
                    slider.value = val;
                }
            }
        }

        saveData();
        calculate();
    }
});

document.body.addEventListener('change', (e) => {
    if(e.target.type === 'checkbox' && e.target.id.includes('resit_check')) {
        const id = e.target.id.replace('resit_check_', '');
        const input = document.getElementById('resit_grade_' + id);
        const slider = document.getElementById('resit_slider_' + id);
        const item = document.getElementById('resit_item_' + id);
        
        if (e.target.checked) {
            if(input) { input.disabled = false; input.value = ''; }
            if(slider) { slider.disabled = false; slider.value = 10; }
            if(item) item.classList.add('active');
        } else {
            if(input) { input.disabled = true; input.value = ''; }
            if(slider) { slider.disabled = true; slider.value = 10; }
            if(item) item.classList.remove('active');
        }
        
        saveData();
        calculate();
    }
});

// ==========================================
// 2. SAUVEGARDE / CHARGEMENT
// ==========================================
function getStorageKey() {
    return BASE_STORAGE_KEY + currentCurriculumId;
}

function saveData() {
    const state = {};
    document.querySelectorAll('input').forEach(el => {
        if(el.type === 'checkbox') state[el.id] = el.checked;
        else state[el.id] = el.value;
    });
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function loadData() {
    const saved = localStorage.getItem(getStorageKey());
    if(!saved) return;
    try {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(key => {
            const el = document.getElementById(key);
            if(el) {
                if(el.type === 'checkbox') {
                    el.checked = state[key];
                    if(key.includes('resit_check_')) {
                        const subId = key.replace('resit_check_', '');
                        const inp = document.getElementById('resit_grade_' + subId);
                        const slider = document.getElementById('resit_slider_' + subId);
                        const item = document.getElementById('resit_item_' + subId);
                        if(inp) inp.disabled = !state[key];
                        if(slider) slider.disabled = !state[key];
                        if(item) {
                            if(state[key]) item.classList.add('active');
                            else item.classList.remove('active');
                        }
                    }
                } else {
                    el.value = state[key];
                }
            }
        });
        const hasResit = Object.keys(state).some(k => k.includes('resit_check') && state[k] === true);
        if(hasResit) document.getElementById('rattrapage-box').style.display = 'block';
    } catch(e) { console.error("Erreur load", e); }
}

function resetData() {
    if(confirm("Voulez-vous vraiment effacer les notes pour " + CURRICULUMS[currentCurriculumId].name + " ?")) {
        localStorage.removeItem(getStorageKey());
        initInterface();
        calculate();
    }
}

// ==========================================
// 3. MOTEUR DE CALCUL
// ==========================================
function calculate() {
    // 1. Lire les notes de Session 1
    currentGrades = {};
    currentBonuses = {};

    activeSubjects.forEach(sub => {
        const gEl = document.getElementById('grade_' + sub.id);
        const bEl = document.getElementById('bonus_' + sub.id);
        let val = 0;
        let bonus = 0;
        let hasInput = false;

        if (gEl && gEl.value !== '') { val += parseFloat(gEl.value); hasInput = true; }
        if (bEl && bEl.value !== '') { 
            bonus = parseFloat(bEl.value);
            val += bonus; 
        }
        if(val > 20) val = 20; 

        if(hasInput) currentGrades[sub.id] = val;
        currentBonuses[sub.id] = bonus;

        const disp = document.getElementById('total_' + sub.id);
        if(disp) {
            const resitCheck = document.getElementById('resit_check_' + sub.id);
            const isResitActive = resitCheck && resitCheck.checked;
            
            if (hasInput) {
                if (isResitActive) {
                    const resitInput = document.getElementById('resit_grade_' + sub.id);
                    const resitValue = resitInput ? resitInput.value : '';
                    if (resitValue !== '') {
                        let retakeVal = parseFloat(resitValue) + bonus;
                        if (retakeVal > 20) retakeVal = 20;
                        
                        disp.innerHTML = `
                            <span class="session1-strikethrough text-muted">${val.toLocaleString('fr-FR', {maximumFractionDigits:2})}</span>
                            <i class="fas fa-life-ring text-warning" title="Note remplacée par le rattrapage"></i>
                            <span class="resit-final-value ${retakeVal >= 10 ? 'text-success' : 'text-danger'}">${retakeVal.toLocaleString('fr-FR', {maximumFractionDigits:2})}</span>
                        `;
                    } else {
                        disp.innerHTML = `
                            <span class="session1-strikethrough text-muted">${val.toLocaleString('fr-FR', {maximumFractionDigits:2})}</span>
                            <i class="fas fa-life-ring text-warning" title="Rattrapage activé (en attente de note)"></i>
                            <span class="resit-pending-badge">?</span>
                        `;
                    }
                    disp.className = 'final-note';
                } else {
                    disp.textContent = val.toLocaleString('fr-FR', {maximumFractionDigits:2});
                    disp.className = 'final-note ' + (val >= 10 ? 'text-success' : 'text-danger');
                }
            } else {
                if (isResitActive) {
                    disp.innerHTML = `
                        <span class="session1-strikethrough text-muted">-</span>
                        <i class="fas fa-life-ring text-warning" title="Rattrapage activé (en attente de note)"></i>
                        <span class="resit-pending-badge">?</span>
                    `;
                    disp.className = 'final-note';
                } else {
                    disp.textContent = '-';
                    disp.className = 'final-note';
                }
            }
        }
    });

    updateResitVisibility();

    // 2. Calculer les moyennes (en prenant en compte les rattrapages si saisis)
    const s1 = getSemStats(1);
    const s2 = getSemStats(2);
    const year = getGlobalStats();

    updateSemDisplay(1, s1);
    updateSemDisplay(2, s2);

    // Footer stats
    document.getElementById('year-maj').textContent = year.majAvg.toLocaleString('fr-FR', {minimumFractionDigits:3, maximumFractionDigits:3});
    document.getElementById('year-gen').textContent = year.genAvg.toLocaleString('fr-FR', {minimumFractionDigits:3, maximumFractionDigits:3});

    // Validation Annuelle
    const hasMajorBlock = CURRICULUMS[currentCurriculumId].hasMajorBlock;
    let yearValid = false;

    if (hasMajorBlock) {
        yearValid = (year.majAvg >= 10 && year.genAvg >= 10);
    } else {
        yearValid = (year.genAvg >= 10);
    }

    const yStat = document.getElementById('year-status');
    if(yearValid) {
        yStat.textContent = "VALIDÉ";
        yStat.className = "annual-badge bg-success";
    } else {
        yStat.textContent = "NON VALIDÉ";
        yStat.className = "annual-badge bg-danger";
    }
    
    // 3. Mettre à jour le module de prédiction (cible)
    if(document.getElementById('rattrapage-box').style.display === 'block') {
        calculateRattrapagePrediction();
        updateAllSlidersColors();
    }
}

/**
 * NOUVEAU : Récupère la note effective (Session 1 OU Rattrapage si saisi)
 * Cette fonction est utilisée par les calculs de moyenne
 */
function getEffectiveNote(sub, overrides = null) {
    const resitCheck = document.getElementById('resit_check_' + sub.id);
    
    // Si la case rattrapage est cochée
    if (resitCheck && resitCheck.checked) {
        let valStr = '';
        if (overrides && overrides[sub.id] !== undefined) {
            valStr = overrides[sub.id] !== null ? String(overrides[sub.id]) : '';
        } else {
            const resitInput = document.getElementById('resit_grade_' + sub.id);
            valStr = resitInput ? resitInput.value : '';
        }
        
        if (valStr !== '') {
            const bonus = currentBonuses[sub.id] || 0;
            let note = parseFloat(valStr) + bonus;
            if (note > 20) note = 20;
            return note;
        }
        
        // Si cochée mais vide (en attente), on retourne la note de session 1
        return currentGrades[sub.id] || 0;
    }
    
    // Sinon on retourne la note de session 1 (ou 0 par défaut)
    return currentGrades[sub.id] || 0;
}

function updateResitVisibility() {
    activeSubjects.forEach(sub => {
        const note = currentGrades[sub.id] || 0;
        const resitItem = document.getElementById(`resit_item_${sub.id}`);
        const checkBox = document.getElementById(`resit_check_${sub.id}`);
        const resitSlider = document.getElementById(`resit_slider_${sub.id}`);
        const resitInput = document.getElementById(`resit_grade_${sub.id}`);
        const bonusDisplay = document.getElementById(`resit_bonus_display_${sub.id}`);
        
        if (resitItem) {
            const bonus = currentBonuses[sub.id] || 0;
            if(bonus > 0) bonusDisplay.textContent = `(+ ${bonus} Bonus)`;
            else bonusDisplay.textContent = '';

            if (note >= 10) {
                resitItem.classList.add('hidden');
                if (checkBox.checked) {
                    checkBox.checked = false;
                    if (resitInput) resitInput.value = '';
                    if (resitSlider) resitSlider.value = 10;
                    if (resitInput) resitInput.disabled = true;
                    if (resitSlider) resitSlider.disabled = true;
                    resitItem.classList.remove('active');
                    saveData();
                }
            } else {
                resitItem.classList.remove('hidden');
            }
        }
    });
}

function getSemStats(sem, overrides = null) {
    let tPts = 0, tCoef = 0, mPts = 0, mCoef = 0;
    activeSubjects.filter(s => s.sem === sem).forEach(s => {
        // MODIFIÉ : Utilise la note effective (Session 1 ou Rattrapage, avec overrides éventuels)
        const note = getEffectiveNote(s, overrides);
        
        tPts += note * s.coef;
        tCoef += s.coef;
        if(s.isMajor) { mPts += note * s.coef; mCoef += s.coef; }
    });
    
    const genAvg = tCoef ? tPts/tCoef : 0;
    const majAvg = mCoef ? mPts/mCoef : 0;
    const hasMajorBlock = CURRICULUMS[currentCurriculumId].hasMajorBlock;

    let isValid = false;
    if(hasMajorBlock) {
        isValid = (genAvg >= 10 && majAvg >= 10);
    } else {
        isValid = (genAvg >= 10);
    }

    return { gen: genAvg, maj: majAvg, isValid: isValid };
}

function getGlobalStats(overrides = null) {
    let tPts = 0, tCoef = 0, mPts = 0, mCoef = 0;
    activeSubjects.forEach(s => {
        // MODIFIÉ : Utilise la note effective avec overrides éventuels
        const note = getEffectiveNote(s, overrides);
        
        tPts += note * s.coef;
        tCoef += s.coef;
        if(s.isMajor) { mPts += note * s.coef; mCoef += s.coef; }
    });
    return {
        genAvg: tCoef ? tPts/tCoef : 0,
        majAvg: mCoef ? mPts/mCoef : 0,
        totalCoef: tCoef,
        majCoef: mCoef
    };
}

function updateSemDisplay(sem, stats) {
    document.getElementById('avg-maj-s'+sem).textContent = stats.maj.toLocaleString('fr-FR', {maximumFractionDigits:3}) + "/20";
    document.getElementById('avg-gen-s'+sem).textContent = stats.gen.toLocaleString('fr-FR', {maximumFractionDigits:3}) + "/20";
    const vDiv = document.getElementById('valid-s'+sem);
    const box = document.getElementById('status-s'+sem);
    if(stats.isValid) {
        vDiv.textContent = "SEMESTRE VALIDÉ";
        vDiv.className = "text-success";
        box.className = "status-box valid";
    } else {
        vDiv.textContent = "Non Validé";
        vDiv.className = "text-danger";
        box.className = "status-box invalid";
    }
}

function toggleRattrapages() {
    const box = document.getElementById('rattrapage-box');
    const isHidden = box.style.display === 'none' || box.style.display === '';
    box.style.display = isHidden ? 'block' : 'none';
    if(isHidden) {
        updateResitVisibility();
        calculateRattrapagePrediction();
        updateAllSlidersColors();
    }
}

// Renommé pour éviter la confusion avec le calcul principal
function calculateRattrapagePrediction() {
    let stats = {
        year: { acqGen: 0, acqMaj: 0, missGen: 0, missMaj: 0, manGen: 0, manMaj: 0 },
        s1: { acqGen: 0, acqMaj: 0, missGen: 0, missMaj: 0, manGen: 0, manMaj: 0, totGen: 0, totMaj: 0 },
        s2: { acqGen: 0, acqMaj: 0, missGen: 0, missMaj: 0, manGen: 0, manMaj: 0, totGen: 0, totMaj: 0 }
    };

    activeSubjects.forEach(sub => {
        const isResit = document.getElementById('resit_check_' + sub.id).checked;
        const scope = sub.sem === 1 ? 's1' : 's2';
        
        stats[scope].totGen += sub.coef;
        if(sub.isMajor) stats[scope].totMaj += sub.coef;

        if(!isResit) {
            // Ici on utilise la note Session 1 car on n'a pas coché "Repasser"
            const note = currentGrades[sub.id] || 0;
            const pts = note * sub.coef;
            stats.year.acqGen += pts; stats[scope].acqGen += pts;
            if(sub.isMajor) { stats.year.acqMaj += pts; stats[scope].acqMaj += pts; }
        } else {
            const inp = document.getElementById('resit_grade_' + sub.id);
            const bonus = currentBonuses[sub.id] || 0;

            if(inp && inp.value !== '') {
                // Si une note de rattrapage est saisie, elle compte comme "manuelle" (acquise via simu)
                let note = parseFloat(inp.value) + bonus;
                if(note > 20) note = 20;
                const pts = note * sub.coef;
                stats.year.manGen += pts; stats[scope].manGen += pts;
                if(sub.isMajor) { stats.year.manMaj += pts; stats[scope].manMaj += pts; }
            } else {
                // Si cochée mais vide, c'est ce qu'on cherche à prédire
                const pointsBonus = bonus * sub.coef;
                stats.year.acqGen += pointsBonus; stats[scope].acqGen += pointsBonus;
                if(sub.isMajor) { stats.year.acqMaj += pointsBonus; stats[scope].acqMaj += pointsBonus; }

                stats.year.missGen += sub.coef; stats[scope].missGen += sub.coef;
                if(sub.isMajor) { stats.year.missMaj += sub.coef; stats[scope].missMaj += sub.coef; }
            }
        }
    });

    const globals = getGlobalStats(); // Pour avoir les totaux de coefs
    const hasMajorBlock = CURRICULUMS[currentCurriculumId].hasMajorBlock;

    const renderBlock = (targetGen, acqGen, manGen, missCoefGen, targetMaj, acqMaj, manMaj, missCoefMaj) => {
        const gapGen = targetGen - (acqGen + manGen);
        const formatLine = (gap, coef, label) => {
            if(gap <= 0.01) return `<div class="text-success" style="font-size:0.8rem"><i class="fas fa-check"></i> ${label} : OK</div>`;
            if(coef === 0) return `<div class="text-danger" style="font-size:0.8rem"><i class="fas fa-times"></i> ${label} : Impossible</div>`;
            const req = gap / coef;
            if(req > 20) return `<div class="text-danger" style="font-size:0.8rem"><i class="fas fa-skull"></i> ${label} : >20</div>`;
            return `<div style="font-size:0.8rem">${label} : <strong>${req.toFixed(2)}</strong></div>`;
        };

        let html = formatLine(gapGen, missCoefGen, "Générale");
        if(hasMajorBlock) {
            const gapMaj = targetMaj - (acqMaj + manMaj);
            html = formatLine(gapMaj, missCoefMaj, "Majeures") + html;
        }
        return html;
    };

    // Calculs cibles basés sur les coefs totaux
    // Note: globals.totalCoef est constant, peu importe les notes
    const targetGenYear = 10 * globals.totalCoef;
    const targetMajYear = 10 * globals.majCoef;
    const targetGenS1 = 10 * stats.s1.totGen;
    const targetMajS1 = 10 * stats.s1.totMaj;
    const targetGenS2 = 10 * stats.s2.totGen;
    const targetMajS2 = 10 * stats.s2.totMaj;

    document.getElementById('resit-target-year-gen').innerHTML = renderBlock(
        targetGenYear, stats.year.acqGen, stats.year.manGen, stats.year.missGen,
        targetMajYear, stats.year.acqMaj, stats.year.manMaj, stats.year.missMaj
    );
    
    document.getElementById('resit-target-s1-gen').innerHTML = renderBlock(
        targetGenS1, stats.s1.acqGen, stats.s1.manGen, stats.s1.missGen,
        targetMajS1, stats.s1.acqMaj, stats.s1.manMaj, stats.s1.missMaj
    );

    document.getElementById('resit-target-s2-gen').innerHTML = renderBlock(
        targetGenS2, stats.s2.acqGen, stats.s2.manGen, stats.s2.missGen,
        targetMajS2, stats.s2.acqMaj, stats.s2.manMaj, stats.s2.missMaj
    );
}

/**
 * Calcule dichotomiquement la note de rattrapage minimale requise pour valider
 * le semestre ou l'année, à partir d'un ensemble de notes d'overrides.
 */
function findThreshold(subId, overrides) {
    const sub = activeSubjects.find(s => s.id === subId);
    if (!sub) return 20.0;
    
    // Fonction test pour vérifier si la note testGrade permet la validation
    const checkValid = (testGrade) => {
        const testOverrides = { ...overrides, [subId]: testGrade };
        const s1 = getSemStats(1, testOverrides);
        const s2 = getSemStats(2, testOverrides);
        const year = getGlobalStats(testOverrides);
        
        const semStats = sub.sem === 1 ? s1 : s2;
        const hasMajorBlock = CURRICULUMS[currentCurriculumId].hasMajorBlock;
        const yearValid = hasMajorBlock ? (year.majAvg >= 10 && year.genAvg >= 10) : (year.genAvg >= 10);
        
        return semStats.isValid || yearValid;
    };
    
    // Si la validation est possible même avec un 0/20
    if (checkValid(0)) return 0.0;
    
    // Si la validation est impossible même avec un 20/20
    if (!checkValid(20)) return 20.0;
    
    // Recherche dichotomique entre 0 et 20
    let low = 0.0;
    let high = 20.0;
    for (let i = 0; i < 11; i++) { // 11 itérations donne une précision de 20 / 2048 ~= 0.01 pt
        const mid = (low + high) / 2;
        if (checkValid(mid)) {
            high = mid;
        } else {
            low = mid;
        }
    }
    return high;
}

/**
 * Calcule les seuils pour chaque matière de rattrapage cochée et applique
 * dynamiquement le dégradé linéaire de fond sur la piste du slider.
 */
function updateAllSlidersColors() {
    // 1. Identifier les notes déjà saisies et celles en attente (pending)
    const retakeValues = {};
    const pendingSubjects = new Set();
    
    activeSubjects.forEach(s => {
        const check = document.getElementById('resit_check_' + s.id);
        const inp = document.getElementById('resit_grade_' + s.id);
        if (check && check.checked) {
            if (inp && inp.value !== '') {
                retakeValues[s.id] = parseFloat(inp.value);
            } else {
                pendingSubjects.add(s.id);
            }
        }
    });
    
    // 2. Pour chaque matière active, calculer les seuils T_orange et T_green
    activeSubjects.forEach(sub => {
        const check = document.getElementById('resit_check_' + sub.id);
        if (!check || !check.checked) return;
        
        // Scénario Optimiste : les autres rattrapages en attente obtiennent 20.0
        const optimisticOverrides = {};
        activeSubjects.forEach(s => {
            const sCheck = document.getElementById('resit_check_' + s.id);
            if (sCheck && sCheck.checked) {
                if (s.id === sub.id) {
                    // Note de test
                } else if (pendingSubjects.has(s.id)) {
                    optimisticOverrides[s.id] = 20.0;
                } else {
                    optimisticOverrides[s.id] = retakeValues[s.id];
                }
            }
        });
        
        // Scénario Pessimiste : les autres rattrapages en attente obtiennent 0.0
        const pessimisticOverrides = {};
        activeSubjects.forEach(s => {
            const sCheck = document.getElementById('resit_check_' + s.id);
            if (sCheck && sCheck.checked) {
                if (s.id === sub.id) {
                    // Note de test
                } else if (pendingSubjects.has(s.id)) {
                    pessimisticOverrides[s.id] = 0.0;
                } else {
                    pessimisticOverrides[s.id] = retakeValues[s.id];
                }
            }
        });
        
        const T_orange = findThreshold(sub.id, optimisticOverrides);
        const T_green = findThreshold(sub.id, pessimisticOverrides);
        
        // 3. Mettre à jour l'apparence de la piste du slider en dégradé
        const slider = document.getElementById('resit_slider_' + sub.id);
        if (slider) {
            const pOrange = (T_orange / 20) * 100;
            const pGreen = (T_green / 20) * 100;
            
            slider.style.background = `linear-gradient(to right, 
                var(--danger) 0%, var(--danger) ${pOrange}%, 
                var(--warning) ${pOrange}%, var(--warning) ${pGreen}%, 
                var(--success) ${pGreen}%, var(--success) 100%)`;
        }
    });
}
