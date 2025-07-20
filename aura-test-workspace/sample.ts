// Sample TypeScript file for testing Aura AI features
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    async createUser(userData: Partial<User>): Promise<User> {
        // TODO: Add validation
        const newUser: User = {
            id: Date.now(),
            name: userData.name || '',
            email: userData.email || ''
        };
        this.users.push(newUser);
        return newUser;
    }
    
    findUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
}

export { UserService, User };
