'use strict'

import { ResponseBody } from './ResponseBody'

export class ESRouteHandler {
  constructor (Model) {
    this.Model = Model

    // Method Hard-Binding to allow them to be assigned to
    // other variables and work as expected
    this.createIndex = this.createIndex.bind(this)
    this.removeIndex = this.removeIndex.bind(this)
    this.create = this.create.bind(this)
    this.findById = this.findById.bind(this)
    this.search = this.search.bind(this)
    this.scan = this.scan.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
    this._handleError = this._handleError.bind(this)
  }

  createIndex (request, response) {
    const { Model } = this

    Model.createIndex(error => {
      let responseBody
      if (this._handleError(error, response)) { return }

      responseBody = new ResponseBody(200, 'OK')
      response.statusMessage = responseBody.message
      response.status(responseBody.statusCode).json(responseBody)
    })
  }

  removeIndex (request, response) {
    const { Model } = this

    Model.removeIndex(error => {
      let responseBody
      if (this._handleError(error, response)) { return }

      responseBody = new ResponseBody(200, 'OK')
      response.statusMessage = responseBody.message
      response.status(responseBody.statusCode).json(responseBody)
    })
  }

  create (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this
    const { body } = request

    Model.create(body, (error, data) => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(201, 'OK', data)
      response.body = responseBody
      next()
    })
  }

  findById (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this
    const { params } = request
    const { id } = params

    Model.findById(id, (error, data) => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(200, 'OK', data)
      response.body = responseBody
      next()
    })
  }

  search (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this
    const { query } = request

    Model.search({ match: query }, (error, data) => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(200, 'OK', data)
      response.body = responseBody
      next()
    })
  }

  scan (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this

    Model.scan((error, data) => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(200, 'OK', data)
      response.body = responseBody
      next()
    })
  }

  update (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this
    const { body } = request

    Model.update(body, error => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(200, 'OK')
      response.body = responseBody
      next()
    })
  }

  remove (request, response, next) {
    if (response.body) { return process.nextTick(next) }

    const { Model } = this
    const { params } = request
    const { id } = params

    Model.remove(id, error => {
      let responseBody
      if (this._handleError(error, response)) { return next() }

      responseBody = new ResponseBody(200, 'OK')
      response.body = responseBody
      next()
    })
  }

  _handleError (error, response) {
    let responseBody

    if (error && error.constructor.name === 'ResponseBody') {
      response.body = error
      return true
    } else if (error) {
      responseBody = new ResponseBody(500, error.toString(), error)
      response.body = responseBody
      return true
    }

    return false
  }
}
