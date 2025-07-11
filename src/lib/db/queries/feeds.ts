import { readConfig } from 'src/config'
import { db } from '../index'
import { feeds, users } from '../schema'
import { getUser } from './users'
import { eq } from 'drizzle-orm'

export async function createFeed(name: string, url: string) {
  try {
    const currentUser = readConfig().currentUserName
    const user = await getUser(currentUser)

    if (!user) {
      throw new Error(`User ${currentUser} not found in database`)
    }

    const [createdFeed] = await db
      .insert(feeds)
      .values({
        name,
        url,
        user_id: user.id,
      })
      .returning()

    return createdFeed
  } catch (error) {
    console.error('Error creating feed')
    console.dir(error, { depth: null })
  }
}

export async function getAllFeeds() {
  try {
    const result = await db
      .select({
        feedName: feeds.name,
        feedUrl: feeds.url,
        userName: users.name,
      })
      .from(feeds)
      .leftJoin(users, eq(feeds.user_id, users.id))
    return result
  } catch (error) {
    console.error('Error fetching all feeds')
    console.dir(error, { depth: null })
  }
}
