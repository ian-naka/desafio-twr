import FunilGrid from "./components/funil/FunilGrid";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="twr-theme">
      <main className="w-screen h-screen bg-background text-foreground">
        <FunilGrid />
        <Toaster position="top-left" closeButton />
      </main>
    </ThemeProvider>
  );
}