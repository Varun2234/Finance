import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import User from "../models/user";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await hash(password, saltRounds);

    // Create user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

export default {
  register,
  login
};