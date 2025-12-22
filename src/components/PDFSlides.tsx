/**
 * PDFSlides.tsx
 * 
 * PROPÓSITO:
 * Componente simple para visualizar archivos PDF dentro de la web.
 * 
 * CAMBIO IMPORTANTE:
 * Antes usaba una librería compleja (react-pdf). AHORA usa un simple <iframe> nativo del navegador.
 * Esto es mucho más fiable, carga más rápido y da menos errores de seguridad.
 * También incluye botones para descargar el archivo o abrirlo en una ventana nueva por si falla la vista integrada.
 */

import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface PDFSlidesProps {
    url: string;
    title?: string;
}

export function PDFSlides({ url }: PDFSlidesProps) {
    return (
        <div className="flex flex-col items-center w-full space-y-4">
            {/* Controls Header */}
            <div className="flex flex-wrap items-center justify-between w-full gap-4 p-4 bg-muted/20 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">
                    Visor de Documentos
                </span>

                <div className="flex gap-2">
                    <a href={url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" /> Abrir en nueva ventana
                        </Button>
                    </a>
                    <a href={url} download target="_blank" rel="noreferrer">
                        <Button variant="secondary" size="sm">
                            <Download className="h-4 w-4 mr-2" /> Descargar
                        </Button>
                    </a>
                </div>
            </div>

            {/* Native Iframe Viewer - Most Reliable */}
            <div className="w-full h-[800px] bg-gray-100 dark:bg-gray-900 border rounded-lg overflow-hidden relative">
                <iframe
                    src={`${url}#toolbar=0`}
                    className="w-full h-full"
                    title="PDF Viewer"
                />
                {/* Fallback for mobile or blockers */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center text-muted-foreground">
                    Cargando visor...
                </div>
            </div>
        </div>
    );
}
