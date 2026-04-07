import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

/**
 * MICROSOFT GRAPH SERVICE (ONEDRIVE SYNC)
 * Handles automatic documentation backup to Cloud Storage.
 */

const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const clientId = process.env.MICROSOFT_CLIENT_ID;
const tenantId = process.env.MICROSOFT_TENANT_ID;

export class MicrosoftGraphService {
  private static instance: MicrosoftGraphService;
  private client: Client | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new MicrosoftGraphService();
    }
    return this.instance;
  }

  private async initialize() {
    if (!clientId || !clientSecret || !tenantId) {
      console.warn("Microsoft Graph Credentials missing. OneDrive sync disabled.");
      return;
    }

    try {
      // Note: In high-load production, use ClientSecretCredential from @azure/identity
      this.client = Client.init({
        authProvider: async (done) => {
          const token = await this.getAccessToken();
          done(null, token);
        },
      });
    } catch (e) {
      console.error("Microsoft Graph initialization failed:", e);
    }
  }

  private async getAccessToken() {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append("client_id", clientId!);
    params.append("client_secret", clientSecret!);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("grant_type", "client_credentials");

    const response = await fetch(url, { method: "POST", body: params });
    const data = await response.json();
    return data.access_token;
  }

  /**
   * Uploads a file to a specific path in OneDrive
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, targetFolder: string = "DaikinConnect/Documentation") {
    if (!this.client) return null;

    try {
      const path = `/me/drive/root:/${targetFolder}/${fileName}:/content`;
      const response = await this.client.api(path).put(fileBuffer);
      return response.id as string; // Return OneDrive ID
    } catch (e) {
      console.error("OneDrive Upload failed:", e);
      return null;
    }
  }
}

export const onedrive = MicrosoftGraphService.getInstance();
