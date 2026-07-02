document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('sia_user');
    const accessToken = localStorage.getItem('sia_access_token');

    if (!userStr || !accessToken) {
        clearSessionAndRedirect();
        return;
    }

    const currentUser = JSON.parse(userStr);
    const MOCK_STUDENT_ID = currentUser.id;

    document.getElementById('user-name').textContent = currentUser.nombre;
    document.getElementById('user-role').textContent = `${currentUser.rol} (ID: ${currentUser.id})`;
    document.getElementById('user-avatar').textContent = currentUser.nombre.charAt(0).toUpperCase();

    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await authFetch('/api/auth/logout', { method: 'POST' });
        } finally {
            clearSessionAndRedirect();
        }
    });

    const alertMessage = document.getElementById('alert-message');
    const courseList = document.getElementById('course-list');
    const scheduleList = document.getElementById('schedule-list');

    const navOferta = document.getElementById('nav-oferta');
    const navHorario = document.getElementById('nav-horario');
    const navCrearSeccion = document.getElementById('nav-crear-seccion');
    const navCrearAsignatura = document.getElementById('nav-crear-asignatura');

    const viewOferta = document.getElementById('view-oferta');
    const viewHorario = document.getElementById('view-horario');
    const viewCrearSeccion = document.getElementById('view-crear-seccion');
    const viewCrearAsignatura = document.getElementById('view-crear-asignatura');

    const pageTitle = document.getElementById('page-title');

    const formCrearSeccion = document.getElementById('form-crear-seccion');
    const formCrearAsignatura = document.getElementById('form-crear-asignatura');

    let inscripcionesActuales = [];

    if (currentUser.rol === 'Coordinador') {
        navCrearSeccion.style.display = 'flex';
    }

    if (currentUser.rol === 'Administrador' || currentUser.rol === 'Admin') {
        navCrearAsignatura.style.display = 'flex';
    }

    function clearSessionAndRedirect() {
        localStorage.removeItem('sia_user');
        localStorage.removeItem('sia_access_token');
        localStorage.removeItem('sia_refresh_token');
        window.location.href = '/login.html';
    }

    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem('sia_refresh_token');
        if (!refreshToken) return null;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) return null;

            const result = await response.json();
            localStorage.setItem('sia_user', JSON.stringify(result.usuario));
            localStorage.setItem('sia_access_token', result.accessToken);
            localStorage.setItem('sia_refresh_token', result.refreshToken);
            return result.accessToken;
        } catch (error) {
            return null;
        }
    }

    async function authFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});
        const token = localStorage.getItem('sia_access_token');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (!newToken) {
                clearSessionAndRedirect();
                return response;
            }

            const retryHeaders = new Headers(options.headers || {});
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            if (options.body && !retryHeaders.has('Content-Type')) {
                retryHeaders.set('Content-Type', 'application/json');
            }

            response = await fetch(url, { ...options, headers: retryHeaders });
        }

        return response;
    }

    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertMessage.className = `alert ${type}`;
        alertMessage.style.display = 'block';

        setTimeout(() => {
            alertMessage.classList.add('hidden');
            alertMessage.style.display = 'none';
        }, 5000);
    }

    function ocultarTodasLasVistas() {
        viewOferta.style.display = 'none';
        viewHorario.style.display = 'none';
        viewCrearSeccion.style.display = 'none';
        viewCrearAsignatura.style.display = 'none';

        navOferta.classList.remove('active');
        navHorario.classList.remove('active');
        navCrearSeccion.classList.remove('active');
        navCrearAsignatura.classList.remove('active');
    }

    navOferta.addEventListener('click', (e) => {
        e.preventDefault();
        ocultarTodasLasVistas();

        navOferta.classList.add('active');
        viewOferta.style.display = 'grid';
        pageTitle.textContent = 'Proceso de Matrícula';

        fetchSecciones();
    });

    navHorario.addEventListener('click', (e) => {
        e.preventDefault();
        ocultarTodasLasVistas();

        navHorario.classList.add('active');
        viewHorario.style.display = 'grid';
        pageTitle.textContent = 'Mi Horario';

        fetchHorario();
    });

    navCrearSeccion.addEventListener('click', (e) => {
        e.preventDefault();
        ocultarTodasLasVistas();

        navCrearSeccion.classList.add('active');
        viewCrearSeccion.style.display = 'grid';
        pageTitle.textContent = 'Crear Sección';
    });

    navCrearAsignatura.addEventListener('click', (e) => {
        e.preventDefault();
        ocultarTodasLasVistas();

        navCrearAsignatura.classList.add('active');
        viewCrearAsignatura.style.display = 'grid';
        pageTitle.textContent = 'Crear Asignatura';
    });

    async function fetchSecciones() {
        try {
            const response = await authFetch('/api/secciones');
            if (!response.ok) throw new Error('Fallo al obtener secciones');

            const secciones = await response.json();
            renderSecciones(secciones);
        } catch (error) {
            if (courseList) {
                courseList.innerHTML = `<div class="course-skeleton">Error al cargar la oferta académica.</div>`;
            }
        }
    }

    function renderSecciones(secciones) {
        if (!courseList) return;

        if (!Array.isArray(secciones) || secciones.length === 0) {
            courseList.innerHTML = `<p class="subtitle">No hay secciones ofertadas en este momento.</p>`;
            return;
        }

        courseList.innerHTML = '';

        secciones.forEach((sec) => {
            const row = document.createElement('div');
            row.className = 'course-item';

            const isFull = sec.cupos_disponibles <= 0;
            const badgeClass = isFull ? 'badge waitlist' : 'badge seats';
            const badgeText = isFull
                ? 'Sin Cupos - Va a Espera'
                : `${sec.cupos_disponibles} Cupos Disponibles`;

            const asigNombre = sec.asig_nombre
                ? `${sec.asig_nombre} (${sec.asig_codigo})`
                : 'Asignatura';

            const estaInscrito = inscripcionesActuales.some((ins) => {
                return ins.seccion_id === sec.id && ins.estado === 'Inscrito';
            });

            let btnHTML;

            if (currentUser.rol === 'Estudiante') {
                if (estaInscrito) {
                    btnHTML = `
                        <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--success); cursor: default;" disabled>
                            ✓ Inscrito
                        </button>
                    `;
                } else {
                    btnHTML = `
                        <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="inscribirRamoRapido(${sec.id})">
                            + Inscribir
                        </button>
                    `;
                }
            } else {
                btnHTML = `
                    <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; cursor: default;" disabled>
                        Solo consulta
                    </button>
                `;
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

    window.inscribirRamoRapido = async function (seccionId) {
        try {
            const response = await authFetch('/api/inscribir', {
                method: 'POST',
                body: JSON.stringify({ seccionId: parseInt(seccionId) })
            });

            const result = await response.json();

            if (response.ok || response.status === 201) {
                const estado = result.estado || result.inscripcion?.estado || 'Inscrito';
                showAlert(`Inscripción exitosa. Estado: ${estado.replace('_', ' ')}`, 'success');
                await fetchHorario();
                await fetchSecciones();
            } else {
                showAlert(
                    `Error: ${result.mensaje || result.error || 'No se pudo inscribir'}`,
                    'error'
                );
            }
        } catch (error) {
            showAlert('Ocurrió un error de conexión con el servidor.', 'error');
        }
    };

    async function fetchHorario() {
        try {
            const response = await authFetch(`/api/horario/${MOCK_STUDENT_ID}`);
            if (!response.ok) throw new Error('Fallo al obtener horario');

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

        if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
            scheduleList.innerHTML = `<p class="subtitle">No tienes asignaturas inscritas.</p>`;
            return;
        }

        scheduleList.innerHTML = '';

        inscripciones.forEach((ins) => {
            const row = document.createElement('div');
            row.className = 'course-item';

            const estado = ins.estado || 'Inscrito';

            row.innerHTML = `
                <div class="course-info">
                    <h4>${ins.nombre} (Sec. ${ins.codigo_seccion})</h4>
                    <p>Horario: ${ins.horario} | Estado: ${estado.replace('_', ' ')}</p>
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

    window.retirarRamo = async function (inscripcionId) {
        if (!confirm('¿Estás seguro de que deseas retirar esta asignatura?')) return;

        try {
            const response = await authFetch(`/api/retirar/${inscripcionId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showAlert(result.mensaje || 'Asignatura retirada correctamente', 'success');
                await fetchHorario();
                await fetchSecciones();
            } else {
                showAlert(
                    `Error: ${result.error || result.mensaje || 'No se pudo retirar'}`,
                    'error'
                );
            }
        } catch (error) {
            showAlert('Ocurrió un error al intentar retirar el ramo.', 'error');
        }
    };

    if (formCrearSeccion) {
        formCrearSeccion.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                asignaturaId: parseInt(document.getElementById('asignaturaId').value),
                codigoSeccion: document.getElementById('codigoSeccion').value.trim(),
                cuposMaximos: parseInt(document.getElementById('cuposMaximos').value),
                horario: document.getElementById('horario').value.trim(),
                aula: document.getElementById('aula').value.trim()
            };

            if (!data.asignaturaId || !data.codigoSeccion || !data.cuposMaximos || !data.horario) {
                showAlert('Completa los campos obligatorios para crear la sección.', 'error');
                return;
            }

            try {
                const response = await authFetch('/api/coordinador/secciones', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok || response.status === 201) {
                    showAlert(result.mensaje || 'Sección creada correctamente', 'success');
                    formCrearSeccion.reset();
                    await fetchSecciones();
                } else {
                    showAlert(
                        result.error || result.mensaje || 'No se pudo crear la sección',
                        'error'
                    );
                }
            } catch (error) {
                showAlert('Error de conexión con el servidor.', 'error');
            }
        });
    }

    if (formCrearAsignatura) {
        formCrearAsignatura.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                codigo: document.getElementById('codigoAsignatura').value.trim(),
                nombre: document.getElementById('nombreAsignatura').value.trim(),
                creditos: parseInt(document.getElementById('creditosAsignatura').value)
            };

            if (!data.codigo || !data.nombre || !data.creditos) {
                showAlert('Completa todos los campos para crear la asignatura.', 'error');
                return;
            }

            try {
                const response = await authFetch('/api/admin/asignaturas', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok || response.status === 201) {
                    showAlert('Asignatura creada correctamente', 'success');
                    formCrearAsignatura.reset();
                } else {
                    showAlert(result.error || 'No se pudo crear la asignatura', 'error');
                }
            } catch (error) {
                showAlert('Error de conexión con el servidor.', 'error');
            }
        });
    }

    fetchHorario().then(() => fetchSecciones());
});
