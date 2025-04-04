document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');
        
        const user = validateUser(username, password);
        
        if (user) {
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                displayName: user.displayName,
                loginTime: new Date().toISOString()
            }));
            
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            errorElement.textContent = 'Nom d\'utilisateur ou mot de passe incorrect';
            errorElement.style.display = 'block';
        }
    });
});