const jsonContent = (schema) => ({
  content: {
    "application/json": { schema },
  },
});

const bearerResponses = {
  401: { description: "Unauthorized" },
  403: { description: "Forbidden" },
};

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Smart Home Backend API",
    version: "1.0.0",
    description: "Backend API for the Smart Home system.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication and current user" },
    { name: "Devices", description: "Home-scoped device management" },
    { name: "Sensors", description: "Home-scoped sensor data" },
    { name: "Alerts", description: "Home-scoped alert management" },
    { name: "Thresholds", description: "Device threshold configuration" },
    { name: "Logs", description: "Home-scoped activity logs" },
    { name: "Homes", description: "Home membership and invitation flow" },
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
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string" },
          full_name: { type: "string" },
          role: { type: "string", enum: ["Gia đình", "Admin"] },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          homeId: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Home: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          admin: { type: "string" },
          members: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
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
          status: { type: "string", enum: ["Bật", "Tắt"] },
          threshold_min_value: { type: "number" },
          threshold_max_value: { type: "number" },
          threshold_is_active: { type: "boolean" },
          homeId: { type: "string" },
          last_seen: { type: "string", format: "date-time" },
        },
      },
      DeviceSummary: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          feed_name: { type: "string" },
          type: { type: "string" },
          status: { type: "string", enum: ["Bật", "Tắt"] },
        },
      },
      CreateDeviceRequest: {
        type: "object",
        required: ["name", "homeId"],
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          model: { type: "string" },
          pin: { type: "number" },
          pin_mode: { type: "string" },
          feed_name: { type: "string" },
          homeId: { type: "string" },
          threshold_min_value: { type: "number" },
          threshold_max_value: { type: "number" },
          threshold_is_active: { type: "boolean" },
        },
      },
      ControlDeviceRequest: {
        type: "object",
        required: ["value"],
        properties: {
          value: { oneOf: [{ type: "number" }, { type: "string" }] },
        },
      },
      SensorData: {
        type: "object",
        properties: {
          _id: { type: "string" },
          device_id: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/DeviceSummary" },
            ],
          },
          type: { type: "string", enum: ["temperature", "humidity", "light"] },
          value: { type: "number" },
          unit: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Alert: {
        type: "object",
        properties: {
          _id: { type: "string" },
          device_id: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/DeviceSummary" },
            ],
          },
          severity: { type: "string", enum: ["Thấp", "Trung bình", "Cao"] },
          message: { type: "string" },
          value_at_alert: { type: "number" },
          status: { type: "string", enum: ["Chưa xử lý", "Đã xử lý"] },
          detected_at: { type: "string", format: "date-time" },
          resolved_at: { type: "string", format: "date-time" },
        },
      },
      ActivityLog: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user_id: {
            oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }],
          },
          device_id: {
            oneOf: [
              { type: "string" },
              { $ref: "#/components/schemas/DeviceSummary" },
            ],
          },
          timestamp: { type: "string", format: "date-time" },
          action: { type: "string" },
          description: { type: "string" },
          is_read: { type: "boolean" },
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
        },
      },
      AuthLoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      AuthRegisterResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              home: { $ref: "#/components/schemas/Home" },
            },
          },
        },
      },
      InvitedRegisterRequest: {
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
      PaginatedResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          count: { type: "number" },
          total: { type: "number" },
          page: { type: "number" },
          totalPages: { type: "number" },
          data: { type: "array", items: {} },
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
            ...jsonContent({ $ref: "#/components/schemas/AuthLoginResponse" }),
          },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register an owner account and auto-create its default home",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Register success",
            ...jsonContent({ $ref: "#/components/schemas/AuthRegisterResponse" }),
          },
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
          200: {
            description: "Current user profile",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/User" },
              },
            }),
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/devices": {
      get: {
        tags: ["Devices"],
        summary: "List devices in the logged-in user's home",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Devices list",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                count: { type: "number" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Device" },
                },
              },
            }),
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Devices"],
        summary: "Create a device in a home owned by the logged-in admin",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDeviceRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Device created",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Device" },
              },
            }),
          },
          400: { description: "Invalid input or duplicate feed_name" },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/devices/{id}": {
      get: {
        tags: ["Devices"],
        summary: "Get one device from the logged-in user's home",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Device",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Device" },
              },
            }),
          },
          404: { description: "Device not found" },
          ...bearerResponses,
        },
      },
      put: {
        tags: ["Devices"],
        summary: "Update device configuration (Admin)",
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
        responses: {
          200: {
            description: "Device updated",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Device" },
              },
            }),
          },
          ...bearerResponses,
        },
      },
      delete: {
        tags: ["Devices"],
        summary: "Delete device (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Device deleted",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { type: "object" },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/devices/{id}/control": {
      post: {
        tags: ["Devices"],
        summary: "Publish a control command to a device feed",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ControlDeviceRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Command sent",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    device_id: { type: "string" },
                    feed_name: { type: "string" },
                    command: { type: "string" },
                    status: { type: "string", enum: ["Bật", "Tắt"] },
                  },
                },
              },
            }),
          },
          400: { description: "Missing value or feed_name" },
          404: { description: "Device not found" },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/sensors/latest": {
      get: {
        tags: ["Sensors"],
        summary: "Get latest sensor data grouped by sensor type for the user's home",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Latest sensor data",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                count: { type: "number" },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/SensorData" },
                },
              },
            }),
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/sensors/history": {
      get: {
        tags: ["Sensors"],
        summary: "Get paginated sensor history for the user's home",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "device_id", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: {
          200: {
            description: "Sensor history",
            ...jsonContent({
              allOf: [
                { $ref: "#/components/schemas/PaginatedResponse" },
                {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SensorData" },
                    },
                  },
                },
              ],
            }),
          },
          403: { description: "Device is outside the user's home" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/alerts/active": {
      get: {
        tags: ["Alerts"],
        summary: "Get active alerts for the user's home",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Active alerts",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                count: { type: "number" },
                data: { type: "array", items: { $ref: "#/components/schemas/Alert" } },
              },
            }),
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/alerts": {
      get: {
        tags: ["Alerts"],
        summary: "Get paginated alerts for the user's home",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["Chưa xử lý", "Đã xử lý"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          200: {
            description: "Alerts list",
            ...jsonContent({
              allOf: [
                { $ref: "#/components/schemas/PaginatedResponse" },
                {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Alert" } },
                  },
                },
              ],
            }),
          },
          401: { description: "Unauthorized" },
        },
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
        responses: {
          200: {
            description: "Alert resolved",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { $ref: "#/components/schemas/Alert" },
              },
            }),
          },
          400: { description: "Alert was already resolved" },
          404: { description: "Alert not found" },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/thresholds": {
      get: {
        tags: ["Thresholds"],
        summary: "Get threshold settings for devices in the user's home",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Thresholds list",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                count: { type: "number" },
                data: { type: "array", items: { $ref: "#/components/schemas/Device" } },
              },
            }),
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/thresholds/{deviceId}": {
      put: {
        tags: ["Thresholds"],
        summary: "Update threshold settings for one device (Admin)",
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
        responses: {
          200: {
            description: "Threshold updated",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    feed_name: { type: "string" },
                    threshold_min_value: { type: "number" },
                    threshold_max_value: { type: "number" },
                    threshold_is_active: { type: "boolean" },
                  },
                },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/logs": {
      get: {
        tags: ["Logs"],
        summary: "Get paginated activity logs for the user's home (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "user_id", in: "query", schema: { type: "string" } },
          { name: "device_id", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          200: {
            description: "Logs list",
            ...jsonContent({
              allOf: [
                { $ref: "#/components/schemas/PaginatedResponse" },
                {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/ActivityLog" } },
                  },
                },
              ],
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/logs/mark-read": {
      put: {
        tags: ["Logs"],
        summary: "Mark activity logs as read for the user's home (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  logIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logs marked as read",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/homes": {
      post: {
        tags: ["Homes"],
        summary: "Create a home for an admin without an existing owned home",
        description: "Normal registration already auto-creates a default home. This endpoint is only useful for an admin account that does not already own a home.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Home created",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { $ref: "#/components/schemas/Home" },
              },
            }),
          },
          400: { description: "User already has an owned home" },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/homes/{homeId}/members": {
      get: {
        tags: ["Homes"],
        summary: "List all users in a home, including the admin (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "homeId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Members list",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "array", items: { $ref: "#/components/schemas/User" } },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/homes/{homeId}/members/invite": {
      post: {
        tags: ["Homes"],
        summary: "Invite a new member to a home (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "homeId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Invitation sent",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: { $ref: "#/components/schemas/Invitation" },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
    "/api/v1/homes/register": {
      post: {
        tags: ["Homes"],
        summary: "Register a member account from an invitation token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InvitedRegisterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Registration successful",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
              },
            }),
          },
          400: { description: "Bad request or invalid invitation" },
        },
      },
    },
    "/api/v1/homes/{homeId}/members/{memberId}": {
      delete: {
        tags: ["Homes"],
        summary: "Remove a member from a home and create their default admin home (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "homeId", in: "path", required: true, schema: { type: "string" } },
          { name: "memberId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Member removed",
            ...jsonContent({
              type: "object",
              properties: {
                success: { type: "boolean" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: { newHomeId: { type: "string" } },
                },
              },
            }),
          },
          ...bearerResponses,
        },
      },
    },
  },
};

export default openApiSpec;
