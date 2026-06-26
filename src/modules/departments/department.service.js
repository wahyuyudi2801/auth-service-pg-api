const AppError = require('../../shared/utils/AppError');
const DepartmentRepository = require('./department.repository');

const DepartmentService = {

    async getAll(query = {}) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(100, parseInt(query.limit) || 10);
        const search = query.search?.trim() || undefined;
        const locationId = query.location_id
            ? parseInt(query.location_id)
            : undefined;

        return DepartmentRepository.findAll({ page, limit, search, locationId });
    },

    async getById(departmentId) {
        const dept = await DepartmentRepository.findById(departmentId);
        if (!dept)
            throw new AppError(`Department dengan ID ${departmentId} tidak ditemukan`, 404);
        return dept;
    },

    async create(data) {
        const { department_name, location_id } = data;

        const errors = [];
        if (!department_name?.trim())
            errors.push('department_name wajib diisi');
        if (department_name?.trim().length > 30)
            errors.push('department_name maksimal 30 karakter');
        if (location_id !== undefined && location_id !== null && isNaN(Number(location_id)))
            errors.push('location_id harus berupa angka');

        if (errors.length > 0)
            throw new AppError('Validasi gagal', 422, errors);

        return DepartmentRepository.create({
            departmentName: department_name.trim(),
            locationId: location_id ? Number(location_id) : null,
        });
    },

    async update(departmentId, data) {
        await this.getById(departmentId);

        const { department_name, location_id } = data;

        const errors = [];
        if (department_name !== undefined) {
            if (!department_name?.trim())
                errors.push('department_name tidak boleh kosong');
            if (department_name?.trim().length > 30)
                errors.push('department_name maksimal 30 karakter');
        }
        if (location_id !== undefined && location_id !== null && isNaN(Number(location_id)))
            errors.push('location_id harus berupa angka');

        if (errors.length > 0)
            throw new AppError('Validasi gagal', 422, errors);

        const updated = await DepartmentRepository.update(departmentId, {
            departmentName: department_name?.trim(),
            locationId: location_id !== undefined
                ? (location_id ? Number(location_id) : null)
                : undefined,
        });

        if (!updated)
            throw new AppError('Gagal udpate department', 500);

        return updated;
    },

    async remove(departmentId) {
        await this.getById(departmentId);
        await DepartmentRepository.remove(departmentId);
        return { deleted_id: departmentId };
    },
};

module.exports = DepartmentService;