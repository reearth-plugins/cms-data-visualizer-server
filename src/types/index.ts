
export type CMSField = {
  id: string;
  key: string;
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
