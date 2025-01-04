import { useQuery } from "@tanstack/react-query";
import { http } from "../../axios";
import styles from "./jsonfeed.module.css";
import { Link } from "../Link/Link";
import { Feed, Item } from "../../../server/types/types";

interface FeedProps {
  source: "hn" | "yle";
}

export const JSONFeed = ({ source }: FeedProps) => {
  const transformHNContentHtml = (data: Item) => {
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
    queryKey: [`${source}-json-feed`],
    queryFn: () =>
      http.get(`/${source}`).then((res) => {
        res.data.items.forEach(transformHNContentHtml);
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
            <div className={styles.information}>
              <h2>
                <Link
                  url={
                    item.content_parsed.article_url ||
                    item.content_parsed.comments_url ||
                    item.url
                  }
                >
                  {item.title}
                </Link>
              </h2>
              {source === "hn" && (
                <Link url={item.content_parsed.comments_url}>
                  {`${getHost(item)} | ${item.content_parsed.points} points | ${item.content_parsed.comments} comments`}
                </Link>
              )}
              <p className={styles.date}>
                {new Date(item.date_published).toLocaleString()}
              </p>
              <div className={styles.separator} />
            </div>
            {source === "yle" && item.enclosure?.type === "image/jpeg" && (
              <img
                src={`${item.enclosure?.link}?w=150`}
                alt={item.title}
                className={styles.image}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
