console.log('Loading firebase utility module...')
const fs = require('fs')
const path = require('path')

let admin = null
let firebaseInitError = null
let isInitialized = false

const resolveServiceAccountPath = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  }
  return path.resolve(__dirname, '../config/firebase-service-account.json')
}

const initializeFirebase = () => {
  if (isInitialized) {
    return admin
  }

  if (!admin) {
    try {
      admin = require('firebase-admin')
    } catch (error) {
      firebaseInitError = 'firebase-admin package is not installed'
      return null
    }
  }

  const serviceAccountPath = resolveServiceAccountPath()
  if (!fs.existsSync(serviceAccountPath)) {
    firebaseInitError = `Firebase service account file not found at ${serviceAccountPath}`
    return null
  }

  try {
    const serviceAccount = require(serviceAccountPath)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }
    isInitialized = true
    firebaseInitError = null
    return admin
  } catch (error) {
    firebaseInitError = error.message
    return null
  }
}

const getFirebaseAdmin = () => initializeFirebase()

const getFirebaseInitError = () => firebaseInitError

module.exports = {
  getFirebaseAdmin,
  getFirebaseInitError
}
