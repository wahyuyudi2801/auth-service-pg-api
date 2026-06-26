const { Op } = require('sequelize');

const getModel = () => require('../../shared/utils/models').departments;
const getLocModel = () => require('../../shared/utils/models').locations;
const getEmpModel = () => require('../../shared/utils/models').employees;


const DepartmentRepository = {

    async findAll({ page = 1, limit = 10, search, locationId } = {}) {
        const Department = getModel();
        const Location = getLocModel();

        const where = {};
        if (locationId) where.location_id = locationId;
        if (search) {
            where.department_name = { [Op.iLike]: `%${search}%` };
        }

        const offset = (page - 1) * limit;

        const { rows, count } = await Department.findAndCountAll({
            where,
            limit,
            offset,
            order: [['department_id', 'ASC']],
            include: [
                {
                    model: Location,
                    as: 'location',
                    required: false,
                    attributes: ['location_id', 'street_address', 'city', 'country_id'],
                },
            ],
        });

        return {
            data: rows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
                hasNext: page < Math.ceil(count / limit),
                hasPrev: page > 1,
            },
        };
    },

    async findById(departmentId) {
        const Department = getModel();
        const Location = getLocModel();
        const Employee = getEmpModel();

        return Department.findOne({
            where: { department_id: departmentId },
            include: [
                {
                    model: Location,
                    as: 'location',
                    required: false,
                    attributes: ['location_id', 'street_address', 'city', 'country_id'],
                },
                {
                    model: Employee,
                    as: 'employees',
                    required: false,
                    attributes: ['employee_id', 'first_name', 'last_name', 'job_id', 'email'],
                },
            ],
        });
    },

    async create({ departmentName, locationId }) {
        const Department = getModel();

        const dept = await Department.create({
            department_name: departmentName,
            location_id: locationId || null,
        });

        return this.findById(dept.department_id);
    },

    async update(departmentId, { departmentName, locationId }) {
        const Department = getModel();

        const updateData = {};
        if (departmentName !== undefined) updateData.department_name = departmentName;
        if (locationId !== undefined) updateData.location_id = locationId;

        const [affectedRows] = await Department.update(updateData, {
            where: { department_id: departmentId },
        });

        if (affectedRows === 0) return null;

        return this.findById(departmentId);
    },

    async remove(departmentId) {
        const Department = getModel();

        const affectedRows = await Department.destroy({
            where: { department_id: departmentId },
        });

        return affectedRows > 0;
    },
};

module.exports = DepartmentRepository;