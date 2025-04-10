document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Busca usuários cadastrados
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && atob(u.password) === password);
    
    if (user) {
        // Salva sessão
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email
        }));
        
        // Redireciona
        window.location.href = 'todo.html';
    } else {
        errorMessage.textContent = 'Credenciais inválidas';
    }
});

// Verifica se o usuário já está logado ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'todo.html';
    }
    
    // Carrega tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});