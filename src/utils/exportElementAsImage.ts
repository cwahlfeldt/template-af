import html2canvas from 'html2canvas';
// If using TypeScript and have @types/html2canvas installed:
import type { Options } from 'html2canvas';

// Interface definition as above...
interface ExportElementAsImageOptions {
  filename?: string;
  html2canvasOptions?: Partial<Options>;
  modifyClone?: (clonedElement: HTMLElement) => void;
  renderDelay?: number;
  format?: string;
  quality?: number;
}

const DEFAULT_H2C_OPTIONS: Partial<Options> = {
  scale: 6, // Consider if this high scale is always needed, affects performance/size
  useCORS: true,
  allowTaint: true,
  backgroundColor: null,
  logging: false,
  scrollX: typeof window !== 'undefined' ? -window.scrollX : 0,
  scrollY: typeof window !== 'undefined' ? -window.scrollY : 0,
  windowWidth: typeof document !== 'undefined' ? document.documentElement.offsetWidth : 0,
  windowHeight: typeof document !== 'undefined' ? document.documentElement.offsetHeight : 0,
};

const DEFAULT_FILENAME = 'download';
const DEFAULT_RENDER_DELAY = 50;
const DEFAULT_QUALITY = 0.5;
const DEFAULT_FORMAT = 'image/jpeg'; // Default to PNG

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gets the appropriate file extension for a given image MIME type.
 * @param {string} format - The image MIME type (e.g., 'image/jpeg').
 * @returns {string} The file extension (e.g., 'jpeg').
 */
const getExtensionFromFormat = (format: string): string => {
  switch (format) {
    case 'image/jpeg':
      return 'jpeg'; // or 'jpg' if preferred
    case 'image/webp':
      return 'webp';
    case 'image/avif':
        return 'avif';
    case 'image/png':
    default: // Fallback to png
      return 'png';
  }
};

/**
 * Exports a given HTML element as an image in the specified format.
 *
 * Clones the element, applies optional modifications, renders using html2canvas,
 * encodes the canvas to the desired format/quality, and triggers a download.
 *
 * @param {HTMLElement | null} element - The HTML element to export.
 * @param {ExportElementAsImageOptions} [options={}] - Optional configuration.
 * @returns {Promise<void>} A promise that resolves when download is initiated, or rejects on error.
 * @throws {Error} If element is invalid or html2canvas fails.
 */
export const exportElementAsImage = async (
  element: HTMLElement | null,
  options: ExportElementAsImageOptions = {}
): Promise<void> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error("exportElementAsImage can only be run in a browser environment.");
  }
  if (!(element instanceof HTMLElement)) {
    console.error("Invalid element provided:", element);
    throw new Error("Invalid HTML element provided. Must be a valid DOM element.");
  }

  const {
    filename = DEFAULT_FILENAME,
    html2canvasOptions = {},
    modifyClone,
    renderDelay = DEFAULT_RENDER_DELAY,
    format = DEFAULT_FORMAT, // Use the default format
    quality = DEFAULT_QUALITY // Quality remains optional
  } = options;

  const originalElement = element;
  let clonedElement: HTMLElement | null = null;

  try {
    // --- Steps 1-7: Cloning, Styling, Modifying, Appending, Delay, H2C Options ---
    clonedElement = originalElement.cloneNode(true) as HTMLElement;
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    clonedElement.style.zIndex = '-1';
    clonedElement.style.visibility = 'visible';
    clonedElement.style.opacity = '1';
    clonedElement.style.transform = 'scale(1)';

    if (typeof modifyClone === 'function') {
      modifyClone(clonedElement);
    }

    document.body.appendChild(clonedElement);

    if (renderDelay > 0) {
      await delay(renderDelay);
    }

    const finalH2cOptions: Partial<Options> = {
      ...DEFAULT_H2C_OPTIONS,
      width: html2canvasOptions.width ?? clonedElement.offsetWidth,
      height: html2canvasOptions.height ?? clonedElement.offsetHeight,
      ...html2canvasOptions,
    };

    // --- 8. Render Clone with html2canvas ---
    const canvas = await html2canvas(clonedElement, finalH2cOptions);

    // --- 9. Generate Data URL with specified format & quality ---
    let dataUrl: string;
    // Check if quality is provided (not null/undefined) and is a number
    // Pass quality only if it's explicitly provided and valid for the format type
    // Note: toDataURL ignores quality for PNG. Browsers handle invalid quality values gracefully (clamping).
    if (typeof quality === 'number' && quality >= 0 && quality <= 1) {
        console.log(`Exporting as ${format} with quality ${quality}`);
        dataUrl = canvas.toDataURL(format, quality);
    } else {
        console.log(`Exporting as ${format} with default quality`);
        dataUrl = canvas.toDataURL(format); // Use browser default quality or ignore if PNG
    }


    // --- 10. Determine File Extension and Trigger Download ---
    const extension = getExtensionFromFormat(format);
    const link = document.createElement('a');
    link.download = `${filename}.${extension}`; // Use dynamic extension
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove(); // Extra cleanup just in case

  } catch (error) {
    console.error("Error exporting element as image:", error);
    throw error;
  } finally {
    // --- 11. Cleanup: ALWAYS Remove the Clone ---
    if (clonedElement) {
      clonedElement.remove();
    }
  }
};

// Optional: Export the type for consumers if needed
export type { ExportElementAsImageOptions };