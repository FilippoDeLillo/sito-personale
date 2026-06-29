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
    // Funzione interna per attivare il tremolio in caso di errore
    const triggerShake = () => {
        contactForm.classList.add('shake');
        setTimeout(() => {
            contactForm.classList.remove('shake');
        }, 400);
    };

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
                contactForm.innerHTML = `
                    <div style="text-align: center; padding: 20px 0; animation: fadeIn 0.5s ease-out;">
                        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
                        <h3 style="color: #10b981; margin-bottom: 10px; font-size: 22px;">Messaggio inviato!</h3>
                        <p style="color: var(--text-light); font-size: 15px; line-height: 1.6;">
                            Grazie per avermi contattato.<br>Ti risponderò il prima possibile.
                        </p>
                    </div>
                `;
            } else {
                formStatus.textContent = "Oops! C'è stato un problema nell'invio del messaggio.";
                formStatus.style.color = "#ef4444"; 
                triggerShake();
            }
        }).catch(error => {
            formStatus.textContent = "Errore di connessione. Riprova più tardi.";
            formStatus.style.color = "#ef4444";
            triggerShake();
        });
    });

    window.onload = function() {
        contactForm.reset();
    };
}



/* --- ANIMAZIONI ALLO SCORRIMENTO (INTERSECTION OBSERVER) --- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-scroll');
            observer.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1 
});

const hiddenElements = document.querySelectorAll('.hidden-scroll');
hiddenElements.forEach((el) => observer.observe(el));


