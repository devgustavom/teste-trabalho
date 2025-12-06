import { FileUploader } from "../FileUploader";

export default function FileUploaderExample() {
  // todo: remove mock functionality
  const mockFiles = [
    { id: "1", name: "Politica_Comercial_2024.pdf", type: "pdf" as const, size: "2.4 MB", uploadedAt: "01/12/2024" },
    { id: "2", name: "Tabela_Precos.xlsx", type: "spreadsheet" as const, size: "156 KB", uploadedAt: "28/11/2024" },
    { id: "3", name: "Catalogo_Produtos.pdf", type: "pdf" as const, size: "8.1 MB", uploadedAt: "15/11/2024" },
  ];
  
  return (
    <div className="max-w-xl">
      <FileUploader
        files={mockFiles}
        onUpload={(files) => console.log("Files uploaded:", files)}
        onDelete={(id) => console.log("Delete file:", id)}
        onDownload={(id) => console.log("Download file:", id)}
        isEditable={true}
      />
    </div>
  );
}
