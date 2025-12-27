import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import bookingsRoutes from './routes/bookings';

dotenv.config();

// Development için SSL sertifika doğrulamasını devre dışı bırak
// ⚠️ SADECE DEVELOPMENT İÇİN - PRODUCTION'DA KULLANMAYIN!
// Bu environment variable .env dosyasında veya package.json script'inde set edilmeli
if (process.env.NODE_ENV === 'development' && process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  console.warn('⚠️  SSL certificate verification disabled for development');
}

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.WEB_URL 
    : 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mentorunden API' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

