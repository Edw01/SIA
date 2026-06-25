document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');

    // Si ya hay una sesión activa, redirigir automáticamente
    const currentUser = localStorage.getItem('sia_user');
    if (currentUser) {
        window.location.href = '/index.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rutInput = document.getElementById('rut').value.trim();
        const btnSubmit = loginForm.querySelector('button');
        
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Verificando...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rut: rutInput })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Guardar la información simulada de la sesión en el navegador
                localStorage.setItem('sia_user', JSON.stringify(result.usuario));
                window.location.href = '/index.html'; // Redirigir al portal
            } else {
                showError(result.error || "RUT inválido o usuario no encontrado.");
            }
        } catch (error) {
            console.error(error);
            showError("Ocurrió un error de red al intentar iniciar sesión.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Ingresar al Sistema';
        }
    });

    function showError(message) {
        loginAlert.style.display = 'block';
        loginAlert.textContent = message;
        loginAlert.className = 'alert error';
        setTimeout(() => {
            loginAlert.style.display = 'none';
        }, 4000);
    }
});
