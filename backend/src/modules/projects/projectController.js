const Project = require('./Project');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with dummy keys (or from env)
// For a real production app these should be strictly in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret'
});

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

// BONUS: POST /api/projects/:id/files — Upload files
exports.uploadFiles = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Multer populates req.files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const host = req.get('host'); // e.g., localhost:5003
    const protocol = req.protocol; // http or https

    const newFiles = req.files.map(file => ({
      filename: file.originalname,
      // Create an absolute URL pointing to the static /uploads directory
      url: `${protocol}://${host}/uploads/${file.filename}`,
      uploadedBy: uid(req),
      uploadedAt: new Date()
    }));

    project.files.push(...newFiles);
    await project.save();
    res.status(201).json(project.files);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// BONUS: PUT /api/projects/:id/payments — Add a payment ledger entry (Admin only)
exports.addPayment = async (req, res) => {
  try {
    // Only Admin handles finances in this system manually
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Admin access required for manual payments' });
    
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { amount, method, notes, totalAmount } = req.body;
    
    // Optionally update the overall expected total
    if (totalAmount !== undefined) {
      project.totalAmount = Number(totalAmount);
    }

    if (amount && Number(amount) > 0) {
      project.paymentHistory.push({
        amount: Number(amount),
        method: method || 'bank_transfer',
        notes: notes || '',
        date: new Date()
      });
      project.amountPaid += Number(amount);
    }

    // Auto-calculate payment status
    if (project.totalAmount > 0) {
      if (project.amountPaid >= project.totalAmount) {
        project.paymentStatus = 'paid';
      } else if (project.amountPaid > 0) {
        project.paymentStatus = 'partially_paid';
      } else {
        project.paymentStatus = 'unpaid';
      }
    }

    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PHASE 8: POST /api/projects/:id/razorpay-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const balanceDue = Math.max(0, project.totalAmount - project.amountPaid);
    if (balanceDue <= 0) return res.status(400).json({ message: 'Project is already fully paid' });

    // DUMMY RESPONSES ONLY for testing the UI flow.
    // In production, we'd use: await razorpay.orders.create(options)
    const mockedOrder = {
      id: `order_dummy_${crypto.randomBytes(6).toString('hex')}`,
      entity: "order",
      amount: balanceDue * 100, // e.g., $100 -> 10000 paise/cents
      amount_paid: 0,
      amount_due: balanceDue * 100,
      currency: "INR",
      receipt: `receipt_proj_${project._id}`,
      status: "created",
      attempts: 0,
      notes: []
    };

    res.json(mockedOrder);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PHASE 8: POST /api/projects/:id/razorpay-verify
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // DUMMY VERIFICATION ONLY: Accept any "payment" from dummy flow
    // In production, verify the crypto signature here matching razorpay's standard
    const isAuthentic = true; 

    if (isAuthentic) {
      const paymentAmount = Number(amount); 
      
      project.paymentHistory.push({
        amount: paymentAmount,
        method: 'razorpay',
        notes: `Online Payment (Txn: ${razorpay_payment_id || 'dummy_txn'})`,
        date: new Date()
      });
      project.amountPaid += paymentAmount;

      if (project.amountPaid >= project.totalAmount) {
        project.paymentStatus = 'paid';
      } else if (project.amountPaid > 0) {
        project.paymentStatus = 'partially_paid';
      }

      await project.save();
      res.json({ message: 'Payment verified successfully (Mocked)', project });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};

