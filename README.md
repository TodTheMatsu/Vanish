# Vanish - Documentation

---

## Project Structure: Supabase (Backend) vs Frontend (React)

### 🟦 Supabase (Backend)
- `supabase/` — All backend code, Edge Functions, and migrations
  - `supabase/functions/` — Supabase Edge Functions (serverless API endpoints)
    - `create-conversation/`   — Implemented: Handles conversation creation (used by frontend)
    - `get-conversations/`     — Placeholder (add code if needed)
    - `get-messages/`          — Placeholder (add code if needed)
    - `get-user-permissions/`  — Placeholder (add code if needed)
    - `send-message/`          — Placeholder (add code if needed)
  - `supabase/migrations/` — Database migration files (SQL)
  - `supabase/config.toml` — Supabase project config
- `sql/policies/` — (Optional) SQL files for RLS policies

### 🟩 Frontend (React App)
- `src/` — All React app code
  - `src/api/` — API calls (calls Edge Functions or Supabase directly)
  - `src/components/` — React UI components
  - `src/pages/`, `src/hooks/`, etc. — App logic and UI
- `public/` — Static assets for the frontend
- `.env` — Environment variables for frontend (Supabase URL/keys)

### 🟨 Project Root (shared/config)
- `package.json`, `vite.config.ts`, `tsconfig.json`, etc. — Project config
- `README.md` — This file

---

## Edge Functions

Edge Functions are serverless API endpoints deployed to Supabase. Only `create-conversation` is implemented by default. Others are placeholders—add code as needed.

- `create-conversation`: Handles creation of conversations and participants in a single transaction, bypassing RLS issues. Used by the frontend for all new conversation creation.
- `get-conversations`, `get-messages`, `get-user-permissions`, `send-message`: Placeholders. Implement as needed for advanced backend logic or security.

**To add/update an Edge Function:**
1. Add or edit code in `supabase/functions/<function-name>/index.ts`.
2. Deploy with `npx supabase functions deploy <function-name>`.
3. Call from frontend using the `/functions/v1/<function-name>` endpoint.

---

## Migrations & Database Setup

- All schema and RLS changes should be made as migration files in `supabase/migrations/`.
- To apply migrations locally: `npx supabase db reset` (WARNING: this wipes local data!)
- To push migrations to remote: `npx supabase db push` (requires project to be linked)
- RLS policies may also be managed in `sql/policies/` for reference, but only migrations in `supabase/migrations/` are applied automatically.

---

## File Structure (Detailed)

```
Vanish/
├── supabase/                  # 🟦 Supabase backend (Edge Functions, migrations, config)
│   ├── config.toml            # Supabase project config
│   ├── migrations/            # Database migration files (SQL)
│   │   └── *.sql              # Migration scripts (schema, RLS fixes, etc.)
│   └── functions/             # Supabase Edge Functions (serverless API endpoints)
│       ├── create-conversation/   # Implemented Edge Function (conversation creation)
│       │   └── index.ts
│       ├── get-conversations/     # Placeholder (add code if needed)
│       ├── get-messages/          # Placeholder (add code if needed)
│       ├── get-user-permissions/  # Placeholder (add code if needed)
│       └── send-message/          # Placeholder (add code if needed)
├── sql/
│   └── policies/              # (Optional) SQL files for RLS policies
├── src/                      # 🟩 Frontend (React app)
│   ├── api/                  # API layer (calls Edge Functions or Supabase directly)
│   ├── components/           # React UI components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── assets/               # Static assets (images, icons)
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx, main.tsx, ...# Main app files
│   └── supabaseClient.ts     # Supabase client config for frontend
├── public/                   # Static assets for frontend
├── .env                      # Environment variables (Supabase URL/keys for frontend)
├── package.json, ...         # Project config
├── README.md                 # Project documentation (this file)
└── ...                       # Other config files (Vite, Tailwind, etc.)
```

- 🟦 = Supabase backend (Edge Functions, migrations, config)
- 🟩 = Frontend (React app)

---

## API Reference (Backend vs Frontend)

- **Edge Functions** (called via `/functions/v1/<function-name>`):
  - `create-conversation` (used in `src/api/messagesApi.ts`)
  - (Add more as you implement them)
- **Direct Supabase API** (called via `supabase-js`):
  - Posts, user profiles, and some messaging features

---

## Getting Started (Updated)

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Vanish
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the project root and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=<your_supabase_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```
4. **Set up Supabase database:**
   - Apply migrations: `npx supabase db reset` (local) or `npx supabase db push` (remote)
   - (Optional) Run SQL from `sql/policies/` in the Supabase SQL editor for reference
5. **Deploy Edge Functions:**
   - Deploy at least `create-conversation` for messaging to work: `npx supabase functions deploy create-conversation`
   - Deploy others as you implement them
6. **Run the application:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Contributing

- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---

## References

- **Main App:** [src/App.tsx](src/App.tsx)
- **Real-time Messaging:** [src/hooks/useRealtimeMessages.ts](src/hooks/useRealtimeMessages.ts)
- **Messages API:** [src/api/messagesApi.ts](src/api/messagesApi.ts)
- **Auth Context:** [src/AuthContext.tsx](src/AuthContext.tsx)
- **Supabase Client:** [src/supabaseClient.ts](src/supabaseClient.ts)
- **Edge Functions:** [supabase/functions/](supabase/functions/)
- **Migrations:** [supabase/migrations/](supabase/migrations/)

---

## License

This project is licensed under the terms specified in the repository LICENSE file.
