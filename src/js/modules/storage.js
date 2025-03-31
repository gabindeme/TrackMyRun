export function saveProgress() {
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

export function loadSavedProgress() {
    const savedProgress = localStorage.getItem('trainingProgress');
    
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        for (const weekIndex in progress) {
            for (const sessionIndex in progress[weekIndex]) {
                if (progress[weekIndex][sessionIndex]) {
                    const sessionId = `session-${weekIndex}-${sessionIndex}`;
                    updateElements(sessionId);
                }
            }
        }
    }
}

function updateElements(sessionId) {
    const dot = document.querySelector(`.session-dot[data-id="${sessionId}"]`);
    const checkbox = document.querySelector(`.session-checkbox[data-id="${sessionId}"]`);
    
    if (dot) {
        dot.classList.add('completed');
    }
    
    if (checkbox) {
        checkbox.checked = true;
        const sessionCard = checkbox.closest('.session-card');
        if (sessionCard) {
            sessionCard.classList.add('completed-session');
        }
    }
}