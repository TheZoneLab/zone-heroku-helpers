#!/usr/bin/env node
const rp = require('request-promise')
const colors = require('colors')
require('console.table')
const [herokuToken, appId1, appId2] = process.argv.slice(process.argv.length - 3, process.argv.length)

const defaultOptions = {
  headers: {
    'Authorization': `Bearer ${herokuToken}`,
    'Accept': 'application/vnd.heroku+json; version=3'
  },
  json: true // Automatically parses the JSON string in the response
}

Promise.all([
  rp(Object.assign({}, defaultOptions, {uri: `https://api.heroku.com/apps/${appId1}/config-vars`})),
  rp(Object.assign({}, defaultOptions, {uri: `https://api.heroku.com/apps/${appId2}/config-vars`}))
]).then(([app1Vars, app2Vars]) => {
  const app1VarsKeys = Object.keys(app1Vars)
  const app2VarsKeys = Object.keys(app2Vars)

  const app1KeysMissingFrom2 = app1VarsKeys.filter((k) => {
    return app2VarsKeys.indexOf(k) < 0
  })

  const app2KeysMissingFrom1 = app1VarsKeys.filter((k) => {
    return app1VarsKeys.indexOf(k) < 0
  })

  const displayData = app1VarsKeys.concat(app2VarsKeys).map(generateDisplayDataRow.bind(null, app1Vars, app2Vars))

  console.table(displayData)

}).catch((e) => {
  console.log(e)
})

function generateDisplayDataRow(app1Vars, app2Vars, k) {
    let app1Value = app1Vars[k]
    let app2Value = app2Vars[k]
    if (app1Value === app2Value) {
      app1Value = app1Value.dim.green
      app2Value = app2Value.dim.green
    } else {
      if (app1Value) {
        app1Value = app1Value.yellow
      } else {
        app1Value = 'WARNING: NOT SET'.bold.red
      }
      if (app2Value) {
        app2Value = app2Value.yellow
      } else {
        app2Value = 'WARNING: NOT SET'.bold.red
      }
    }

    return {
      key: k,
      [appId1.bold]: app1Value,
      [appId2.bold]: app2Value
    }
  }
