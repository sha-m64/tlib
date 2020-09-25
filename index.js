#!/usr/bin/env node

const fs = require('fs')
const { basename } = require('path')
const { exit, argv } = require('process')
const readline = require('readline')

const { tlib } = require(__dirname + '/src/Tlib.js')

function help({verbose = false, exit_code = 0} = {})
{

  const invocation = "npx github:sha-m64/tlib" // argv.slice(0, 2).join(' ') //
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

function read_save_as_names(file_names, cb) {
  const files = Array.from(file_names)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  })

  const prompt = (str) => {
    rl.setPrompt(str)
    process.stdout.write(str)
  }

  let name_entry = {}
  let consumed = 0

  prompt(files[0] + " = ")
  rl.on('line', (new_name) => {
    if (new_name.trim() === '')
      return

    entry = files[consumed]
    save_as = new_name + `.${basename(entry)}.js`
    if (name_entry.hasOwnProperty(save_as)) {
      console.log('WARN: this name will overwrite', `'${new_names[save_as]}'`)
    }
    name_entry[save_as] = entry
    consumed++
    if (consumed === files.length) {
      rl.close()
    } else {
      prompt(files[consumed] + " = ")
    }
  }).on('close', () => {
    cb(Array.from(Object.entries(name_entry)))
  })
}

function parse_args(argv, cb) {
  let files = new Set,
    save_to = process.cwd(),
    repo

  while (argv.length) {
    arg = argv.shift()

    if (arg.startsWith('-')) {
      flag = arg[1]
      if(!flag) {
        console.error("ArgumentError: sorry, '-' is not acceptable as a valid file name yet!");
        help()
      }

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
      files.add(arg)
    }
  }

  if (repo === undefined) {
    console.error("ArgumentError: Failed to provide -r GH_USERNAME/repo")
    help({verbose: true})
  }

  if (files.size === 0) {
    console.error("ArgumentError: atleast a single file name is expected")
    help({verbose: true})
  }

  read_save_as_names(files, (file_saveas) => {
    cb({ files: file_saveas, save_to, repo })
  })
}

function main(argv)
{
  parse_args(argv, ({ files, repo, save_to }) => {
    fs.stat(save_to, (err, stat) => {
      if (err && err.code === 'ENOENT') {
        fs.mkdir(save_to, { recursive: true }, (err) => {
          if (err) throw err;
          tlib(repo, files, save_to)
        })
      }

      tlib(repo, files, save_to)
    })

  })
}

main(argv.slice(2))
