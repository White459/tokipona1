const API_URL = window.location.origin;

let allWords = [];

async function loadWords() {
    try {
        const response = await fetch(`${API_URL}/api/words`);
        if (!response.ok) throw new Error('Failed to fetch words');
        allWords = await response.json();
        displayWords(allWords);
    } catch (error) {
        console.error('Error loading words:', error);
        showMessage('단어를 불러오는데 실패했습니다.', 'error');
    }
}

function displayWords(words) {
    const wordsList = document.getElementById('wordsList');
    
    if (words.length === 0) {
        wordsList.innerHTML = '<p class="loading">단어가 없습니다. 첫 번째 단어를 추가해보세요!</p>';
        return;
    }

    wordsList.innerHTML = words.map(word => `
        <div class="word-item ${word.is_official ? 'official' : ''}">
            <div class="word-content">
                <div class="word-title">${escapeHtml(word.word)}</div>
                <div class="word-meaning">한국어: ${escapeHtml(word.meaning)}</div>
                ${word.english ? `<div class="word-meaning">English: ${escapeHtml(word.english)}</div>` : ''}
                ${word.is_official ? '<span class="word-badge">공식 단어</span>' : ''}
            </div>
            <button class="delete-btn" onclick="deleteWord(${word.id})">삭제</button>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('addWordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        word: document.getElementById('word').value.trim(),
        meaning: document.getElementById('meaning').value.trim(),
        english: document.getElementById('english').value.trim() || null,
        is_official: document.getElementById('isOfficial').checked
    };

    try {
        const response = await fetch(`${API_URL}/api/words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add word');

        showMessage('단어가 추가되었습니다!', 'success');
        e.target.reset();
        loadWords();
    } catch (error) {
        console.error('Error adding word:', error);
        showMessage('단어 추가에 실패했습니다.', 'error');
    }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredWords = allWords.filter(word => 
        word.word.toLowerCase().includes(searchTerm) ||
        word.meaning.toLowerCase().includes(searchTerm) ||
        (word.english && word.english.toLowerCase().includes(searchTerm))
    );
    displayWords(filteredWords);
});

async function deleteWord(id) {
    if (!confirm('이 단어를 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`${API_URL}/api/words/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete word');

        showMessage('단어가 삭제되었습니다.', 'success');
        loadWords();
    } catch (error) {
        console.error('Error deleting word:', error);
        showMessage('단어 삭제에 실패했습니다.', 'error');
    }
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.error, .success');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => messageDiv.remove(), 3000);
}

loadWords();
