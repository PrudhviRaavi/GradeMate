// Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.calculator-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const activeSec = document.getElementById(tabId);
    if (activeSec) activeSec.classList.add('active');

    const buttons = document.querySelectorAll('.tab-btn');
    const sections = ['gradePredictor', 'cgpaPercent', 'sgpaCalc', 'cgpaCalc', 'reqSgpa', 'academicRef'];
    const index = sections.indexOf(tabId);
    if (index >= 0 && buttons[index]) buttons[index].classList.add('active');
}

function exportResults(calcId) {
    window.print();
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
    // Rounding? Usually standard round or ceil. adhere to logic provided "90-100"
    // Let's use Math.round for safety comparison or just strict ranges.
    // Generally standard ranges match strict floating points or rounded.
    // Let's assume standard rounding.
    score = Math.round(score);

    if (score >= 90) return { grade: 'S', points: 10 };
    if (score >= 80) return { grade: 'A+', points: 9 };
    if (score >= 70) return { grade: 'A', points: 8 };
    if (score >= 60) return { grade: 'B+', points: 7 };
    if (score >= 55) return { grade: 'B', points: 6 };
    if (score >= 50) return { grade: 'C', points: 5 };

    // P Grade Check
    if (type !== 'practical') {
        if (score >= 45) return { grade: 'P', points: 4 };
    }

    return { grade: 'F', points: 0 };
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
let sgpaCount = 1;
function addSgpaRow() {
    sgpaCount++;
    const row = document.createElement('div');
    row.className = 'form-group row-container';
    row.style = 'display:flex; gap:1rem; align-items:center; animation:fadeInUp 0.3s;';
    row.innerHTML = `
        <input type="text" class="form-control" value="Subject ${sgpaCount}" placeholder="Subject Name">
        <input type="number" class="form-control credit-input" placeholder="Credits" style="width:100px;">
        <select class="form-control grade-input" style="width:120px;">
            <option value="10">S</option>
            <option value="9">A+</option>
            <option value="8">A</option>
            <option value="7">B+</option>
            <option value="6">B</option>
            <option value="5">C</option>
            <option value="4">P</option>
            <option value="0">F</option>
        </select>
        <button class="btn-delete" onclick="this.parentElement.remove()" title="Delete Row">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    document.getElementById('sgpaRows').appendChild(row);
}

function calculateSgpa() {
    let totalCredits = 0;
    let totalPoints = 0;
    let hasValidRow = false;

    const credits = document.querySelectorAll('.credit-input');
    const grades = document.querySelectorAll('.grade-input');

    for (let i = 0; i < credits.length; i++) {
        const c = parseFloat(credits[i].value);
        const g = parseFloat(grades[i].value);

        if (!isNaN(c)) {
            if (c <= 0 || c > 30) {
                alert(`Credits in Row ${i + 1} must be between 1 and 30.`);
                return;
            }
            totalCredits += c;
            totalPoints += (c * g);
            hasValidRow = true;
        }
    }

    if (!hasValidRow) {
        alert("Please enter credits for at least one subject.");
        return;
    }

    const sgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits);

    const box = document.getElementById('sgpaCalcResult');
    box.classList.add('show');
    box.innerHTML = `<h3>SGPA: ${sgpa.toFixed(2)}</h3>`;
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
    document.getElementById('cgpaRows').appendChild(row);
}

function calculateCgpa() {
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
                alert(`SGPA in Row ${i + 1} must be between 0 and 10.`);
                return;
            }
            totalCredits += c;
            totalPoints += (c * s);
            hasValidRow = true;
        }
    }

    if (!hasValidRow) {
        alert("Please enter SGPA and credits for at least one semester.");
        return;
    }

    const cgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits);

    const box = document.getElementById('cgpaCalcResult');
    box.classList.add('show');
    box.innerHTML = `<h3>CGPA: ${cgpa.toFixed(2)}</h3>`;
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
function saveInputs() {
    const data = {
        internalMarks: document.getElementById('internalMarks').value,
        cgpaInput: document.getElementById('cgpaInput').value,
        curCgpa: document.getElementById('curCgpa').value,
        curTotalCredits: document.getElementById('curTotalCredits').value,
        targetCgpa: document.getElementById('targetCgpa').value,
        nextSemCredits: document.getElementById('nextSemCredits').value
    };
    localStorage.setItem('grademate_data', JSON.stringify(data));
}

function loadInputs() {
    const data = JSON.parse(localStorage.getItem('grademate_data'));
    if (data) {
        document.getElementById('internalMarks').value = data.internalMarks || '';
        document.getElementById('cgpaInput').value = data.cgpaInput || '';
        document.getElementById('curCgpa').value = data.curCgpa || '';
        document.getElementById('curTotalCredits').value = data.curTotalCredits || '';
        document.getElementById('targetCgpa').value = data.targetCgpa || '';
        document.getElementById('nextSemCredits').value = data.nextSemCredits || '';
    }
}

// Auto-load on startup
window.onload = () => {
    loadInputs();
};
