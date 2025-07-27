import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(request: NextRequest) {
  await dbConnect();
  const { userId, name, email, rank, section } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (rank) user.rank = rank;
  if (section) user.section = section;
  await user.save();
  return NextResponse.json({ user });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, email, password, role, section, rank, name } = await request.json();

    // Validate required fields
    if (!username || !email || !password || !role || !name) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['localStoreManager', 'wsgStoreManager'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if section is provided for localStoreManager
    if (role === 'localStoreManager' && !section) {
      return NextResponse.json(
        { error: 'Section is required for local store managers' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      section,
      rank,
      name,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      section: user.section,
    });

    // Return user data (without password) and token
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      section: user.section,
      rank: user.rank,
      name: user.name,
    };

    return NextResponse.json({
      message: 'User registered successfully',
      user: userData,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 