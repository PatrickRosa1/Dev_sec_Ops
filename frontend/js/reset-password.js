document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const storedToken = localStorage.getItem('recoveryToken');
    
    if (token !== storedToken) {
        alert('Token inválido ou expirado');
        window.location.href = 'forgot-password.html';
    }
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const message = document.getElementById('resetMessage');
    
    if (newPassword !== confirmPassword) {
        message.textContent = 'As senhas não coincidem';
        message.style.color = '#f44336';
        return;
    }
    
    if (newPassword.length < 6) {
        message.textContent = 'A senha deve ter pelo menos 6 caracteres';
        message.style.color = '#f44336';
        return;
    }
    
    const email = localStorage.getItem('recoveryEmail');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].password = btoa(newPassword);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Limpa tokens temporários
        localStorage.removeItem('recoveryToken');
        localStorage.removeItem('recoveryEmail');
        
        message.textContent = 'Senha redefinida com sucesso! Redirecionando para login...';
        message.style.color = '#4CAF50';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});