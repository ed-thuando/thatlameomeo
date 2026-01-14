#!/usr/bin/env node

/**
 * Helper script to hash a password
 * Usage: node scripts/hash-password.js <password>
 */

import bcrypt from 'bcrypt'

const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: node scripts/hash-password.js <password>')
  console.error('Example: node scripts/hash-password.js mypassword123')
  process.exit(1)
}

const password = args[0]

async function hashPassword() {
  try {
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    console.log('Hashed password:')
    console.log(hash)
    console.log('\nYou can use this hash in SQL:')
    console.log(`INSERT INTO users (username, password_hash, meomeo_score, theme_preference)`)
    console.log(`VALUES ('username', '${hash}', 0, 'default');`)
  } catch (error) {
    console.error('Error hashing password:', error.message)
    process.exit(1)
  }
}

hashPassword()
