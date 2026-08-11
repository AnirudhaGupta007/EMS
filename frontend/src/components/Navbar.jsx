import { User, Home, FileText } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 bg-white-800 text-black">
      <Home className="w-6 h-6" />
      <User className="w-6 h-6" />
      <FileText className="w-6 h-6" />
      <span className="text-blue-500">Hello</span>
    </nav>
  );
}
