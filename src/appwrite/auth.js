import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({ email, password, name }) {
        // eslint-disable-next-line no-useless-catch
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return this.login({ email, password });
            } else {
                return userAccount;
            }
        } catch (error) {
            //console.error("Error creating account:", error);
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            console.log("Attempting login with", email, password);
            const session = await this.account.createEmailSession(email, password);
            console.log('Login successful', session);
            return session;
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            console.log("Current user:", user);
            return user;
        } catch (error) {
            //console.error("Error fetching current user:", error);
            return null;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
            console.log("Logged out successfully");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }
}

const authService = new AuthService();

export default authService;
