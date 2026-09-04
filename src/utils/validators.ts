export class ValidatorService {
    public isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public isValidPassword(password: string): boolean {
        return password.length >= 6 && /[0-9]/.test(password);
    }

    public isValidName(name: string): boolean {
        return name.trim().length >= 2;
    }

    public isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    public isValidJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    public isValidProjectName(name: string): boolean {
        return name.trim().length >= 1 && name.trim().length <= 100;
    }

    public isValidOutputFormat(format: string): boolean {
        const validFormats = ['text', 'audio', 'ppt', 'pdf', 'markdown', 'custom'];
        return validFormats.includes(format);
    }

    public sanitizeInput(input: string): string {
        return input.trim().replace(/[<>]/g, '');
    }

    public validateEmailDomain(email: string, allowedDomains: string[] = []): boolean {
        if (allowedDomains.length === 0) return true;
        const domain = email.split('@')[1];
        return allowedDomains.includes(domain);
    }
}
