document.addEventListener('DOMContentLoaded', () => {
    // --- AUTENTICACIÓN (SSO SIMULADO) --- //
    const userStr = localStorage.getItem('sia_user');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }
    
    const currentUser = JSON.parse(userStr);
    const MOCK_STUDENT_ID = currentUser.id;

    // Actualizar interfaz con datos del usuario
    document.getElementById('user-name').textContent = currentUser.nombre;
    document.getElementById('user-role').textContent = `${currentUser.rol} (ID: ${currentUser.id})`;
    document.getElementById('user-avatar').textContent = currentUser.nombre.charAt(0).toUpperCase();

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('sia_user');
        window.location.href = '/login.html';
    });

    const alertMessage = document.getElementById('alert-message');
    const courseList = document.getElementById('course-list');

    let inscripcionesActuales = [];

    // 1. Cargar el horario primero y luego las secciones
    fetchHorario().then(() => fetchSecciones()); 

    // --- LÓGICA DE NAVEGACIÓN --- //
    const navOferta = document.getElementById('nav-oferta');
    const navHorario = document.getElementById('nav-horario');
    const viewOferta = document.getElementById('view-oferta');
    const viewHorario = document.getElementById('view-horario');
    const pageTitle = document.getElementById('page-title');

    navOferta.addEventListener('click', (e) => {
        e.preventDefault();
        navOferta.classList.add('active');
        navHorario.classList.remove('active');
        viewOferta.style.display = 'grid';
        viewHorario.style.display = 'none';
        pageTitle.textContent = 'Proceso de Matrícula';
        fetchSecciones(); // Refrescar si es necesario
    });

    navHorario.addEventListener('click', (e) => {
        e.preventDefault();
        navHorario.classList.add('active');
        navOferta.classList.remove('active');
        viewHorario.style.display = 'grid';
        viewOferta.style.display = 'none';
        pageTitle.textContent = 'Mi Horario';
        fetchHorario(); // Refrescar el horario al entrar
    });

    // Lógica de inscripción directa mediante botón +
    window.inscribirRamoRapido = async function(seccionId) {
        try {
            const response = await fetch('/api/inscribir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estudianteId: MOCK_STUDENT_ID,
                    seccionId: parseInt(seccionId)
                })
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                let msg = `Inscripción Exitosa. Estado: ${result.estado.replace('_', ' ')}`;
                showAlert(msg, 'success');
                // Actualizar estado global y vista
                if (typeof fetchHorario === 'function') {
                    await fetchHorario();
                }
                fetchSecciones();
            } else {
                showAlert(`Error: ${result.mensaje || result.error}`, 'error');
            }

        } catch (error) {
            console.error('Error de red:', error);
            showAlert('Ocurrió un error de conexión con el servidor.', 'error');
        }
    };

    /**
     * Función para obtener secciones y renderizarlas
     */
    async function fetchSecciones() {
        try {
            const response = await fetch(`/api/secciones`);
            if (!response.ok) throw new Error("Fallo al obtener secciones");
            
            const secciones = await response.json();
            setTimeout(() => renderSecciones(secciones), 400);
        } catch (error) {
            if (courseList) {
                courseList.innerHTML = `<div class="course-skeleton">Error al cargar la oferta académica.</div>`;
            }
        }
    }

    /**
     * Función para dibujar el HTML de las secciones
     */
    function renderSecciones(secciones) {
        if (!courseList) return;
        if (secciones.length === 0) {
            courseList.innerHTML = `<p class="subtitle">No hay secciones ofertadas en este momento.</p>`;
            return;
        }

        courseList.innerHTML = ''; 
        
        secciones.forEach(sec => {
            const row = document.createElement('div');
            row.className = 'course-item';
            
            const isFull = sec.cupos_disponibles <= 0;
            const badgeClass = isFull ? 'badge waitlist' : 'badge seats';
            const badgeText = isFull ? 'Sin Cupos - Va a Espera' : `${sec.cupos_disponibles} Cupos Disponibles`;
            const asigNombre = sec.asig_nombre ? `${sec.asig_nombre} (${sec.asig_codigo})` : 'Asignatura';

            const estaInscrito = inscripcionesActuales.some(ins => ins.seccion_id === sec.id && ins.estado === 'Inscrito');
            let btnHTML = '';

            if (estaInscrito) {
                btnHTML = `<button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--success); cursor: default;" disabled>✓ Inscrito</button>`;
            } else {
                btnHTML = `<button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="inscribirRamoRapido(${sec.id})">+ Inscribir</button>`;
            }

            row.innerHTML = `
                <div class="course-info">
                    <h4>${asigNombre} - Sec. ${sec.codigo_seccion}</h4>
                    <p>Horario: ${sec.horario} | Aula: ${sec.aula || 'TBD'}</p>
                </div>
                <div class="course-meta" style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                    <span class="${badgeClass}">${badgeText}</span>
                    ${btnHTML}
                </div>
            `;
            courseList.appendChild(row);
        });
    }

    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertMessage.className = `alert ${type}`;
        
        // Ocultar la alerta después de 5 segundos
        setTimeout(() => {
            alertMessage.classList.add('hidden');
        }, 5000);
    }

    // --- NUEVAS FUNCIONES PARA EL HORARIO Y RETIRO --- //
    const scheduleList = document.getElementById('schedule-list');

    async function fetchHorario() {
        try {
            const response = await fetch(`/api/horario/${MOCK_STUDENT_ID}`);
            if (!response.ok) throw new Error("Fallo al obtener horario");
            
            inscripcionesActuales = await response.json();
            renderHorario(inscripcionesActuales);
        } catch (error) {
            if (scheduleList) {
                scheduleList.innerHTML = `<div class="course-skeleton">Error al cargar el horario.</div>`;
            }
        }
    }

    function renderHorario(inscripciones) {
        if (!scheduleList) return;
        
        if (inscripciones.length === 0) {
            scheduleList.innerHTML = `<p class="subtitle">No tienes asignaturas inscritas.</p>`;
            return;
        }

        scheduleList.innerHTML = '';
        
        inscripciones.forEach(ins => {
            const row = document.createElement('div');
            row.className = 'course-item';
            
            row.innerHTML = `
                <div class="course-info">
                    <h4>${ins.nombre} (Sec. ${ins.codigo_seccion})</h4>
                    <p>Horario: ${ins.horario} | Estado: ${ins.estado.replace('_', ' ')}</p>
                </div>
                <div class="course-meta">
                    <button class="btn-primary" style="background: var(--danger); padding: 0.5rem 1rem; width: auto; font-size: 0.8rem;" onclick="retirarRamo(${ins.inscripcion_id})">
                        Retirar
                    </button>
                </div>
            `;
            scheduleList.appendChild(row);
        });
    }

    window.retirarRamo = async function(inscripcionId) {
        if (!confirm("¿Estás seguro de que deseas retirar esta asignatura?")) return;
        
        try {
            const response = await fetch(`/api/retirar/${inscripcionId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estudianteId: MOCK_STUDENT_ID })
            });
            
            const result = await response.json();
            if (response.ok) {
                showAlert(result.mensaje, 'success');
                await fetchHorario();
                fetchSecciones(); // Actualizar cupos en la oferta
            } else {
                showAlert(`Error: ${result.error || result.mensaje}`, 'error');
            }
        } catch (error) {
            showAlert('Ocurrió un error al intentar retirar el ramo.', 'error');
        }
    }
});
