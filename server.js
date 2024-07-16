const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const app = express();
const port = process.env.PORT || 5000;
const url = 'mongodb://localhost:27017/';
const dbName = 'workspace_management';
const jwtSecret = 'your_jwt_secret'; // Change this to a secure random string

// Middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/resource', express.static(path.join(__dirname, 'resource')));


// Mongoose connection
mongoose.connect(url + dbName, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected successfully to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// User Schema and Model
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
    console.log('user registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
    console.log('error in register');
  }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Invalid email or password');
      }
      let redirectUrl = '/user'; // Default redirect URL
      if (email === 'hiten@gmail.com') {
        redirectUrl = '/admin'; // Redirect to admin page if email matches
      }
      const token = jwt.sign({ userId: user._id }, jwtSecret);
      res.send({ token, redirectUrl });
      console.log('Login successful:', email);
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Error logging in');
    }
  });

  const UserProfile = mongoose.model('UserProfile', new mongoose.Schema({
    name: String,
    email: String,
    contactNumber: Number
  }, { collection: 'user_profile' }));

// Serve index.html for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
  });

  app.post('/api/data-change', async (req, res) => {
    const { name, email, number } = req.body;
    try {
      const user = await UserProfile.findOneAndUpdate(
        { email: email },
        { name: name, contactNumber: number },
        { new: true, upsert: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json(user);
    } catch (err) {
      console.error('Error updating user data:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  //***********************************assets management  */
  const classroomSchema = new mongoose.Schema({
    classId: { type: String, required: true },
    assets: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ]
});

const Classroom = mongoose.model('Classroom', classroomSchema);

app.post('/api/assets', async (req, res) => {
    try {
        const { classId, name, quantity } = req.body;
        let classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            classroom = new Classroom({ classId, assets: [] });
        }
        const assetIndex = classroom.assets.findIndex(asset => asset.name === name);
        if (assetIndex > -1) {
            classroom.assets[assetIndex].quantity = quantity;
        } else {
            classroom.assets.push({ name, quantity });
        }
        await classroom.save();
        res.json({ message: 'Asset added/updated successfully', classroom });
    } catch (error) {
        console.error('Error adding/updating asset:', error);
        res.status(500).send('Error adding/updating asset');
    }
});

// Endpoint to get all assets for a class
app.get('/api/assets', async (req, res) => {
    try {
        const { classId } = req.query;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom.assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).send('Error fetching assets');
    }
});

// Endpoint to delete an asset
app.delete('/api/assets', async (req, res) => {
    try {
        const { classId, name } = req.body;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        classroom.assets = classroom.assets.filter(asset => asset.name !== name);
        await classroom.save();
        res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).send('Error deleting asset');
    }
});

// Endpoint to clear all assets for a class
app.post('/api/assets/clear', async (req, res) => {
    try {
        const { classId } = req.body;
        const classroom = await Classroom.findOne({ classId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        classroom.assets = [];
        await classroom.save();
        res.json({ message: 'All assets cleared successfully' });
    } catch (error) {
        console.error('Error clearing assets:', error);
        res.status(500).send('Error clearing assets');
    }
});

  
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
//********************************************retriving user number************** */
app.get('/api/user-profile', async (req, res) => {
    try {
        // Fetch user profile data from MongoDB
        const userProfile = await UserProfile.findOne({ email: req.user.email }); // Replace with your logic to fetch the user profile

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Return user profile data
        return res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});