import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inscripcionRoutes from './routes/inscripcionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import coordinadorRoutes from './routes/coordinadorRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Permite procesar JSON en el req.body

// Rutas de la API
app.use('/api/auth', authRoutes); // Rutas de Autenticación
app.use('/api', inscripcionRoutes); // Rutas base (Estudiante)
app.use('/api/admin', adminRoutes); // Rutas de Administrador
app.use('/api/coordinador', coordinadorRoutes); // Rutas de Coordinador

// Servir archivos estáticos del Frontend
import path from 'path';
app.use(express.static(path.join(process.cwd(), 'frontend', 'public')));

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor SIA ejecutándose en el puerto ${PORT}`);
    console.log(`📄 Interfaz disponible en: http://localhost:${PORT}`);
});
