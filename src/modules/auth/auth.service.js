const argon2 = require('argon2');
const { v4: uuid } = require('uuid');
const config = require('../../../config');
const AppError = require('../../shared/utils/AppError');
const tokenHelper = require('../../shared/utils/tokenHelper');
const emailService = require('../../shared/utils/emailService');
const AuthRepository = require('./auth.repository');

//Helpers

const generateOtp = () => {
  const len = config.otp.length;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const otpExpiresAt = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + config.otp.expiryMinutes);
  return d;
};

const refreshExpiresAt = () => {
  const d = new Date();
  const str = config.jwt.refreshExpiresIn;
  const num = parseInt(str);
  if (str.endsWith('d')) d.setDate(d.getDate() + num);
  if (str.endsWith('h')) d.setHours(d.getHours() + num);
  return d;
};

const parseExpiry = (str) => {
  const num = parseInt(str);
  if (str.endsWith('m')) return num * 60 * 1000;
  if (str.endsWith('h')) return num * 60 * 60 * 1000;
  if (str.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  return 15 * 60 * 1000;
};

// Build JWT payload dari Sequelize model instances
const buildJwtPayload = (user, roles, permissions) => ({
  sub: user.user_id,
  username: user.username,
  email: user.email,
  fullName: user.full_name,
  roles: roles.map(r => r.role_code),
  permissions: permissions.map(p => p.permission_code),
});

// Build response JSON untuk login / verify OTP
const buildAuthResponse = (user, roles, permissions, accessToken, refreshToken) => ({
  user: {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    isActive: user.is_active,
  },
  roles: roles.map(r => ({
    roleId: r.role_id,
    roleCode: r.role_code,
    roleName: r.role_name,
  })),
  permissions: permissions.map(p => ({
    permissionCode: p.permission_code,
    module: p.module,
    action: p.action,
  })),
  accessToken,
  refreshToken,
  accessTokenExpiry: new Date(Date.now() + parseExpiry(config.jwt.accessExpiresIn)).toISOString(),
});


const AuthService = {

  //SIGNUP
  async signup({ username, email, password, fullName }, meta = {}) {
    const [existEmail, existUsername] = await Promise.all([
      AuthRepository.findByEmail(email),
      AuthRepository.findByUsername(username),
    ]);
    if (existEmail) throw new AppError('Email sudah terdaftar', 409);
    if (existUsername) throw new AppError('Username sudah dipakai', 409);

    const passwordHash = await argon2.hash(password, config.argon2);
    const userId = await AuthRepository.createUser({ username, email, passwordHash, fullName });

    await AuthRepository.assignDefaultRole(userId);

    const otp = generateOtp();
    const otpHash = await argon2.hash(otp, { ...config.argon2, memoryCost: 19456, timeCost: 2 });
    await AuthRepository.createOtp({ userId, otpHash, purpose: 'EMAIL_VERIFY', expiresAt: otpExpiresAt() });
    await emailService.sendOtp({ to: email, username, otp, purpose: 'EMAIL_VERIFY' });

    await AuthRepository.createAuditLog({
      userId, action: 'REGISTER', status: 'SUCCESS',
      ipAddress: meta.ip, userAgent: meta.userAgent,
      detail: `User ${username} registered`,
    });

    return { userId, email, message: `OTP verifikasi telah dikirim ke ${email}` };
  },

  // SEND OTP
  async sendOtp({ email, purpose }, meta = {}) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new AppError('Email tidak ditemukan', 404);

    if (purpose === 'EMAIL_VERIFY' && user.is_active)
      throw new AppError('Akun sudah terverifikasi', 400);

    const otp = generateOtp();
    const otpHash = await argon2.hash(otp, { ...config.argon2, memoryCost: 19456, timeCost: 2 });
    await AuthRepository.createOtp({ userId: user.user_id, otpHash, purpose, expiresAt: otpExpiresAt() });
    await emailService.sendOtp({ to: user.email, username: user.username, otp, purpose });

    return { message: `OTP baru telah dikirim ke ${email}` };
  },

  //VERIFY OTP
  async verifyOtp({ email, otp, purpose }, meta = {}) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new AppError('Email tidak ditemukan', 404);

    const otpRecord = await AuthRepository.findActiveOtp(user.user_id, purpose);
    if (!otpRecord)
      throw new AppError('OTP tidak valid atau sudah expired. Minta OTP baru.', 400);

    if (otpRecord.attempts >= otpRecord.max_attempts) {
      await AuthRepository.markOtpUsed(otpRecord.otp_id);
      throw new AppError('Terlalu banyak percobaan. Minta OTP baru.', 429);
    }

    const valid = await argon2.verify(otpRecord.otp_hash, otp);
    if (!valid) {
      await AuthRepository.incrementOtpAttempts(otpRecord.otp_id);
      const remaining = otpRecord.max_attempts - (otpRecord.attempts + 1);
      throw new AppError(`OTP salah. Sisa percobaan: ${remaining}`, 400);
    }

    await AuthRepository.markOtpUsed(otpRecord.otp_id);

    if (purpose === 'EMAIL_VERIFY') {
      await AuthRepository.activateUser(user.user_id);
      const { roles, permissions } = await AuthRepository.getUserRolesAndPermissions(user.user_id);
      const payload = buildJwtPayload({ ...user.toJSON(), is_active: true }, roles, permissions);
      const accessToken = tokenHelper.signAccess(payload);
      const refreshToken = uuid();
      const decoded = tokenHelper.decode(accessToken);

      await Promise.all([
        AuthRepository.saveToken({
          userId: user.user_id, tokenType: 'ACCESS_JTI',
          tokenValue: decoded.jti, expiresAt: new Date(decoded.exp * 1000), ipAddress: meta.ip,
        }),
        AuthRepository.saveToken({
          userId: user.user_id, tokenType: 'REFRESH',
          tokenValue: refreshToken, expiresAt: refreshExpiresAt(),
          deviceInfo: meta.userAgent, ipAddress: meta.ip,
        }),
      ]);

      await AuthRepository.createAuditLog({
        userId: user.user_id, action: 'EMAIL_VERIFY', status: 'SUCCESS',
        ipAddress: meta.ip, detail: 'Email berhasil diverifikasi',
      });

      return {
        verified: true,
        message: 'Akun berhasil diverifikasi',
        ...buildAuthResponse(
          { ...user.toJSON(), is_active: true },
          roles, permissions, accessToken, refreshToken
        ),
      };
    }

    return { verified: true, message: 'OTP berhasil diverifikasi', userId: user.user_id };
  },

  // LOGIN
  async login({ identifier, password }, meta = {}) {
    const user = identifier.includes('@')
      ? await AuthRepository.findByEmail(identifier)
      : await AuthRepository.findByUsername(identifier);

    const INVALID = 'Email/username atau password salah';
    if (!user) throw new AppError(INVALID, 401);

    if (!user.is_active)
      throw new AppError('Akun belum diverifikasi. Cek email untuk kode OTP.', 403);

    if (user.locked_until && new Date(user.locked_until) > new Date())
      throw new AppError(
        `Akun terkunci hingga ${new Date(user.locked_until).toLocaleString('id-ID')}.`,
        423
      );

    const valid = await argon2.verify(user.password_hash, password);

    if (!valid) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      const shouldLock = newAttempts >= config.lockout.maxFailedAttempts;
      const lockoutAt = shouldLock
        ? new Date(Date.now() + config.lockout.lockMinutes * 60 * 1000)
        : null;

      await AuthRepository.incrementFailedAttempts(user.user_id, lockoutAt);
      await AuthRepository.createAuditLog({
        userId: user.user_id, action: 'LOGIN', status: 'FAILED',
        ipAddress: meta.ip, userAgent: meta.userAgent,
        detail: `Attempt ${newAttempts}/${config.lockout.maxFailedAttempts}`,
      });

      if (shouldLock)
        throw new AppError(
          `Akun dikunci ${config.lockout.lockMinutes} menit karena terlalu banyak percobaan gagal.`,
          423
        );

      throw new AppError(INVALID, 401);
    }

    await AuthRepository.resetFailedAttempts(user.user_id, meta.ip);
    const { roles, permissions } = await AuthRepository.getUserRolesAndPermissions(user.user_id);
    const payload = buildJwtPayload(user.toJSON(), roles, permissions);
    const accessToken = tokenHelper.signAccess(payload);
    const refreshToken = uuid();
    const decoded = tokenHelper.decode(accessToken);

    await Promise.all([
      AuthRepository.saveToken({
        userId: user.user_id, tokenType: 'ACCESS_JTI',
        tokenValue: decoded.jti, expiresAt: new Date(decoded.exp * 1000), ipAddress: meta.ip,
      }),
      AuthRepository.saveToken({
        userId: user.user_id, tokenType: 'REFRESH',
        tokenValue: refreshToken, expiresAt: refreshExpiresAt(),
        deviceInfo: meta.userAgent, ipAddress: meta.ip,
      }),
    ]);

    await AuthRepository.createAuditLog({
      userId: user.user_id, action: 'LOGIN', status: 'SUCCESS',
      ipAddress: meta.ip, userAgent: meta.userAgent,
      detail: `Login dari ${meta.ip || 'unknown'}`,
    });

    return buildAuthResponse(user.toJSON(), roles, permissions, accessToken, refreshToken);
  },

  //REFRESH TOKEN
  async refreshToken({ refreshToken }, meta = {}) {
    const tokenRecord = await AuthRepository.findRefreshToken(refreshToken);
    if (!tokenRecord)
      throw new AppError('Refresh token tidak valid atau sudah expired', 401);

    const user = await AuthRepository.findUserById(tokenRecord.user_id);
    if (!user || !user.is_active)
      throw new AppError('Akun tidak aktif', 403);

    const { roles, permissions } = await AuthRepository.getUserRolesAndPermissions(user.user_id);
    await AuthRepository.revokeToken(refreshToken, 'REFRESH');

    const payload = buildJwtPayload(user.toJSON(), roles, permissions);
    const newAccessToken = tokenHelper.signAccess(payload);
    const newRefreshToken = uuid();
    const decoded = tokenHelper.decode(newAccessToken);

    await Promise.all([
      AuthRepository.saveToken({
        userId: user.user_id, tokenType: 'ACCESS_JTI',
        tokenValue: decoded.jti, expiresAt: new Date(decoded.exp * 1000), ipAddress: meta.ip,
      }),
      AuthRepository.saveToken({
        userId: user.user_id, tokenType: 'REFRESH',
        tokenValue: newRefreshToken, expiresAt: refreshExpiresAt(), ipAddress: meta.ip,
      }),
    ]);

    await AuthRepository.createAuditLog({
      userId: user.user_id, action: 'TOKEN_REFRESH', status: 'SUCCESS', ipAddress: meta.ip,
    });

    return buildAuthResponse(user.toJSON(), roles, permissions, newAccessToken, newRefreshToken);
  },

  //LOGOUT
  async logout({ userId, jti, refreshToken }, meta = {}) {
    await AuthRepository.revokeAllUserTokens(userId, 'LOGOUT');
    await AuthRepository.createAuditLog({
      userId, action: 'LOGOUT', status: 'SUCCESS', ipAddress: meta.ip,
    });
    return { message: 'Logout berhasil' };
  },

  //ME
  async me(userId) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new AppError('User tidak ditemukan', 404);

    const { roles, permissions } = await AuthRepository.getUserRolesAndPermissions(userId);

    return {
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        profilePictureUrl: user.profile_picture_url,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
      roles: roles.map(r => ({
        roleId: r.role_id, roleCode: r.role_code, roleName: r.role_name,
      })),
      permissions: permissions.map(p => ({
        permissionCode: p.permission_code, module: p.module, action: p.action,
      })),
    };
  },
};

module.exports = AuthService;
