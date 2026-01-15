// Simple script to delete test users from Turso database
const https = require('https')

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://thatlameomeo-ed-thuando.aws-ap-northeast-1.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_TOKEN) {
    console.error('TURSO_AUTH_TOKEN environment variable is required')
    process.exit(1)
}

// Extract hostname from URL
const url = new URL(TURSO_URL.replace('libsql://', 'https://'))

const data = JSON.stringify({
    requests: [
        { type: "execute", stmt: { sql: "DELETE FROM users WHERE username LIKE 'temp_%'" } },
        { type: "close" }
    ]
})

const options = {
    hostname: url.hostname,
    path: '/v2/pipeline',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}

const req = https.request(options, (res) => {
    let body = ''

    res.on('data', (chunk) => {
        body += chunk
    })

    res.on('end', () => {
        console.log('Response:', body)
        try {
            const result = JSON.parse(body)
            if (result.results && result.results[0]) {
                console.log('\nSuccess! Deleted', result.results[0].response?.result?.affected_row_count || result.results[0].affected_row_count || 0, 'test users')
            }
        } catch (e) {
            console.log('Response received, but could not parse')
        }
    })
})

req.on('error', (error) => {
    console.error('Error:', error.message)
})

req.write(data)
req.end()
