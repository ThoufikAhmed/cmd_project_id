const sql = require('mssql')
const mysql = require('mysql2')
const isReachable = require('is-reachable')

// 🔹 Function to create MSSQL config
const createMSSQLConfig = (user, password, server, database) => ({
  user,
  password,
  server,
  database,
  pool: { max: 20, min: 0, idleTimeoutMillis: 300000 } // Auto-close after 3s
})

// 🔹 MSSQL Database Configurations
const sageDBConfigs = {
  NJKDAT_PRIMARY: createMSSQLConfig(process.env.DB_SAGE_USERNAME, process.env.DB_SAGE_PASSWORD, process.env.DB_HOSTIP, 'NJKDAT'),
  NJKDAT_BACKUP: createMSSQLConfig(process.env.DB_SAGE_USERNAME, process.env.DB_SAGE_PASSWORD, process.env.DB_HOSTIP_BACKUP, 'NJKDAT'),
  BDDDAT_PRIMARY: createMSSQLConfig(process.env.BD_DB_SAGE_USERNAME, process.env.BD_DB_SAGE_PASSWORD, process.env.BD_DB_HOSTIP, 'BDDDAT'),
  BDDDAT_BACKUP: createMSSQLConfig(process.env.BD_DB_SAGE_USERNAME, process.env.BD_DB_SAGE_PASSWORD, process.env.BD_DB_HOSTIP_BACKUP, 'BDDDAT')
}

// 🔹 Function to determine which DB to use
const determineDBConfig = async (queryInput) => {
  const prefixes = ['ID', 'BD', 'NJ', 'SA']
  const ocNumber = queryInput.flatMap(Object.values).find(value =>
    typeof value === 'string' && prefixes.some(prefix => value.startsWith(prefix))
  )

  const selectedDB = ocNumber?.startsWith('BD') ? 'BDDDAT' : 'NJKDAT'
  const primaryConfig = sageDBConfigs[`${selectedDB}_PRIMARY`]
  const backupConfig = sageDBConfigs[`${selectedDB}_BACKUP`]

  return (await isReachable(`${primaryConfig.server}:1433`)) ? primaryConfig
    : (await isReachable(`${backupConfig.server}:1433`)) ? backupConfig
      : null
}

// 🔹 Run MSSQL Query - Keeps Connection Open Only When Needed
const msSqlRunQuery = async (queryInput, query) => {
  const config = await determineDBConfig(queryInput) || await determineDBConfig([])
  if (!config) throw new Error('Connection failed for Sage DB')

  const pool = new sql.ConnectionPool(config)
  await pool.connect()

  try {
    const request = pool.request()
    queryInput.forEach(obj => Object.entries(obj).forEach(([key, value]) =>
      request.input(key, sql.VarChar(sql.MAX), value)
    ))
    const result = await request.query(query)
    return result
  } finally {
    // setTimeout(() => {
    //   if (pool.connected) pool.close()
    // }, 90000) // Auto-close after 3s if no queries
    await pool.close()
  }
}

// 🔹 MySQL Connection Pool
const mySqlPool = mysql.createPool({
  connectionLimit: 500,
  host: process.env.DB_MYSQL_HOST,
  user: process.env.DB_MYSQL_USERNAME,
  password: process.env.DB_MYSQL_PASSWORD,
  database: process.env.DB_MYSQL_DBNAME,
  port: process.env.DB_MYSQL_PORT,
  multipleStatements: true
})

// 🔹 Close MySQL Pool If No Active Connections After 3s
let mysqlTimeout
const closeMySqlPool = () => {
  clearTimeout(mysqlTimeout)
  mysqlTimeout = setTimeout(() => {
    if (!mySqlPool._allConnections.length && !mySqlPool._freeConnections.length) {
      mySqlPool.end(err => err ? console.error('Error closing MySQL pool:', err) : console.log('MySQL pool closed.'))
    }
  }, 300000)
}

// 🔹 Run MySQL Queries - Keeps Connection Open Only When Needed
const mysqlHelpers = {
  runQuery: (query) => new Promise((resolve, reject) => {
    mySqlPool.query(query, (err, results) => {
      err ? reject(err) : resolve(results)
      closeMySqlPool()
    })
  }),

  runQueryWithParameters: (query, ...parameters) => new Promise((resolve, reject) => {
    mySqlPool.query(query, parameters, (err, results) => {
      err ? reject(err) : resolve(results)
      closeMySqlPool()
    })
  })
}

module.exports = { sagePool: { msSqlRunQuery }, mysqlHelpers }

// ---------------v3=---------------
// const sql = require('mssql');
// const mysql = require('mysql');
// const isReachable = require('is-reachable');

// // 🔹 Common function to create MSSQL config
// const createMSSQLConfig = (user, password, server, database) => ({
//   user, password, server, database,
//   pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
// });

// // 🔹 MSSQL Database Configurations
// const sageDBConfigs = {
//   NJKDAT_PRIMARY: createMSSQLConfig(process.env.DB_SAGE_USERNAME, process.env.DB_SAGE_PASSWORD, process.env.DB_HOSTIP, 'NJKDAT'),
//   NJKDAT_BACKUP: createMSSQLConfig(process.env.DB_SAGE_USERNAME, process.env.DB_SAGE_PASSWORD, process.env.DB_HOSTIP_BACKUP, 'NJKDAT'),
//   BDDDAT_PRIMARY: createMSSQLConfig(process.env.BD_DB_SAGE_USERNAME, process.env.BD_DB_SAGE_PASSWORD, process.env.BD_DB_HOSTIP, 'BDDDAT'),
//   BDDDAT_BACKUP: createMSSQLConfig(process.env.BD_DB_SAGE_USERNAME, process.env.BD_DB_SAGE_PASSWORD, process.env.BD_DB_HOSTIP_BACKUP, 'BDDDAT')
// };

// // 🔹 Function to determine which DB to use
// const determineDBConfig = async (queryInput) => {
//   const prefixes = ['ID', 'BD', 'NJ', 'SA'];
//   const ocNumber = queryInput.flatMap(Object.values).find(value =>
//     typeof value === 'string' && prefixes.some(prefix => value.startsWith(prefix))
//   );

//   let selectedDB = ocNumber?.startsWith('BD') ? 'BDDDAT' : 'NJKDAT';
//   const primaryConfig = sageDBConfigs[`${selectedDB}_PRIMARY`];
//   const backupConfig = sageDBConfigs[`${selectedDB}_BACKUP`];

//   return (await isReachable(`${primaryConfig.server}:1433`)) ? primaryConfig :
//          (await isReachable(`${backupConfig.server}:1433`)) ? backupConfig :
//          null;
// };

// // 🔹 Run MSSQL Query
// const msSqlRunQuery = async (queryInput, query) => {
//   const config = await determineDBConfig(queryInput) || await determineDBConfig([]);
//   if (!config) throw new Error('Connection failed for Sage DB');

//   return new Promise((resolve, reject) => {
//     const connection = new sql.ConnectionPool(config);
//     connection.connect()
//       .then(async pool => {
//         try {
//           const request = pool.request();
//           queryInput.forEach(obj => Object.entries(obj).forEach(([key, value]) =>
//             request.input(key, sql.VarChar(sql.MAX), value)
//           ));
//           const result = await request.query(query);
//           connection.close();
//           resolve(result);
//         } catch (err) {
//           connection.close();
//           reject(err);
//         }
//       })
//       .catch(reject);
//   });
// };

// // 🔹 MySQL Connection Pool
// const mySqlPool = mysql.createPool({
//   connectionLimit: 500,
//   host: process.env.DB_MYSQL_HOST,
//   user: process.env.DB_MYSQL_USERNAME,
//   password: process.env.DB_MYSQL_PASSWORD,
//   database: process.env.DB_MYSQL_DBNAME,
//   port: process.env.DB_MYSQL_PORT,
//   multipleStatements: true
// });

// // 🔹 Close MySQL Pool If No Active Connections
// const closePoolIfNoConnections = () => {
//   if (!mySqlPool._allConnections.length && !mySqlPool._freeConnections.length) {
//     mySqlPool.end(err => err ? console.error('Error closing MySQL pool:', err) : console.log('MySQL pool closed.'));
//   }
// };

// // 🔹 Run MySQL Queries
// const mysqlHelpers = {
//   runQuery: (query) => new Promise((resolve, reject) => {
//     mySqlPool.query(query, (err, results) => {
//       err ? reject(err) : resolve(results);
//       closePoolIfNoConnections();
//     });
//   }),

//   runQueryWithParameters: (query, ...parameters) => new Promise((resolve, reject) => {
//     mySqlPool.query(query, parameters, (err, results) => {
//       err ? reject(err) : resolve(results);
//       closePoolIfNoConnections();
//     });
//   })
// };

// module.exports = { sagePool: { msSqlRunQuery }, mysqlHelpers };

// --------------------v2-------------------
// const sql = require('mssql')
// const mysql = require('mysql')
// const isReachable = require('is-reachable')

// const sageConfig1 = {
//   user: process.env.DB_SAGE_USERNAME,
//   password: process.env.DB_SAGE_PASSWORD,
//   server: process.env.DB_HOSTIP,
//   database: 'NJKDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 300000
//   }
// }

// const sageConfig2 = {
//   user: process.env.DB_SAGE_USERNAME,
//   password: process.env.DB_SAGE_PASSWORD,
//   server: process.env.DB_HOSTIP_BACKUP,
//   database: 'NJKDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// }

// const sageConfig3 = {
//   user: process.env.BD_DB_SAGE_USERNAME,
//   password: process.env.BD_DB_SAGE_PASSWORD,
//   server: process.env.BD_DB_HOSTIP,
//   database: 'BDDDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 300000
//   }
// }

// const sageConfig4 = {
//   user: process.env.BD_DB_SAGE_USERNAME,
//   password: process.env.BD_DB_SAGE_PASSWORD,
//   server: process.env.BD_DB_HOSTIP_BACKUP,
//   database: 'BDDDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// }

// module.exports.sagePool = {
//   msSqlRunQuery: async (queryInput, query) => {
//     // Function to get OC number or any matching value from queryInput
//     const getMatchingValue = (input, prefix) => {
//       for (const obj of input) {
//         for (const value of Object.values(obj)) {
//           if (typeof value === 'string' && value.startsWith(prefix)) {
//             return value
//           }
//         }
//       }
//       return null
//     }

//     // Find the value that starts with 'ID' or 'BD'
//     const ocNumber = getMatchingValue(queryInput, 'ID') || getMatchingValue(queryInput, 'BD') || getMatchingValue(queryInput, 'NJ') || getMatchingValue(queryInput, 'SA')

//     // Determine which database to use based on the OC number prefix or fallback strategy
//     const checkConnection = async (config1, config2) => {
//       const check1 = await isReachable(config1.server + ':1433')
//       const check2 = await isReachable(config2.server + ':1433')
//       return check1 ? config1 : check2 ? config2 : null
//     }

//     let config = null
//     if (ocNumber) {
//       const prefix = ocNumber.substring(0, 2)
//       if (prefix === 'ID' || prefix === 'NJ' || prefix === 'SA') {
//         config = await checkConnection(sageConfig1, sageConfig2)
//       } else if (prefix === 'BD') {
//         config = await checkConnection(sageConfig3, sageConfig4)
//       }
//     }

//     // If no OC number prefix match, try NJKDAT first, then BDDDAT
//     if (!config) {
//       config = await checkConnection(sageConfig1, sageConfig2)
//       if (!config) {
//         config = await checkConnection(sageConfig3, sageConfig4)
//       }
//     }

//     // Handle case where no valid connection was found
//     if (!config) {
//       return Promise.reject(new Error('Connection failed for Sage DB'))
//     }

//     // Run the query on the determined database connection
//     return new Promise((resolve, reject) => {
//       const connection = new sql.ConnectionPool(config)
//       connection.connect()
//         .then(async (pool) => {
//           try {
//             const request = pool.request()
//             queryInput.forEach(obj => {
//               Object.entries(obj).forEach(([key, value]) => {
//                 request.input(key, sql.VarChar(sql.MAX), value)
//               })
//             })
//             const result = await request.query(query)
//             connection.close()
//             resolve(result)
//           } catch (err) {
//             connection.close()
//             reject(err)
//           }
//         })
//         .catch(err => {
//           connection.close()
//           reject(err)
//         })
//     })
//   }
// }

// // Below source connects Mysql
// const mySqlConfig = {
//   connectionLimit: 500,
//   host: process.env.DB_MYSQL_HOST,
//   user: process.env.DB_MYSQL_USERNAME,
//   password: process.env.DB_MYSQL_PASSWORD,
//   database: process.env.DB_MYSQL_DBNAME,
//   port: process.env.DB_MYSQL_PORT,
//   multipleStatements: true
// }
// // console.log("mySqlConfig", mySqlConfig)
// const mySqlPool = mysql.createPool(mySqlConfig)

// // console.log("mySqlPool", mySqlPool)
// const closePoolIfNoConnections = () => {
//   mySqlPool._allConnections.length === 0 && mySqlPool._freeConnections.length === 0 ? mySqlPool.end(err => {
//     if (err) {
//       console.error('Error closing MySQL pool:', err)
//     } else {
//       console.log('MySQL pool closed.')
//     }
//   }) : console.log('Active connections exist, pool not closed.')
// }

// module.exports.mysqlHelpers = {
//   runQuery: (query) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, function (err, results) {
//         if (err) {
//           console.log(err)
//           closePoolIfNoConnections()
//           return reject(err)
//         }
//         console.log(results)
//         closePoolIfNoConnections()
//         return resolve(results)
//       })
//     })
//   },

//   runQueryWithParameters: (query, ...parameters) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, parameters, function (err, results) {
//         if (err) {
//           closePoolIfNoConnections()
//           return reject(err)
//         }
//         closePoolIfNoConnections()
//         return resolve(results)
//       })
//     })
//   }
// }
// --------------------v1 -------------------
// module.exports.mysqlHelpers = {
//   runQuery: (query) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, function (err, results) {
//         if (err) {
//           return reject(err)
//         }
//         return resolve(results)
//       })
//     })
//   },

//   runQueryWithParameters: (query, ...parameters) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, parameters, function (err, results) {
//         if (err) {
//           return reject(err)
//         }
//         return resolve(results)
//       })
//     })
//   }
// }

// // module.exports.mysqlPool = mySqlPool
// const sql = require('mssql')
// const mysql = require('mysql')
// const isReachable = require('is-reachable')

// const sageConfig1 = {
//   user: process.env.DB_SAGE_USERNAME,
//   password: process.env.DB_SAGE_PASSWORD,
//   server: process.env.DB_HOSTIP,
//   database: 'NJKDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// }

// const sageConfig2 = {
//   user: process.env.DB_SAGE_USERNAME,
//   password: process.env.DB_SAGE_PASSWORD,
//   server: process.env.DB_HOSTIP_BACKUP,
//   database: 'NJKDAT',
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// }

// // Below source connects mssql
// // checking for multiple host connections, if 1st connection fails then connects 2nd connection
// // if both connections fail then throws error
// module.exports.sagePool = {
//   msSqlRunQuery: async (queryInput, query) => {
//     //  Obtain MsSql connection and run query
//     const checkConnection1 = await isReachable(process.env.DB_HOSTIP + ':1433')
//     const checkConnection2 = await isReachable(process.env.DB_HOSTIP_BACKUP + ':1433')
//     return new Promise((resolve, reject) => {
//       let connection = null
//       if (checkConnection1 === true) {
//         connection = new sql.ConnectionPool(sageConfig1)
//       } else if (checkConnection2 === true) {
//         connection = new sql.ConnectionPool(sageConfig2)
//       } else {
//         return reject(new Error('Connection failed for Sage DB'))
//       }
//       connection.connect()
//         .then(async (pool) => {
//           try {
//             const request = pool.request()
//             queryInput.map(obj => {
//               Object.entries(obj).map(([key, value]) => {
//                 request.input(`${key}`, sql.VarChar(sql.MAX), `${value}`)
//               })
//             })
//             const result = await request.query(`${query}`)
//             connection.close()
//             return resolve(result)
//           } catch (err) {
//             connection.close()
//             return reject(err)
//           }
//         }).catch(err => {
//           connection.close()
//           return reject(err)
//         })
//     })
//   }
// }

// // Below source connects Mysql
// const mySqlConfig = {
//   connectionLimit: 250,
//   host: process.env.DB_MYSQL_HOST,
//   user: process.env.DB_MYSQL_USERNAME,
//   password: process.env.DB_MYSQL_PASSWORD,
//   database: process.env.DB_MYSQL_DBNAME,
//   multipleStatements: true
// }

// const mySqlPool = mysql.createPool(mySqlConfig)
// const closePoolIfNoConnections = () => {
//   mySqlPool._allConnections.length === 0 && mySqlPool._freeConnections.length === 0 ? mySqlPool.end(err => {
//     if (err) {
//       console.error('Error closing MySQL pool:', err)
//     } else {
//       console.log('MySQL pool closed.')
//     }
//   }) : console.log('Active connections exist, pool not closed.')
// }

// module.exports.mysqlHelpers = {
//   runQuery: (query) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, function (err, results) {
//         if (err) {
//           console.log(err);
//           closePoolIfNoConnections()
//           return reject(err)
//         }
//         console.log(results)
//         closePoolIfNoConnections()
//         return resolve(results)
//       })
//     })
//   },

//   runQueryWithParameters: (query, ...parameters) => {
//     return new Promise((resolve, reject) => {
//       mySqlPool.query(query, parameters, function (err, results) {
//         if (err) {
//           closePoolIfNoConnections()
//           return reject(err)
//         }
//         closePoolIfNoConnections()
//         return resolve(results)
//       });
//     });
//   }
// }
// // module.exports.mysqlHelpers = {
// //   runQuery: (query) => {
// //     return new Promise((resolve, reject) => {
// //       mySqlPool.query(query, function (err, results) {
// //         if (err) {
// //           return reject(err)
// //         }
// //         return resolve(results)
// //       })
// //     })
// //   },

// //   runQueryWithParameters: (query, ...parameters) => {
// //     return new Promise((resolve, reject) => {
// //       mySqlPool.query(query, parameters, function (err, results) {
// //         if (err) {
// //           return reject(err)
// //         }
// //         return resolve(results)
// //       })
// //     })
// //   }
// // }

// module.exports.mysqlPool = mySqlPool
