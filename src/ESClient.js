'use strict'

import elasticsearch from 'elasticsearch'

export const ESClient = (CONFIG) => {
  const { AUTH = {}, ES = {} } = CONFIG
  const { ACCESS_KEY_ID = '', SECRET_ACCESS_KEY = '' } = AUTH
  const { REGION = '', HOST = '' } = ES
  const ES_CONFIG = {
    service: 'es',
    region: REGION,
    host: HOST,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
  return new elasticsearch.Client(ES_CONFIG)
}
