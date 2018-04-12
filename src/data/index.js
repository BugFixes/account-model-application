const AWS = require('aws-sdk')
const BugFixes = require('bugfixes')

const dataFunctions = {
  removeAll: (callback)  => {
    AWS.config.update({
      region: process.env.AWS_YNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.describeTable('application', (error, result) => {
      if (error) {
        return null
      }

      dynamodb.deleteTable({
        TableName: 'application'
      }, (error, result) => {
        if (error) {
          BugFixes.error('Remove Applications Table', Error(error))

          return null
        }

        return null
      })

      return null
    })
  },

  createTable: (callback) => {
    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamodb = new AWS.DynamoDB({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamodb.describeTable('application', (error, result) => {
      if (error) {
        dynamodb.createTable({
          TableName: 'application',
          AttributeDefinitions: [
            {
              AttributeName: 'key',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              KeyType: 'HASH',
              AttributeName: 'key'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }, (error, result) => {
          if (error) {
            if (error.length) {
              BugFixes.error('Create Application Table', Error(error))

              return null
            }
          }

          return null
        })
      }

      return null
    })
  }
}

module.exports = dataFunctions