const express =require ('express');
const router =express.Router()


const { signup,login,verifyToken,getUser,refreshToken,logout } = require('../controllers/userControllers');

router.post ('/signup', signup)
router.post ('/login', login)
router.get ('/user', verifyToken,getUser)
//verify token if the user still using the app
router.get("/refresh",refreshToken,verifyToken,getUser)
router.post ('/logout', verifyToken,logout)

module.exports = router;