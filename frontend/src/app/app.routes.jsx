import { createBrowserRouter } from "react-router";
import Dashboard from "../chat/pages/Dashoboard";




export const router = createBrowserRouter([
    {
        path: "/",
        element: <Dashboard />
    }
])