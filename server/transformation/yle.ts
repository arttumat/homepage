import { Feed } from "../types/types";
import { YLEItem, YLERSSFeed } from "../types/yle";

export function transformYleApiResponse(apiResponse: YLERSSFeed): Feed {
  return {
    version: "https://jsonfeed.org/version/1",
    title: apiResponse.feed.title,
    description: apiResponse.feed.description,
    home_page_url: apiResponse.feed.link,
    url: apiResponse.feed.url,
    author: apiResponse.feed.author,
    image: apiResponse.feed.image,
    items: apiResponse.items.map((item: YLEItem) => ({
      id: item.guid,
      title: item.title,
      content_html: item.content,
      content_parsed: {}, // Assuming no parsed content provided, set empty object
      url: item.link,
      external_url: item.link,
      date_published: item.pubDate,
      author: {
        name: item.author || "Unknown",
        url: apiResponse.feed.url,
      },
      pubDate: item.pubDate,
      link: item.link,
      guid: item.guid,
      thumbnail: item.thumbnail,
      description: item.description,
      enclosure: item.enclosure
        ? {
            link: item.enclosure.link,
            type: item.enclosure.type,
          }
        : undefined,
      categories: item.categories,
    })),
  };
}
