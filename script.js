// Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.calculator-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const activeSec = document.getElementById(tabId);
    if (activeSec) activeSec.classList.add('active');

    const buttons = document.querySelectorAll('.tab-btn');
    const sections = ['sgpaCalc', 'cgpaCalc', 'gradePredictor', 'expectedMarks', 'reqSgpa', 'cgpaPercent', 'gradingSystem'];
    const index = sections.indexOf(tabId);
    if (index >= 0 && buttons[index]) buttons[index].classList.add('active');
}

// FAQ Accordion
function toggleFaq(element) {
    const item = element.parentElement;
    const answer = item.querySelector('.faq-answer');

    // Toggle active class
    item.classList.toggle('active');

    // Animate height
    if (item.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
        answer.style.maxHeight = null;
    }
}

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            // Create mailto link with form data
            const subject = encodeURIComponent(`GradeMate Contact: Message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            const mailtoLink = `mailto:raaviprudhvi1@gmail.com?subject=${subject}&body=${body}`;

            // Open default email client
            window.location.href = mailtoLink;

            // Reset form
            contactForm.reset();

            // Show success message
            alert('Your default email client will open. Please send the email to complete your message.');
        });
    }
});


// ==========================================
// GRADING SCHEME LOGIC
// ==========================================
const DEFAULT_SCHEME = {
    "S": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0
};
let currentScheme = { ...DEFAULT_SCHEME };

function loadGradingScheme() {
    const saved = localStorage.getItem('grademate_scheme');
    if (saved) {
        currentScheme = JSON.parse(saved);
    }
    renderSchemeTable();
}

function renderSchemeTable() {
    const tbody = document.querySelector('#gradingSchemeTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.keys(DEFAULT_SCHEME).forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${grade}</strong></td>
            <td><input type="number" class="form-control scheme-input" data-grade="${grade}" value="${currentScheme[grade]}" step="1" min="0" max="100"></td>
        `;
        tbody.appendChild(row);
    });
}

function saveGradingScheme() {
    const inputs = document.querySelectorAll('.scheme-input');
    inputs.forEach(input => {
        const grade = input.getAttribute('data-grade');
        currentScheme[grade] = parseFloat(input.value) || 0;
    });
    localStorage.setItem('grademate_scheme', JSON.stringify(currentScheme));

    // Update existing select options in SGPA calculator if they exist
    updateAllGradeOptionsByScheme();

    const status = document.getElementById('gradingSchemeStatus');
    if (status) {
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 3000);
    }
}

function resetGradingScheme() {
    if (confirm("Reset grading points to default values?")) {
        currentScheme = { ...DEFAULT_SCHEME };
        localStorage.removeItem('grademate_scheme');
        renderSchemeTable();
        updateAllGradeOptionsByScheme();
    }
}

function updateAllGradeOptionsByScheme() {
    // This will update the internal mapping and we'll ensure selects use labels as values
}

function exportResults(calcId) {
    const element = document.getElementById(calcId);
    if (!element) return;

    // Use html2canvas for a better report
    html2canvas(element, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `GradeMate_${calcId}_Report.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// ==========================================
// GRADE PREDICTOR LOGIC
// ==========================================

function updatePredictorUI() {
    const type = document.getElementById('courseType').value;
    const extPracGroup = document.getElementById('extPracGroup');

    if (type === 'integrated') {
        extPracGroup.style.display = 'block';
    } else {
        extPracGroup.style.display = 'none';
    }
}

function calculateGrade() {
    // Inputs
    const courseType = document.getElementById('courseType').value;
    const internalInput = document.getElementById('internalMarks');
    const internalMarks = parseFloat(internalInput.value);
    const isAbsentInternals = document.getElementById('absentInternals').checked;

    const extPracInput = document.getElementById('extPracMarks');
    const extPracMarks = parseFloat(extPracInput.value) || 0;

    const endSemInput = document.getElementById('endSemMarks');
    const endSemMarks = parseFloat(endSemInput.value);
    const isAbsentEndSem = document.getElementById('absentEndSem').checked;

    const isLowAttendance = document.getElementById('lowAttendance').checked;

    const resultBox = document.getElementById('gradeResult');
    resultBox.innerHTML = '';

    // Validation
    if (isNaN(internalMarks) && !isAbsentInternals) {
        alert("Please enter Internal Marks.");
        return;
    }
    if (internalMarks > 50 || internalMarks < 0) {
        alert("Internal Marks must be between 0 and 50.");
        return;
    }
    if (courseType === 'integrated' && (extPracMarks > 100 || extPracMarks < 0)) {
        alert("External Practical Marks must be between 0 and 100.");
        return;
    }
    if (!isNaN(endSemMarks) && (endSemMarks > 100 || endSemMarks < 0)) {
        alert("End Sem Marks must be between 0 and 100.");
        return;
    }

    resultBox.classList.add('show');

    // 1. Check Special Failure Conditions First
    if (isLowAttendance) {
        showResult("Grade: RA", "Repeat the course due to lack of minimum attendance.", "fail");
        return;
    }

    if (isAbsentInternals) {
        showResult("Grade: RI", "Absent for CIA (Internals).", "fail");
        return;
    }

    // 2. Calculate Current Total (Internals + External Practical if applicable)
    let currentTotal = internalMarks;
    let endSemWeight = 0.5; // Default for Theory/Practical (50%)

    if (courseType === 'integrated') {
        // Integrated: Int(50) + ExtPrac(25) + EndSem(25)
        // Ext Practical is out of 100, converted to 25 => * 0.25
        currentTotal += (extPracMarks * 0.25);
        endSemWeight = 0.25;
    } else {
        // Theory/Practical: Int(50) + EndSem(50)
        // End Sem is out of 100, converted to 50 => * 0.5
        endSemWeight = 0.5;
    }

    // 3. Check for AB (Absent End Sem)
    if (isAbsentEndSem) {
        showResult("Grade: AB", "Absent for End Semester Exam.", "fail");
        return;
    }

    // 4. If End Sem marks are provided -> Calculate Final Grade
    if (!isNaN(endSemMarks)) {
        let finalScore = currentTotal + (endSemMarks * endSemWeight);
        let grade = getGrade(finalScore, courseType);

        let msg = `Total Score: ${finalScore.toFixed(2)}`;
        if (grade.grade === 'F') {
            msg += ` (Failed)`;
            showResult(`Grade: ${grade.grade}`, msg, "fail");
        } else {
            msg += ` (${grade.points} Points)`;
            showResult(`Grade: ${grade.grade}`, msg, "pass");
        }
    }
    // 5. Prediction Mode (No End Sem Marks) -> Show Required Marks Table
    else {
        let tableHtml = `
            <h3><i class="fa-solid fa-list-ol"></i> Target Grades</h3>
            <p>Based on your current marks (${currentTotal.toFixed(2)}), here is what you need in End Sem (out of 100):</p>
            <div class="grade-table-wrapper">
                <table class="grade-table">
                    <tr>
                        <th>Target Grade</th>
                        <th>Required Total</th>
                        <th>Required End Sem (100)</th>
                    </tr>
        `;

        const grades = [
            { g: 'S', min: 90 },
            { g: 'A+', min: 80 },
            { g: 'A', min: 70 },
            { g: 'B+', min: 60 },
            { g: 'B', min: 55 },
            { g: 'C', min: 50 },
            { g: 'P', min: 45 } // Theory/Integrated only
        ];

        let possible = false;

        grades.forEach(item => {
            // Skip P grade for Practical course (min is 50)
            if (courseType === 'practical' && item.g === 'P') return;

            // Calculate required end sem score
            // Formula: Final = Curr + (Req * Weight)
            // Req = (Final - Curr) / Weight
            let requiredEndSem = (item.min - currentTotal) / endSemWeight;

            // If required is negative, it means they already have enough marks (assuming they pass end sem min reqs)
            // But usually you need to appear. Let's say min 0.
            // However, practically, if you have 50 internals, you have 50 total. 
            // For S (90), you need 40 more. 40 / 0.5 = 80.

            if (requiredEndSem <= 100) {
                let displayReq = Math.ceil(requiredEndSem);
                if (displayReq < 0) displayReq = 0; // Just need to attend/pass min criteria usually

                // Formatting
                tableHtml += `
                    <tr>
                        <td><span class="grade-badge" style="font-size:0.9rem; padding:0.2rem 0.6rem;">${item.g}</span></td>
                        <td>${item.min}</td>
                        <td><strong>${displayReq}</strong> / 100</td>
                    </tr>
                `;
                possible = true;
            }
        });

        if (!possible) {
            tableHtml += `<tr><td colspan="3">You cannot pass with these internal marks.</td></tr>`;
        }

        tableHtml += `</table></div>`;
        resultBox.innerHTML = tableHtml;

        // Show export button
        const exportBtn = document.getElementById('exportGrade');
        if (exportBtn) exportBtn.style.display = 'inline-flex';
    }
}

function getGrade(score, type) {
    score = Math.round(score);

    // Dynamic Grade Detection based on currentScheme
    if (score >= 90) return { grade: 'S', points: currentScheme['S'] };
    if (score >= 80) return { grade: 'A+', points: currentScheme['A+'] };
    if (score >= 70) return { grade: 'A', points: currentScheme['A'] };
    if (score >= 60) return { grade: 'B+', points: currentScheme['B+'] };
    if (score >= 55) return { grade: 'B', points: currentScheme['B'] };
    if (score >= 50) return { grade: 'C', points: currentScheme['C'] };

    // P Grade Check
    if (type !== 'practical') {
        if (score >= 45) return { grade: 'P', points: currentScheme['P'] };
    }

    return { grade: 'F', points: currentScheme['F'] };
}

function showResult(title, msg, type) {
    const box = document.getElementById('gradeResult');
    const color = type === 'fail' ? '#c53030' : '#2f855a'; // Red or Green
    const bg = type === 'fail' ? '#fff5f5' : '#f0fff4';

    box.style.backgroundColor = bg;
    box.style.borderColor = color;
    box.style.color = color;

    box.innerHTML = `
        <h2 style="color:${color}">${title}</h2>
        <p>${msg}</p>
    `;
}

// ==========================================
// CGPA -> PERCENTAGE
// ==========================================
function convertCgpa() {
    let cgpa = parseFloat(document.getElementById('cgpaInput').value);

    if (isNaN(cgpa)) {
        alert("Please enter a valid CGPA.");
        return;
    }

    // Strict Validation
    if (cgpa > 10 || cgpa < 0) {
        alert("CGPA must be between 0.00 and 10.00");
        document.getElementById('cgpaInput').value = Math.max(0, Math.min(10, cgpa)).toFixed(2);
        return;
    }

    const percent = cgpa * 10;

    const box = document.getElementById('cgpaPercentResult');
    box.classList.add('show');
    box.innerHTML = `
        <h3>${percent.toFixed(2)}%</h3>
        <p>Calculated for CGPA ${cgpa.toFixed(2)} using multiplier (10)</p>
    `;
    saveInputs();

    // Show export button
    const exportBtn = document.getElementById('exportCgpa');
    if (exportBtn) exportBtn.style.display = 'inline-flex';
}

// ==========================================
// SGPA / CGPA BASICS (Placeholders)
// ==========================================
// Minimal implementation for SGPA
// Removed global sgpaCount to allow dynamic numbering
// Helper to renumber all rows sequentially
function updateSgpaRowNumbers() {
    const rows = document.querySelectorAll('#sgpaRows .row-container');
    rows.forEach((row, index) => {
        const input = row.querySelector('input[type="text"]');
        // Only update if it follows the "Subject X" pattern to avoid overwriting custom names
        if (input && (input.value.startsWith('Subject ') || input.value === '')) {
            input.value = `Subject ${index + 1}`;
        }
    });
}

function addSgpaRow() {
    const row = document.createElement('div');
    row.className = 'form-group row-container';
    row.style = 'display:flex; gap:1rem; align-items:center; animation:fadeInUp 0.3s;';

    // Create selection options based on scheme
    let options = '';
    Object.keys(DEFAULT_SCHEME).forEach(grade => {
        options += `<option value="${grade}">${grade}</option>`;
    });

    row.innerHTML = `
        <input type="text" class="form-control" placeholder="Subject Name">
        <input type="number" class="form-control credit-input" placeholder="Credits" style="width:100px;">
        <select class="form-control grade-input" style="width:120px;">
            ${options}
        </select>
        <button class="btn-delete" title="Delete Row">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    // Real-time update listeners
    const inputs = row.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculateSgpa(true));
    });

    // Add delete functionality with renumbering
    row.querySelector('.btn-delete').onclick = function () {
        row.remove();
        updateSgpaRowNumbers();
        calculateSgpa(true);
    };

    document.getElementById('sgpaRows').appendChild(row);
    updateSgpaRowNumbers();
}

function calculateSgpa(isSilent = false) {
    let totalCredits = 0;
    let totalPoints = 0;
    let hasValidRow = false;

    const credits = document.querySelectorAll('.credit-input');
    const grades = document.querySelectorAll('.grade-input');

    for (let i = 0; i < credits.length; i++) {
        const c = parseFloat(credits[i].value);
        const gName = grades[i].value;
        const g = currentScheme[gName] !== undefined ? currentScheme[gName] : 0;

        if (!isNaN(c) && c > 0) {
            if (c > 30) {
                if (!isSilent) alert(`Credits in Row ${i + 1} must be between 1 and 30.`);
                return;
            }
            totalCredits += c;
            totalPoints += (c * g);
            hasValidRow = true;
        }
    }

    if (!hasValidRow) {
        if (!isSilent) alert("Please enter credits for at least one subject.");
        return;
    }

    const sgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits);

    const box = document.getElementById('sgpaCalcResult');
    box.classList.add('show');
    box.innerHTML = `<h3>SGPA: ${sgpa.toFixed(2)}</h3>`;

    // Flash effect for real-time updates
    if (isSilent) {
        box.style.transition = 'none';
        box.style.transform = 'scale(1.02)';
        box.style.borderColor = 'var(--primary-color)';
        setTimeout(() => {
            box.style.transition = 'transform 0.2s, border-color 0.2s';
            box.style.transform = 'scale(1)';
            box.style.borderColor = '#bee3f8';
        }, 100);
    }

    saveInputs();

    // Show export button
    const exportBtn = document.getElementById('exportSgpa');
    if (exportBtn) exportBtn.style.display = 'inline-flex';
}

// Minimal implementation for CGPA
let cgpaCount = 1;
function addCgpaRow() {
    cgpaCount++;
    const row = document.createElement('div');
    row.className = 'form-group row-container';
    row.style = 'display:flex; gap:1rem; align-items:center; animation:fadeInUp 0.3s;';
    row.innerHTML = `
        <label style="flex:1">Sem ${cgpaCount} SGPA: <input type="number" class="form-control sgpa-val" placeholder="SGPA"></label>
        <label style="flex:1">Credits: <input type="number" class="form-control sem-credit" placeholder="Credits"></label>
        <button class="btn-delete" onclick="this.parentElement.remove()" title="Delete Row" style="margin-top: 1.5rem;">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    // Real-time update listeners
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => calculateCgpa(true));
    });

    // Add delete functionality
    row.querySelector('.btn-delete').onclick = function () {
        row.remove();
        calculateCgpa(true);
    };

    document.getElementById('cgpaRows').appendChild(row);
}

function calculateCgpa(isSilent = false) {
    let totalCredits = 0;
    let totalPoints = 0;
    let hasValidRow = false;

    const sgpas = document.querySelectorAll('.sgpa-val');
    const credits = document.querySelectorAll('.sem-credit');

    for (let i = 0; i < sgpas.length; i++) {
        const s = parseFloat(sgpas[i].value);
        const c = parseFloat(credits[i].value);

        if (!isNaN(s) && !isNaN(c) && c > 0) {
            if (s > 10 || s < 0) {
                if (!isSilent) alert(`SGPA in Row ${i + 1} must be between 0 and 10.`);
                return;
            }
            totalCredits += c;
            totalPoints += (c * s);
            hasValidRow = true;
        }
    }

    if (!hasValidRow) {
        if (!isSilent) alert("Please enter SGPA and credits for at least one semester.");
        return;
    }

    const cgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits);

    const box = document.getElementById('cgpaCalcResult');
    box.classList.add('show');
    box.innerHTML = `<h3>CGPA: ${cgpa.toFixed(2)}</h3>`;

    // Flash effect for real-time updates
    if (isSilent) {
        box.style.transition = 'none';
        box.style.transform = 'scale(1.02)';
        box.style.borderColor = 'var(--primary-color)';
        setTimeout(() => {
            box.style.transition = 'transform 0.2s, border-color 0.2s';
            box.style.transform = 'scale(1)';
            box.style.borderColor = '#bee3f8';
        }, 100);
    }

    // GPA Growth Chart Logic
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        chartContainer.style.display = 'block';

        const labels = Array.from(sgpas).map((_, i) => `Sem ${i + 1}`);
        const data = Array.from(sgpas).map(s => parseFloat(s.value) || 0);

        const ctx = document.getElementById('gpaChart').getContext('2d');

        // Destroy existing chart if it exists
        if (window.gpaChartInstance) {
            window.gpaChartInstance.destroy();
        }

        window.gpaChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Semester SGPA',
                    data: data,
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0ea5e9',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    saveInputs();

    // Show export button
    const exportBtn = document.getElementById('exportCgpaCalc');
    if (exportBtn) exportBtn.style.display = 'inline-flex';
}

// ==========================================
// REQUIRED SGPA LOGIC
// ==========================================
function calculateRequiredSGPA() {
    const curCgpa = parseFloat(document.getElementById('curCgpa').value);
    const curCredits = parseFloat(document.getElementById('curTotalCredits').value);
    const targetCgpa = parseFloat(document.getElementById('targetCgpa').value);
    const nextCredits = parseFloat(document.getElementById('nextSemCredits').value);

    // Strict Validation
    if (isNaN(curCgpa) || isNaN(curCredits) || isNaN(targetCgpa) || isNaN(nextCredits)) {
        alert("Please fill in all required fields.");
        return;
    }

    if (curCgpa > 10 || curCgpa < 0 || targetCgpa > 10 || targetCgpa < 0) {
        alert("Current and Target CGPA must be between 0.00 and 10.00");
        return;
    }

    if (curCredits < 0 || curCredits > 300) {
        alert("Total credits earned must be between 0 and 300.");
        return;
    }

    if (nextCredits <= 0 || nextCredits > 40) {
        alert("Next semester credits must be between 1 and 40.");
        return;
    }

    const box = document.getElementById('reqSgpaResult');
    box.classList.add('show');

    const curPoints = curCgpa * curCredits;
    const reqPoints = targetCgpa * (curCredits + nextCredits) - curPoints;
    const reqSgpa = reqPoints / nextCredits;

    let resultHtml = `<h3>Required SGPA: ${reqSgpa.toFixed(2)}</h3>`;

    if (reqSgpa > 10) {
        resultHtml = `<h3 style="color:#e53e3e;">Required SGPA: ${reqSgpa.toFixed(2)}</h3>
                     <p><strong>Status: <i class="fa-solid fa-circle-xmark"></i> Impossible</strong></p>
                     <p>Even with an S grade (10.0) in all subjects next sem, you can't reach this target in one go.</p>`;
    } else if (reqSgpa < 0) {
        resultHtml = `<h3 style="color:#2f855a;">Goal Reached!</h3>
                     <p><strong>Status: <i class="fa-solid fa-circle-check"></i> Already Safe</strong></p>
                     <p>You have already surpassed your target! You just need to pass your subjects.</p>`;
    } else {
        resultHtml += `<p><strong>Status: <i class="fa-solid fa-bullseye"></i> Achievable</strong></p>
                       <p>To reach ${targetCgpa.toFixed(2)} CGPA, you need an SGPA of <strong>${reqSgpa.toFixed(2)}</strong> in your next ${nextCredits} credits.</p>`;
    }

    box.innerHTML = resultHtml;
    saveInputs();

    // Show export button
    const exportBtn = document.getElementById('exportReq');
    if (exportBtn) exportBtn.style.display = 'inline-flex';
}

// ==========================================
// LOCAL STORAGE PERSISTENCE
// ==========================================

// ... EXPECTED MARKS CALCULATOR ...
function calculateExpectedMarks() {
    const internals = parseFloat(document.getElementById('expInternalMarks').value);
    const resultBox = document.getElementById('expectedMarksResult');
    const errorMsg = document.getElementById('expErrorMsg');

    // Reset UI
    resultBox.style.display = 'none';
    if (errorMsg) {
        errorMsg.style.visibility = 'hidden';
        errorMsg.style.color = 'var(--text-light)'; // Reset color
        errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid number between 0 and 50. Negative values and characters are not allowed.';
    }

    // Validation
    if (isNaN(internals) || internals < 0 || internals > 50) {
        if (errorMsg) {
            errorMsg.style.visibility = 'visible';
            errorMsg.style.color = '#e53e3e'; // Red color for error
            if (isNaN(internals)) errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid number.';
            else if (internals < 0) errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Negative marks are not allowed.';
            else if (internals > 50) errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Internal marks cannot exceed 50.';
        }
        return;
    }

    // Thresholds
    const grades = [
        { label: 'S', minTotal: 90 },
        { label: 'A+', minTotal: 80 },
        { label: 'A', minTotal: 70 },
        { label: 'B+', minTotal: 60 },
        { label: 'B', minTotal: 55 },
        { label: 'C', minTotal: 50 },
        { label: 'P', minTotal: 45 }
    ];

    let tableRows = '';

    grades.forEach(grade => {
        // Formula: Total = Internals + (Externals/2)
        // Externals = (Total - Internals) * 2
        let requiredExt = (grade.minTotal - internals) * 2;
        let extDisplay = '';

        if (requiredExt > 100) {
            extDisplay = '<span style="color: #ef4444; font-weight:600;">NA</span>'; // Not Possible
        } else if (requiredExt <= 0) {
            extDisplay = '<span style="color: #22c55e; font-weight:600;">0</span>'; // Already Achieved
        } else {
            extDisplay = `<strong>${Math.ceil(requiredExt)}</strong>`;
        }

        tableRows += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${grade.label}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${extDisplay}</td>
            </tr>
        `;
    });

    resultBox.innerHTML = `
        <table style="width:100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr style="background: #f8fafc;">
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: var(--primary-color);">Grade</th>
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; color: var(--primary-color);">Required External (100)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
    resultBox.style.display = 'block';
}

function saveInputs() {
    const data = {
        internalMarks: document.getElementById('internalMarks')?.value || '',
        cgpaInput: document.getElementById('cgpaInput')?.value || '',
        curCgpa: document.getElementById('curCgpa')?.value || '',
        curTotalCredits: document.getElementById('curTotalCredits')?.value || '',
        targetCgpa: document.getElementById('targetCgpa')?.value || '',
        nextSemCredits: document.getElementById('nextSemCredits')?.value || ''
    };
    localStorage.setItem('grademate_data', JSON.stringify(data));
}

function loadInputs() {
    const dataString = localStorage.getItem('grademate_data');
    if (!dataString) return;

    const data = JSON.parse(dataString);
    if (data) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };
        setVal('internalMarks', data.internalMarks);
        setVal('cgpaInput', data.cgpaInput);
        setVal('curCgpa', data.curCgpa);
        setVal('curTotalCredits', data.curTotalCredits);
        setVal('targetCgpa', data.targetCgpa);
        setVal('nextSemCredits', data.nextSemCredits);
    }
}

// Auto-load on startup
window.onload = () => {
    loadInputs();
    loadGradingScheme();

    // Apply real-time listeners for existing rows in SGPA
    document.querySelectorAll('.credit-input, .grade-input').forEach(input => {
        input.addEventListener('input', () => calculateSgpa(true));
    });

    // Apply real-time listeners for existing rows in CGPA
    document.querySelectorAll('.sgpa-val, .sem-credit').forEach(input => {
        input.addEventListener('input', () => calculateCgpa(true));
    });

    // Handle redirection from homepage/links
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || localStorage.getItem('activeTab');

    if (activeTab) {
        switchTab(activeTab);
        // Clear it after use if it's from localStorage to avoid sticking
        localStorage.removeItem('activeTab');
    }

    // Mobile Menu Toggle Logic
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== mobileMenuBtn) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }
};
