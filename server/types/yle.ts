type Feed = {
  url: string;
  title: string;
  link: string;
  author: string;
  description: string;
  image: string;
};

type Enclosure = {
  link: string;
  type: string;
};

export type YLEItem = {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: Enclosure;
  categories: string[];
};

export type YLERSSFeed = {
  status: string;
  feed: Feed;
  items: YLEItem[];
};
