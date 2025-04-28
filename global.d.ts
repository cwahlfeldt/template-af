
import { text } from "stream/consumers";
import EditableText from "./components/web-components/editable-text";

declare global {
    namespace JSX {
      interface IntrinsicElements {
        // This catch-all index signature tells TypeScript that any string tag name is allowed
        // ': any' means it can have any attributes, effectively disabling type checking
        'editable-text': any;
      }
    }
  }
  
  // This is necessary to make the declaration file a module if it only contains declarations
  export {};