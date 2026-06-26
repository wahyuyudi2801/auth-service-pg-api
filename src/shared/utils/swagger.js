// src/shared/utils/swagger.js
// Swagger/OpenAPI 3.0 spec untuk Auth Service

const swaggerJsdoc  = require('swagger-jsdoc');
const swaggerUi     = require('swagger-ui-express');
const config        = require('../../../config');

// ── OpenAPI spec definition ───────────────────────────────
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title:       'Auth Service API',
    version:     '1.0.0',
    description: `
REST API untuk autentikasi dan otorisasi.

### Flow registrasi
1. \`POST /auth/signup\` → akun dibuat, OTP dikirim ke email
2. \`POST /auth/verify-otp\` → verifikasi OTP → return **accessToken + refreshToken**

### Flow login
1. \`POST /auth/login\` → return **accessToken + refreshToken + user + roles + permissions**
2. Gunakan \`accessToken\` di header: \`Authorization: Bearer <token>\`
3. Saat expired: \`POST /auth/refresh\` → dapat accessToken baru

### Rate limiting
- Login: **5 percobaan / 15 menit** per IP
- Send OTP: **3 permintaan / 10 menit** per IP
- General: **100 req / menit** per IP
    `,
    contact: {
      name:  'HR System Team',
      email: 'kangdiancp@gmail.com',
    },
  },
  servers: [
    {
      url:         `http://localhost:${config.app.port}${config.app.prefix}`,
      description: 'Local development',
    },
    {
      url:         `http://auth-service:${config.app.port}${config.app.prefix}`,
      description: 'Docker container',
    },
  ],

  // ── Reusable components ─────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type:         'http',
        scheme:       'bearer',
        bearerFormat: 'JWT',
        description:  'Masukkan access token dari response login/verify-otp',
      },
    },

    schemas: {
      // ── Request bodies ──
      SignupRequest: {
        type:     'object',
        required: ['username', 'email', 'password', 'fullName'],
        properties: {
          username: {
            type:        'string',
            minLength:   3,
            maxLength:   50,
            pattern:     '^[a-zA-Z0-9_]+$',
            example:     'john_doe',
            description: 'Hanya huruf, angka, underscore',
          },
          email: {
            type:    'string',
            format:  'email',
            example: 'john@example.com',
          },
          password: {
            type:        'string',
            minLength:   8,
            example:     'Secret123',
            description: 'Min 8 karakter, harus ada huruf besar, kecil, dan angka',
          },
          fullName: {
            type:    'string',
            example: 'John Doe',
          },
        },
      },

      LoginRequest: {
        type:     'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: {
            type:        'string',
            example:     'john_doe',
            description: 'Email atau username',
          },
          password: {
            type:    'string',
            example: 'Secret123',
          },
        },
      },

      SendOtpRequest: {
        type:     'object',
        required: ['email', 'purpose'],
        properties: {
          email: {
            type:    'string',
            format:  'email',
            example: 'john@example.com',
          },
          purpose: {
            type: 'string',
            enum: ['EMAIL_VERIFY', 'PASSWORD_RESET', 'TWO_FACTOR', 'PIN_SETUP', 'PIN_RESET'],
            example: 'EMAIL_VERIFY',
          },
        },
      },

      VerifyOtpRequest: {
        type:     'object',
        required: ['email', 'otp', 'purpose'],
        properties: {
          email: {
            type:    'string',
            format:  'email',
            example: 'john@example.com',
          },
          otp: {
            type:      'string',
            minLength: 6,
            maxLength: 6,
            pattern:   '^\\d{6}$',
            example:   '482751',
          },
          purpose: {
            type: 'string',
            enum: ['EMAIL_VERIFY', 'PASSWORD_RESET', 'TWO_FACTOR', 'PIN_SETUP', 'PIN_RESET'],
            example: 'EMAIL_VERIFY',
          },
        },
      },

      RefreshRequest: {
        type:     'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type:    'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },

      LogoutRequest: {
        type:     'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type:    'string',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },

      // ── Response objects ──
      UserObject: {
        type: 'object',
        properties: {
          userId:   { type: 'integer', example: 1001 },
          username: { type: 'string',  example: 'john_doe' },
          email:    { type: 'string',  example: 'john@example.com' },
          fullName: { type: 'string',  example: 'John Doe' },
          isActive: { type: 'boolean', example: true },
        },
      },

      RoleObject: {
        type: 'object',
        properties: {
          roleId:   { type: 'integer', example: 4 },
          roleCode: { type: 'string',  example: 'USER' },
          roleName: { type: 'string',  example: 'Regular User' },
        },
      },

      PermissionObject: {
        type: 'object',
        properties: {
          permissionCode: { type: 'string', example: 'dept:read' },
          module:         { type: 'string', example: 'DEPARTMENT' },
          action:         { type: 'string', example: 'READ' },
        },
      },

      AuthTokens: {
        type: 'object',
        properties: {
          accessToken:       { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken:      { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
          accessTokenExpiry: { type: 'string', format: 'date-time', example: '2026-01-01T10:15:00.000Z' },
        },
      },

      AuthResponse: {
        allOf: [
          { $ref: '#/components/schemas/AuthTokens' },
          {
            type: 'object',
            properties: {
              user:        { $ref: '#/components/schemas/UserObject' },
              roles:       { type: 'array', items: { $ref: '#/components/schemas/RoleObject' } },
              permissions: { type: 'array', items: { $ref: '#/components/schemas/PermissionObject' } },
            },
          },
        ],
      },

      // ── API envelope ──
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success:    { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message:    { type: 'string',  example: 'Success' },
          data:       { type: 'object' },
          errors:     { type: 'array', items: { type: 'string' }, example: [] },
          timestamp:  { type: 'string', format: 'date-time' },
        },
      },

      ErrorEnvelope: {
        type: 'object',
        properties: {
          success:    { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message:    { type: 'string',  example: 'Pesan error' },
          data:       { type: 'object',  nullable: true, example: null },
          errors:     { type: 'array',   items: { type: 'string' } },
          timestamp:  { type: 'string',  format: 'date-time' },
        },
      },
    },

    // ── Reusable responses ──────────────────────────────────
    responses: {
      Unauthorized: {
        description: '401 — Token tidak valid atau tidak ada',
        content: {
          'application/json': {
            schema:  { $ref: '#/components/schemas/ErrorEnvelope' },
            example: { success: false, statusCode: 401, message: 'Token tidak ditemukan', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' },
          },
        },
      },
      Forbidden: {
        description: '403 — Tidak punya izin',
        content: {
          'application/json': {
            schema:  { $ref: '#/components/schemas/ErrorEnvelope' },
            example: { success: false, statusCode: 403, message: 'Akses ditolak', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' },
          },
        },
      },
      ValidationError: {
        description: '422 — Validasi gagal',
        content: {
          'application/json': {
            schema:  { $ref: '#/components/schemas/ErrorEnvelope' },
            example: { success: false, statusCode: 422, message: 'Validasi gagal', data: null, errors: ['username minimal 3 karakter'], timestamp: '2026-01-01T10:00:00.000Z' },
          },
        },
      },
      TooManyRequests: {
        description: '429 — Rate limit tercapai',
        content: {
          'application/json': {
            schema:  { $ref: '#/components/schemas/ErrorEnvelope' },
            example: { success: false, statusCode: 429, message: 'Terlalu banyak percobaan login. Coba lagi 15 menit.', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' },
          },
        },
      },
    },
  },

  // ── Tags ───────────────────────────────────────────────
  tags: [
    { name: 'Registration', description: 'Signup dan verifikasi OTP' },
    { name: 'Authentication', description: 'Login, refresh, logout' },
    { name: 'User', description: 'Data user yang sedang login' },
    { name: 'Health', description: 'Status service' },
  ],

  // ── Paths ──────────────────────────────────────────────
  paths: {

    // ── HEALTH ──
    '/health': {
      get: {
        tags:    ['Health'],
        summary: 'Cek status service',
        description: 'Endpoint health check untuk Docker dan load balancer. Tidak memerlukan autentikasi.',
        responses: {
          200: {
            description: 'Service berjalan normal',
            content: {
              'application/json': {
                example: {
                  success:   true,
                  service:   'auth-service',
                  version:   '1.0.0',
                  env:       'production',
                  timestamp: '2026-01-01T10:00:00.000Z',
                  uptime:    '3600s',
                },
              },
            },
          },
        },
      },
    },

    // ── SIGNUP ──
    '/auth/signup': {
      post: {
        tags:    ['Registration'],
        summary: 'Daftar akun baru',
        description: `
Membuat akun baru dan mengirim OTP 6 digit ke email.

**Setelah signup:**
- Akun dibuat dengan \`is_active = 0\` (belum aktif)
- OTP dikirim ke email dengan masa berlaku **10 menit**
- Lanjutkan ke \`POST /auth/verify-otp\` dengan purpose \`EMAIL_VERIFY\`
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Signup berhasil, OTP dikirim ke email',
            content: {
              'application/json': {
                example: {
                  success:    true,
                  statusCode: 201,
                  message:    'Registrasi berhasil. Cek email untuk kode OTP.',
                  data: {
                    userId:  1001,
                    email:   'john@example.com',
                    message: 'OTP verifikasi telah dikirim ke john@example.com',
                  },
                  errors:    [],
                  timestamp: '2026-01-01T10:00:00.000Z',
                },
              },
            },
          },
          409: {
            description: 'Email atau username sudah terdaftar',
            content: {
              'application/json': {
                example: { success: false, statusCode: 409, message: 'Email sudah terdaftar', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' },
              },
            },
          },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── SEND OTP ──
    '/auth/send-otp': {
      post: {
        tags:    ['Registration'],
        summary: 'Kirim / resend OTP',
        description: `
Mengirim ulang OTP atau mengirim OTP untuk keperluan tertentu.

**Purpose yang tersedia:**
| Purpose | Kapan dipakai |
|---|---|
| \`EMAIL_VERIFY\` | Resend OTP verifikasi email setelah signup |
| \`PASSWORD_RESET\` | Reset password — kirim OTP ke email |
| \`TWO_FACTOR\` | OTP untuk 2FA saat login |
| \`PIN_SETUP\` | Setup PIN pertama kali |
| \`PIN_RESET\` | Reset PIN |

> OTP lama dengan purpose yang sama otomatis di-invalidate saat OTP baru dikirim.
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendOtpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP berhasil dikirim',
            content: {
              'application/json': {
                example: {
                  success:    true,
                  statusCode: 200,
                  message:    'OTP berhasil dikirim',
                  data:       { message: 'OTP baru telah dikirim ke john@example.com' },
                  errors:     [],
                  timestamp:  '2026-01-01T10:00:00.000Z',
                },
              },
            },
          },
          400: {
            description: 'Akun sudah terverifikasi (untuk EMAIL_VERIFY)',
            content: { 'application/json': { example: { success: false, statusCode: 400, message: 'Akun sudah terverifikasi', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } },
          },
          404: {
            description: 'Email tidak ditemukan',
            content: { 'application/json': { example: { success: false, statusCode: 404, message: 'Email tidak ditemukan', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } },
          },
          422: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    // ── VERIFY OTP ──
    '/auth/verify-otp': {
      post: {
        tags:    ['Registration'],
        summary: 'Verifikasi OTP',
        description: `
Memverifikasi kode OTP yang dikirim ke email.

**Jika purpose = \`EMAIL_VERIFY\`:**
- Akun diaktifkan (\`is_active = 1\`)
- Response langsung berisi **accessToken + refreshToken + user + roles + permissions**
- User tidak perlu login lagi setelah verifikasi

**Jika purpose lain (PASSWORD_RESET, dll):**
- Response hanya \`{ verified: true, userId }\`
- Lanjutkan ke endpoint selanjutnya (misal: ganti password)

**Security:**
- Max **3 percobaan** salah — OTP di-invalidate otomatis
- OTP expired setelah **10 menit**
- One-time use — tidak bisa dipakai dua kali
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP valid — untuk EMAIL_VERIFY langsung return JWT',
            content: {
              'application/json': {
                examples: {
                  email_verify: {
                    summary: 'Purpose: EMAIL_VERIFY',
                    value: {
                      success:    true,
                      statusCode: 200,
                      message:    'Akun berhasil diverifikasi',
                      data: {
                        verified:          true,
                        message:           'Akun berhasil diverifikasi',
                        user:              { userId: 1001, username: 'john_doe', email: 'john@example.com', fullName: 'John Doe', isActive: true },
                        roles:             [{ roleId: 4, roleCode: 'USER', roleName: 'Regular User' }],
                        permissions:       [{ permissionCode: 'dept:read', module: 'DEPARTMENT', action: 'READ' }],
                        accessToken:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refreshToken:      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        accessTokenExpiry: '2026-01-01T10:15:00.000Z',
                      },
                      errors:    [],
                      timestamp: '2026-01-01T10:00:00.000Z',
                    },
                  },
                  other_purpose: {
                    summary: 'Purpose lain (PASSWORD_RESET, dll)',
                    value: {
                      success:    true,
                      statusCode: 200,
                      message:    'OTP berhasil diverifikasi',
                      data:       { verified: true, message: 'OTP berhasil diverifikasi', userId: 1001 },
                      errors:     [],
                      timestamp:  '2026-01-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'OTP salah atau expired',
            content: {
              'application/json': {
                examples: {
                  wrong_otp:  { summary: 'OTP salah', value: { success: false, statusCode: 400, message: 'OTP salah. Sisa percobaan: 2', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } },
                  expired:    { summary: 'OTP expired', value: { success: false, statusCode: 400, message: 'OTP tidak valid atau sudah expired. Minta OTP baru.', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } },
                },
              },
            },
          },
          429: { description: 'Max percobaan tercapai', content: { 'application/json': { example: { success: false, statusCode: 429, message: 'Terlalu banyak percobaan. Minta OTP baru.', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── LOGIN ──
    '/auth/login': {
      post: {
        tags:    ['Authentication'],
        summary: 'Login',
        description: `
Login menggunakan email atau username + password.

**Response berisi:**
- \`accessToken\` — JWT berlaku **15 menit**, kirim di header \`Authorization: Bearer <token>\`
- \`refreshToken\` — UUID berlaku **7 hari**, simpan securely di client
- \`user\` — data profil user
- \`roles\` — daftar role yang dimiliki (untuk cache di client)
- \`permissions\` — daftar permission efektif (untuk cache di client, cek di frontend)

**Security:**
- Gagal login **5 kali** → akun dikunci **30 menit**
- Counter reset otomatis setelah login berhasil
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                with_email:    { summary: 'Login dengan email',    value: { identifier: 'john@example.com', password: 'Secret123' } },
                with_username: { summary: 'Login dengan username', value: { identifier: 'john_doe',         password: 'Secret123' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                example: {
                  success:    true,
                  statusCode: 200,
                  message:    'Login berhasil',
                  data: {
                    user:        { userId: 1001, username: 'john_doe', email: 'john@example.com', fullName: 'John Doe', isActive: true },
                    roles:       [{ roleId: 4, roleCode: 'USER', roleName: 'Regular User' }],
                    permissions: [
                      { permissionCode: 'dept:read',     module: 'DEPARTMENT', action: 'READ' },
                      { permissionCode: 'employee:read', module: 'EMPLOYEE',   action: 'READ' },
                    ],
                    accessToken:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken:      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    accessTokenExpiry: '2026-01-01T10:15:00.000Z',
                  },
                  errors:    [],
                  timestamp: '2026-01-01T10:00:00.000Z',
                },
              },
            },
          },
          401: { description: 'Credential salah', content: { 'application/json': { example: { success: false, statusCode: 401, message: 'Email/username atau password salah', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
          403: { description: 'Akun belum diverifikasi', content: { 'application/json': { example: { success: false, statusCode: 403, message: 'Akun belum diverifikasi. Cek email untuk kode OTP.', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
          423: { description: 'Akun dikunci karena terlalu banyak gagal login', content: { 'application/json': { example: { success: false, statusCode: 423, message: 'Akun terkunci hingga 01/01/2026 10:30:00. Terlalu banyak percobaan login gagal.', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
          422: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    // ── REFRESH ──
    '/auth/refresh': {
      post: {
        tags:    ['Authentication'],
        summary: 'Refresh access token',
        description: `
Mendapatkan access token baru menggunakan refresh token.

- Refresh token lama di-revoke otomatis
- Response berisi **accessToken + refreshToken baru** (token rotation)
- Roles dan permissions di-fetch ulang dari DB — selalu up to date
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token berhasil diperbarui',
            content: {
              'application/json': {
                example: {
                  success:    true,
                  statusCode: 200,
                  message:    'Token berhasil diperbarui',
                  data: {
                    user:              { userId: 1001, username: 'john_doe', email: 'john@example.com', fullName: 'John Doe', isActive: true },
                    roles:             [{ roleId: 4, roleCode: 'USER', roleName: 'Regular User' }],
                    permissions:       [{ permissionCode: 'dept:read', module: 'DEPARTMENT', action: 'READ' }],
                    accessToken:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken:      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                    accessTokenExpiry: '2026-01-01T10:15:00.000Z',
                  },
                  errors:    [],
                  timestamp: '2026-01-01T10:00:00.000Z',
                },
              },
            },
          },
          401: { description: 'Refresh token tidak valid atau expired', content: { 'application/json': { example: { success: false, statusCode: 401, message: 'Refresh token tidak valid atau sudah expired', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── LOGOUT ──
    '/auth/logout': {
      post: {
        tags:        ['Authentication'],
        summary:     'Logout',
        description: 'Revoke semua token user (access JTI + refresh token). Token yang sudah di-revoke tidak bisa dipakai lagi meskipun belum expired.',
        security:    [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LogoutRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Logout berhasil',
            content: {
              'application/json': {
                example: { success: true, statusCode: 200, message: 'Logout berhasil', data: { message: 'Logout berhasil' }, errors: [], timestamp: '2026-01-01T10:00:00.000Z' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ── ME ──
    '/auth/me': {
      get: {
        tags:        ['User'],
        summary:     'Ambil data user yang sedang login',
        description: 'Mengembalikan profil lengkap user beserta roles dan permissions. Berguna untuk:\n- Cache data user di client setelah login\n- Verifikasi permission di frontend\n- Refresh data user tanpa re-login',
        security:    [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Data user berhasil diambil',
            content: {
              'application/json': {
                example: {
                  success:    true,
                  statusCode: 200,
                  message:    'Data user berhasil diambil',
                  data: {
                    user: {
                      userId:            1001,
                      username:          'john_doe',
                      email:             'john@example.com',
                      fullName:          'John Doe',
                      phoneNumber:       '08123456789',
                      profilePictureUrl: null,
                      isActive:          true,
                      createdAt:         '2026-01-01T08:00:00.000Z',
                    },
                    roles:       [{ roleId: 4, roleCode: 'USER', roleName: 'Regular User' }],
                    permissions: [
                      { permissionCode: 'dept:read',     module: 'DEPARTMENT', action: 'READ' },
                      { permissionCode: 'employee:read', module: 'EMPLOYEE',   action: 'READ' },
                      { permissionCode: 'report:read',   module: 'REPORT',     action: 'READ' },
                    ],
                  },
                  errors:    [],
                  timestamp: '2026-01-01T10:00:00.000Z',
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'User tidak ditemukan', content: { 'application/json': { example: { success: false, statusCode: 404, message: 'User tidak ditemukan', data: null, errors: [], timestamp: '2026-01-01T10:00:00.000Z' } } } },
        },
      },
    },

  }, // end paths
};

// ── Options untuk swagger-jsdoc ──────────────────────────
const options = {
  definition: swaggerDefinition,
  apis:       [], // kita pakai inline definition, bukan JSDoc comment
};

const swaggerSpec = swaggerJsdoc(options);

// ── Setup function — dipanggil di app.js ─────────────────
const setupSwagger = (app) => {
  const isDev = config.app.env !== 'production';

  // Hanya aktif di non-production (atau bisa di-override via env)
  if (!isDev && process.env.SWAGGER_ENABLED !== 'true') {
    console.log('ℹ️  Swagger dinonaktifkan di production. Set SWAGGER_ENABLED=true untuk mengaktifkan.');
    return;
  }

  const swaggerPath = '/api-docs';

  app.use(
    swaggerPath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Auth Service API',
      customCss: `
        .swagger-ui .topbar { background-color: #1a1a2e; }
        .swagger-ui .topbar .link { display: none; }
        .swagger-ui .info .title { color: #1a1a2e; }
      `,
      swaggerOptions: {
        persistAuthorization: true,   // token tidak hilang saat refresh halaman
        displayRequestDuration: true, // tampilkan response time
        filter: true,                 // enable search filter
        tryItOutEnabled: true,        // langsung bisa try dari UI
      },
    })
  );

  // Endpoint untuk download raw JSON spec (berguna untuk Postman import)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  console.log(`📚 Swagger UI  : http://localhost:${config.app.port}${swaggerPath}`);
  console.log(`📄 OpenAPI JSON: http://localhost:${config.app.port}/api-docs.json`);
};

module.exports = { setupSwagger, swaggerSpec };
