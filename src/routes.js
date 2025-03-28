import { randomUUID } from 'node:crypto'
import { buildRoutePath } from "./utils/build-route-path.js"
import { Database } from './database.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handle: (request, response) => {
      const { search } = request.query
      const tasks = database.select('tasks', search ? {
        title: search, description: search
      } : null)

      return response.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handle: (request, response) => {
      const { title, description } = request.body

      const task = {
        id: randomUUID(),
        title: title,
        description: description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null
      }

      database.insert('tasks', task)

      return response.writeHead(201).end("Nova Task criada")
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handle: (request, response) => {
      const { id } = request.params
      const { title, description } = request.body

      let task = database.select('tasks', id)

      if (!task) {
        response.writeHead(404)
        return response.end(JSON.stringify({ error: 'Task não encontrada' }))
      }

      const updatedFields = {
        ...task,
        ...(title && { title }),
        ...(description && { description }),
        updated_at: new Date()
      }

      task = database.update('tasks', id, updatedFields)

      return response.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handle: (request, response) => {
      const { id } = request.params

      database.delete('tasks', id)

      return response.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handle: (request, response) => {
      const { id } = request.params

      database.updateCompleted('tasks', id, { completed_at: new Date(), updated_at: new Date() })

      return response.writeHead(204).end()
    }
  }
]