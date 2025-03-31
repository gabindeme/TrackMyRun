document.addEventListener('DOMContentLoaded', function() {
    // Load the JSON data
    fetch('training-plan.json')
        .then(response => response.json())
        .then(data => {
            initializeWebsite(data);
            // Load saved progress from local storage
            loadSavedProgress();
        })
        .catch(error => console.error('Error loading training plan:', error));
});

function initializeWebsite(data) {
    const plan = data.plan_10k;
    
    // Store the plan data globally for later use
    window.trainingPlan = plan;
    
    // Generate statistics
    generateStatistics(plan);
    
    // Generate progress tracker with dynamic statistics
    generateProgressTracker(plan);
    
    // Generate weekly views
    generateWeeklyViews(plan);
    
    // Add event listeners for week toggles
    addEventListeners();
}

function generateStatistics(plan) {
    // Statistics code remains the same
    let totalDistance = 0;
    let sessionTypes = {};
    
    plan.forEach(week => {
        week.seances.forEach(session => {
            totalDistance += parseFloat(session.distance.split(' ')[0]);
            
            if (!sessionTypes[session.type]) {
                sessionTypes[session.type] = 0;
            }
            sessionTypes[session.type]++;
        });
    });
    
    const statsPanel = document.querySelector('.stats-panel');
    statsPanel.innerHTML = `
        <h2>Statistiques du Plan</h2>
        <div class="stat-item">
            <span class="stat-label">Distance totale:</span>
            <span class="stat-value">${totalDistance.toFixed(1)} km</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Nombre de séances:</span>
            <span class="stat-value">${Object.values(sessionTypes).reduce((a, b) => a + b, 0)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Durée du plan:</span>
            <span class="stat-value">${plan.length} semaines</span>
        </div>
        <h3>Répartition des séances</h3>
        <div class="session-distribution">
            ${Object.entries(sessionTypes).map(([type, count]) => `
                <div class="distribution-item">
                    <span class="type-label">${type}:</span>
                    <span class="type-count">${count}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateProgressTracker(plan) {
    const progressTracker = document.querySelector('.progress-tracker');
    progressTracker.innerHTML = `
        <h2>Suivi de progression</h2>
        
        <!-- Dynamic Statistics Cards -->
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
        
        <!-- Weekly Distance Chart -->
        <h3>Progression par semaine</h3>        
        <!-- Session Dots Tracker -->
        <div class="progress-visualization">
            ${plan.map((week, weekIndex) => `
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
            `).join('')}
        </div>
        
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: 0%"></div>
        </div>
        <div class="completion-rate">
            <div class="completion-label">Progression: </div>
            <div class="completion-value">0%</div>
        </div>
    `;
    
    // Add click event to toggle completion status in the progress tracker
    document.querySelectorAll('.session-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const weekIndex = this.getAttribute('data-week');
            const sessionIndex = this.getAttribute('data-session');
            const sessionId = this.getAttribute('data-id');
            
            // Toggle completion status
            this.classList.toggle('completed');
            
            // Also toggle the checkbox in the session card if it exists
            const checkbox = document.querySelector(`.session-checkbox[data-id="${sessionId}"]`);
            if (checkbox) {
                checkbox.checked = this.classList.contains('completed');
                
                // Update session card appearance
                const sessionCard = checkbox.closest('.session-card');
                if (sessionCard) {
                    if (checkbox.checked) {
                        sessionCard.classList.add('completed-session');
                    } else {
                        sessionCard.classList.remove('completed-session');
                    }
                }
            }
            
            // Update completion statistics and save progress
            updateCompletionStatistics();
            saveProgress();
        });
    });
}

function updateCompletionStatistics() {
    const plan = window.trainingPlan;
    
    // Calculate total and completed distances
    let totalDistance = 0;
    let completedDistance = 0;
    let totalSessions = 0;
    let completedSessions = 0;
    
    // Track completed distance by week
    const weeklyCompletedDistance = {};
    
    document.querySelectorAll('.session-dot').forEach(dot => {
        const distance = parseFloat(dot.getAttribute('data-distance'));
        const weekIndex = dot.getAttribute('data-week');
        const isCompleted = dot.classList.contains('completed');
        
        totalDistance += distance;
        totalSessions++;
        
        if (isCompleted) {
            completedDistance += distance;
            completedSessions++;
            
            // Add to weekly completed distance
            if (!weeklyCompletedDistance[weekIndex]) {
                weeklyCompletedDistance[weekIndex] = 0;
            }
            weeklyCompletedDistance[weekIndex] += distance;
        }
    });
    
    // Update statistics cards
    document.getElementById('completed-distance').textContent = completedDistance.toFixed(1);
    document.getElementById('completed-sessions').textContent = completedSessions;
    document.getElementById('completion-percentage').textContent = `${Math.round((completedSessions / totalSessions) * 100)}%`;
    document.getElementById('remaining-distance').textContent = (totalDistance - completedDistance).toFixed(1);
    
    // Update progress bar and completion rate
    const completionRate = (completedSessions / totalSessions) * 100;
    document.querySelector('.completion-value').textContent = `${completionRate.toFixed(0)}%`;
    document.querySelector('.progress-bar').style.width = `${completionRate}%`;
    
    // Update weekly chart bars
    for (let weekIndex in weeklyCompletedDistance) {
        const weeklyTotal = parseFloat(plan[weekIndex].total_semaine.split(' ')[0]);
        const completedPercentage = (weeklyCompletedDistance[weekIndex] / weeklyTotal) * 100;
        
        const bar = document.getElementById(`week-bar-${weekIndex}`);
        if (bar) {
            if (completedPercentage >= 100) {
                bar.classList.add('completed');
            } else if (completedPercentage > 0) {
                // Create a gradient effect for partially completed weeks
                bar.style.background = `linear-gradient(to top, 
                    var(--secondary-color) ${completedPercentage}%, 
                    var(--primary-color) ${completedPercentage}%)`;
            }
        }
    }
}

function generateWeeklyViews(plan) {
    const weeksContainer = document.querySelector('.weeks-container');
    
    plan.forEach((week, weekIndex) => {
        const weekCard = document.createElement('div');
        weekCard.className = 'week-card';
        
        weekCard.innerHTML = `
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
                    ${week.seances.map((session, sessionIndex) => {
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
                    }).join('')}
                </div>
            </div>
        `;
        
        weeksContainer.appendChild(weekCard);
    });
    
    // Open the current week by default
    const currentDate = new Date();
    const startDate = new Date(2025, 1, 25); // February 25, 2025
    const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.floor(daysDiff / 7), plan.length - 1);
    
    if (currentWeek >= 0) {
        document.querySelector(`#week-${currentWeek}-content`).classList.add('active');
        document.querySelector(`.week-header[data-week="${currentWeek}"] .toggle-icon`).textContent = '▲';
    }
}

function addEventListeners() {
    // Week toggle event listeners
    document.querySelectorAll('.week-header').forEach(header => {
        header.addEventListener('click', function() {
            const weekIndex = this.getAttribute('data-week');
            const content = document.querySelector(`#week-${weekIndex}-content`);
            const toggleIcon = this.querySelector('.toggle-icon');
            
            content.classList.toggle('active');
            toggleIcon.textContent = content.classList.contains('active') ? '▲' : '▼';
        });
    });
    
    // Session checkbox event listeners
    document.querySelectorAll('.session-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const weekIndex = this.getAttribute('data-week');
            const sessionIndex = this.getAttribute('data-session');
            const sessionId = this.getAttribute('data-id');
            
            // Find the corresponding dot in the progress tracker and update its status
            const dot = document.querySelector(`.session-dot[data-id="${sessionId}"]`);
            if (dot) {
                if (this.checked) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.remove('completed');
                }
            }
            
            // Update the session card appearance
            const sessionCard = this.closest('.session-card');
            if (sessionCard) {
                if (this.checked) {
                    sessionCard.classList.add('completed-session');
                } else {
                    sessionCard.classList.remove('completed-session');
                }
            }
            
            // Update completion statistics and save progress
            updateCompletionStatistics();
            saveProgress();
        });
    });
}

// Save progress to local storage
function saveProgress() {
    const progress = {};
    
    document.querySelectorAll('.session-dot').forEach(dot => {
        const weekIndex = dot.getAttribute('data-week');
        const sessionIndex = dot.getAttribute('data-session');
        const isCompleted = dot.classList.contains('completed');
        
        if (!progress[weekIndex]) {
            progress[weekIndex] = {};
        }
        
        progress[weekIndex][sessionIndex] = isCompleted;
    });
    
    localStorage.setItem('trainingProgress', JSON.stringify(progress));
}

// Load saved progress from local storage
function loadSavedProgress() {
    const savedProgress = localStorage.getItem('trainingProgress');
    
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        for (const weekIndex in progress) {
            for (const sessionIndex in progress[weekIndex]) {
                if (progress[weekIndex][sessionIndex]) {
                    const sessionId = `session-${weekIndex}-${sessionIndex}`;
                    
                    // Update dot in progress tracker
                    const dot = document.querySelector(`.session-dot[data-id="${sessionId}"]`);
                    if (dot) {

                        // Fonction pour charger les données JSON et initialiser la page
async function initializeTrainingPlan() {
    try {
        // Charger les données JSON (remplacez l'URL par l'emplacement réel de votre fichier JSON)
        const response = await fetch('data/training-plan.json');
        if (!response.ok) {
            throw new Error('Impossible de charger les données du plan d\'entraînement');
        }
        
        const data = await response.json();
        
        // Extraire les informations générales (premier élément du JSON)
        const planInfo = data[0];
        
        // Mettre à jour le titre et l'objectif dans l'interface
        updatePlanHeader(planInfo);
        
        // Initialiser le reste de l'application avec les données des semaines (à partir du deuxième élément)
        const weeksData = data.slice(1);
        initializeWeeks(weeksData);
        
        // Mettre à jour les statistiques et les visualisations
        updateStatistics(weeksData);
        
        // Configurer les indicateurs de défilement
        setupScrollIndicators();
        
    } catch (error) {
        console.error('Erreur lors du chargement du plan d\'entraînement:', error);
        displayErrorMessage('Impossible de charger le plan d\'entraînement. Veuillez réessayer plus tard.');
    }
}

// Fonction pour mettre à jour l'en-tête de la page avec les informations du plan
function updatePlanHeader(planInfo) {
    // Mettre à jour le titre de la page
    document.title = planInfo.titre || 'Plan d\'entraînement';
    
    // Mettre à jour l'en-tête principal
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.textContent = planInfo.titre || 'Plan d\'entraînement';
    }
    
    // Mettre à jour la bannière d'objectif
    const goalBanner = document.querySelector('.goal-banner');
    if (goalBanner) {
        goalBanner.textContent = planInfo.objectif || 'Objectif non défini';
    } else {
        // Créer la bannière si elle n'existe pas
        const header = document.querySelector('header');
        const newGoalBanner = document.createElement('div');
        newGoalBanner.className = 'goal-banner';
        newGoalBanner.textContent = planInfo.objectif || 'Objectif non défini';
        header.appendChild(newGoalBanner);
    }
}

// Fonction pour initialiser les semaines à partir des données JSON
function initializeWeeks(weeksData) {
    const weeksContainer = document.querySelector('.weeks-container');
    if (!weeksContainer) return;
    
    // Vider le conteneur existant
    weeksContainer.innerHTML = '';
    
    // Créer les cartes de semaines à partir des données
    weeksData.forEach((weekData, index) => {
        const weekCard = createWeekCard(weekData, index + 1);
        weeksContainer.appendChild(weekCard);
    });
    
    // Ajouter les écouteurs d'événements pour les en-têtes de semaine
    setupWeekToggles();
    
    // Ajouter les écouteurs d'événements pour les cases à cocher des séances
    setupSessionCheckboxes();
}

// Fonction pour créer une carte de semaine à partir des données
function createWeekCard(weekData, weekNumber) {
    const weekCard = document.createElement('div');
    weekCard.className = 'week-card';
    
    // Créer l'en-tête de la semaine
    const weekHeader = document.createElement('div');
    weekHeader.className = 'week-header';
    weekHeader.innerHTML = `
        <div class="week-title">Semaine ${weekNumber}</div>
        <div class="week-summary">
            <span class="week-distance">${calculateWeekDistance(weekData)} km</span>
            <span class="toggle-icon">▼</span>
        </div>
    `;
    
    // Créer le contenu de la semaine
    const weekContent = document.createElement('div');
    weekContent.className = 'week-content';
    
    // Ajouter l'objectif de la semaine
    const weekObjective = document.createElement('div');
    weekObjective.className = 'week-objective';
    weekObjective.textContent = weekData.objectif || 'Pas d\'objectif spécifique pour cette semaine';
    weekContent.appendChild(weekObjective);
    
    // Créer le conteneur de séances
    const sessionsContainer = document.createElement('div');
    sessionsContainer.className = 'sessions-container';
    
    // Ajouter chaque séance
    weekData.seances.forEach(session => {
        const sessionCard = createSessionCard(session);
        sessionsContainer.appendChild(sessionCard);
    });
    
    weekContent.appendChild(sessionsContainer);
    
    // Assembler la carte de semaine
    weekCard.appendChild(weekHeader);
    weekCard.appendChild(weekContent);
    
    return weekCard;
}

// Fonction pour créer une carte de séance à partir des données
function createSessionCard(sessionData) {
    const sessionCard = document.createElement('div');
    sessionCard.className = 'session-card';
    sessionCard.dataset.id = sessionData.id || generateSessionId();
    
    if (sessionData.completed) {
        sessionCard.classList.add('completed-session');
    }
    
    sessionCard.innerHTML = `
        <div class="session-header">
            <div>
                <span class="session-day">${sessionData.jour}</span>
                <span class="session-type type-${sessionData.type.toLowerCase()}">${sessionData.type}</span>
            </div>
            <div class="session-actions">
                <label class="completion-checkbox">
                    <input type="checkbox" class="session-checkbox" ${sessionData.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="session-distance">${sessionData.distance} km</span>
            </div>
        </div>
        <div class="session-details">
            <div class="session-workout">${sessionData.entrainement}</div>
            <div class="session-description">${sessionData.description || ''}</div>
        </div>
    `;
    
    return sessionCard;
}

// Fonction pour calculer la distance totale d'une semaine
function calculateWeekDistance(weekData) {
    if (!weekData.seances || !Array.isArray(weekData.seances)) return 0;
    
    return weekData.seances.reduce((total, session) => {
        const distance = parseFloat(session.distance) || 0;
        return total + distance;
    }, 0);
}

// Fonction pour générer un ID unique pour une séance
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

// Fonction pour configurer les bascules d'affichage des semaines
function setupWeekToggles() {
    const weekHeaders = document.querySelectorAll('.week-header');
    
    weekHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const weekCard = header.parentElement;
            const content = weekCard.querySelector('.week-content');
            const toggleIcon = header.querySelector('.toggle-icon');
            
            content.classList.toggle('active');
            toggleIcon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : '';
        });
    });
}

// Fonction pour configurer les cases à cocher des séances
function setupSessionCheckboxes() {
    const sessionCheckboxes = document.querySelectorAll('.session-checkbox');
    
    sessionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const sessionCard = this.closest('.session-card');
            if (this.checked) {
                sessionCard.classList.add('completed-session');
            } else {
                sessionCard.classList.remove('completed-session');
            }
            
            // Mettre à jour les statistiques et sauvegarder l'état
            updateStatistics();
            saveSessionState(sessionCard.dataset.id, this.checked);
        });
    });
}

// Fonction pour mettre à jour les statistiques
function updateStatistics(weeksData) {
    // Calculer les statistiques à partir des données ou de l'état actuel du DOM
    const totalSessions = document.querySelectorAll('.session-card').length;
    const completedSessions = document.querySelectorAll('.completed-session').length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    // Mettre à jour les statistiques dans l'interface
    updateStatsDisplay(totalSessions, completedSessions, completionRate);
    
    // Mettre à jour les visualisations
    updateProgressVisualizations(weeksData);
}

// Fonction pour mettre à jour l'affichage des statistiques
function updateStatsDisplay(totalSessions, completedSessions, completionRate) {
    // Mettre à jour les valeurs dans l'interface
    const totalSessionsElement = document.querySelector('.total-sessions');
    const completedSessionsElement = document.querySelector('.completed-sessions');
    const completionRateElement = document.querySelector('.completion-percentage');
    const progressBarElement = document.querySelector('.progress-bar');
    
    if (totalSessionsElement) totalSessionsElement.textContent = totalSessions;
    if (completedSessionsElement) completedSessionsElement.textContent = completedSessions;
    if (completionRateElement) completionRateElement.textContent = `${completionRate}%`;
    if (progressBarElement) progressBarElement.style.width = `${completionRate}%`;
}

// Fonction pour mettre à jour les visualisations de progression
function updateProgressVisualizations(weeksData) {
    // Mettre à jour le graphique de progression hebdomadaire
    updateWeeklyProgressChart(weeksData);
    
    // Mettre à jour la visualisation des points de session
    updateSessionDots(weeksData);
}

// Fonction pour sauvegarder l'état d'une séance
function saveSessionState(sessionId, isCompleted) {
    // Implémenter la sauvegarde de l'état (localStorage, API, etc.)
    try {
        const savedStates = JSON.parse(localStorage.getItem('sessionStates') || '{}');
        savedStates[sessionId] = isCompleted;
        localStorage.setItem('sessionStates', JSON.stringify(savedStates));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'état de la séance:', error);
    }
}

// Fonction pour charger l'état sauvegardé des séances
function loadSavedSessionStates() {
    try {
        const savedStates = JSON.parse(localStorage.getItem('sessionStates') || '{}');
        Object.entries(savedStates).forEach(([sessionId, isCompleted]) => {
            const sessionCard = document.querySelector(`.session-card[data-id="${sessionId}"]`);
            if (sessionCard) {
                const checkbox = sessionCard.querySelector('.session-checkbox');
                if (checkbox) {
                    checkbox.checked = isCompleted;
                    if (isCompleted) {
                        sessionCard.classList.add('completed-session');
                    } else {
                        sessionCard.classList.remove('completed-session');
                    }
                }
            }
        });
        
        // Mettre à jour les statistiques après avoir chargé les états
        updateStatistics();
    } catch (error) {
        console.error('Erreur lors du chargement des états de séance:', error);
    }
}

// Fonction pour afficher un message d'erreur
function displayErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    
    // Insérer au début du corps de la page
    document.body.insertBefore(errorContainer, document.body.firstChild);
    
    // Style pour le message d'erreur
    errorContainer.style.backgroundColor = '#f8d7da';
    errorContainer.style.color = '#721c24';
    errorContainer.style.padding = '1rem';
    errorContainer.style.margin = '1rem';
    errorContainer.style.borderRadius = '4px';
    errorContainer.style.textAlign = 'center';
}

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    initializeTrainingPlan();
});

                        dot.classList.add('completed');
                    }
                    
                    // Update checkbox in session card
                    const checkbox = document.querySelector(`.session-checkbox[data-id="${sessionId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        const sessionCard = checkbox.closest('.session-card');
                        if (sessionCard) {
                            sessionCard.classList.add('completed-session');
                        }
                    }
                }
            }
        }
        
        // Update completion statistics
        updateCompletionStatistics();
    }
}