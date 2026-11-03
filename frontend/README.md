# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Live avatar setup

The avatar panel connects to a LiveKit room and renders the remote avatar's audio and video tracks. Configure the backend using `../backend/.env.example` and keep the LiveKit API secret on the server. Set `LIVEKIT_ROOM` to the room that your Synthesia LiveKit app or agent joins. The browser requests a short-lived participant token from `POST /api/livekit/token`.

Run the backend on port `3000` and the Vite app on port `5173`. Document uploads and questions use the existing chat API on the backend.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
