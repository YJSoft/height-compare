export type Character = {
  id: string
  name: string
  height: number
  image: string
  bottom: number
  top: number
  color: string
  order: number
  createdAt: number
}

const DB_NAME = 'heightary-db'
const STORE = 'characters'

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

export async function loadCharacters(): Promise<Character[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveCharacter(character: Character) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(character)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function removeCharacter(id: string) {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearDatabase() {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
