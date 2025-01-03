import { useQuery } from "@tanstack/react-query";
import { http } from "../../axios";
import styles from "./jsonfeed.module.css";
import { Link } from "../Link/Link";

interface Author {
  name: string;
  url: string;
}

interface Item {
  id: string;
  title: string;
  content_html: string;
  content_parsed: Content;
  url: string;
  external_url: string;
  date_published: string;
  author: Author;
}

interface Feed {
  version: string;
  title: string;
  description: string;
  home_page_url: string;
  items: Item[];
}

interface Content {
  comments_url?: string;
  article_url?: string;
  points?: string;
  comments?: string;
}

export const HNJSONFeed = () => {
  const transformContentHtml = (data: Item) => {
    // find <p> tag containing text "Article URL" and from inside that extract the href attribute of the a tag
    const article_url = data.content_html.match(
      /<p>Article URL: <a href="([^"]+)">/,
    )?.[1];
    const comments_url = data.content_html.match(
      /<p>Comments URL: <a href="([^"]+)">/,
    )?.[1];
    const points = data.content_html.match(/<p>Points: ([0-9]+)<\/p>/)?.[1];
    const comments = data.content_html.match(
      /<p># Comments: ([0-9]+)<\/p>/,
    )?.[1];
    data.content_parsed = {
      article_url,
      comments_url,
      points,
      comments,
    };
  };

  const getHost = (item: Item) => {
    if (!item) return "";
    if (item.content_parsed.article_url) {
      const url = new URL(item.content_parsed.article_url);
      return url.host;
    }
    if (item.content_parsed.comments_url) {
      const url = new URL(item.content_parsed.comments_url);
      return url.host;
    }
    return "";
  };

  const { data, isLoading, isError } = useQuery<Feed>({
    queryKey: ["hn-json-feed"],
    queryFn: () =>
      http.get("/hn").then((res) => {
        res.data.items.forEach(transformContentHtml);
        return res.data;
      }),
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error fetching data</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ul>
        {data.items.map((item) => (
          <li key={item.id}>
            <h2>
              <Link
                url={
                  item.content_parsed.article_url ||
                  item.content_parsed.comments_url
                }
              >
                {item.title}
              </Link>
            </h2>
            <Link url={item.content_parsed.comments_url}>
              {`${getHost(item)} | ${item.content_parsed.points} points | ${item.content_parsed.comments} comments`}
            </Link>
            <p className={styles.date}>
              {new Date(item.date_published).toLocaleString()}
            </p>
            <div className={styles.separator} />
          </li>
        ))}
      </ul>
    </div>
  );
};
