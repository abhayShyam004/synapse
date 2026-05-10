# Synapse 🧠

**Think, plan, and automate—all in one place.**

Synapse is a modern, visual workflow planner and automation engine designed for speed and clarity. Built with a neo-brutalist aesthetic and powered by AI, it enables you to map complex logic, connect independent services, and visualize your progress on an infinite canvas.

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://synapse-flame-two.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Infinite Canvas:** Drag-and-drop node-based interface for effortless workflow design.
- **AI-Powered Suggestions:** Intelligent "Ghost Cards" powered by **NVIDIA NIM (Llama 3.1)** to help you draft complex logic in seconds.
- **Dynamic Variable System:** Define and track reactive variables that update your workflow paths in real-time.
- **Customizable Themes:** Personalize your workspace with a dynamic accent color system.
- **Mobile Optimized:** A responsive design that scales from high-density desktop monitors to mobile devices.

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** Vanilla CSS + [Framer Motion](https://www.framer.com/motion/)
- **Graph Engine:** [@xyflow/react](https://reactflow.dev/) (React Flow)
- **AI Integration:** NVIDIA NIM API (Llama 3.1 8B)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- npm or pnpm
- A Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhayShyam004/synapse.git
   cd synapse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_NVIDIA_NIM_API_KEY=your_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   create table workflows (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) on delete cascade,
     name text not null default 'Untitled Workflow',
     nodes jsonb default '[]',
     edges jsonb default '[]',
     variables jsonb default '[]',
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   alter table workflows enable row level security;

   create policy "Users own their workflows" on workflows
     for all using (auth.uid() = user_id);
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

We love contributions! Whether you're fixing a bug, suggesting a feature, or improving documentation, your help is welcome.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 💡 Feature Requests

Have an idea to make Synapse better? We'd love to hear it! Please open an issue with the tag `enhancement` and describe your vision.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Abhay](https://github.com/abhayShyam004)
