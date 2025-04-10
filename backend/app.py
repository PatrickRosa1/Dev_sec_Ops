from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='frontend')
CORS(app)

# Simulando usuários e tarefas em memória
users = [{"id": 1, "username": "admin", "password": "admin"}]
tasks = []

# Rota de login (simples)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    for user in users:
        if user["username"] == data.get("username") and user["password"] == data.get("password"):
            return jsonify({"message": "Login bem-sucedido", "user": user})
    return jsonify({"message": "Credenciais inválidas"}), 401

# Rotas de tarefas
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    task = {
        "id": len(tasks) + 1,
        "text": data["text"],
        "completed": False
    }
    tasks.append(task)
    return jsonify(task), 201

# Servindo arquivos do frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

