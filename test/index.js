/* global it, before, after, describe */
'use strict'

require('dotenv').config()
const BugFixes = require('bugfixes') // eslint-disable-line
const expect = require('chai').expect

const Application = require('../src')

let appPayload = {
  name: 'tester',
  accountId: process.env.TEST_ACCOUNT_DATA_ID,
  version: '0.0.1'
}

let versionPayload = {
  version: '0.0.2',
  accountId: process.env.TEST_ACCOUNT_DATA_ID
}

let appDetails = {

}

process.env.AWS_DYNAMO_ENDPOINT = 'http://docker.devel:8000'

describe('Application Model', () => {
  before(() => {
    let app = new Application()
    app.createTable((error, result) => {
      if (error) {
        BugFixes.error('Create Application Table Error', Error(error))
      }
    })
  })

  after(() => {
    let app = new Application()
    app.removeAll((error, result) => {
      if (error) {
        BugFixes.error('Remove All Application Error', Error(error))
      }
    })
  })

  it('should create app', (done) => {
    let app = new Application()
    app.name = appPayload.name
    app.accountId = appPayload.accountId
    app.version = appPayload.version
    app.save((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('key').to.be.lengthOf.least(4)
      expect(result).to.have.property('secret').to.be.lengthOf.least(4)

      appDetails = result

      done()
    })
  })

  it('should get app secret', (done) => {
    let app = new Application()
    app.key = appDetails.key
    app.getSecret((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('secret').to.be.equal(appDetails.secret)

      done()
    })
  })

  it('should get app key', (done) => {
    let app = new Application()
    app.applicationId = appDetails.applicationId
    app.getKey((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('key').to.be.equal(appDetails.key)

      done()
    })
  })

  it('should get app details from key', (done) => {
    let app = new Application()
    app.key = appDetails.key
    app.getDetailsFromKey((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('applicationId').to.be.equal(appDetails.applicationId)

      done()
    })
  })

  it('should get app details from id', (done) => {
    let app = new Application()
    app.applicationId = appDetails.applicationId
    app.accountId = appPayload.accountId
    app.getDetailsFromId((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('key').to.be.equal(appDetails.key)

      done()
    })
  })

  it('should list all apps', (done) => {
    let app = new Application()
    app.accountId = appPayload.accountId
    app.list((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('array')
      expect(result).to.have.lengthOf.least(1)

      done()
    })
  })

  it('should list versions', (done) => {
    let app = new Application()
    app.accountId = appPayload.accountId
    app.applicationId = appDetails.applicationId
    app.listVersions((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('array')
      expect(result).to.have.lengthOf.least(1)

      done()
    })
  })

  it('should add version', (done) => {
    let app = new Application()
    app.applicationId = appDetails.applicationId
    app.accountId = versionPayload.accountId
    app.version = versionPayload.version
    app.name = appDetails.name
    app.createVersion((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('key').to.be.lengthOf.least(4)
      expect(result).to.have.property('secret').to.be.lengthOf.least(4)
      expect(result).to.have.property('applicationId').to.be.equal(appDetails.applicationId)

      done()
    })
  })

  it('should rename app', (done) => {
    let newName = 'test2'

    let app = new Application()
    app.name = newName
    app.key = appDetails.key
    app.rename((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('name').to.be.equal(newName)

      done()
    })
  })

  it('should verify app against key', (done) => {
    let app = new Application()
    app.applicationId = appDetails.applicationId
    app.key = appDetails.key
    app.verify((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('success')
      expect(result.success).to.be.equal(true)

      done()
    })
  })
})