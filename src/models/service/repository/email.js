/**
 * @module repository/email
 */

const db = require('../../../model/db')
const nodemailer = require('nodemailer')

module.exports = {

  /**
   * @name fetchEmailAddress
   * @function
   * @instance
   * @memberof module:repository/email
   * @param {String} location
   * @returns  {String} The email address of the cutting user at the location
   */
  fetchEmailAddress: async function (location) {
    const query = 'select email from service_users where user_location_unique = ?;'
    const result = await db.mysqlHelpers.runQueryWithParameters(query, location)
    const { email } = result[0] || {}
    return email
  },

  /**
   * @name fetchEmailUsersAssociatedWithType
   * @function
   * @instance
   * @memberof module:repository/email
   * @param {String} userType
   * @returns {emailUsers[]}
   */
  /**
   * @inner
   * @typedef {Object} emailUsers
   * @property {String} emailUsers.email The email of users
   */
  fetchEmailUsersAssociatedWithType: async function (userType) {
    const query = 'select email from service_email_users where user_type = ?;'
    const result = await db.mysqlHelpers.runQueryWithParameters(query, userType)
    return result
  },

  /**
   * This is a function that exposes an email service which will send out the email to the relevant user
   * @name emailService
   * @function
   * @instance
   * @memberof module:repository/email
   * @param {String[]} to The array of recepients email addresses
   * @param {String} subject The subject for the email to be sent
   * @param {String} text  The body of the email
   */
  emailService: async function (to, subject, text) {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_SENDER } = process.env

    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: true, //  set to true because we are using port 465
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS
      }
    })

    try {
      await transporter.sendMail({
        from: MAIL_SENDER,
        to: [...to],
        subject,
        text
      })
      return
    } catch (e) {
      throw new Error(e)
    }
  }
}
