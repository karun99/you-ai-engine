import * as fs from 'fs';
import * as path from 'path';

export class FileSystemStorage {
    private filePath: string;
    private data: Record<string, string> = {};

    constructor(fileName: string = 'storage.json') {
        this.filePath = path.join(process.cwd(), fileName);
        this.load();
    }

    private load(): void {
        try {
            if (fs.existsSync(this.filePath)) {
                const content = fs.readFileSync(this.filePath, 'utf8');
                this.data = JSON.parse(content);
            }
        } catch (error) {
            console.error('Error loading storage file:', error);
            this.data = {};
        }
    }

    private save(): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving storage file:', error);
        }
    }

    public getItem(key: string): string | null {
        return this.data[key] || null;
    }

    public setItem(key: string, value: string): void {
        this.data[key] = value;
        this.save();
    }

    public removeItem(key: string): void {
        delete this.data[key];
        this.save();
    }

    public clear(): void {
        this.data = {};
        this.save();
    }

    public keys(): string[] {
        return Object.keys(this.data);
    }
}
