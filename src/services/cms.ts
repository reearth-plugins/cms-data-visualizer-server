import axios from "axios";

import { CMSResponse, CMSModel } from "../types";

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
      // Fetch first page to get total count
      const firstResponse = await axios.get(
        `${CMS_BASE_URL}/models/${modelId}/items`,
        {
          headers: this.getHeaders(),
          params: {
            perPage: 100,
            page: 1
          }
        }
      );

      const totalCount = firstResponse.data.totalCount;
      const totalPages = Math.ceil(totalCount / 100);
      let allItems = [...firstResponse.data.items];

      // Fetch remaining pages if needed
      if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(
            axios.get(
              `${CMS_BASE_URL}/models/${modelId}/items`,
              {
                headers: this.getHeaders(),
                params: {
                  perPage: 100,
                  page
                }
              }
            )
          );
        }

        const remainingResponses = await Promise.all(pagePromises);
        remainingResponses.forEach(response => {
          allItems = allItems.concat(response.data.items);
        });
      }

      return {
        ...firstResponse.data,
        items: allItems,
        totalCount
      };
    } catch (error) {
      console.error("Error fetching items from CMS:", error);
      throw error;
    }
  }

  async getModel(modelId: string): Promise<CMSModel> {
    try {
      const response = await axios.get(
        `${CMS_BASE_URL}/models/${modelId}`,
        {
          headers: this.getHeaders()
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching model from CMS:", error);
      throw error;
    }
  }
}

export const cmsService = new CMSService();