const db = require("../models");
const Course = db.course;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: courses } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, courses, totalPages, currentPage };
  };


// Create and Save a new Course
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can NOT be empty!"
        });
        return;
    }

    // Create a Course
    const course = {
        id: req.body.id,
        dept: req.body.dept,
        course_number: req.body.course_number,
        level: req.body.level,
        hours: req.body.hours,
        name: req.body.name,
        description: req.body.description,
        when_off: req.body.when_off
    };

    // Save Course in the database
    Course.create(course)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Course."
        });
    });
};

// Retrieve all Courses from the database.
exports.findAll = (req, res) => {
    const { page, size, dept } = req.query;
    var condition = dept ? { dept: { [Op.like]: `%${dept}%` } } : null;

    const {limit, offset } = getPagination(page, size);

    Course.findAndCountAll({where: condition, limit:limit, offset:offset })
    
    .then(data => {

        const response = getPagingData(data, page, limit);
        res.send(response);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving courses."
        });
    });
    
};

// Find a single Course with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Course.findByPk(id)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: "Error retrieving Course with id=" + id
        });
    });
};

// Update a Course by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Course.update(req.body, {
        where: {
            id: id
        }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "Course was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Course with id=${id}. Maybe Course was not found or req.body is empty!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Error updating Course with id=" + id
        });
    });
};

// Delete a Course with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Course.destroy({
        where: {
            id: id
        }
    })
    .then(num => {
        if (num == 1) {
            res.send({
                message: "Course was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Course with id=${id}. Maybe Course was not found!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Could not delete Course with id=" + id
        });
    });
};

// Delete all Courses from the database.
exports.deleteAll = (req, res) => {
    Course.destroy({
        where: {},
        truncate: false
    })
    .then(nums => {
        res.send({
            message: `${nums} Courses were deleted successfully!`
        });
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while removing all courses."
        });
    });
};