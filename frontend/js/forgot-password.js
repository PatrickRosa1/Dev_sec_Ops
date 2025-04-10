document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    const message = document.getElementById('recoveryMessage');
    
    if (user) {
        // Em um sistema real, enviaria email. Aqui simulamos
        const tempToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
        localStorage.setItem('recoveryToken', tempToken);
        localStorage.setItem('recoveryEmail', email);
        
        message.textContent = `Link de recuperação enviado para ${email} (simulado)`;
        message.style.color = '#4CAF50';
        
        // Simula redirecionamento após 3 segundos
        setTimeout(() => {
            window.location.href = `reset-password.html?token=${tempToken}`;
        }, 3000);
    } else {
        message.textContent = 'Email não encontrado';
        message.style.color = '#f44336';
    }
});