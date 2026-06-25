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

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const data = new FormData(contactForm);

        formStatus.textContent = "Invio in corso...";
        formStatus.style.color = "var(--text-light)";

        fetch(contactForm.action, {
            method: contactForm.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                formStatus.textContent = "Messaggio inviato con successo! Ti risponderò presto.";
                formStatus.style.color = "#10b981"; 
                contactForm.reset();
            } else {
                formStatus.textContent = "Oops! C'è stato un problema nell'invio del messaggio.";
                formStatus.style.color = "#ef4444"; 
            }
        }).catch(error => {
            formStatus.textContent = "Errore di connessione. Riprova più tardi.";
            formStatus.style.color = "#ef4444";
        });
    });
    
window.onload = function() {
    if (contactForm) {
        contactForm.reset();
    }
};
}