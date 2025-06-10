## nextjs-rag

This is a simple application designed to demonstrate the core aspects of RAG.

Before you run this yourself you will need to:

- create a Supabase project, run the content of `setupDb.sql` into it
- create an OpenAI API account and add some credit
- create a `.env` file in the root of the project and add the following variables:
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- run `npm run seed` to populate the Supabase database (this can take a little while)

Then you can run, modify and use this application as you would any other Next.JS application.

For a detailed description of how this was built, check out [this medium article](TODO)
