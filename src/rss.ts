import { XMLParser } from 'fast-xml-parser'

type RSSFeed = {
  channel: {
    title: string
    link: string
    description: string
    item: RSSItem[]
  }
}

type RSSItem = {
  title: string
  link: string
  description: string
  pubDate: string
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  try {
    const response = await fetch(feedURL, {
      headers: {
        'User-Agent': 'gator',
      },
    })
    const xmlText = await response.text()
    const parser = new XMLParser()
    const parsedXml = parser.parse(xmlText)

    const channel = parsedXml?.rss?.channel

    if (!channel || typeof channel !== 'object') {
      throw new Error(
        'Invalid RSS feed format: "channel" element missing or malformed.'
      )
    }

    const { title, link, description } = channel

    if (
      typeof title !== 'string' ||
      typeof link !== 'string' ||
      typeof description !== 'string'
    ) {
      throw new Error(
        'Invalid RSS feed: Missing or invalid channel metadata (title, link, description).'
      )
    }

    const rawItems: unknown = channel.item
    const items: RSSItem[] = Array.isArray(rawItems)
      ? rawItems
          .filter(
            (entry: any) =>
              typeof entry.title === 'string' &&
              typeof entry.link === 'string' &&
              typeof entry.description === 'string' &&
              typeof entry.pubDate === 'string'
          )
          .map((entry: any) => ({
            title: entry.title,
            link: entry.link,
            description: entry.description,
            pubDate: entry.pubDate,
          }))
      : []

    return {
      channel: {
        title,
        link,
        description,
        item: items,
      },
    }
  } catch (err) {
    console.error('Error during fetching feed')
    console.dir(err, { depth: null })
    process.exit(1)
  }
}
