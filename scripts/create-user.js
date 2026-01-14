#!/usr/bin/env node

/**
 * Helper script to create a new user account
 * Usage: node scripts/create-user.js <username> <password> [display_name]
 */

import bcrypt from 'bcrypt'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    // Skip comments and empty lines
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    }
  })
} catch (error) {
  console.error('Error loading .env.local file:', error.message)
  console.error('Make sure .env.local exists in the project root')
  console.error('Expected path:', envPath)
  process.exit(1)
}

const databaseUrl = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!databaseUrl || !authToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: node scripts/create-user.js <username> <password> [display_name]')
  console.error('Example: node scripts/create-user.js admin mypassword123 "Admin User"')
  process.exit(1)
}

const [username, password, displayName] = args

async function createUser() {
  try {
    // Create database client
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    })

    // Check if user already exists
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username],
    })

    if (existingUser.rows.length > 0) {
      console.error(`Error: User "${username}" already exists`)
      client.close()
      process.exit(1)
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert user
    const result = await client.execute({
      sql: `
        INSERT INTO users (username, password_hash, display_name, meomeo_score, theme_preference)
        VALUES (?, ?, ?, 0, 'default')
        RETURNING id, username, display_name
      `,
      args: [username, passwordHash, displayName || username],
    })

    if (result.rows.length > 0) {
      const user = result.rows[0]
      console.log('✅ User created successfully!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Display Name: ${user.display_name || user.username}`)
      console.log(`\n   You can now login with:`)
      console.log(`   Username: ${username}`)
      console.log(`   Password: ${password}`)
    } else {
      console.error('Error: Failed to create user')
      process.exit(1)
    }

    client.close()
  } catch (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }
}

createUser()
