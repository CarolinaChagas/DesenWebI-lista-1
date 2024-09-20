// Seletores e variáveis
const listaTarefas = document.getElementById('listaTarefas');
const novaTarefaInput = document.getElementById('novaTarefa');
const adicionarTarefaButton = document.getElementById('adicionarTarefa');
const filtrarTarefasInput = document.getElementById('filtrarTarefas');
const escolherTemaButton = document.getElementById('escolherTema');
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let temaEscuro = localStorage.getItem('temaEscuro') === 'true';

// Inicializando
document.addEventListener('DOMContentLoaded', () => {
    // Carregar tema
    if (temaEscuro) document.body.setAttribute('data-theme', 'dark');
    escolherTemaButton.innerText = temaEscuro ? '☀️ Tema Claro' : '🌙 Tema Escuro';
    // Carregar tarefas
    if (tarefas.length === 0) {
        tarefas = [
            { name: 'Fazer trabalho de Banco de Dados', completed: false },
            { name: 'Fazer trabalho de CTS', completed: true },
        ];
    }
    listarTarefas();
});

// Função para listar tarefas
function listarTarefas() {
    listaTarefas.innerHTML = '';
    tarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');
        li.className = tarefa.completed ? 'tarefaCompleta' : '';
        li.innerHTML = `
            <span>${tarefa.name}</span>
            <div>
                <button class="tarefaCompleta" aria-label="Concluir tarefa">${tarefa.completed ? '❌' : '✔️'}</button>
                <button class="removerTarefa" aria-label="Remover tarefa">🗑️</button>
            </div>
        `;
        // Adicionar eventos
        li.querySelector('.tarefaCompleta').addEventListener('click', () => tarefaCompleta(index));
        li.querySelector('.removerTarefa').addEventListener('click', () => removerTarefa(index));
        listaTarefas.appendChild(li);
    });
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Adicionar nova tarefa
adicionarTarefaButton.addEventListener('click', () => {
    const tarefaNome = novaTarefaInput.value.trim();
    if (tarefaNome !== '') {
        tarefas.push({ name: tarefaNome, completed: false });
        novaTarefaInput.value = '';
        listarTarefas();
    }
});

// Remover tarefa
function removerTarefa(index) {
    tarefas.splice(index, 1);
    listarTarefas();
}

// Marcar como concluída
function tarefaCompleta(index) {
    tarefas[index].completed = !tarefas[index].completed;
    listarTarefas();
}

// Filtrar tarefas
filtrarTarefasInput.addEventListener('input', (e) => {
    const filtrarValor = e.target.value.toLowerCase();
    const filtrarTarefas = tarefas.filter(tarefa => tarefa.name.toLowerCase().includes(filtrarValor));
    listaTarefas.innerHTML = '';
    filtrarTarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');
        li.className = tarefa.completed ? 'tarefaCompleta' : '';
        li.innerHTML = `
            <span>${tarefa.name}</span>
            <div>
                <button class="tarefaCompleta">${tarefa.completed ? '❌' : '✔️'}</button>
                <button class="removerTarefa">🗑️</button>
            </div>
        `;
        listaTarefas.appendChild(li);
    });
});

// Alternar tema
escolherTemaButton.addEventListener('click', () => {
    temaEscuro = !temaEscuro;
    document.body.setAttribute('data-theme', temaEscuro ? 'dark' : 'light');
    localStorage.setItem('temaEscuro', temaEscuro);
    escolherTemaButton.innerText = temaEscuro ? '☀️ Tema Claro' : '🌙 Tema Escuro';
});