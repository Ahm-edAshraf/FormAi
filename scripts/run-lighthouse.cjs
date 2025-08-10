#!/usr/bin/env node
/* Simple local Lighthouse CI runner (against localhost:3000) */
const { spawn } = require('node:child_process')

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts })
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(cmd + ' exited ' + code))))
  })
}

;(async () => {
  try {
    await run('npx', ['-y', 'lighthouse', 'http://localhost:3000', '--preset=desktop', '--output=json', '--output-path=./.lighthouse/report.json'])
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()


