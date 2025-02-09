import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query, Account } from "appwrite";

export class Service {
    client = new Client();
    databases;
    bucket;
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
        this.account = new Account(this.client);  // Appwrite account service for user management
    }

    async createPost({ title, slug, content, featuredimage, status, userid }) {
        try {
            if (!userid) {
                throw new Error("User ID is required to create a post");
            }

            // Handle the featured image upload if it's a file
            let imageUrlOrId = featuredimage;

            if (featuredimage instanceof File) {
                const file = await this.uploadFile(featuredimage);  // Upload file
                imageUrlOrId = file?.$id;  // Save the file ID (or URL, depending on your need)
            }

            // Create the post document in the database
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredimage: imageUrlOrId,  // Add the image ID or URL here
                    status,
                    userid,  // Ensure user ID is passed
                }
            );
        } catch (error) {
            console.log("Appwrite service :: createPost :: error", error);
        }
    }

    async updatePost(slug, { title, content, featuredimage, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredimage,
                    status,
                }
            );
        } catch (error) {
            console.log("Appwrite service :: updatePost :: error", error);
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deletePost :: error", error);
            return false;
        }
    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.log("Appwrite service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.log("Appwrite service :: getPosts :: error", error);
            return false;
        }
    }

    // File upload service
    async uploadFile(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.log("Appwrite service :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

getFilePreview(fileId) {
    // Check if fileId exists and is not empty
    if (!fileId) {
        console.error("File ID is required to get file preview.");
        return "";
    }

    return this.bucket.getFilePreview(
        conf.appwriteBucketId,
        fileId
    );
}


    // Get the logged-in user's ID
    async getUserId() {
        try {
            const user = await this.account.get(); // Get logged-in user details
            return user.$id;  // Return the user ID
        } catch (error) {
            console.log("Error fetching user ID:", error);
            return null;  // If user is not logged in, return null
        }
    }
}

const service = new Service();
export default service;
