import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { OrcamentoPrintTemplate } from "./OrcamentoPrintTemplate";

interface OrcamentoPDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  printData: any;
  isGenerating: boolean;
}

export function OrcamentoPDFPreviewDialog({
  open,
  onClose,
  onPrint,
  printData,
  isGenerating,
}: OrcamentoPDFPreviewDialogProps) {
  if (!printData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        {/* Barra de Ferramentas */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-100">
          <h2 className="text-lg font-bold">
            Pré-visualização - Orçamento #{printData.orcamento.numero_orc}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={onPrint}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isGenerating ? "Gerando PDF..." : "Imprimir"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isGenerating}
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>

        {/* Área de Preview com Scroll */}
        <div
          className="overflow-auto p-8 bg-gray-200"
          style={{ maxHeight: "calc(95vh - 80px)" }}
        >
          <div className="mx-auto" style={{ maxWidth: "210mm" }}>
            <OrcamentoPrintTemplate
              orcamento={printData.orcamento}
              items={printData.items}
              veiculo={printData.veiculo}
              cliente={printData.cliente}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
