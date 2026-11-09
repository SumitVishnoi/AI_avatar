import { createBrowserRouter } from "react-router";
import Dashboard from "../chat/pages/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Dashboard />
    }
])