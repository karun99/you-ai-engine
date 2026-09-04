import { Project, ProjectCreate, ProjectUpdate } from '../types';
import { StorageService } from '../utils/storage';
import { ValidatorService } from '../utils/validators';

export class ProjectManager {
    private storage: StorageService;
    private validator: ValidatorService;

    constructor(storage: StorageService) {
        this.storage = storage;
        this.validator = new ValidatorService();
    }

    public async createProject(ownerId: string, ownerName: string, data: ProjectCreate): Promise<Project> {
        if (!this.validator.isValidProjectName(data.name)) {
            throw new Error('Invalid project name');
        }

        const projects = this.getProjects();
        
        const newProject: Project = {
            id: 'prj_' + Date.now(),
            name: data.name,
            ownerId: ownerId,
            ownerName: ownerName,
            description: data.description || '',
            status: 'draft',
            outputFormat: data.outputFormat,
            agents: {
                knowledgeLearner: { enabled: data.agents?.knowledgeLearner?.enabled ?? true, knowledgeBase: data.agents?.knowledgeLearner?.knowledgeBase || '' },
                webSearch: { enabled: data.agents?.webSearch?.enabled ?? true },
                dataAnalyst: { enabled: data.agents?.dataAnalyst?.enabled ?? true, model: data.agents?.dataAnalyst?.model || 'gpt-4', temperature: data.agents?.dataAnalyst?.temperature ?? 0.7, maxTokens: data.agents?.dataAnalyst?.maxTokens ?? 2048 },
                contentValidator: { enabled: data.agents?.contentValidator?.enabled ?? true, strictness: data.agents?.contentValidator?.strictness || 'medium', checkInjection: true, checkBias: true, checkHallucinations: true },
                answeringAgent: { enabled: data.agents?.answeringAgent?.enabled ?? true, temperature: data.agents?.answeringAgent?.temperature ?? 0.7, maxTokens: data.agents?.answeringAgent?.maxTokens ?? 2048 },
            },
            features: {
                threeJsAvatar: data.features?.threeJsAvatar ?? false,
                voiceInput: data.features?.voiceInput ?? false,
                voiceOutput: data.features?.voiceOutput ?? false,
                themeToggle: data.features?.themeToggle ?? true,
                accentColorPicker: data.features?.accentColorPicker ?? true,
                adminPanel: data.features?.adminPanel ?? false,
                voiceSelector: data.features?.voiceSelector ?? false,
                outputSelector: data.features?.outputSelector ?? true,
            },
            commands: data.commands || [],
            skills: data.skills || [],
            generatedOutputs: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublic: false,
            gallerySelected: false,
            viewCount: 0,
            likeCount: 0,
        };

        projects.push(newProject);
        this.saveProjects(projects);
        return newProject;
    }

    public async getProject(id: string): Promise<Project | null> {
        const projects = this.getProjects();
        return projects.find(p => p.id === id) || null;
    }

    public async getProjectsByUser(userId: string): Promise<Project[]> {
        const projects = this.getProjects();
        return projects.filter(p => p.ownerId === userId);
    }

    public async getAllProjects(): Promise<Project[]> {
        return this.getProjects();
    }

    public async updateProject(id: string, updates: ProjectUpdate): Promise<Project | null> {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);

        if (index === -1) return null;

        const project = projects[index];
        if (updates.name) {
            if (!this.validator.isValidProjectName(updates.name)) throw new Error('Invalid project name');
            project.name = updates.name;
        }
        if (updates.description !== undefined) project.description = updates.description;
        if (updates.status) project.status = updates.status;
        if (updates.outputFormat) project.outputFormat = updates.outputFormat;
        if (updates.agents) project.agents = { ...project.agents, ...updates.agents };
        if (updates.features) project.features = { ...project.features, ...updates.features };
        if (updates.commands) project.commands = updates.commands;
        if (updates.skills) project.skills = updates.skills;
        if (updates.isPublic !== undefined) project.isPublic = updates.isPublic;
        if (updates.gallerySelected !== undefined) project.gallerySelected = updates.gallerySelected;

        project.updatedAt = new Date().toISOString();
        projects[index] = project;
        this.saveProjects(projects);

        return project;
    }

    public async deleteProject(id: string): Promise<boolean> {
        const projects = this.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        if (filtered.length === projects.length) return false;
        this.saveProjects(filtered);
        return true;
    }

    public async getGalleryProjects(): Promise<Project[]> {
        const projects = this.getProjects();
        return projects.filter(p => p.isPublic && p.gallerySelected);
    }

    private getProjects(): Project[] {
        const data = this.storage.get('projects');
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    }

    private saveProjects(projects: Project[]): void {
        this.storage.set('projects', JSON.stringify(projects));
    }
}
