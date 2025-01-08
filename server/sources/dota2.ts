import { load } from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  try {
    const news: NewsItem[] = []

    if (!news.length) {
      // 如果 hawk.live 失败，回退到 Steam RSS 源
      const steamRes = await myFetch("https://store.steampowered.com/feeds/news/app/570/?l=schinese", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml,application/xml;q=0.9",
        },
      })
      const $ = load(steamRes as string, { xmlMode: true })

      return $("item").map((_, item) => {
        const $item = $(item)
        const title = $item.find("title").text()
        const description = $item.find("description").text()

        return {
          id: $item.find("guid").text(),
          title,
          url: $item.find("link").text(),
          pubDate: new Date($item.find("pubDate").text()).getTime(),
          extra: {
            date: new Date($item.find("pubDate").text()).getTime(),
            hover: description ? load(description).text().trim() : undefined,
          },
        }
      }).get()
    }

    return news
  } catch (error) {
    console.error("Error fetching DOTA2 news:", error)
    throw error
  }
})
