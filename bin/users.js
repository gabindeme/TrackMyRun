const defaultUsers = [
    { username: 'demo', password: 'demo123', displayName: 'Demo User' },
    { username: 'admin', password: 'admin123', displayName: 'Administrator' }
];

function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

function validateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
}