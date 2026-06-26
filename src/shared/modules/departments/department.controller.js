const DepartmentService = require('./department.service');
const response          = require('../../shared/utils/response');

const DepartmentController = {

  // GET /departments?page=1&limit=10&search=sales&location_id=1
  async index(req, res, next) {
    try {
      const { data, pagination } = await DepartmentService.getAll(req.query);
      response.success(res, { data, pagination }, 'Data department berhasil diambil');
    } catch (e) { next(e); }
  },

  // GET /departments/:id  — include location + employees
  async show(req, res, next) {
    try {
      const data = await DepartmentService.getById(Number(req.params.id));
      response.success(res, data, 'Detail department berhasil diambil');
    } catch (e) { next(e); }
  },

  // POST /departments
  async store(req, res, next) {
    try {
      const data = await DepartmentService.create(req.body);
      response.success(res, data, 'Department berhasil dibuat', 201);
    } catch (e) { next(e); }
  },

  // PUT /departments/:id
  async update(req, res, next) {
    try {
      const data = await DepartmentService.update(Number(req.params.id), req.body);
      response.success(res, data, 'Department berhasil diupdate');
    } catch (e) { next(e); }
  },

  // DELETE /departments/:id
  async destroy(req, res, next) {
    try {
      const data = await DepartmentService.remove(Number(req.params.id));
      response.success(res, data, 'Department berhasil dihapus');
    } catch (e) { next(e); }
  },
};

module.exports = DepartmentController;