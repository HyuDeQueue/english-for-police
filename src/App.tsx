import { BrowserRouter as Router } from "react-router-dom";
import { AppRouter } from "./AppRouter";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </Router>
  );
}
