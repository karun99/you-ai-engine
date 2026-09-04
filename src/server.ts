import express, { Request, Response, NextFunction } from 'express';
import { AppCore } from './core/AppCore';

const app = express();
const port = process.env.PORT || 3000;
const core = AppCore.getInstance();

app.use(express.json());

// Extend Request type to include userSession
interface AuthenticatedRequest extends Request {
    userSession?: any;
}

// --- Authentication Middleware ---
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'] as string;
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    
    const session = await core.sessions.validateSession(token);
    if (!session) return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    
    req.userSession = session;
    next();
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const user = await core.auth.register(email, password, name);
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await core.auth.login(email, password);
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const session = await core.sessions.createSession(user);
        res.json({ success: true, data: { user, token: session.token } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// --- Project Routes ---
app.post('/api/projects', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, description, outputFormat, agents, features, commands, skills } = req.body;
        const session = req.userSession;
        if (!session) return res.status(401).json({ success: false, message: 'Session missing' });
        
        const user = await core.users.getUser(session.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const project = await core.projects.createProject(user.id, user.name, {
            name, description, outputFormat, agents, features, commands, skills
        });
        
        await core.logActivity(user.id, user.name, 'CREATE_PROJECT', { projectId: project.id });
        res.json({ success: true, data: project });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/projects', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const session = req.userSession;
        if (!session) return res.status(401).json({ success: false, message: 'Session missing' });
        const projects = await core.projects.getProjectsByUser(session.userId);
        res.json({ success: true, data: projects });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/projects/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const project = await core.projects.getProject(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, data: project });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects/:id/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { prompt } = req.body;
        const project = await core.projects.getProject(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        
        const outputs = await core.ai.generateProjectOutput(project, prompt);
        
        const session = req.userSession;
        if (!session) return res.status(401).json({ success: false, message: 'Session missing' });
        const user = await core.users.getUser(session.userId);
        if (user) {
            await core.logActivity(user.id, user.name, 'GENERATE_CONTENT', { projectId: project.id });
        }
        
        res.json({ success: true, data: outputs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Admin Routes ---
app.get('/api/admin/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const session = req.userSession;
        if (!session || session.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        
        const stats = await core.admin.getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Export for Vercel Serverless Functions
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Perspective AI API Server running at http://localhost:${port}`);
    });
}
