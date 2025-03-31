export function formatDistance(distance) {
    return parseFloat(distance).toFixed(1);
}

export function calculatePercentage(completed, total) {
    return Math.round((completed / total) * 100);
}

export function getCurrentWeek(startDate) {
    const currentDate = new Date();
    const start = new Date(startDate);
    const daysDiff = Math.floor((currentDate - start) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7);
}