#!/usr/bin/env node

const fs = require('fs')
const { exit, argv } = require('process')
const { tlib } = require(__dirname + '/src/Tlib.bs.js')

function help({verbose = false, exit_code = 0} = {})
{

  const invocation = argv.slice(0, 2).join(' ') // "npx github:sha-m64/tlib"
  console.log("USAGE: %s -FLAG value ... file [file ...]", invocation)
  console.log("\t-h for help")

  if (verbose) {
    console.log("fetch template from git repo\n")
    console.log("FLAGS:\n %s\n %s\n %s\n",
      "-h: help menu",
      "-r: git repo",
      "-d: target directory"
    )

    console.log("Example: $ %s -r sha-m64/templates router # fetches router.template.js from sha-m64/templates", invocation)
    console.log("\t $ %s -r sha-m64/templates -d /tmp/buzz router controller # saves to /tmp/buzz", invocation)
  }
  exit(exit_code)
}

function parse_args(argv) {
  let files = [], 
    save_to = process.cwd(),
    repo

  let i = 0

  while (argv.length) {
    arg = argv.shift()

    if (arg.startsWith('-')) {
      flag = arg[1]
      value = argv.shift()
      if (!value && flag != 'h') {
        console.error("ArgumentError: Value not provided for -%s.", flag)
        help({exit_code: 1})
      }

      switch (flag) {
        case 'r':
          repo = value
          break
        case 'd':
          save_to = value
          break
        case 'h':
          help()
          break
        default:
          console.error("ArgumentError: unrecognized flag %s", arg);
          help({verbose: true})
          break
      }
    } else {
      files.push(arg)
    }
  }

  if (repo === undefined) {
    console.error("ArgumentError: Failed to provide -r GH_USERNAME/repo")
    help({verbose: true})
  }

  if (files.length === 0) {
    console.error("ArgumentError: atleast a single file name is expected")
    help({verbose: true})
  }

  return { files, save_to, repo }
}

function main(argv)
{

  const { files, repo, save_to } = parse_args(argv)

    // fs.realpath(save_to, (err, absolute_save_to) => {
    //   if (err) {
    //     console.error("ArgumentError: issue in resolving path '%s'.", save_to);
    //     console.error("DUMP\n====\n\n%s", err);
    //     exit(21);
    //   }
      // tlib(repo, files, absolute_save_to)
    // })

  fs.stat(save_to, (err, stat) => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(save_to, { recursive: true }, (err) => {
        if (err) throw err;
        tlib(repo, files, save_to)
      })
    }

    tlib(repo, files, save_to)
  })
}

main(argv.slice(2))
