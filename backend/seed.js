require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const Project = require('./models/Project');
  const Task = require('./models/Task');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  const admin = await User.create({
    name: 'Admin User', email: 'admin@test.com',
    password: 'Admin@123456', role: 'admin'
  });
  const member = await User.create({
    name: 'John Member', email: 'member@test.com',
    password: 'Member@123456', role: 'member'
  });
  const project = await Project.create({
    title: 'Q4 Product Launch',
    description: 'Launch new features for Q4',
    members: [admin._id, member._id],
    createdBy: admin._id
  });
  await Task.create([
    { title: 'Design new homepage', project: project._id,
      assignedTo: member._id, status: 'todo', priority: 'high',
      dueDate: new Date(Date.now() + 86400000), createdBy: admin._id },
    { title: 'Fix payment bug', project: project._id,
      assignedTo: admin._id, status: 'in-progress', priority: 'high',
      dueDate: new Date(Date.now() - 86400000), createdBy: admin._id },
    { title: 'Write unit tests', project: project._id,
      assignedTo: member._id, status: 'done', priority: 'medium',
      dueDate: new Date(Date.now() + 86400000), createdBy: admin._id }
  ]);
  console.log('✅ Seed done! Login: admin@test.com / Admin@123456');
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
