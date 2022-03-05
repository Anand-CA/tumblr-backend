const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        userId : userId
      }
      const secret = process.env.JWT_ACCESS_KEY
      const options = {
        expiresIn: '28d',
        issuer: 'Unique'
      }
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          reject(createError.InternalServerError())
          return
        }
        resolve(token)
      })
    })
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized())
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    JWT.verify(token, process.env.JWT_ACCESS_KEY, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      console.log(req.payload)
      next()
    })
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        userId : userId
      }
      console.log(payload)
      const secret = process.env.JWT_REFRESH_KEY
      const options = {
        expiresIn: '1y',
        issuer: 'Unique'
      }
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          // reject(err)
          reject(createError.InternalServerError())
        }
        client.GET(userId, (err, result) => {
          if (err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          if(result){
            resolve(result)
          }
          else{
             client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          resolve(token)
        })
          }
        })
      })
    })
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY,
        (err, payload) => {
          console.log(payload)
          if (err) return reject(createError.Unauthorized())
          const adminId = payload.userId
          client.GET(adminId, (err, result) => {
            if (err) {
              console.log(err.message)
              reject(createError.InternalServerError())
              return 
            }
            if (refreshToken === result) return resolve(adminId)
            reject(createError.Unauthorized())
          })
        }
      )
    })
  },
}