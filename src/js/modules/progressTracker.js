import { saveProgress } from './storage.js';
import { formatDistance, calculatePercentage } from '../utils/helpers.js';

export function generateProgressTracker(plan) {
    const progressTracker = document.querySelector('.progress-tracker');
    progressTracker.innerHTML = `
        <h2>Suivi de progression</h2>
        <div class="progress-stats">
            <div class="stat-card">
                <div class="stat-value" id="completed-distance">0.0</div>
                <div class="stat-label">km parcourus</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="completed-sessions">0</div>
                <div class="stat-label">séances terminées</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="completion-percentage">0%</div>
                <div class="stat-label">du plan terminé</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="remaining-distance">0.0</div>
                <div class="stat-label">km restants</div>
            </div>
        </div>
        <div class="progress-visualization">
            ${generateProgressDots(plan)}
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: 0%"></div>
        </div>
    `;

    addProgressTrackerListeners();
}

function generateProgressDots(plan) {
    return plan.map((week, weekIndex) => `
        <div class="week-progress">
            <div class="week-label">Semaine ${week.semaine}</div>
            <div class="session-dots">
                ${week.seances.map((session, sessionIndex) => `
                    <div class="session-dot" 
                        data-week="${weekIndex}" 
                        data-session="${sessionIndex}"
                        data-id="session-${weekIndex}-${sessionIndex}"
                        data-distance="${parseFloat(session.distance.split(' ')[0])}"
                        title="${session.jour}: ${session.type} - ${session.details}">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function addProgressTrackerListeners() {
    document.querySelectorAll('.session-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            this.classList.toggle('completed');
            updateCompletionStatistics();
            saveProgress();
        });
    });
}

export function updateCompletionStatistics() {
    const dots = document.querySelectorAll('.session-dot');
    let totalDistance = 0;
    let completedDistance = 0;
    let completedSessions = 0;
    
    dots.forEach(dot => {
        const distance = parseFloat(dot.getAttribute('data-distance'));
        totalDistance += distance;
        
        if (dot.classList.contains('completed')) {
            completedDistance += distance;
            completedSessions++;
        }
    });

    const totalSessions = dots.length;
    const completionRate = calculatePercentage(completedSessions, totalSessions);

    updateStatisticsDisplay(
        formatDistance(completedDistance),
        completedSessions,
        completionRate,
        formatDistance(totalDistance - completedDistance)
    );
}

function updateStatisticsDisplay(completedDistance, completedSessions, completionRate, remainingDistance) {
    document.getElementById('completed-distance').textContent = completedDistance;
    document.getElementById('completed-sessions').textContent = completedSessions;
    document.getElementById('completion-percentage').textContent = `${completionRate}%`;
    document.getElementById('remaining-distance').textContent = remainingDistance;
    document.querySelector('.progress-bar').style.width = `${completionRate}%`;
}