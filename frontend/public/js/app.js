document.addEventListener('DOMContentLoaded', () => {
    const enrollmentForm = document.getElementById('enrollment-form');
    const alertMessage = document.getElementById('alert-message');
    const courseList = document.getElementById('course-list');

    // ID de estudiante quemado para el demo (En la realidad vendría de la sesión JWT/SSO)
    const MOCK_STUDENT_ID = 1; 

    // 1. Cargar las secciones disponibles al iniciar (Simulando que queremos ver las de la asig 1)
    fetchSecciones(1); 

    // 2. Manejar el evento de submit del formulario de inscripción
    enrollmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const seccionId = document.getElementById('seccion-id').value;
        const btnSubmit = enrollmentForm.querySelector('button');
        
        // Efecto visual de carga
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';

        try {
            // Llamada a nuestro controlador Backend (Fase 4)
            const response = await fetch('/api/inscribir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estudianteId: MOCK_STUDENT_ID,
                    seccionId: parseInt(seccionId)
                })
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                // Éxito o Lista de Espera
                let msg = `Inscripción Exitosa. Estado: ${result.estado.replace('_', ' ')}`;
                showAlert(msg, 'success');
                // Recargar secciones para ver el descuento de cupos
                fetchSecciones(1);
            } else {
                // Fallo de validación (Morosidad, Prerrequisitos, Horario)
                showAlert(`Error: ${result.mensaje || result.error}`, 'error');
            }

        } catch (error) {
            console.error('Error de red:', error);
            showAlert('Ocurrió un error de conexión con el servidor.', 'error');
        } finally {
            // Restaurar botón
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Inscribir Asignatura';
            enrollmentForm.reset();
        }
    });

    /**
     * Función para obtener secciones y renderizarlas
     */
    async function fetchSecciones(asignaturaId) {
        try {
            const response = await fetch(`/api/secciones/${asignaturaId}`);
            if (!response.ok) throw new Error("Fallo al obtener secciones");
            
            const secciones = await response.json();
            
            // Simular un pequeño delay para que se aprecie la UI dinámica
            setTimeout(() => renderSecciones(secciones), 400);

        } catch (error) {
            courseList.innerHTML = `<div class="course-skeleton">Error al cargar la oferta académica.</div>`;
        }
    }

    /**
     * Función para dibujar el HTML de las secciones
     */
    function renderSecciones(secciones) {
        if (secciones.length === 0) {
            courseList.innerHTML = `<p class="subtitle">No hay secciones ofertadas en este momento.</p>`;
            return;
        }

        courseList.innerHTML = ''; // Limpiar
        
        secciones.forEach(sec => {
            const row = document.createElement('div');
            row.className = 'course-item';
            
            const isFull = sec.cupos_disponibles <= 0;
            const badgeClass = isFull ? 'badge waitlist' : 'badge seats';
            const badgeText = isFull ? 'Sin Cupos - Va a Espera' : `${sec.cupos_disponibles} Cupos Disponibles`;

            row.innerHTML = `
                <div class="course-info">
                    <h4>Sección ${sec.codigo_seccion}</h4>
                    <p>Horario: ${sec.horario} | Aula: ${sec.aula || 'TBD'}</p>
                </div>
                <div class="course-meta">
                    <span class="${badgeClass}">${badgeText}</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary)">ID Interno: ${sec.id}</span>
                </div>
            `;
            courseList.appendChild(row);
        });
    }

    /**
     * Función utilitaria para mostrar alertas
     */
    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertMessage.className = `alert ${type}`;
        
        // Ocultar la alerta después de 5 segundos
        setTimeout(() => {
            alertMessage.classList.add('hidden');
        }, 5000);
    }
});
