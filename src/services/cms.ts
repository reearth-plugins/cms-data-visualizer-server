import axios from "axios";

import { CMSResponse } from "../types";

const CMS_BASE_URL = process.env.REEARTH_CMS_INTEGRATION_API_BASE_URL;
const CMS_TOKEN = process.env.REEARTH_CMS_INTEGRATION_API_ACCESS_TOKEN;

class CMSService {
  private getHeaders() {
    return {
      Authorization: `Bearer ${CMS_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  async getItems(modelId: string): Promise<CMSResponse> {
    try {
      const response = await axios.get(
        `${CMS_BASE_URL}/models/${modelId}/items`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching items from CMS:", error);
      throw error;
    }
  }
}

export const cmsService = new CMSService();