document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorMessage = document.getElementById('regErrorMessage');
    
    // Validações
    if (password !== confirmPassword) {
        errorMessage.textContent = 'As senhas não coincidem';
        return;
    }
    
    if (password.length < 6) {
        errorMessage.textContent = 'A senha deve ter pelo menos 6 caracteres';
        return;
    }
    
    if (username.length < 4) {
        errorMessage.textContent = 'O usuário deve ter pelo menos 4 caracteres';
        return;
    }
    
    // Verifica se usuário já existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.username === username)) {
        errorMessage.textContent = 'Nome de usuário já em uso';
        return;
    }
    
    if (users.some(user => user.email === email)) {
        errorMessage.textContent = 'Email já cadastrado';
        return;
    }
    
    // Adiciona novo usuário
    const newUser = {
        id: Date.now(),
        username,
        email,
        password: btoa(password) // Criptografia básica (não seguro para produção)
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    window.location.href = 'index.html';
});