export interface Author {
  name: string;
  url: string;
}

export interface Content {
  comments_url?: string;
  article_url?: string;
  points?: string;
  comments?: string;
}

export interface Item {
  id: string;
  title: string;
  content_html: string;
  content_parsed: Content;
  url: string;
  external_url: string;
  date_published: string;
  author: Author;
  pubDate?: string;
  link?: string;
  guid?: string;
  thumbnail?: string;
  description?: string;
  enclosure?: {
    link?: string;
    type?: string;
  };
  categories?: string[];
}

export interface Feed {
  version: string;
  title: string;
  description: string;
  home_page_url: string;
  items: Item[];
  url?: string;
  author?: string;
  image?: string;
}
