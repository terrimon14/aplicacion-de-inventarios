const path = require('path')
const fs = require('fs')
const { app } = require('electron')

let db = null
let SQL = null
let dbPath = null

async function getDatabase() {
  if (db) return db

  // Initialize sql.js
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '../../node_modules/sql.js/dist/', file),
  })

  // Database file location — next to the app (dev) or userData (prod)
  const dataDir = app.isPackaged
    ? app.getPath('userData')
    : path.join(__dirname, '../../')

  dbPath = path.join(dataDir, 'inventario.db')

  // Load existing DB or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  // Enable WAL-like mode and foreign keys
  db.run('PRAGMA foreign_keys = ON;')
  db.run('PRAGMA journal_mode = MEMORY;')

  // Run migrations
  runMigrations()

  return db
}

function saveDatabase() {
  if (!db || !dbPath) return
  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  } catch (err) {
    console.error('[DB] Save error:', err)
  }
}

function runMigrations() {
  const schema = require('./schema')
  schema.forEach(sql => {
    try {
      db.run(sql)
    } catch (err) {
      // Table already exists — skip
    }
  })
  // Seed initial data if empty
  seedIfEmpty()
}

function seedIfEmpty() {
  const row = db.exec('SELECT COUNT(*) as cnt FROM categories')
  const count = row[0]?.values[0][0] ?? 0
  if (count > 0) return

  const seed = require('./seed')
  seed.forEach(sql => {
    try { db.run(sql) } catch (_) {}
  })
  saveDatabase()
}

// Helper: run a query that returns rows as objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// Helper: run a query that returns one row
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params)
  return rows[0] ?? null
}

// Helper: run a mutation and auto-save
function run(sql, params = []) {
  db.run(sql, params)
  saveDatabase()
  return db.getRowsModified()
}

// Helper: get last inserted row id
function lastInsertRowId() {
  const result = db.exec('SELECT last_insert_rowid() as id')
  return result[0]?.values[0][0] ?? null
}

module.exports = { getDatabase, saveDatabase, queryAll, queryOne, run, lastInsertRowId }
