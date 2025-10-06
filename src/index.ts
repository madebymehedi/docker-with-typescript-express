import express, { type Request, type Response, type NextFunction } from 'express';

const app = express();

// Environment variables with proper typing
const PORT = Number(process.env.PORT) || 3000;  // Convert PORT to number
const HOST = process.env.HOST || '0.0.0.0';     // Default to all network interfaces

// Server shutdown timeout in ms
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || '5000', 10);

// Server state tracking
let isReady = false;  // Track if server is ready to accept requests
let server: ReturnType<typeof app.listen> | undefined;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - Used by Docker to check if container is healthy
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness check endpoint - Used by container orchestrators (like Kubernetes) for readiness probe
app.get('/ready', (req: Request, res: Response) => {
    if (isReady) {
        res.json({ status: 'Ready', timestamp: new Date().toISOString() });
    } else {
        res.status(503).json({ status: 'Not Ready', timestamp: new Date().toISOString() });
    }
});

// Simple GET route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the Dockerized Express + TypeScript API!' });
});

// Route to simulate an error
app.get('/error', (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Simulated error!');
    next(error);
});

// Not Found Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Graceful shutdown handler - Ensures clean server shutdown
function gracefulShutdown(signal: string) {
    console.log(`[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);
    isReady = false;  // Mark server as not ready

    if (server) {
        // Force shutdown if graceful shutdown takes too long
        setTimeout(() => {
            console.error('Forcing shutdown after timeout');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT).unref();

        // Attempt graceful shutdown
        server.close(() => {
            console.log(`[${new Date().toISOString()}] Server closed.`);
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}

// Process signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

// Server startup
try {
    server = app.listen(PORT, HOST, () => {
        console.log(`[${new Date().toISOString()}] Server running at http://${HOST}:${PORT}`);
        // Log environment configuration for debugging
        console.log('Environment:', {
            NODE_ENV: process.env.NODE_ENV,
            PORT,
            HOST,
            SHUTDOWN_TIMEOUT
        });
        isReady = true;  // Mark server as ready to accept requests
    });
} catch (err) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, err);
    process.exit(1);
}
