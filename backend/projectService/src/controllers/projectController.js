const Project = require('../models/Project');

const role = (req) => req.headers['x-user-role'];
const uid  = (req) => req.headers['x-user-id'];

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    if (role(req) === 'employee') query = { assignedEmployees: uid(req) };
    if (role(req) === 'client')   query = { client: uid(req) };
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/projects — Admin only
exports.createProject = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/projects/:id — Admin (full edit) / Employee (status only)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (role(req) === 'employee') {
      // Employees can only update status, and only if assigned
      const isAssigned = project.assignedEmployees.map(String).includes(uid(req));
      if (!isAssigned) return res.status(403).json({ message: 'Not assigned to this project' });
      if (!req.body.status) return res.status(400).json({ message: 'Only status can be updated' });
      project.status = req.body.status;
    } else if (role(req) === 'admin') {
      const { name, description, client, status, serviceRequest } = req.body;
      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      if (client) project.client = client;
      if (status) project.status = status;
      if (serviceRequest) project.serviceRequest = serviceRequest;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/projects/:id/assign — Admin only
exports.assignEmployees = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { employeeIds } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { assignedEmployees: employeeIds },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/projects/:id — Admin only
exports.deleteProject = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
