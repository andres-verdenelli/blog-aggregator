import { readConfig, setUser } from './config.js'
import {
  createUser,
  deleteAllUsers,
  getUser,
  getUsers,
} from './lib/db/queries/users.js'
import { fetchFeed } from './rss.js'

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>
type CommandsRegistry = Record<string, CommandHandler>

const registry: CommandsRegistry = {}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Error: no command provided')
    process.exit(1)
  }

  const [cmdName, ...cmdArgs] = args

  try {
    await runCommand(registry, cmdName, ...cmdArgs)
    process.exit(0)
  } catch (err) {
    console.error((err as Error).message)
    process.exit(1)
  }
}

async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  const handler = registry[cmdName]
  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`)
  }
  await handler(cmdName, ...args)
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler
}

async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error('Error: a username is required for login')
  }
  const username = args[0]

  try {
    const user = await getUser(username)
    if (!user) {
      console.error(`❌ User "${username}" does not exist`)
      process.exit(1)
      return
    }

    setUser(username)
    console.log(`✅ Logged in as '${username}'`)
  } catch (err) {
    console.error('Error login user')
    console.dir(err, { depth: null })
    process.exit(1)
  }
}

async function handleRegister(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error('Error: a username is required for login')
  }
  const username = args[0]
  try {
    const user = await createUser(username)
    console.log('✅ User created:', user)
    setUser(username)
  } catch (err) {
    console.error('🔥 Error when creating user:')
    console.dir(err, { depth: null })
    process.exit(1)
  }
}

async function handleReset(cmdName: string, ...args: string[]) {
  try {
    await deleteAllUsers()
    console.log('All users deleted')
    process.exit(0)
  } catch (err) {
    console.error('Error deletening all users')
    console.dir(err, { depth: null })
    process.exit(1)
  }
}

async function handleUsers(cmdName: string, ...args: string[]) {
  try {
    const users = await getUsers()
    const currentUser = readConfig().currentUserName
    if (!users) {
      console.log('No users found')
      process.exit(0)
    }

    users.forEach(user => {
      console.log(`* ${user}${user === currentUser ? ' (current)' : ''}`)
    })
    process.exit(0)
  } catch (err) {
    console.error('Error obteniendo todos los usuarios')
    console.dir(err, { depth: null })
    process.exit(1)
  }
}

async function handleAggregator(cmdName: string, ...args: string[]) {
  const rssFeed = await fetchFeed('https://www.wagslane.dev/index.xml')
  console.dir(rssFeed, { depth: null })
}

registerCommand(registry, 'login', handlerLogin)
registerCommand(registry, 'register', handleRegister)
registerCommand(registry, 'reset', handleReset)
registerCommand(registry, 'users', handleUsers)
registerCommand(registry, 'agg', handleAggregator)

main()
