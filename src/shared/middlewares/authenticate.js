const tokenHelper = require('../utils/tokenHelper');
const AppError = require('../utils/AppError');
const { sequelize } = require('../utils/db');
const { QueryTypes } = require('sequelize');

/**
 * authenticate — verifikasi JWT access token
 * Set req.user = { sub, username, email, roles[], permissions[], jti }
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      throw new AppError('Token tidak ditemukan', 401);

    const token = header.split(' ')[1];
    const decoded = tokenHelper.verifyAccess(token);

    // Cek apakah JTI sudah di-revoke (logout / password change)
    const revoked = await sequelize.query(
      `SELECT COUNT(*) AS CNT
       FROM   account.user_tokens
       WHERE  token_value = :jti
         AND  token_type  = 'ACCESS_JTI'
         AND  is_revoked  = true`,
      {
        replacements: { jti: decoded.jti },
        type: QueryTypes.SELECT
      }
    );
    
    if (revoked[0].CNT > 0)
      throw new AppError('Token sudah tidak valid, silakan login ulang', 401);

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return next(new AppError('Token sudah expired', 401));
    if (err.name === 'JsonWebTokenError')
      return next(new AppError('Token tidak valid', 401));
    next(err);
  }
};

module.exports = authenticate;
