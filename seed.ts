import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const scrapePage = async (url: string): Promise<string> => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return (await loader.scrape()).replace(/<[^>]*>?/gm, "");
};

const loadData = async (webpages: string[]) => {
  for await (const url of webpages) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: chunk,
      });
      const { error } = await supabase.from("chunks").insert({
        content: chunk,
        vector: embedding,
        url: url,
      });
      if (error) {
        console.error("Error inserting chunk:", error);
      }
    }
  }
};

loadData([
  "https://en.wikipedia.org/wiki/Samsung_Galaxy_S25",
  "https://en.wikipedia.org/wiki/Samsung_Galaxy_S24",
  "https://en.wikipedia.org/wiki/IPhone_16",
  "https://en.wikipedia.org/wiki/IPhone_16_Pro",
  "https://en.wikipedia.org/wiki/IPhone_15",
  "https://en.wikipedia.org/wiki/IPhone_15_Pro",
]);
