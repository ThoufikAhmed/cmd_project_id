/**
 * @module utils/envConfig
 */

const envConfig = () => {
  const { DB_SAGE_USERNAME, DB_SAGE_PASSWORD, DB_HOSTIP, DB_HOSTIP_BACKUP } = process.env

  const { BD_DB_SAGE_USERNAME, BD_DB_SAGE_PASSWORD, BD_DB_HOSTIP, BD_DB_HOSTIP_BACKUP } = process.env

  const { DB_MYSQL_USERNAME, DB_MYSQL_PASSWORD, DB_MYSQL_HOST, DB_MYSQL_DBNAME, DB_MYSQL_PORT } = process.env

  const { NODE_ENV, SERVER_PORT } = process.env

  const { MAIL_SENDER, MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env

  const { SAGE_AP_HOSTIP, SAGE_AP_HOSTIP_BACKUP } = process.env

  const { BD_SAGE_AP_HOSTIP, BD_SAGE_AP_HOSTIP_BACKUP } = process.env

  const { S3_BUCKET_ID, S3_BUCKET_SECRET, S3_BUCKET_NAME, S3_BUCKET_REGION } = process.env

  if (!DB_SAGE_USERNAME || !DB_SAGE_PASSWORD || !DB_HOSTIP || !DB_HOSTIP_BACKUP) {
    throw new Error('The Sage environment variables are not defined')
  }
  if (!BD_DB_SAGE_USERNAME || !BD_DB_SAGE_PASSWORD || !BD_DB_HOSTIP || !BD_DB_HOSTIP_BACKUP) {
    throw new Error('The BD Sage environment variables are not defined')
  }

  if (!DB_MYSQL_USERNAME || !DB_MYSQL_PASSWORD || !DB_MYSQL_HOST || !DB_MYSQL_DBNAME || !DB_MYSQL_PORT) {
    throw new Error('The MySQL environment variables are not defined')
  }

  if (!NODE_ENV || !SERVER_PORT) {
    throw new Error('The Server environment variables are not defined')
  }

  if (!MAIL_SENDER || !MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error('The Nodemailer environment variables are not defined')
  }

  if (!SAGE_AP_HOSTIP || !SAGE_AP_HOSTIP_BACKUP) {
    throw new Error('The Sage-AP server environment variables are not defined')
  }
  if (!BD_SAGE_AP_HOSTIP || !BD_SAGE_AP_HOSTIP_BACKUP) {
    throw new Error('The BD_Sage-AP server environment variables are not defined')
  }

  if (!S3_BUCKET_ID || !S3_BUCKET_SECRET || !S3_BUCKET_NAME || !S3_BUCKET_REGION) {
    throw new Error('The S3 bucket environment variables are not defined')
  }
}

module.exports = envConfig
