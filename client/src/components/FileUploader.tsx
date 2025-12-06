import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, FileSpreadsheet, X, Download, Trash2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "other";
  size: string;
  uploadedAt: string;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onUpload?: (files: FileList) => void;
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  isEditable?: boolean;
  accept?: string;
}

const fileTypeIcons = {
  pdf: FileText,
  image: Image,
  spreadsheet: FileSpreadsheet,
  other: FileText,
};

const fileTypeLabels = {
  pdf: "PDF",
  image: "Imagem",
  spreadsheet: "Planilha",
  other: "Arquivo",
};

export function FileUploader({
  files,
  onUpload,
  onDelete,
  onDownload,
  isEditable = true,
  accept = ".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.csv",
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && onUpload) {
      onUpload(e.dataTransfer.files);
    }
  }, [onUpload]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(e.target.files);
    }
  };
  
  return (
    <div className="space-y-4">
      {isEditable && (
        <div
          className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            PDF, imagens ou planilhas (max 10MB)
          </p>
          <label>
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Selecionar Arquivos</span>
            </Button>
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple
              onChange={handleFileSelect}
              data-testid="input-file-upload"
            />
          </label>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = fileTypeIcons[file.type];
            return (
              <Card key={file.id} data-testid={`card-file-${file.id}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {fileTypeLabels[file.type]}
                      </Badge>
                      <span>{file.size}</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onDownload && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDownload(file.id)}
                        data-testid={`button-download-${file.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {isEditable && onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(file.id)}
                        data-testid={`button-delete-${file.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {files.length === 0 && !isEditable && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum arquivo disponivel
        </p>
      )}
    </div>
  );
}
