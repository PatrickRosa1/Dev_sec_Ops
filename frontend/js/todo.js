document.addEventListener('DOMContentLoaded', () => {
    // Verificação de login
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Obtém usuário atual
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('welcomeUser').textContent = `Olá, ${currentUser.username}!`;
    
    // Elementos da interface
    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const addAdvancedTaskBtn = document.getElementById('addAdvancedTaskBtn');
    
    // Variáveis de estado
    let currentFilter = 'all';
    let draggedItem = null;
    let tasks = loadTasks(currentUser.id);
    
    // Funções
    function loadTasks(userId) {
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return allTasks.filter(task => task.userId === userId);
    }
    
    function saveTasks() {
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const otherUsersTasks = allTasks.filter(task => task.userId !== currentUser.id);
        localStorage.setItem('tasks', JSON.stringify([...otherUsersTasks, ...tasks]));
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = [...tasks];
        
        // Aplica filtro
        if (currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }
        
        // Aplica pesquisa
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(searchTerm) ||
                (task.category && task.category.toLowerCase().includes(searchTerm))
            );
        }
        
        // Agrupa por categoria se houver
        const tasksByCategory = {};
        filteredTasks.forEach(task => {
            const category = task.category || 'Sem Categoria';
            if (!tasksByCategory[category]) {
                tasksByCategory[category] = [];
            }
            tasksByCategory[category].push(task);
        });
        
        // Renderiza
        for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
            if (Object.keys(tasksByCategory).length > 1) {
                const categoryHeader = document.createElement('h3');
                categoryHeader.textContent = category;
                categoryHeader.className = 'category-header';
                taskList.appendChild(categoryHeader);
            }
            
            categoryTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.priority || ''}`;
                taskItem.setAttribute('draggable', 'true');
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
                    <div class="task-actions">
                        <button class="edit-btn" data-id="${task.id}">Editar</button>
                        <button class="delete-btn" data-id="${task.id}">Excluir</button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
        }
    }
    
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
    
    function addTask(text, category = null, dueDate = null, priority = 'medium') {
        if (text.trim()) {
            const newTask = {
                id: Date.now(),
                userId: currentUser.id,
                text: text.trim(),
                category,
                dueDate,
                priority,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
        }
    }
    
    function openEditModal(task) {
        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Editar Tarefa</h2>
                <form id="editTaskForm">
                    <input type="hidden" id="editTaskId" value="${task.id}">
                    <div class="input-group">
                        <label for="editTaskText">Descrição*</label>
                        <input type="text" id="editTaskText" value="${task.text}" required>
                    </div>
                    <div class="input-group">
                        <label for="editTaskCategory">Categoria</label>
                        <input type="text" id="editTaskCategory" value="${task.category || ''}">
                    </div>
                    <div class="input-group">
                        <label for="editTaskDueDate">Data de Vencimento</label>
                        <input type="date" id="editTaskDueDate" value="${task.dueDate || ''}">
                    </div>
                    <div class="input-group">
                        <label>Prioridade</label>
                        <div class="priority-options">
                            <input type="radio" id="editPriorityLow" name="editPriority" value="low" ${task.priority === 'low' ? 'checked' : ''}>
                            <label for="editPriorityLow">Baixa</label>
                            
                            <input type="radio" id="editPriorityMedium" name="editPriority" value="medium" ${!task.priority || task.priority === 'medium' ? 'checked' : ''}>
                            <label for="editPriorityMedium">Média</label>
                            
                            <input type="radio" id="editPriorityHigh" name="editPriority" value="high" ${task.priority === 'high' ? 'checked' : ''}>
                            <label for="editPriorityHigh">Alta</label>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="editTaskStatus">Status</label>
                        <select id="editTaskStatus">
                            <option value="pending" ${!task.completed ? 'selected' : ''}>Pendente</option>
                            <option value="completed" ${task.completed ? 'selected' : ''}>Concluída</option>
                        </select>
                    </div>
                    <button type="submit">Salvar Alterações</button>
                    <button type="button" id="cancelEditBtn">Cancelar</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(editModal);
        editModal.style.display = 'block';
        
        // Fechar modal
        editModal.querySelector('.close-modal').addEventListener('click', () => {
            editModal.remove();
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            editModal.remove();
        });
        
        // Salvar edição
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskId = parseInt(document.getElementById('editTaskId').value);
            const taskToEdit = tasks.find(t => t.id === taskId);
            
            if (taskToEdit) {
                taskToEdit.text = document.getElementById('editTaskText').value;
                taskToEdit.category = document.getElementById('editTaskCategory').value || null;
                taskToEdit.dueDate = document.getElementById('editTaskDueDate').value || null;
                taskToEdit.priority = document.querySelector('input[name="editPriority"]:checked').value;
                taskToEdit.completed = document.getElementById('editTaskStatus').value === 'completed';
                
                saveTasks();
                renderTasks();
                editModal.remove();
            }
        });
    }
    
    function openAddTaskModal() {
        const addTaskModal = document.createElement('div');
        addTaskModal.className = 'modal';
        addTaskModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Nova Tarefa</h2>
                <form id="addTaskForm">
                    <div class="input-group">
                        <label for="taskText">Descrição*</label>
                        <input type="text" id="taskText" required>
                    </div>
                    <div class="input-group">
                        <label for="taskCategory">Categoria</label>
                        <input type="text" id="taskCategory">
                    </div>
                    <div class="input-group">
                        <label for="taskDueDate">Data de Vencimento</label>
                        <input type="date" id="taskDueDate">
                    </div>
                    <div class="input-group">
                        <label>Prioridade</label>
                        <div class="priority-options">
                            <input type="radio" id="priorityLow" name="priority" value="low">
                            <label for="priorityLow">Baixa</label>
                            
                            <input type="radio" id="priorityMedium" name="priority" value="medium" checked>
                            <label for="priorityMedium">Média</label>
                            
                            <input type="radio" id="priorityHigh" name="priority" value="high">
                            <label for="priorityHigh">Alta</label>
                        </div>
                    </div>
                    <button type="submit">Adicionar Tarefa</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(addTaskModal);
        addTaskModal.style.display = 'block';
        
        // Fechar modal
        addTaskModal.querySelector('.close-modal').addEventListener('click', () => {
            addTaskModal.remove();
        });
        
        // Adicionar tarefa
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const text = document.getElementById('taskText').value;
            const category = document.getElementById('taskCategory').value || null;
            const dueDate = document.getElementById('taskDueDate').value || null;
            const priority = document.querySelector('input[name="priority"]:checked').value;
            
            addTask(text, category, dueDate, priority);
            addTaskModal.remove();
        });
    }
    
    function checkDueDates() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dueTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            
            const dueDate = new Date(task.dueDate);
            return dueDate >= now && dueDate <= tomorrow;
        });
        
        if (dueTasks.length > 0 && Notification.permission === 'granted') {
            dueTasks.forEach(task => {
                new Notification(`Tarefa "${task.text}" está próxima do vencimento!`, {
                    body: `Vence em: ${formatDate(task.dueDate)}`,
                    icon: 'icon.png'
                });
            });
        }
    }
    
    // Event Listeners
    addTaskBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text) {
            addTask(text);
            newTaskInput.value = '';
        }
    });
    
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });
    
    searchBtn.addEventListener('click', renderTasks);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderTasks();
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.id.replace('TasksBtn', '').toLowerCase();
            renderTasks();
        });
    });
    
    // Drag and Drop
    taskList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            draggedItem = e.target;
            e.target.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }
    });
    
    taskList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.opacity = '1';
        }
    });
    
    taskList.addEventListener('dragover', (e) => {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    });
    
    taskList.addEventListener('dragenter', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.borderTop = '2px solid var(--primary-color)';
        }
    });
    
    taskList.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.style.borderTop = '';
        }
    });
    
    taskList.addEventListener('drop', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        
        if (e.target.classList.contains('task-item') && draggedItem !== e.target) {
            draggedItem.style.opacity = '1';
            e.target.style.borderTop = '';
            
            // Obtém IDs das tarefas
            const draggedId = parseInt(draggedItem.querySelector('.task-checkbox').getAttribute('data-id'));
            const targetId = parseInt(e.target.querySelector('.task-checkbox').getAttribute('data-id'));
            
            // Reorganiza no array
            const draggedIndex = tasks.findIndex(t => t.id === draggedId);
            const targetIndex = tasks.findIndex(t => t.id === targetId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [removed] = tasks.splice(draggedIndex, 1);
                tasks.splice(targetIndex, 0, removed);
                saveTasks();
                renderTasks();
            }
        }
        
        return false;
    });
    
    // Interações com tarefas
    taskList.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.getAttribute('data-id'));
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        if (e.target.classList.contains('task-checkbox')) {
            task.completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }
        
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(task);
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Modal para adicionar tarefas avançadas
    addAdvancedTaskBtn.addEventListener('click', openAddTaskModal);
    
    // Toggle de tema
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Notificações
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permissão para notificações concedida');
                }
            });
        }
    }
    
    // Verifica tarefas a cada hora
    checkDueDates();
    setInterval(checkDueDates, 3600000); // 1 hora
    
    // Renderiza inicialmente
    renderTasks();
});