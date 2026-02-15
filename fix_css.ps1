$file = "styles.css"
$lines = Get-Content $file -TotalCount 674
$lines | Set-Content $file -Encoding UTF8
$newCss = @"

/* Guide Grid and Cards */
.guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.guide-card {
    background: var(--glass-bg);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-md);
    transition: var(--transition);
}

.guide-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.guide-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
}

.guide-card h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.guide-steps {
    list-style: none;
    counter-reset: step-counter;
    padding-left: 0;
}

.guide-steps li {
    counter-increment: step-counter;
    position: relative;
    padding-left: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.6;
    color: var(--text-dark);
}

.guide-steps li::before {
    content: counter(step-counter);
    position: absolute;
    left: 0;
    top: 0;
    width: 1.8rem;
    height: 1.8rem;
    background: var(--accent-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
}

.guide-steps li strong {
    color: var(--primary-color);
}

/* Features List */
.features-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
}

.feature-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-icon {
    width: 45px;
    height: 45px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.feature-item h4 {
    color: white;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
}

.feature-item p {
    color: #94a3b8;
    line-height: 1.6;
    margin: 0;
}

@media (max-width: 768px) {
    .guide-grid {
        grid-template-columns: 1fr;
    }

    .feature-item {
        flex-direction: column;
        text-align: center;
    }
}
"@
Add-Content $file $newCss -Encoding UTF8
Write-Host "Styles restored."
