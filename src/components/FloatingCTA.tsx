import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCTA = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
      <Button variant="gold" size="lg" className="shadow-lg">
        <FileText className="w-5 h-5" strokeWidth={1.5} />
        Exportar PDF
      </Button>
    </div>
  );
};

export default FloatingCTA;
