import { updateCompletionStatistics } from './progressTracker.js';
import { saveProgress } from './storage.js';

export function generateWeeklyViews(plan) {
    const weeksContainer = document.querySelector('.weeks-container');
    
    plan.forEach((week, weekIndex) => {
        const weekCard = createWeekCard(week, weekIndex);
        weeksContainer.appendChild(weekCard);
    });

    openCurrentWeek(plan);
}

function createWeekCard(week, weekIndex) {
    const weekCard = document.createElement('div');
    weekCard.className = 'week-card';
    weekCard.innerHTML = generateWeekCardHTML(week, weekIndex);
    return weekCard;
}

function generateWeekCardHTML(week, weekIndex) {
    return `
        <div class="week-header" data-week="${weekIndex}">
            <div class="week-title">
                Semaine ${week.semaine} (${week.date})
            </div>
            <div class="week-summary">
                <span class="week-distance">${week.total_semaine}</span>
                <span class="toggle-icon">▼</span>
            </div>
        </div>
        <div class="week-content" id="week-${weekIndex}-content">
            <div class="week-objective">
                <strong>Objectif:</strong> ${week.objectif}
            </div>
            <div class="sessions-container">
                ${generateSessionsHTML(week, weekIndex)}
            </div>
        </div>
    `;
}

function generateSessionsHTML(week, weekIndex) {
    return week.seances.map((session, sessionIndex) => {
        const sessionTypeClass = `type-${session.type.toLowerCase().replace(' ', '-')}`;
        const sessionId = `session-${weekIndex}-${sessionIndex}`;
        return `
            <div class="session-card" data-id="${sessionId}">
                <div class="session-header">
                    <div>
                        <span class="session-day">${session.jour}</span>
                        <span class="session-type ${sessionTypeClass}">${session.type}</span>
                    </div>
                    <div class="session-actions">
                        <label class="completion-checkbox">
                            <input type="checkbox" class="session-checkbox" 
                                data-week="${weekIndex}" 
                                data-session="${sessionIndex}"
                                data-id="${sessionId}"
                                data-distance="${parseFloat(session.distance.split(' ')[0])}">
                            <span class="checkmark"></span>
                            <span class="checkbox-label">Terminé</span>
                        </label>
                        <span class="session-distance">${session.distance}</span>
                    </div>
                </div>
                <div class="session-details">
                    <div class="session-workout"><strong>${session.details}</strong></div>
                    <div class="session-description">${session.description}</div>
                </div>
            </div>
        `;
    }).join('');
}

export function addEventListeners() {
    addWeekToggleListeners();
    addCheckboxListeners();
}

function addWeekToggleListeners() {
    document.querySelectorAll('.week-header').forEach(header => {
        header.addEventListener('click', function() {
            const weekIndex = this.getAttribute('data-week');
            const content = document.querySelector(`#week-${weekIndex}-content`);
            const toggleIcon = this.querySelector('.toggle-icon');
            
            content.classList.toggle('active');
            toggleIcon.textContent = content.classList.contains('active') ? '▲' : '▼';
        });
    });
}

function addCheckboxListeners() {
    document.querySelectorAll('.session-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const sessionId = this.getAttribute('data-id');
            updateSessionStatus(this, sessionId);
            updateCompletionStatistics();
            saveProgress();
        });
    });
}

function updateSessionStatus(checkbox, sessionId) {
    const dot = document.querySelector(`.session-dot[data-id="${sessionId}"]`);
    const sessionCard = checkbox.closest('.session-card');

    if (dot) {
        dot.classList.toggle('completed', checkbox.checked);
    }
    
    if (sessionCard) {
        sessionCard.classList.toggle('completed-session', checkbox.checked);
    }
}

function openCurrentWeek(plan) {
    const currentDate = new Date();
    const startDate = new Date(2025, 1, 25);
    const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.floor(daysDiff / 7), plan.length - 1);
    
    if (currentWeek >= 0) {
        const weekContent = document.querySelector(`#week-${currentWeek}-content`);
        const toggleIcon = document.querySelector(
            `.week-header[data-week="${currentWeek}"] .toggle-icon`
        );
        
        if (weekContent && toggleIcon) {
            weekContent.classList.add('active');
            toggleIcon.textContent = '▲';
        }
    }
}