// import { text } from "stream/consumers";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // This catch-all index signature tells TypeScript that any string tag name is allowed
      // ': any' means it can have any attributes, effectively disabling type checking
      "editable-text": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

// This is necessary to make the declaration file a module if it only contains declarations
export {};
