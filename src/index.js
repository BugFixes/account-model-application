'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid/v5')
const BugFixes = require('bugfixes')

const dataLayer = require('./data')

const bugFunctions = BugFixes.functions

class Application {
  constructor () {
    this.KEY_UUID = uuid(process.env.KEY_GEN, uuid.DNS)
    this.SECRET_UUID = uuid(process.env.SECRET_GEN, uuid.DNS)
    this.APPLICATION_UUID = uuid(process.env.APPLICATION_GEN, uuid.DNS)
  }

  create () {
    const microTime = new Date().getTime()
    this.key = uuid(this.applicationId + microTime, this.KEY_UUID)
    this.secret = uuid(this.applicationId + microTime, this.SECRET_UUID)
  }

  generateAppId () {
    const microTime = new Date().getTime()
    this.applicationId = uuid(this.name + microTime, this.APPLICATION_UUID)
  }

  set applicationId (applicationId) {
    this._applicationId = applicationId
  }
  get applicationId () {
    return this._applicationId
  }

  set accountId (accountId) {
    this._accountId = accountId
  }
  get accountId () {
    return this._accountId
  }

  set secret (secret) {
    this._secret = secret
  }
  get secret () {
    return this._secret
  }

  set key (key) {
    this._key = key
  }
  get key () {
    return this._key
  }

  set name (name) {
    this._name = name
  }
  get name () {
    return this._name
  }

  set version (version) {
    this._version = version
  }
  get version () {
    return this._version
  }

  save (callback) {
    this.generateAppId()
    this.create()

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    let appId = this.applicationId
    let name = this.name
    let key = this.key
    let secret = this.secret

    const insertItem = {
      applicationId: appId,
      accountId: this.accountId,
      name: name,
      version: this.version,
      key: key,
      secret: secret
    }

    dynamodb.put({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      Item: insertItem
    }, (error, result) => {
      if (error) {
        if (error.statusCode) {
          return callback(error)
        }
      }

      return callback(null, {
        applicationId: appId,
        name: name,
        key: key,
        secret: secret
      })
    })
  }

  getSecret (callback) {
    let key = this.key

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.get({
      Key: {
        key: key
      },
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      if (result.Item) {
        return callback(null, {
          secret: result.Item.secret
        })
      } else {
        const error = 'No Result'
        return callback(error)
      }
    })
  }

  getKey (callback) {
    let id = this.applicationId

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      ExpressionAttributeNames: {
        '#K': 'key'
      },
      ExpressionAttributeValues: {
        ':i': id
      },
      FilterExpression: 'applicationId = :i',
      ProjectionExpression: '#K'
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      if (result.Count) {
        return callback(null, {
          key: result.Items[0].key
        })
      } else {
        const error = 'No Result'
        return callback(error)
      }
    })
  }

  getDetailsFromKey (callback) {
    let key = this.key

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.get({
      Key: {
        key: key
      },
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      if (result.Item) {
        return callback(null, {
          applicationId: result.Item.applicationId,
          account: result.Item.accountId,
          name: result.Item.name,
          version: result.Item.version,
          key: result.Item.key,
          secret: result.Item.secret
        })
      } else {
        const error = 'No Result'
        callback(error)
      }
    })
  }

  getDetailsFromId (callback) {
    let applicationId = this.applicationId
    let accountId = this.accountId

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      ExpressionAttributeNames: {
        '#ID': 'applicationId',
        '#A': 'accountId',
        '#N': 'name',
        '#V': 'version',
        '#K': 'key',
        '#S': 'secret'
      },
      ExpressionAttributeValues: {
        ':ID': applicationId,
        ':A': accountId
      },
      FilterExpression: 'applicationId = :ID AND accountId = :A',
      ProjectionExpression: '#ID, #A, #N, #V, #K, #S'
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      if (result.Items) {
        let item = result.Items[0]

        return callback(null, {
          applicationId: item.applicationId,
          account: item.accountId,
          name: item.name,
          version: item.version,
          key: item.key,
          secret: item.secret
        })
      } else {
        const error = 'No Result'
        return callback(error)
      }
    })
  }

  list (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      ExpressionAttributeNames: {
        '#N': 'name',
        '#V': 'version',
        '#ID': 'applicationId'
      },
      ExpressionAttributeValues: {
        ':a': self.accountId
      },
      FilterExpression: 'accountId = :a',
      ProjectionExpression: '#ID, #N, #V'
    }, (error, result) => {
      if (error) {
        return callback(error, null)
      }

      let appNames = {}

      if (result.Count) {
        let resultSet = []
        for (let i = (result.Count - 1); i >= 0; i--) {
          let resultData = result.Items[i]
          let resultName = resultData.name
          let resultId = resultData.applicationId
          let resultVersion = resultData.version

          if (!bugFunctions.checkIfDefined(appNames[resultName])) {
            appNames[resultName] = true

            resultSet.push({
              applicationId: resultId,
              name: resultName,
              version: resultVersion
            })
          }
        }

        return callback(null, resultSet)
      } else {
        const error = 'No Result'
        return callback(error, null)
      }
    })
  }

  listVersions (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      ExpressionAttributeNames: {
        '#N': 'name',
        '#V': 'version',
        '#ID': 'applicationId'
      },
      ExpressionAttributeValues: {
        ':a': self.accountId,
        ':id': self.applicationId
      },
      FilterExpression: 'accountId = :a AND applicationId = :id',
      ProjectionExpression: '#ID, #N, #V'
    }, (error, result) => {
      if (error) {
        return callback(error, null)
      }

      if (result.Count) {
        let resultSet = []
        for (let i = (result.Count - 1); i >= 0; i--) {
          resultSet.push({
            applicationId: result.Items[i].applicationId,
            name: result.Items[i].name,
            version: result.Items[i].version
          })
        }

        return callback(null, resultSet)
      } else {
        const error = 'No Result'
        return callback(error, null)
      }
    })
  }

  createVersion (callback) {
    this.create()

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    let appId = this.applicationId
    let name = this.name
    let key = this.key
    let secret = this.secret

    const insertItem = {
      applicationId: appId,
      accountId: this.accountId,
      name: name,
      version: this.version,
      key: key,
      secret: secret
    }

    dynamodb.put({
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      Item: insertItem
    }, (error, result) => {
      if (error) {
        if (error.statusCode) {
          return callback(error)
        }
      }

      return callback(null, {
        applicationId: appId,
        name: name,
        key: key,
        secret: secret
      })
    })
  }

  rename (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    let updateObject = {
      ExpressionAttributeNames: {
        '#N': 'name'
      },
      ExpressionAttributeValues: {
        ':n': self.name
      },
      Key: {
        key: self.key
      },
      ReturnValues: 'UPDATED_NEW',
      TableName: process.env.AWS_DYNAMO_TABLE_APPLICATION,
      UpdateExpression: 'SET #N = :n'
    }

    dynamodb.update(updateObject, (error, result) => {
      if (error) {
        BugFixes.error('Update Name', error)

        return callback(error)
      }

      return callback(null, {
        name: result.Attributes.name
      })
    })
  }
}

Application.prototype.removeAll = dataLayer.removeAll
Application.prototype.createTable = dataLayer.createTable

module.exports = Application
