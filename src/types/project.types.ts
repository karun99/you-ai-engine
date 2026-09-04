export type OutputFormat = 'text' | 'audio' | 'ppt' | 'pdf' | 'markdown' | 'custom';

export interface Project {
    id: string;
    name: string;
    ownerId: string;
    ownerName: string;
    description: string;
    status: 'active' | 'draft' | 'archived' | 'deleted';
    outputFormat: OutputFormat;
    agents: AgentConfig;
    features: FeatureConfig;
    commands: Command[];
    skills: Skill[];
    generatedOutputs: GeneratedOutputs;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    gallerySelected: boolean;
    viewCount: number;
    likeCount: number;
}

export interface AgentConfig {
    knowledgeLearner: KnowledgeLearnerAgent;
    webSearch: WebSearchAgent;
    dataAnalyst: DataAnalystAgent;
    contentValidator: ContentValidatorAgent;
    answeringAgent: AnsweringAgent;
}

export interface KnowledgeLearnerAgent {
    enabled: boolean;
    knowledgeBase: string;
    indexingStrategy?: 'semantic' | 'keyword';
}

export interface WebSearchAgent {
    enabled: boolean;
    providers?: string[];
    scope?: string[];
}

export interface DataAnalystAgent {
    enabled: boolean;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
}

export interface ContentValidatorAgent {
    enabled: boolean;
    strictness: 'low' | 'medium' | 'high';
    checkInjection: boolean;
    checkBias: boolean;
    checkHallucinations: boolean;
}

export interface AnsweringAgent {
    enabled: boolean;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
}

export interface FeatureConfig {
    threeJsAvatar: boolean;
    voiceInput: boolean;
    voiceOutput: boolean;
    themeToggle: boolean;
    accentColorPicker: boolean;
    adminPanel: boolean;
    voiceSelector: boolean;
    outputSelector: boolean;
}

export interface Command {
    trigger: string;
    response: string;
    description?: string;
    enabled?: boolean;
}

export interface Skill {
    name: string;
    action: string;
    description?: string;
    parameters?: SkillParameter[];
}

export interface SkillParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    required: boolean;
    default?: any;
}

export interface GeneratedOutputs {
    fullHtml?: string;
    embeddedHtml?: string;
    markdown?: string;
    pptx?: string; // base64 encoded
    pdfHtml?: string;
    custom?: string;
}

export interface ProjectCreate {
    name: string;
    description?: string;
    outputFormat: OutputFormat;
    agents?: Partial<AgentConfig>;
    features?: Partial<FeatureConfig>;
    commands?: Command[];
    skills?: Skill[];
}

export interface ProjectUpdate {
    name?: string;
    description?: string;
    status?: 'active' | 'draft' | 'archived';
    outputFormat?: OutputFormat;
    agents?: Partial<AgentConfig>;
    features?: Partial<FeatureConfig>;
    commands?: Command[];
    skills?: Skill[];
    isPublic?: boolean;
    gallerySelected?: boolean;
}
