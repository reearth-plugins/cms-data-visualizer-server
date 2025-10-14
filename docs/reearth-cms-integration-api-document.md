# Integration API

The **ReEarth-CMS Integration API** allows users and applications to interact with Re:Earth CMS. It supports various operations, such as retrieving and managing projects, models, items, assets, schemata, fields, and comments.

## Authentication

The API requires Bearer Token Authentication. You must include the token in the `Authorization` header for all requests:

```bash
Authorization: Bearer <your_token>
```

## API Endpoints

### Projects

---

### **List Projects**

**GET** `/workspaceId/projects`

- **Summary**: Returns a list of projects within the selected workspace.
- **Authentication**: Bearer token is required.
- **Query Parameters**:
  - `page` (optional): Specifies the page of results (default: 1).
  - `perPage` (optional): Number of items per page (default: 50).
- **Response**:
  - **200**: A JSON object containing the list of projects.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Projects not found.

---

### Models

---

### **List Models**

**GET** `/projects/{projectIdOrAlias}/models`

- **Summary**: Returns a list of models under a specific project.
- **Authentication**: Bearer token is required.
- **Path Parameters**:
  - `projectIdOrAlias`: The ID or alias of the project.
- **Query Parameters**:
  - `page` (optional): Specifies the page of results.
  - `perPage` (optional): Specifies the number of models per page.
- **Response**:
  - **200**: A JSON object containing a list of models and their details.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Models not found.

### **Create Model**

**POST** `/projects/{projectIdOrAlias}/models`

- **Summary**: Creates a new model under the specified project.
- **Authentication**: Bearer token is required.
- **Request Body**:
  - `name` (string): The name of the model.
  - `description` (string): A description of the model.
  - `key` (string): A unique key for the model.
- **Response**:
  - **200**: The created model object.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

---

### **Get a Specific Model**

**GET** `/models/{modelId}`

- **Summary**: Retrieves details of a specific model by its ID.
- **Authentication**: Bearer token is required.
- **Path Parameters**:
  - `modelId`: The ID of the model.
- **Response**:
  - **200**: The model details.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Model not found.

### **Update a Model**

**PATCH** `/models/{modelId}`

- **Summary**: Updates details of a model.
- **Authentication**: Bearer token is required.
- **Request Body**:
  - `name` (string): The updated name of the model.
  - `description` (string): The updated description of the model.
  - `key` (string): The updated key of the model.
- **Response**:
  - **200**: The updated model object.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

### **Delete a Model**

**DELETE** `/models/{modelId}`

- **Summary**: Deletes a specific model.
- **Authentication**: Bearer token is required.
- **Response**:
  - **200**: Model successfully deleted.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

---

### Items

---

### **List Items**

**GET** `/models/{modelId}/items`

- **Summary**: Retrieves a list of items from a model.
- **Authentication**: Bearer token is required.
- **Query Parameters**:
  - `sort` (optional): Sorting field (e.g., `createdAt` or `updatedAt`).
  - `dir` (optional): Sorting direction (`asc` or `desc`).
  - `page` (optional): Specifies the page of results.
  - `perPage` (optional): Number of items per page.
  - `ref` (optional): Version reference (`latest` or `public`).
- **Response**:
  - **200**: A JSON array of items.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Items not found.

### **Create an Item**

**POST** `/models/{modelId}/items`

- **Summary**: Creates a new item in the specified model.
- **Authentication**: Bearer token is required.
- **Request Body**:
  - `fields`: An array of item fields.
  - `metadataFields`: An array of metadata fields.
- **Response**:
  - **200**: The created item object.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

### **Get an Item**

**GET** `/items/{itemId}`

- **Summary**: Retrieves details of a specific item.
- **Authentication**: Bearer token is required.
- **Path Parameters**:
  - `itemId`: The ID of the item.
- **Response**:
  - **200**: The item details.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Item not found.

### **Update an Item**

**PATCH** `/items/{itemId}`

- **Summary**: Updates details of a specific item.
- **Authentication**: Bearer token is required.
- **Request Body**:
  - `fields`: An array of updated item fields.
  - `metadataFields`: An array of updated metadata fields.
- **Response**:
  - **200**: The updated item object.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

### **Delete an Item**

**DELETE** `/items/{itemId}`

- **Summary**: Deletes a specific item.
- **Authentication**: Bearer token is required.
- **Response**:
  - **200**: Item successfully deleted.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

---

### Assets

---

### **List Assets**

**GET** `/projects/{projectId}/assets`

- **Summary**: Retrieves a list of assets under a project.
- **Authentication**: Bearer token is required.
- **Query Parameters**:
  - `sort` (optional): Sorting field (e.g., `createdAt` or `updatedAt`).
  - `dir` (optional): Sorting direction (`asc` or `desc`).
  - `page` (optional): Specifies the page of results.
  - `perPage` (optional): Number of assets per page.
- **Response**:
  - **200**: A JSON array of assets.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Assets not found.

### **Create an Asset**

**POST** `/projects/{projectId}/assets`

- **Summary**: Creates a new asset within a project.
- **Authentication**: Bearer token is required.
- **Request Body**:
  - **For `multipart/form-data`**:
    - `file` (binary): The file to upload.
    - `skipDecompression` (boolean): Optional flag to skip file decompression.
  - **For `application/json`**:
    - `url` (string): The URL to the file.
    - `token` (string): Authentication token for the file.
- **Response**:
  - **200**: The created asset object.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.

---

### Comments

---

### **List Comments on an Item**

**GET** `/items/{itemId}/comments`

- **Summary**: Retrieves comments associated with a specific item.
- **Authentication**: Bearer token is required.
- **Response**:
  - **200**: A JSON array of comments.
  - **400**: Invalid request parameter.
  - **401**: Unauthorized access.
  - **404**: Comments not found.

---

## Error Handling

- **401 Unauthorized**: Occurs when the request does not include a valid Bearer token or the token is expired.
- **400 Bad Request**: Invalid request parameters.
- **404 Not Found**: Resource not found.
- **500 Internal Server Error**: Server encountered an error while processing the request.

---

### Reference

Please refer to the [My Integration](https://www.notion.so/My-Integrations-11b16e0fb16580e98297f321c9d82467?pvs=21) page for more details about the integration creation flow.