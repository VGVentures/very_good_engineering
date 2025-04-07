import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

const docs = await getCollection("docs");

export const GET: APIRoute = async () => {
  return new Response(
    `# Very Good Engineering Documentation\n\n${docs
      .map((doc) => {
        return `- [${doc.data.title}](https://engineering.verygood.ventures/${doc.slug}/)\n`;
      })
      .join("")}`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
