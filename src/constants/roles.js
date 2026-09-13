const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  VERIFIER: 'verifier',
  ADMIN: 'admin',
});

module.exports = { ROLES, ROLE_VALUES: Object.values(ROLES) };
