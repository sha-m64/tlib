const fs = require('fs')
const https = require('https')
const { exit } = require('process')

function gh_request(path, cb, {http_opts = ({})}={}) {
  const validator = (res) => {
    if (res.statusCode !== 200) {
      console.error("something went wrong while querying; likely a wrong path (%s)", path)
      exit(31)
    }

    cb(res)
  }

  const opts = Object.assign({
    method: 'GET',
    hostname: 'github.com',
    path: '/' + path,
  }, http_opts)

  https.request(opts, validator).end()
}

function raw_gh_request(path, cb) {
  gh_request(path, cb, {http_opts: {hostname: 'raw.githubusercontent.com'}})
}

function validate_gh_path(path, cb) {
  gh_request(path, cb, {http_opts: {method: 'HEAD'}})
}

function matching_template(file_prefix) {
  return file_prefix + '.template.js'
}

function tlib(repo, files, save_to, branch='master') {

  const download = ([save_as, file_identifier]) => {
    const file = matching_template(file_identifier)
    const http_path = [repo, branch, file].join('/')
    raw_gh_request(http_path, (res) => {
      res.pipe(fs.createWriteStream(`${save_to}/${save_as}`))
    })
  }

  /* let it verify and exit at whim */
  validate_gh_path(repo, (res) => null)
  files.forEach(download)
}

module.exports = { tlib }
