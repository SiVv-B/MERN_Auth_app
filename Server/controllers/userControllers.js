const User = require('../model/UserModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res, next) => {
  const { name, email, password } = req.body
  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    console.log(err)
  }
  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'User already exists! try another email' })
  }
  const hasedPassword = bcrypt.hashSync(password)
  const user = new User({
    name,
    email,
    password: hasedPassword,
  })

  try {
    await user.save()
    console.log('user signed up')
  } catch (err) {
    console.log('error signup', err)
  }

  console.log(`${user.name} just signed up`)
  return res.status(201).json({ message: `${user.name} just signed up`, user })
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    return new Error(err)
  }
  if (!existingUser) {
    console.log('this email does not exist')
    return res.status(400).json({ message: 'User not found. Signup Please' })
  }
  const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password)
  if (!isPasswordCorrect) {
    console.log('incorrect password')
    return res.status(400).json({ message: 'The password is not correct' })
  }
  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '35s',
  })

console.log('geerated token: /n',token)

if(req.cookies[`${existingUser._id}`]) {
  req.cookies[`${existingUser._id}`] =""
}

  //setup cookies to hide token from the browser(frontend)
  res.cookie(String(existingUser._id), token, {
    path: '/',
    //add cookie for 30 seconds from now
    expires: new Date(Date.now() + 1000 * 30),
    //with httpOnly the token will not be acceccible to frontend
    httpOnly: true,
    sameSite: 'lax',
  })

  console.log(`${existingUser.name} just logged in`)
  return res.status(200).json({
    message: `${existingUser.name} just logged in`,
    user: existingUser,
    token,
  })
}

const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie
  const token = cookies.split('=')[1]
  console.log(token)

  if (!token) {
    res.status(404).json({ message: 'No token found' })
  }
  jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log('no token found : ====>', err)
      return res.status(400).json({ message: 'Invalid Token' })
    }
    console.log("user token verifyed, the user's data will be desplayed")
    req.id = user.id
  })
  next()
}

const getUser = async (req, res, next) => {
  const userId = req.id
  let user
  try {
    user = await User.findById(userId, '-password')
  } catch (err) {
    return new Error(err)
  }
  if (!user) {
    return res.status(404).json({ messsage: 'User Not Found' })
  }
  return res.status(200).json({ user })
}


const refreshToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "35s",
    });
    console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};

const logout = (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";
    return res.status(200).json({ message:`${user.name} is successfully loggedout`});
  });
};
  


module.exports = { signup, login, verifyToken, getUser,refreshToken,logout }
