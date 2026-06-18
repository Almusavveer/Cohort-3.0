 let tasks = [];
let searchQuery = '';
let activeCategory = 'all';

const todoForm = document.getElementById('todo-form');
const taskTitleInput = document.getElementById('task-title');
const taskCategorySelect = document.getElementById('task-category');
const taskParent = document.getElementById('task-parent');
const taskGrandparent = document.getElementById('task-grandparent');
const tasksEmptyState = document.getElementById('tasks-empty-state');

const taskSearchInput = document.getElementById('task-search');
const categoryFilterContainer = document.getElementById('category-filter-container');
const clearAllBtn = document.getElementById('clear-all-btn');

const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            tasks = [];
        }
    } else {
        
        tasks = [
            { id: '1718625600000', title: 'Understand browser parsing and tokenization', category: 'work', status: 'completed' },
            { id: '1718629200000', title: 'Implement event delegation on task containers', category: 'personal', status: 'pending' }
        ];
        saveTasksToLocalStorage();
    }
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeModeText = document.getElementById('theme-mode-text');

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    
    updateThemeUI(savedTheme);
}

function updateThemeUI(theme) {
    if (theme === 'dark') {
        themeToggleBtn.textContent = '🌙';
        themeModeText.textContent = 'Dark Mode';
        document.body.classList.remove('light-mode'); 
    } else {
        themeToggleBtn.textContent = '☀️';
        themeModeText.textContent = 'Light Mode';
        document.body.classList.add('light-mode'); 
    }
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
});

function updateStats() {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const pendingCount = totalCount - completedCount;
    statTotal.textContent = totalCount;
    statPending.textContent = pendingCount;
    statCompleted.textContent = completedCount;
}
 
function createTaskElement(task) {
    
    const card = document.createElement('div');
    card.className = 'task-card';

    card.setAttribute('data-id', task.id);
    card.dataset.status = task.status;
    card.dataset.category = task.category;

    const details = document.createElement('div');
    details.className = 'task-details';

    const categoryTag = document.createElement('span');
    categoryTag.className = `tag tag-${task.category}`;
    if (card.hasAttribute('data-category')) {
        const catValue = card.getAttribute('data-category');
        categoryTag.textContent = catValue;
    }

    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';

    const textNode = document.createTextNode(task.title);
    titleSpan.append(textNode);

    details.append(categoryTag, titleSpan);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const btnComplete = document.createElement('button');
    btnComplete.className = 'action-btn btn-complete';
    btnComplete.setAttribute('aria-label', 'Complete Task');
    btnComplete.innerHTML = '✔️';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'action-btn btn-edit';
    btnEdit.setAttribute('aria-label', 'Edit Task');
    btnEdit.innerHTML = '✏️';

    const btnDelete = document.createElement('button');
    btnDelete.className = 'action-btn btn-delete';
    btnDelete.setAttribute('aria-label', 'Delete Task');
    btnDelete.innerHTML = '🗑️';
    
    actions.append(btnComplete, btnEdit, btnDelete);
 
    card.append(details, actions);
    
    return card;
}

function renderTasks() {
    
    const existingCards = taskParent.querySelectorAll('.task-card');
    existingCards.forEach(c => c.remove());

    const filteredTasks = tasks.filter(task => {
        const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    if (filteredTasks.length === 0) {
        tasksEmptyState.style.display = 'block';
        if (!taskParent.contains(tasksEmptyState)) {
            taskParent.append(tasksEmptyState);
        }
    } else {
        tasksEmptyState.style.display = 'none';

        const fragment = document.createDocumentFragment();
        
        filteredTasks.forEach(task => {
            const card = createTaskElement(task);
            fragment.appendChild(card); 
        });
        
        taskParent.appendChild(fragment); 
    }
    
    updateStats();
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;
    
    if (!title) return;
    
    const newTask = {
        id: String(Date.now()),
        title: title,
        category: category,
        status: 'pending'
    };
    
    tasks.push(newTask);
    saveTasksToLocalStorage();

    taskTitleInput.value = '';
    renderTasks();

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: var(--success-glow);
        color: var(--success);
        border: 1px solid var(--success);
        padding: 10px 16px;
        border-radius: var(--border-radius-md);
        font-family: var(--font-sans);
        font-size: 0.85rem;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: fadeIn 0.2s ease-out;
    `;
    toast.innerHTML = `<span>🎉</span> Task "<strong>${newTask.title}</strong>" created successfully!`;
    
    todoForm.before(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
});

taskSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

categoryFilterContainer.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return;

    categoryFilterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    filterBtn.classList.add('active');
    activeCategory = filterBtn.dataset.filter;
    renderTasks();
});

clearAllBtn.addEventListener('click', () => {
    if (tasks.length === 0) return;
    
    if (confirm('🧹 Are you sure you want to clear all tasks?')) {
        tasks = [];
        saveTasksToLocalStorage();
        renderTasks();
    }
});

taskParent.addEventListener('click', (event) => {
    const completeBtn = event.target.closest('.btn-complete');
    const editBtn = event.target.closest('.btn-edit');
    const deleteBtn = event.target.closest('.btn-delete');
    
    const taskCard = event.target.closest('.task-card');
    if (!taskCard) return;
    
    const taskId = taskCard.getAttribute('data-id');

    if (completeBtn) {
        const taskObj = tasks.find(t => t.id === taskId);
        if (taskObj) {
            taskObj.status = taskObj.status === 'completed' ? 'pending' : 'completed';
            saveTasksToLocalStorage();
            renderTasks();
        }
        return;
    }

    if (editBtn) {
        const titleSpan = taskCard.querySelector('.task-title');
        const originalTitleText = titleSpan.textContent;

        const editHeaderLabel = document.createElement('div');
        editHeaderLabel.style.cssText = `
            font-size: 0.65rem;
            color: var(--warning);
            font-family: var(--font-mono);
            margin-bottom: -6px;
            margin-left: 10px;
            animation: fadeIn 0.2s;
        `;
        editHeaderLabel.textContent = `📝 EDITING MODE ACTIVE (ID: ${taskId})`;
        
        const editFooterLabel = document.createElement('div');
        editFooterLabel.style.cssText = `
            font-size: 0.65rem;
            color: var(--text-muted);
            font-family: var(--font-mono);
            margin-top: -6px;
            margin-left: 10px;
            margin-bottom: 8px;
            animation: fadeIn 0.2s;
        `;
        editFooterLabel.textContent = `⚠️ Save changes to apply or Cancel to revert.`;

        taskCard.before(editHeaderLabel);
        taskCard.after(editFooterLabel);

        const editFormContainer = document.createElement('div');
        editFormContainer.className = 'edit-form-container';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = originalTitleText;
        
        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        
        const btnSave = document.createElement('button');
        btnSave.className = 'btn-save';
        btnSave.textContent = 'Save';
        
        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn-cancel';
        btnCancel.textContent = 'Cancel';
        
        editActions.append(btnSave, btnCancel);
        editFormContainer.append(editInput, editActions);
        
        const detailsContainer = taskCard.querySelector('.task-details');
        const actionsContainer = taskCard.querySelector('.task-actions');
        
        actionsContainer.style.display = 'none';

        detailsContainer.replaceWith(editFormContainer);
        
        editInput.focus();
        editInput.select();

        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation(); 
            editFormContainer.replaceWith(detailsContainer);
            actionsContainer.style.display = 'flex';
            
            editHeaderLabel.remove();
            editFooterLabel.remove();
        });

        btnSave.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTitle = editInput.value.trim();
            if (!newTitle) return;
            
            const taskObj = tasks.find(t => t.id === taskId);
           if (taskObj) {
                taskObj.title = newTitle;
                saveTasksToLocalStorage();
            }
            
            renderTasks();
            editHeaderLabel.remove();
            editFooterLabel.remove();
        });
        
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnSave.click();
            } else if (e.key === 'Escape') {
                btnCancel.click();
            }
        });
        
        return;
    }

    if (deleteBtn) {
        const title = taskCard.querySelector('.task-title').textContent;
        
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToLocalStorage();

        taskCard.remove();
        updateStats();
        return;
    }
});

const playgroundInput = document.getElementById('playground-input');
const setPropBtn = document.getElementById('set-prop-btn');
const setAttrBtn = document.getElementById('set-attr-btn');
const resetPlaygroundBtn = document.getElementById('reset-playground-btn');
const propValDisplay = document.getElementById('prop-val-display');
const attrValDisplay = document.getElementById('attr-val-display');
const inspectorActionDesc = document.getElementById('inspector-action-desc');

function updatePlaygroundOutputs(actionDescription = '') {
    if (!playgroundInput || !propValDisplay || !attrValDisplay) return;

    const propertyValue = playgroundInput.value;
    const attributeValue = playgroundInput.getAttribute('value');

    propValDisplay.textContent = propertyValue === '' ? '(empty string "")' : `"${propertyValue}"`;
    attrValDisplay.textContent = attributeValue === null ? 'null' : `"${attributeValue}"`;

    if (propertyValue !== attributeValue) {
        propValDisplay.style.borderColor = 'var(--primary)';
        attrValDisplay.style.borderColor = 'var(--card-border)';
    } else {
        propValDisplay.style.borderColor = 'var(--card-border)';
        attrValDisplay.style.borderColor = 'var(--card-border)';
    }

    const escapeHTML = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const codeContainer = document.querySelector('.inspector-code');
    if (codeContainer) {
        const escapedProp = escapeHTML(propertyValue);
        if (attributeValue === null) {
            codeContainer.innerHTML = `
                <span class="keyword">HTML Markup:</span> &lt;input id="playground-input"&gt; <span style="color: var(--text-muted); font-size: 0.75rem; font-style: italic;">(value attribute removed)</span>
                <br/>
                <span class="keyword">DOM JS Property:</span> { value: "<span class="highlight-val">${escapedProp}</span>" }
            `;
        } else {
            const escapedAttr = escapeHTML(attributeValue);
            codeContainer.innerHTML = `
                <span class="keyword">HTML Markup:</span> &lt;input id="playground-input" value="<span class="highlight-val">${escapedAttr}</span>"&gt;
                <br/>
                <span class="keyword">DOM JS Property:</span> { value: "<span class="highlight-val">${escapedProp}</span>" }
            `;
        }
    }

    if (inspectorActionDesc && actionDescription) {
        inspectorActionDesc.innerHTML = actionDescription;
    }
}

if (playgroundInput) {
    playgroundInput.addEventListener('input', () => {
        updatePlaygroundOutputs(
            `✍️ <strong>You typed in the input box:</strong> Notice how the live DOM property (<code>input.value</code>) updates in real-time, but the static HTML attribute (<code>input.getAttribute("value")</code>) remains unchanged at its original value.`
        );
    });
}

if (setPropBtn && playgroundInput) {
    setPropBtn.addEventListener('click', () => {
        playgroundInput.value = 'Updated Via JS .value Property';
        updatePlaygroundOutputs(
            `💻 <strong>Set Property clicked:</strong> We ran <code>input.value = "Updated Via JS .value Property"</code>. The live DOM property updated, but the HTML markup source code remains unaffected.`
        );
    });
}

if (setAttrBtn && playgroundInput) {
    setAttrBtn.addEventListener('click', () => {
        playgroundInput.setAttribute('value', 'Updated Via setAttribute("value")');
        updatePlaygroundOutputs(
            `🏷️ <strong>Set Attribute clicked:</strong> We ran <code>input.setAttribute("value", "Updated Via setAttribute('value')")</code>. This updated the HTML markup directly. Since the user has not typed since the reset, the DOM property synced with it.`
        );
    });
}

if (resetPlaygroundBtn && playgroundInput) {
    resetPlaygroundBtn.addEventListener('click', () => {
        playgroundInput.removeAttribute('value');
        playgroundInput.value = '';
        updatePlaygroundOutputs(
            `🧹 <strong>Reset clicked:</strong> We ran <code>input.removeAttribute("value")</code> to delete the attribute, and set <code>input.value = ""</code> to clear the DOM property. Both are now reset.`
        );
    });
}
updatePlaygroundOutputs();

const propGrandparent = document.getElementById('prop-grandparent');
const propParent = document.getElementById('prop-parent');
const propChild = document.getElementById('prop-child');

let animationQueue = [];
let isAnimating = false;
function enqueueHighlight(element, phase, duration = 400) {
    animationQueue.push({ element, phase, duration });
    if (!isAnimating) {
        processAnimationQueue();
    }
}
function processAnimationQueue() {
    if (animationQueue.length === 0) {
        isAnimating = false;
        propGrandparent.classList.remove('capturing-highlight', 'bubbling-highlight');
        propParent.classList.remove('capturing-highlight', 'bubbling-highlight');
        propChild.classList.remove('capturing-highlight', 'bubbling-highlight');
        return;
    }
    
    isAnimating = true;
    const { element, phase, duration } = animationQueue.shift();
    
    propGrandparent.classList.remove('capturing-highlight', 'bubbling-highlight');
    propParent.classList.remove('capturing-highlight', 'bubbling-highlight');
    propChild.classList.remove('capturing-highlight', 'bubbling-highlight');
    
    const highlightClass = phase === 'capturing' ? 'capturing-highlight' : 'bubbling-highlight';
    element.classList.add(highlightClass);
    
    setTimeout(() => {
        processAnimationQueue();
    }, duration);
}

propGrandparent.addEventListener('click', (event) => {
    console.log('Grandparent'); 
    console.log('📥 [CAPTURING PHASE] Grandparent Node caught event');
    enqueueHighlight(propGrandparent, 'capturing');
}, true);

propParent.addEventListener('click', (event) => {
    console.log('Parent'); 
    console.log('📥 [CAPTURING PHASE] Parent Node caught event');
    enqueueHighlight(propParent, 'capturing');
}, true); 

propChild.addEventListener('click', (event) => {
    console.log('Child'); 
    console.log('🎯 [TARGET PHASE] Child Button reached (Capturing listener)');
    enqueueHighlight(propChild, 'capturing');
}, true);

propChild.addEventListener('click', (event) => {
    console.log('Child'); 
    console.log('🎯 [TARGET PHASE] Child Button reached (Bubbling listener)');
    enqueueHighlight(propChild, 'bubbling');
}, false); 

propParent.addEventListener('click', (event) => {
    console.log('Parent');
    console.log('📤 [BUBBLING PHASE] Parent Node caught event');
    enqueueHighlight(propParent, 'bubbling');
}, false); 

propGrandparent.addEventListener('click', (event) => {
    console.log('Grandparent');
    console.log('📤 [BUBBLING PHASE] Grandparent Node caught event');
    enqueueHighlight(propGrandparent, 'bubbling');
}, false); 

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTasks();
    renderTasks();
});
