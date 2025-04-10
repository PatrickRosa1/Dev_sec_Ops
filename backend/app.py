from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
CORS(app)

# Configuração do banco de dados SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80))
    due_date = db.Column(db.String(20))
    priority = db.Column(db.String(20), default='medium')
    completed = db.Column(db.Boolean, default=False)

# Rotas de Autenticação
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Usuário já registrado."}), 400
    user = User(email=data['email'], username=data.get('username', 'Usuário'))
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Usuário registrado com sucesso."})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        return jsonify({"message": "Login bem-sucedido.", "user": {"id": user.id, "email": user.email, "username": user.username}})
    return jsonify({"message": "Credenciais inválidas."}), 401

# Rotas de Tarefas
@app.route('/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('userId')
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": t.id, "text": t.text, "category": t.category, "due_date": t.due_date, "priority": t.priority, "completed": t.completed} for t in tasks])

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    task = Task(user_id=data['userId'], text=data['text'], category=data.get('category'), due_date=data.get('dueDate'), priority=data.get('priority', 'medium'))
    db.session.add(task)
    db.session.commit()
    return jsonify({"message": "Tarefa adicionada com sucesso."})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Tarefa não encontrada."}), 404
    task.text = data.get('text', task.text)
    task.category = data.get('category', task.category)
    task.due_date = data.get('dueDate', task.due_date)
    task.priority = data.get('priority', task.priority)
    task.completed = data.get('completed', task.completed)
    db.session.commit()
    return jsonify({"message": "Tarefa atualizada com sucesso."})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Tarefa não encontrada."}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Tarefa removida com sucesso."})

# Servir o front-end
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
