const register = async (req, res) => {
  try {

    // 🔥 הוספנו fullName
    const { fullName, email, password, role, specialization } = req.body;

    // 🔥 ולידציה
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Full name, email and password are required' 
      });
    }

    // בדיקת role חוקי
    const allowedRoles = ['patient', 'doctor', 'secretary', 'admin'];

    const userRole = role && allowedRoles.includes(role)
      ? role
      : 'patient';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 יצירת המשתמש (הוספנו fullName)
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: userRole,
      specialization: userRole === 'doctor' ? specialization : undefined
    });

    // AUDIT LOG – REGISTER
    await AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTER',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      role: user.role
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};