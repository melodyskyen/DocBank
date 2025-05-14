# Reginold: Fullstack RAG-as-a-Service Template

**Build your own AI-powered research assistant for your private knowledge base!**

Reginold is a serverless Next.js template built for the Vercel AI SDK, leveraging **Mastra** for advanced Retrieval Augmented Generation (RAG) and **Inngest** for robust background job processing. This template provides a powerful foundation to quickly deploy a sophisticated RAG-as-a-Service application.

[![Star on GitHub](https://img.shields.io/github/stars/YOUR_USERNAME/YOUR_REPOSITORY?style=social)](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/stargazers)

---

## The Million-Dollar Idea, Now Free.

There was a time when a product with these capabilities – a private, AI-driven knowledge assistant that can ingest and reason over your documents – would be a multi-million dollar endeavor. The AI landscape is evolving rapidly, and powerful tools are becoming more accessible.

**Reginold is my contribution to the AI startup space.** I'm giving this template away for free to empower builders, innovators, and entrepreneurs like you.

All I ask in return?
1.  **Star this repository** on GitHub! ⭐
2.  Give a **shoutout or a link back** when you build something amazing with it.

Let's build the future of AI together!

---

## Features

*   **Fullstack RAG Implementation**: End-to-end solution for building AI assistants that can chat with your data.
*   **Private Knowledge Base**: Securely upload and manage your private documents. Your data remains yours.
*   **Intelligent Document Processing**:
    *   Seamless document uploads.
    *   Automatic embedding generation for uploaded content (via Inngest background jobs).
    *   Efficient semantic search and retrieval powered by Mastra.
*   **Conversational AI Interface**: Engage with your knowledge base through an intuitive chat interface, built with the Vercel AI SDK.
*   **Serverless & Scalable**: Built on Next.js for Vercel, ensuring easy deployment, scalability, and cost-efficiency.
*   **Background Job Processing**: Utilizes Inngest for reliable handling of intensive tasks like document processing and embedding generation, ensuring your application remains responsive.
*   **Modern Tech Stack**:
    *   Next.js (App Router)
    *   Vercel AI SDK
    *   Mastra (for RAG)
    *   Inngest (for background jobs)
    *   Tailwind CSS
    *   shadcn/ui
    *   TypeScript

## How It Works

1.  **Upload Documents**: Add your private documents (e.g., PDFs, TXT, DOCX - *please specify exact supported types*) to your knowledge base.
2.  **Automated Processing**: Inngest triggers background jobs to parse, chunk, generate embeddings, and store them (e.g., in Supabase pgvector, Pinecone - *please specify*).
3.  **Ask Questions**: Interact with the AI assistant.
4.  **Intelligent Retrieval**: Mastra performs semantic search for relevant document chunks.
5.  **Augmented Generation**: Retrieved context is passed to an LLM via the Vercel AI SDK for answers.

## Deploy Your Own

Deploy your own version of Reginold to Vercel. You'll need to configure environment variables for your LLM, Inngest, Mastra, and database providers during setup.

<!-- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2FYOUR_REPOSITORY&env=OPENAI_API_KEY,INNGEST_EVENT_KEY,INNGEST_SIGNING_KEY,MASTRA_API_KEY,DATABASE_URL,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables%20for%20Synapse%20AI.&project-name=synapse-ai-rag&repository-name=synapse-ai-rag&demo-title=Synapse%20AI%20RAG%20Service&demo-url=https%3A%2F%2Fyour-demo-url.vercel.app) -->

*(Note: Update the `repository-url` in the Deploy button above and the environment variables (`env=...`) to match the essential ones for your template. The `demo-url` should point to a live demo if you have one.)*

## Getting Started

### Prerequisites

*   Node.js (e.g., v18.x or v20.x)
*   npm/yarn/pnpm
*   Vercel Account (for deployment)
*   Inngest Account & relevant keys (Event Key, Signing Key for Cloud)
*   Mastra setup (API key, specific configuration for your chosen backend/vector store)
*   LLM Provider API Key (e.g., OpenAI)
*   Database connection string (e.g., Supabase, Neon)
*   Auth.js secret (`NEXTAUTH_SECRET`)

### Running Locally

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    cd YOUR_REPOSITORY
    ```
2.  **Install Dependencies**:
    ```bash
    pnpm install # Recommended
    # or npm install / yarn install
    ```
3.  **Set Up Environment Variables**:
    Copy `.env.example` to `.env.local` and fill in your credentials. **Do not commit `.env.local`!**
    ```env
    # LLM Provider (e.g., OpenAI)
    OPENAI_API_KEY=

    # Inngest (ensure these match your Inngest setup - dev server or Cloud)
    INNGEST_EVENT_KEY=
    # INNGEST_SIGNING_KEY= # Required if using Inngest Cloud and secure webhooks
    # INNGEST_DEV=true # To use the Inngest Dev Server locally without signing key

    # Mastra / Vector Store / Database
    # Provide specific variables needed for Mastra and your chosen DB
    # e.g., for Supabase:
    # SUPABASE_URL=
    # SUPABASE_SERVICE_ROLE_KEY=
    # e.g., for Pinecone:
    # PINECONE_API_KEY=
    # PINECONE_ENVIRONMENT=
    # PINECONE_INDEX_NAME=
    DATABASE_URL= # General database connection string if Mastra uses it directly

    # Authentication (Auth.js)
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET= # Generate a strong secret: `openssl rand -base64 32`
    # Add any OAuth provider client IDs/secrets if configured
    # GITHUB_CLIENT_ID=
    # GITHUB_CLIENT_SECRET=
    ```
4.  **Run Inngest Dev Server** (for local development with Inngest functions):
    Open a new terminal and run:
    ```bash
    npx inngest-cli dev -u http://localhost:3000/api/inngest
    ```
5.  **Run the Next.js Development Server**:
    ```bash
    pnpm dev
    ```
    Your app should now be running on [http://localhost:3000](http://localhost:3000).

## Project Structure (Example)

```
/app                    # Next.js App Router: UI pages & API routes
/components             # Shared React components
/inngest                # Inngest function definitions
/lib                    # Core logic: Mastra client, DB interactions, utils
/public                 # Static assets (images, fonts)
.env.example            # Template for environment variables
# ... and other standard Next.js files
```

## Customization

*   **LLMs**: Switch models via Vercel AI SDK configurations.
*   **Embeddings**: Configure embedding models in your Mastra setup / document processing pipeline.
*   **Vector Store**: Mastra is flexible; adapt its backend to your chosen vector database.
*   **UI**: Modify components in `components/` and styles (Tailwind CSS).

## Contributing

Contributions are welcome! Please follow standard fork, branch, commit, and PR practices.

## License

Licensed under the MIT License. See `LICENSE.txt`.

---

**Thank you for checking out Reginold! Star the repo, and let me know what you build!**

Connect with me:
*   GitHub: [@YourGitHubUsername](https://github.com/YourGitHubUsername) 
*   Twitter: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)
*   LinkedIn: [Your LinkedIn Profile URL](https://linkedin.com/in/yourprofile)
