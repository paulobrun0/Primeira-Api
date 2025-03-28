import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8').then(data => {
      this.#database = JSON.parse(data)
    }).catch(() => {
      this.#persist()
    })
  }

  #persist() {
    fs.writeFile('db.json', JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          const field = row[key]
          if (typeof field === 'string') {
            return field.toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      })
    }

    return data
  }


  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }
  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = {
        ...this.#database[table][rowIndex],
        ...data,
        id,
        updated_at: new Date()
      }

      this.#persist()
    }
  }

  updateCompleted(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      const existingRow = this.#database[table][rowIndex]
      const newCompletedAt = existingRow.completed_at ? null : new Date()

      this.#database[table][rowIndex] = {
        ...existingRow,
        completed_at: newCompletedAt,
        updated_at: new Date()
      }
      this.#persist()
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}