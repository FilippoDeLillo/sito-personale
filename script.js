const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

const temaSalvato = localStorage.getItem('tema');
if (temaSalvato === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = '☀️ Light Mode';
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'dark');
        toggleButton.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('tema', 'light');
        toggleButton.textContent = '🌙 Dark Mode';
    }
});