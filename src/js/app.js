import { generateStatistics } from './modules/statistics.js';
import { generateProgressTracker, updateCompletionStatistics } from './modules/progressTracker.js';
import { generateWeeklyViews, addEventListeners } from './modules/weeklyView.js';
import { loadSavedProgress } from './modules/storage.js';

document.addEventListener('DOMContentLoaded', function() {
    fetch('data/training-plan.json')
        .then(response => response.json())
        .then(data => {
            initializeWebsite(data);
            loadSavedProgress();
        })
        .catch(error => console.error('Error loading training plan:', error));
});

function initializeWebsite(data) {
    const plan = data.plan_10k;
    window.trainingPlan = plan; // Make plan globally available
    
    generateStatistics(plan);
    generateProgressTracker(plan);
    generateWeeklyViews(plan);
    addEventListeners();
}