const PostCreateUserController = require('./postCreateUserController')
const PostLoginController = require('./postLoginController')
const PostRefreshController = require('./postRefreshTokenController')
const PostLogoutController = require('./postLogoutController')
const PostLogoutAllController = require('./postLogoutAllController')
const PostAdminLogoutAllUsersController = require('./postAdminLogoutAllUserController')
const PostAdminLogoutUserController = require('./postAdminLogoutUserController')
const PostForgotPasswordController = require('./postForgotPasswordController')
const PostResetPasswordController = require('./postResetPasswordController')
const PostSaveDeviceTokenController = require('./postSaveDeviceTokenController')
const PostDeleteDeviceTokenController = require('./postDeleteDeviceTokenController')

const GetAllUsersController = require('./getallusersController')
const UpdateUserController = require('./updateuserdetailsController')





const authRepository = require('../../../models/authentication/repository/auth')


const postCreateUserController = new PostCreateUserController(authRepository)
const postLoginController = new PostLoginController(authRepository)
const postRefreshController = new PostRefreshController(authRepository)
const postLogoutController = new PostLogoutController(authRepository)
const postLogoutAllController = new PostLogoutAllController(authRepository)
const postAdminLogoutAllUsersController = new PostAdminLogoutAllUsersController(authRepository)
const postAdminLogoutUserController = new PostAdminLogoutUserController(authRepository)
const postForgotPasswordController = new PostForgotPasswordController(authRepository)
const postResetPasswordController = new PostResetPasswordController(authRepository)
const postSaveDeviceTokenController = new PostSaveDeviceTokenController(authRepository)
const postDeleteDeviceTokenController = new PostDeleteDeviceTokenController(authRepository)
const getAllUsersController = new GetAllUsersController(authRepository)
const updateUserController = new UpdateUserController(authRepository)




module.exports={
  postCreateUserController,
  postLoginController,
  postRefreshController,
  postLogoutController,
  postLogoutAllController,
  postAdminLogoutAllUsersController,
  postAdminLogoutUserController,
  postForgotPasswordController,
  postResetPasswordController,
  postSaveDeviceTokenController,
  postDeleteDeviceTokenController,
  getAllUsersController,
  updateUserController
  
}
