import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Fallback in-memory user registry for instant admin synchronization
const inMemoryUsers = [
  { id: 1, name: 'Admin User', email: 'admin@jalyn.com', phone: '+91 98765 43210', role: 'admin', created_at: new Date().toISOString().split('T')[0] },
];

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  try {
    let user = null;
    let isMatch = false;

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        user = rows[0];
        isMatch = await bcrypt.compare(password, user.password);
      }
    } catch (dbErr) {
      console.warn('DB query failed in login, falling back to default admin check:', dbErr.message);
    }

    // Default super admin check fallback if DB table not seeded
    if (!user && email === 'admin@jalyn.com' && password === 'admin123') {
      user = {
        id: 1,
        name: 'Super Admin',
        email: 'admin@jalyn.com',
        role: 'superadmin',
      };
      isMatch = true;
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length > 0) {
      return res.json({
        success: true,
        user: rows[0],
      });
    }
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.json({
      success: true,
      user: req.user,
    });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide full name, email address, and password.',
    });
  }

  const assignedRole = role || 'customer';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUserId = Date.now();

    try {
      const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      if (phone) {
        const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'An account with this phone number already exists. Please check or use another number.',
          });
        }
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, hashedPassword, assignedRole]
      );
      newUserId = result.insertId;
    } catch (dbErr) {
      console.warn('DB insert in register fallback:', dbErr.message);
      // Ensure we don't proceed with in-memory registration if email exists in memory fallback
      if (inMemoryUsers.some((u) => u.email === email)) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      if (phone && inMemoryUsers.some((u) => u.phone === phone)) {
        return res.status(400).json({
          success: false,
          message: 'An account with this phone number already exists.',
        });
      }
    }

    // Sync newly registered user to inMemoryUsers store
    const createdUserObj = {
      id: newUserId,
      name,
      email,
      phone: phone || null,
      role: assignedRole,
      created_at: new Date().toISOString().split('T')[0],
    };
    if (!inMemoryUsers.some((u) => u.email === email)) {
      inMemoryUsers.unshift(createdUserObj);
    }

    const token = jwt.sign(
      { id: newUserId, name, email, role: assignedRole },
      process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: createdUserObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

export const createUserByAdmin = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, password, and assigned role.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUserId = Date.now();

    try {
      const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      if (phone) {
        const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'User with this phone number already exists.',
          });
        }
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, hashedPassword, role]
      );
      newUserId = result.insertId;
    } catch (dbErr) {
      console.warn('DB create user fallback:', dbErr.message);
      if (inMemoryUsers.some((u) => u.email === email)) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }
      if (phone && inMemoryUsers.some((u) => u.phone === phone)) {
        return res.status(400).json({
          success: false,
          message: 'User with this phone number already exists.',
        });
      }
    }

    const createdAdminUserObj = {
      id: newUserId,
      name,
      email,
      phone: phone || null,
      role,
      created_at: new Date().toISOString().split('T')[0],
    };
    if (!inMemoryUsers.some((u) => u.email === email)) {
      inMemoryUsers.unshift(createdAdminUserObj);
    }

    return res.status(201).json({
      success: true,
      message: `User created with role "${role}" successfully!`,
      user: createdAdminUserObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user: ' + error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC');
    
    // Fetch addresses for each database user
    const usersWithAddresses = [];
    for (const u of rows) {
      const [addrs] = await pool.query(
        'SELECT id, name, phone, address_line1 AS addressLine1, city, state, pincode, type, is_default AS isDefault FROM addresses WHERE user_id = ?',
        [u.id]
      );
      usersWithAddresses.push({
        ...u,
        addresses: addrs || []
      });
    }

    // Merge DB users and inMemoryUsers (deduplicating by email)
    const combinedMap = new Map();
    inMemoryUsers.forEach((u) => combinedMap.set(u.email, { ...u, addresses: u.addresses || [] }));
    usersWithAddresses.forEach((u) => combinedMap.set(u.email, u));

    return res.json({
      success: true,
      data: Array.from(combinedMap.values()),
    });
  } catch (err) {
    return res.json({
      success: true,
      data: inMemoryUsers,
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    // Prevent removing the last superadmin
    if (user.role === 'superadmin' && role && role !== 'superadmin') {
      const [superCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
      if (superCount[0].count <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the only remaining Super Admin account.' });
      }
    }

    const fields = [];
    const params = [];

    if (name) { fields.push('name = ?'); params.push(name); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone || null); }
    if (role) { fields.push('role = ?'); params.push(role); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      params.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    // Sync inMemoryUsers if present
    const inMemIdx = inMemoryUsers.findIndex((u) => u.id === parseInt(id, 10) || u.email === user.email);
    if (inMemIdx !== -1) {
      if (name) inMemoryUsers[inMemIdx].name = name;
      if (email) inMemoryUsers[inMemIdx].email = email;
      if (phone !== undefined) inMemoryUsers[inMemIdx].phone = phone;
      if (role) inMemoryUsers[inMemIdx].role = role;
    }

    const [updatedRows] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: `User "${name || user.name}" updated successfully!`,
      user: updatedRows[0] || { id, name, email, phone, role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user: ' + error.message });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  // Prevent superadmin from deleting their own logged-in account
  if (parseInt(id, 10) === parseInt(req.user.id, 10) || req.user.email === 'admin@jalyn.com' && parseInt(id, 10) === 1) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own active Super Admin account.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    if (user.role === 'superadmin') {
      const [superCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
      if (superCount[0].count <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining Super Admin account.' });
      }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    const inMemIdx = inMemoryUsers.findIndex((u) => u.id === parseInt(id, 10) || u.email === user.email);
    if (inMemIdx !== -1) {
      inMemoryUsers.splice(inMemIdx, 1);
    }

    return res.json({
      success: true,
      message: `User "${user.name}" (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user: ' + error.message });
  }
};

/**
 * Self-Service Password Change
 * Available to any logged-in user (Super Admin, Admin, Manager, Staff, Customer)
 */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both your current password and a new password.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect. Please verify and try again.',
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    return res.json({
      success: true,
      message: 'Password changed successfully! You can use your new password next time you sign in.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + error.message,
    });
  }
};

/**
 * Targeted Password Reset (Super Admin exclusive)
 * Super Admin can reset the password for any account directly without knowing the old password.
 */
export const superAdminResetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    return res.json({
      success: true,
      message: `Password for "${user.name}" (${user.email}) has been successfully reset!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password: ' + error.message,
    });
  }
};

export const googleAuthUser = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required for Google Sign-In.',
    });
  }

  try {
    let user = null;

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        user = rows[0];
      } else {
        const dummyPassword = await bcrypt.hash(`google_${sub || Date.now()}`, 10);
        const [result] = await pool.query(
          'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
          [name || 'Google User', email, dummyPassword, 'customer', picture || null]
        );
        user = {
          id: result.insertId,
          name: name || 'Google User',
          email,
          role: 'customer',
          avatar: picture || null,
        };
      }
    } catch (dbErr) {
      console.warn('DB query in googleAuthUser fallback:', dbErr.message);
      user = {
        id: Date.now(),
        name: name || 'Google User',
        email,
        role: 'customer',
        avatar: picture || null,
      };
    }

    if (!inMemoryUsers.some((u) => u.email === user.email)) {
      inMemoryUsers.unshift({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role || 'customer',
        created_at: new Date().toISOString().split('T')[0],
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Google Sign-In successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || picture || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Google auth failed: ' + error.message,
    });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, phone, address_line1 AS addressLine1, city, state, pincode, type, is_default AS isDefault FROM addresses WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req, res) => {
  const { name, phone, addressLine1, city, state, pincode, type = 'Home', isDefault = 0 } = req.body;

  if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ success: false, message: 'Name, phone, address, city, state and pincode are required.' });
  }

  try {
    if (isDefault) {
      // Reset other addresses to non-default
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, name, phone, address_line1, city, state, pincode, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, phone, addressLine1, city, state, pincode, type, isDefault ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      data: { id: result.insertId, name, phone, addressLine1, city, state, pincode, type, isDefault }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { name, phone, addressLine1, city, state, pincode, type, isDefault } = req.body;

  try {
    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await pool.query(
      `UPDATE addresses 
       SET name = COALESCE(?, name), 
           phone = COALESCE(?, phone), 
           address_line1 = COALESCE(?, address_line1), 
           city = COALESCE(?, city), 
           state = COALESCE(?, state), 
           pincode = COALESCE(?, pincode), 
           type = COALESCE(?, type), 
           is_default = COALESCE(?, is_default) 
       WHERE id = ? AND user_id = ?`,
      [
        name || null,
        phone || null,
        addressLine1 || null,
        city || null,
        state || null,
        pincode || null,
        type || null,
        isDefault !== undefined ? (isDefault ? 1 : 0) : null,
        id,
        req.user.id
      ]
    );

    return res.json({ success: true, message: 'Address updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
