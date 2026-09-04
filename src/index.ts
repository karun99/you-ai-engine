import { AppCore } from './core/AppCore';

async function demo() {
    const core = AppCore.getInstance();
    console.log('--- Perspective AI System Demo ---');

    try {
        // 1. Register a user
        console.log('
1. Registering User...');
        const user = await core.auth.register('test@example.com', 'Password123', 'John Doe');
        console.log('User registered:', user?.name);

        // 2. Login
        console.log('
2. Logging in...');
        const loggedInUser = await core.auth.login('test@example.com', 'Password123');
        if (!loggedInUser) throw new Error('Login failed');
        
        const session = await core.sessions.createSession(loggedInUser);
        console.log('Session created:', session.token);
        await core.logActivity(user!.id, user!.name, 'LOGIN', { ip: '127.0.0.1' });

        // 3. Create a Project
        console.log('
3. Creating AI Project...');
        const project = await core.projects.createProject(user!.id, user!.name, {
            name: 'Quantum Computing Insights',
            description: 'An exploration of quantum supremacy',
            outputFormat: 'markdown',
            agents: {
                webSearch: { enabled: true },
                dataAnalyst: { enabled: true, model: 'gpt-4o' }
            }
        });
        console.log('Project created:', project.name);
        await core.logActivity(user!.id, user!.name, 'CREATE_PROJECT', { projectId: project.id });

        // 4. Generate Content
        console.log('
4. Generating AI Content...');
        const outputs = await core.ai.generateProjectOutput(project, 'Explain the impact of Shor's algorithm on RSA encryption');
        console.log('Generated Markdown Output:
', outputs.markdown);
        await core.logActivity(user!.id, user!.name, 'GENERATE_CONTENT', { projectId: project.id });

        // 5. Admin Stats
        console.log('
5. Admin Dashboard Stats:');
        const stats = await core.admin.getDashboardStats();
        console.log('Total Users:', stats.totalUsers);
        console.log('Total Projects:', stats.totalProjects);

    } catch (error: any) {
        console.error('Demo Error:', error.message);
    }
}

demo();
