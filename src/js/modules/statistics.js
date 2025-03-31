export function generateStatistics(plan) {
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