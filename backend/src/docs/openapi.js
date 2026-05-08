const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Smart Home Backend API",
    version: "1.0.0",
    description: "REST API for Smart Home backend (Node.js/Express).",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local" },
  ],
  tags: [
    { name: "Auth", description: "Authentication" },
    { name: "Users", description: "User management" },
    { name: "Devices", description: "Device management" },
    { name: "Sensors", description: "Sensor data" },
    { name: "Alerts", description: "Alert management" },
    { name: "Thresholds", description: "Threshold configuration" },
    { name: "Logs", description: "Activity logs" },
    { name: "Legacy", description: "Legacy IoT endpoints" },
    { name: "Homes", description: "Home and invitation management" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AuthLoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      AuthRegisterRequest: {
        type: "object",
        required: ["username", "password", "email", "full_name"],
        properties: {
          username: { type: "string" },
          password: { type: "string", format: "password" },
          email: { type: "string", format: "email" },
          full_name: { type: "string" },
          role: { type: "string", enum: ["Admin", "Gia dinh"] },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string" },
          full_name: { type: "string" },
          role: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Device: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" },
          model: { type: "string" },
          feed_name: { type: "string" },
          pin: { type: "number" },
          pin_mode: { type: "string" },
          status: { type: "string", enum: ["Bat", "Tat"] },
          threshold_min_value: { type: "number" },
          threshold_max_value: { type: "number" },
          threshold_is_active: { type: "boolean" },
          homeId: { type: "string" },
          last_seen: { type: "string", format: "date-time" },
        },
      },
      SensorData: {
        type: "object",
        properties: {
          _id: { type: "string" },
          device_id: { type: "string" },
          type: { type: "string" },
          value: { type: "number" },
          unit: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Alert: {
        type: "object",
        properties: {
          _id: { type: "string" },
          device_id: { type: "string" },
          severity: { type: "string", enum: ["Thap", "Trung binh", "Cao"] },
          message: { type: "string" },
          value_at_alert: { type: "number" },
          status: { type: "string", enum: ["Chua xu ly", "Da xu ly"] },
          detected_at: { type: "string", format: "date-time" },
          resolved_at: { type: "string", format: "date-time" },
        },
      },
      ActivityLog: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user_id: { type: "string" },
          device_id: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          action: { type: "string" },
          description: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
        },
      },
      Home: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          admin: { type: "string" },
          members: { type: "array", items: { type: "string" } },
        },
      },
      Invitation: {
        type: "object",
        properties: {
          _id: { type: "string" },
          email: { type: "string", format: "email" },
          homeId: { type: "string" },
          token: { type: "string" },
          status: { type: "string", enum: ["pending", "accepted"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
            },
          },
        },
        responses: {
          200: { description: "Register success" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List users (Admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Users list" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/User" } },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/v1/users/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update user (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/User" } },
          },
        },
        responses: {
          200: { description: "User updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "User deleted" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/v1/devices": {
      get: {
        tags: ["Devices"],
        summary: "List devices",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Devices list" },
        },
      },
      post: {
        tags: ["Devices"],
        summary: "Create device (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Device" } },
          },
        },
        responses: {
          201: { description: "Device created" },
        },
      },
    },
    "/api/v1/devices/{id}": {
      get: {
        tags: ["Devices"],
        summary: "Get device",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Device" } },
      },
      put: {
        tags: ["Devices"],
        summary: "Update device (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Device" } },
          },
        },
        responses: { 200: { description: "Device updated" } },
      },
      delete: {
        tags: ["Devices"],
        summary: "Delete device (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Device deleted" } },
      },
    },
    "/api/v1/devices/{id}/control": {
      post: {
        tags: ["Devices"],
        summary: "Control device",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { value: { type: "number" } },
                required: ["value"],
              },
            },
          },
        },
        responses: { 200: { description: "Command sent" } },
      },
    },
    "/api/v1/sensors/latest": {
      get: {
        tags: ["Sensors"],
        summary: "Get latest sensor data",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Latest sensor data" } },
      },
    },
    "/api/v1/sensors/history": {
      get: {
        tags: ["Sensors"],
        summary: "Get sensor history",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "device_id", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Sensor history" } },
      },
    },
    "/api/v1/alerts/active": {
      get: {
        tags: ["Alerts"],
        summary: "Get active alerts",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Active alerts" } },
      },
    },
    "/api/v1/alerts": {
      get: {
        tags: ["Alerts"],
        summary: "Get all alerts",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Alerts list" } },
      },
    },
    "/api/v1/alerts/{id}/resolve": {
      put: {
        tags: ["Alerts"],
        summary: "Resolve alert (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Alert resolved" } },
      },
    },
    "/api/v1/thresholds": {
      get: {
        tags: ["Thresholds"],
        summary: "Get thresholds",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Thresholds list" } },
      },
    },
    "/api/v1/thresholds/{deviceId}": {
      put: {
        tags: ["Thresholds"],
        summary: "Update device thresholds (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "deviceId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  threshold_min_value: { type: "number" },
                  threshold_max_value: { type: "number" },
                  threshold_is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Threshold updated" } },
      },
    },
    "/api/v1/logs": {
      get: {
        tags: ["Logs"],
        summary: "Get activity logs (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "user_id", in: "query", schema: { type: "string" } },
          { name: "device_id", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Logs list" } },
      },
    },
    "/api/iot-data": {
      get: {
        tags: ["Legacy"],
        summary: "Get latest IoT cache data",
        responses: { 200: { description: "IoT cache" } },
      },
    },
    "/api/iot-control": {
      post: {
        tags: ["Legacy"],
        summary: "Send IoT control command",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["feedName", "value"],
                properties: {
                  feedName: { type: "string" },
                  value: { type: "number" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Command sent" } },
      },
    },
    "/api/v1/homes": {
      post: {
        tags: ["Homes"],
        summary: "Create a new home (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Home created" },
          500: { description: "Server error" },
        },
      },
    },
    "/api/v1/homes/invite": {
      post: {
        tags: ["Homes"],
        summary: "Invite a new member to home (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["homeId", "email"],
                properties: {
                  homeId: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Invitation sent" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/v1/homes/register": {
      post: {
        tags: ["Homes"],
        summary: "Register using invitation token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "email", "username", "password", "full_name"],
                properties: {
                  token: { type: "string" },
                  email: { type: "string", format: "email" },
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                  full_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Registration successful" },
          400: { description: "Bad request or invalid token" },
        },
      },
    },
    "/api/v1/homes/{homeId}/members/{memberId}": {
      delete: {
        tags: ["Homes"],
        summary: "Remove member from home (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "homeId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Member removed" },
          403: { description: "Forbidden" },
        },
      },
    },
  },
};

export default openApiSpec;
