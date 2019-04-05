'use strict'

import { ESClient } from './ESClient'
import { ResponseBody } from './ResponseBody'

const DEFAULT_SETTING = {
  index: {
    number_of_shards: 5,
    number_of_replicas: 1
  }
}

export class ESModel {
  constructor (CONFIG, Class) {
    const { _index = '', _type = '', _settings = {}, _properties = {} } = Class
    this.CONFIG = CONFIG
    this.Class = Class
    this.index = _index
    this.type = _type
    this.settings = _settings
    this.properties = _properties

    // Method Hard-binding
    this.createIndex = this.createIndex.bind(this)
    this.removeIndex = this.removeIndex.bind(this)
    this.create = this.create.bind(this)
    this.createWithIndex = this.createWithIndex.bind(this)
    this.findById = this.findById.bind(this)
    this.search = this.search.bind(this)
    this.scan = this.scan.bind(this)
    this.scroll = this.scroll.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
    this.removeBy = this.removeBy.bind(this)
  }

  createIndex (callback) {
    const { CONFIG, index, type, settings, properties } = this
    const Client = new ESClient(CONFIG)
    const body = {
      settings: Object.assign({}, DEFAULT_SETTING, settings),
      mappings: {
        [type]: { properties }
      }
    }

    Client.indices.create({
      index,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName, message } = error
        const responseBody = new ResponseBody(status, displayName, message)
        return callback(responseBody)
      }

      callback(null, response)
    })
  }

  removeIndex (callback) {
    const { CONFIG, index } = this
    const Client = new ESClient(CONFIG)

    Client.indices.delete({
      index
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const err = new ResponseBody(status, displayName, error)
        return callback(err)
      }

      return callback()
    })
  }

  create (attrs, callback) {
    const { CONFIG, Class, index, type } = this
    const Client = new ESClient(CONFIG)
    const body = new Class(attrs)
    const { id } = body

    Client.create({
      index,
      type,
      id,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      return callback(null, body)
    })
  }

  createWithIndex (attrs, options, callback) {
    const { CONFIG, Class, type } = this
    const body = new Class(attrs)
    const { id } = body
    const { getDynamicIndex } = options

    if (typeof getDynamicIndex !== 'function') {
      const err = new ResponseBody(500, "Require 'getDynamicIndex()' to Create Document")
      return process.nextTick(() => callback(err))
    }

    const index = getDynamicIndex(body)
    if (!index) {
      const err = new ResponseBody(500, "Invalid Index Found: '" + index + "'")
      return process.nextTick(() => callback(err))
    }

    async.waterfall([
      // Check if Index Exists
      next => {
        const Client = new ESClient(CONFIG)
        Client.indices.exists({ index }, (error, indexExists) => {
          Client.close()
          next(error, indexExists)
        })
      },

      // Create Index if it does not Exist
      (indexExists, next) => {
        if (!indexExists) { return process.nextTick(next) }

        const Client = new ESClient(CONFIG)
        Client.indices.create({
          index,
          body
        }, (error, response) => {
          Client.close()

          if (error) {
            const { status, displayName, message } = error
            const responseBody = new ResponseBody(status || 500, displayName, message)
            return next(responseBody)
          }

          next()
        })
      },

      // Create Document
      next => {
        const Client = new ESClient(CONFIG)
        Client.create({
          index,
          type,
          id,
          body
        }, (error, response) => {
          Client.close()

          if (error) {
            const { status, displayName } = error
            const responseBody = new ResponseBody(status, displayName, error)
            return next(responseBody)
          }

          return next(null, body)
        })
      }
    ], callback)
  }

  findById (id, callback) {
    const { CONFIG, index, type } = this
    const Client = new ESClient(CONFIG)

    Client.get({
      index,
      type,
      id
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      let { found, _source } = response
      if (!found) { _source = null }
      return callback(null, _source)
    })
  }

  search (query, callback) {
    const { CONFIG, index } = this
    const Client = new ESClient(CONFIG)
    const body = {
      query
    }

    Client.search({
      index,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      let { hits } = response.hits
      hits = hits.sort((a, b) => b._score - a._score)
      hits = hits.map(hit => {
        const { _score, _source } = hit
        return Object.assign({ _score }, _source)
      })
      return callback(null, hits)
    })
  }

  scan (callback) {
    const { CONFIG, index } = this
    const Client = new ESClient(CONFIG)
    const body = {
      query: {
        match_all: {}
      },
      size: 100
    }

    Client.search({
      index,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      let { hits } = response.hits
      hits = hits.sort((a, b) => b._score - a._score)
      hits = hits.map(hit => {
        const { _score, _source } = hit
        return Object.assign({ _score }, _source)
      })
      return callback(null, hits)
    })
  }

  scroll (params, callback) {
    const { CONFIG, index } = this
    const Client = new ESClient(CONFIG)
    const { query, scrollDuration } = params
    const body = { query }
    let allRecords = []

    const responseHandler = function (error, response) {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      let { hits = {} } = response
      const allHits = hits.hits || []

      allHits.forEach(hit => allRecords.push(hit._source))

      if (hits.total === allRecords.length) { return callback(null, allRecords) }

      Client.scroll({
        scrollId: response._scroll_id,
        scroll: scrollDuration
      }, responseHandler)
    }

    Client.search({
      index,
      scroll: scrollDuration,
      body
    }, responseHandler)
  }

  update (attrs, callback) {
    const { CONFIG, index, type, Class } = this
    const Client = new ESClient(CONFIG)
    const doc = new Class(attrs)
    const { id } = doc
    const body = { doc }

    Client.update({
      index,
      type,
      id,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName, message } = error
        const responseBody = new ResponseBody(status, displayName, message)
        return callback(responseBody)
      }

      callback(null, response)
    })
  }

  remove (id, callback) {
    const { CONFIG, index, type } = this
    const Client = new ESClient(CONFIG)

    Client.delete({
      index,
      type,
      id
    }, (error, response) => {
      if (error) {
        const { status, displayName } = error
        const responseBody = new ResponseBody(status, displayName, error)
        return callback(responseBody)
      }

      return callback()
    })
  }

  removeBy (query, callback) {
    const { CONFIG, index } = this
    const Client = new ESClient(CONFIG)
    const body = { query }

    Client.deleteByQuery({
      index,
      body
    }, (error, response) => {
      if (error) {
        const { status, displayName, message } = error
        const responseBody = new ResponseBody(status, displayName, message)
        return callback(responseBody)
      }

      callback(null, response)
    })
  }
}
