export const convertPdfToImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }

      try {
        const pdf = await (window as any).pdfjsLib.getDocument({ data: event.target.result }).promise;
        const numPages = pdf.numPages;

        if (numPages === 0) {
          return reject(new Error("PDF file is empty."));
        }

        const pageCanvases: HTMLCanvasElement[] = [];
        let totalHeight = 0;
        let maxWidth = 0;
        const scale = 1.5; // Use a consistent scale

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            return reject(new Error("Could not create canvas context for a page."));
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          
          pageCanvases.push(canvas);
          totalHeight += canvas.height;
          if (canvas.width > maxWidth) {
            maxWidth = canvas.width;
          }
        }
        
        if (numPages === 1) {
            // If only one page, no need to stitch
            resolve(pageCanvases[0].toDataURL('image/jpeg', 0.9).split(',')[1]);
            return;
        }

        // Create the final canvas to stitch all pages together
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = maxWidth;
        finalCanvas.height = totalHeight;
        const finalContext = finalCanvas.getContext('2d');

        if (!finalContext) {
          return reject(new Error("Could not create the final canvas context."));
        }
        
        // Fill with a white background in case pages have different widths
        finalContext.fillStyle = 'white';
        finalContext.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        let currentY = 0;
        for (const pageCanvas of pageCanvases) {
          // Center the page horizontally if it's narrower than the max width
          const xOffset = (maxWidth - pageCanvas.width) / 2;
          finalContext.drawImage(pageCanvas, xOffset, currentY);
          currentY += pageCanvas.height;
        }

        // Return base64 encoded image of the final stitched canvas
        resolve(finalCanvas.toDataURL('image/jpeg', 0.9).split(',')[1]);

      } catch (error) {
        console.error("Error processing PDF:", error);
        reject(new Error("Could not process the PDF file. Please ensure it's a valid multi-page PDF."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};