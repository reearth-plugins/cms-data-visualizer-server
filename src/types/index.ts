
export type CMSField = {
  id: string;
  key: string;
  type: string;
  name?: string;
  value: string | number | object | boolean | null;
};

export type CMSItem = {
  id: string;
  fields: CMSField[];
  createdAt: string;
  updatedAt?: string;
};

export type CMSResponse = {
  items: CMSItem[];
  totalCount?: number;
};

export type CMSSchemaField = {
  id: string;
  key: string;
  multiple: boolean;
  name: string;
  required: boolean;
  type: string;
};

export type CMSSchema = {
  createdAt: string;
  fields: CMSSchemaField[];
  id: string;
  projectId: string;
};

export type CMSModel = {
  createdAt: string;
  id: string;
  key: string;
  lastModified: string;
  name: string;
  projectId: string;
  schema: CMSSchema;
  schemaId: string;
  updatedAt: string;
};

export type CMSAsset = {
  id: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt?: string;
};

export type CMSAssetsResponse = {
  items: CMSAsset[] | null;
  totalCount?: number;
};


export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  total?: number;
  error?: {
    code: string;
    message: string;
    details?: {
      field: string;
      message: string;
    }[];
  };
};
