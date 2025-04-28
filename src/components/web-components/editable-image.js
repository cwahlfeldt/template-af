/**
 * @class EditableImage
 * @extends HTMLElement
 * @description A custom web component that displays an image and allows users
 * to replace it by selecting a new image file. It supports features
 * like read-only/disabled states, preview mode, placeholder images,
 * and optional persistence to localStorage.
 *
 * @fires input - Dispatched when the image source is changed by the user via file selection. Contains `{ detail: { src: newSrc } }`.
 * @fires change - Dispatched after the 'input' event when the image source is changed. Contains `{ detail: { src: newSrc } }`.
 *
 * @attr {string} src - The URL of the image to display.
 * @attr {string} alt - The alternative text for the image.
 * @attr {boolean} readonly - If present, prevents the user from changing the image but keeps it interactive (e.g., hover effects).
 * @attr {boolean} disabled - If present, disables the component entirely, preventing interaction and reducing opacity.
 * @attr {boolean} preview - If present, acts like readonly, hiding the edit overlay. Useful for displaying the final state without edit controls.
 * @attr {boolean} persist - If present, the component will save its `src` and `alt` attributes to localStorage and load them on initialization.
 * @attr {string} storage-key - Specifies a custom key for localStorage persistence. Defaults to a generated key based on ID or DOM position.
 *
 * @cssprop --editable-image-overlay-bg - Background color of the overlay shown on hover (default: rgba(0, 0, 0, 0.5)).
 * @cssprop --editable-image-button-bg - Background color of the edit button (default: white).
 * @cssprop --editable-image-button-color - Text/icon color of the edit button (default: black).
 * @cssprop --editable-image-button-hover-bg - Background color of the edit button on hover/focus (default: #f0f0f0).
 * @cssprop --editable-image-disabled-opacity - Opacity of the component when disabled (default: 0.6).
 * @cssprop --editable-image-border-radius - Border radius for the container and image (default: 0px).
 * @cssprop --editable-image-aspect-ratio - Aspect ratio for the container (default: auto).
 * @cssprop --editable-image-button-position - Position of the edit button within the overlay (default: top-right). Options: top-right, top-left, bottom-right, bottom-left, center.
 *
 * @csspart container - The main container div element.
 * @csspart image - The `<img>` element displaying the image.
 * @csspart overlay - The overlay `<div>` shown on hover.
 * @csspart edit-button - The `<button>` element used to trigger file selection.
 * @csspart edit-icon - The SVG icon inside the edit button.
 */
class EditableImage extends HTMLElement {
  /**
   * @static
   * @property {string[]} observedAttributes - An array of attribute names to observe for changes.
   * The `attributeChangedCallback` will be invoked when these change.
   */
  static observedAttributes = [
    "src",
    "alt",
    "readonly",
    "disabled",
    "preview",
    "persist",
    "storage-key",
  ];

  // Private instance fields
  #shadowRoot; // Encapsulated Shadow DOM root
  #container; // The main container element (div)
  #imageElement; // The <img> element
  #overlay; // The overlay div shown on hover
  #editButton; // The button to trigger file selection
  #fileInput; // The hidden <input type="file"> element
  #placeholderSrc = "https://placehold.co/400x400"; // Default placeholder image URL

  /**
   * @constructor
   * Initializes the component, creates the Shadow DOM, and sets up the initial structure and event listeners.
   */
  constructor() {
    super(); // Always call super() first in constructor
    // Create a Shadow DOM for encapsulation
    this.#shadowRoot = this.attachShadow({ mode: "open" });
    // Build the internal DOM structure and apply styles
    this.#createStructureAndStyles();
    // Attach event listeners to interactive elements
    this.#addEventListeners();
  }

  /**
   * @method connectedCallback
   * Called when the element is added to the document's DOM.
   * Used for initialization tasks like setting initial state based on attributes,
   * upgrading properties, and potentially loading persisted data.
   */
  connectedCallback() {
    // Upgrade properties set before the element was defined or connected
    this.#upgradeProperty("src");
    this.#upgradeProperty("alt");
    this.#upgradeProperty("readOnly");
    this.#upgradeProperty("disabled");
    this.#upgradeProperty("preview");
    this.#upgradeProperty("persist");
    this.#upgradeProperty("storageKey");

    // Set the initial visual state based on current attributes
    this.#updateRendering();
    // Set the initial interactive state (enabled/disabled/readonly)
    this.#updateEditableState();

    // If persistence is enabled, load the image source and alt text from localStorage
    if (this.persist) {
      this.#loadFromLocalStorage();
    }
  }

  /**
   * @method disconnectedCallback
   * Called when the element is removed from the document's DOM.
   * Used for cleanup tasks. Event listeners attached to Shadow DOM children
   * are typically garbage-collected automatically, so explicit removal might not be needed here.
   */
  disconnectedCallback() {
    // Listeners on shadow DOM elements are usually garbage collected automatically.
    // If listeners were attached to the `window` or `document`, they should be removed here.
  }

  /**
   * @method attributeChangedCallback
   * Called when one of the `observedAttributes` changes.
   * @param {string} name - The name of the attribute that changed.
   * @param {string|null} oldValue - The previous value of the attribute.
   * @param {string|null} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Avoid unnecessary work if the value hasn't actually changed
    if (oldValue === newValue) {
      return;
    }

    // Handle changes based on the attribute name
    switch (name) {
      case "src":
      case "alt":
        // Update the displayed image or its alt text
        this.#updateRendering();
        // If persistence is enabled, save the new value
        if (this.persist) {
          this.#saveToLocalStorage();
        }
        break;
      case "readonly":
      case "disabled":
      case "preview":
        // Update the component's interactive state (enabled/disabled/readonly appearance)
        this.#updateEditableState();
        break;
      case "persist":
        // If the 'persist' attribute is added, attempt to load from localStorage
        if (this.persist) {
          this.#loadFromLocalStorage();
        }
        // Note: If 'persist' is removed, we don't automatically clear localStorage here,
        // but saving will stop. Clearing could be added if desired.
        break;
      case "storage-key":
        // If the storage key changes and persistence is enabled, reload data
        // using the new key. This might overwrite current state if the new key exists.
        if (this.persist) {
          // Consider if loading immediately is the desired behavior, or if it should
          // only affect future saves/loads. Current behavior loads immediately.
          this.#loadFromLocalStorage();
        }
        break;
    }
  }

  // --- Public Property Accessors (Getters/Setters) ---

  /**
   * @property {string} src - Gets or sets the image source URL. Reflects the 'src' attribute.
   */
  get src() {
    return this.getAttribute("src") || "";
  }

  set src(value) {
    // Ensure the value is a string, defaulting to empty string if null/undefined
    const Svalue = String(value || "");
    this.setAttribute("src", Svalue);
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {string} alt - Gets or sets the image alt text. Reflects the 'alt' attribute.
   */
  get alt() {
    return this.getAttribute("alt") || "";
  }

  set alt(value) {
    // Ensure the value is a string, defaulting to empty string if null/undefined
    const Svalue = String(value || "");
    this.setAttribute("alt", Svalue);
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {boolean} readOnly - Gets or sets the read-only state. Reflects the 'readonly' attribute.
   */
  get readOnly() {
    return this.hasAttribute("readonly");
  }

  set readOnly(value) {
    // Use toggleAttribute for boolean attributes
    this.toggleAttribute("readonly", Boolean(value));
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {boolean} disabled - Gets or sets the disabled state. Reflects the 'disabled' attribute.
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    // Use toggleAttribute for boolean attributes
    this.toggleAttribute("disabled", Boolean(value));
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {boolean} preview - Gets or sets the preview state. Reflects the 'preview' attribute.
   */
  get preview() {
    return this.hasAttribute("preview");
  }

  set preview(value) {
    // Use toggleAttribute for boolean attributes
    this.toggleAttribute("preview", Boolean(value));
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {boolean} persist - Gets or sets the persistence state. Reflects the 'persist' attribute.
   */
  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    // Use toggleAttribute for boolean attributes
    this.toggleAttribute("persist", Boolean(value));
    // Note: attributeChangedCallback will handle the update logic
  }

  /**
   * @property {string} storageKey - Gets or sets the localStorage key. Reflects the 'storage-key' attribute.
   * Falls back to a generated default key if the attribute is not set.
   */
  get storageKey() {
    return this.getAttribute("storage-key") || this.#getDefaultStorageKey();
  }

  set storageKey(value) {
    this.setAttribute("storage-key", String(value));
    // Note: attributeChangedCallback will handle the update logic
  }

  // --- Private Helper Methods ---

  /**
   * @method #upgradeProperty
   * Ensures that properties set on the instance before it's defined or connected
   * are correctly handled by the component's setters.
   * See: https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
   * @param {string} prop - The name of the property to upgrade.
   * @private
   */
  #upgradeProperty(prop) {
    // Check if the instance itself has the property (meaning it was set before upgrade)
    if (this.hasOwnProperty(prop)) {
      // Temporarily store the value
      let value = this[prop];
      // Delete the instance property so it doesn't shadow the prototype property
      delete this[prop];
      // Re-apply the value using the component's setter
      this[prop] = value;
    }
  }

  /**
   * @method #createStructureAndStyles
   * Creates the component's internal DOM structure (Shadow DOM) and applies necessary CSS styles.
   * @private
   */
  #createStructureAndStyles() {
    // Create the main container div
    this.#container = document.createElement("div");
    this.#container.className = "editable-image-container";
    this.#container.setAttribute("part", "container"); // Expose part for external styling

    // Create the image element
    this.#imageElement = document.createElement("img");
    this.#imageElement.setAttribute("part", "image"); // Expose part

    // --- Image Error Handling ---
    // Set up an error handler for the main image element
    this.#imageElement.onerror = () => {
      // Check if the failed source is the primary 'src' attribute value
      // (and not already the placeholder we tried to load)
      if (this.#imageElement.src !== this.#placeholderSrc) {
        console.warn(
          `EditableImage: Failed to load src "${this.src}". Falling back to placeholder.`
        );
        // If the primary source fails, attempt to load the placeholder image
        this.#imageElement.src = this.#placeholderSrc;
      } else {
        // If the placeholder itself fails to load (e.g., network error, invalid placeholder URL)
        console.error(
          `EditableImage: Failed to load placeholder image "${
            this.#placeholderSrc
          }".`
        );
        // Hide the broken image icon or display alt text. Hiding is chosen here.
        // Alternatively, set a background color on the container or show alt text.
        this.#imageElement.style.display = "none";
      }
    };
    this.#container.appendChild(this.#imageElement);

    // Create the overlay div (shown on hover)
    this.#overlay = document.createElement("div");
    this.#overlay.className = "editable-image-overlay";
    this.#overlay.setAttribute("part", "overlay"); // Expose part
    this.#container.appendChild(this.#overlay);

    // Create the edit button
    this.#editButton = document.createElement("button");
    this.#editButton.className = "editable-image-edit-button";
    this.#editButton.setAttribute("part", "edit-button"); // Expose part
    this.#editButton.setAttribute("aria-label", "Edit image"); // Accessibility
    // Use an SVG icon for the button (Lucide icon: image-plus)
    this.#editButton.innerHTML = /*html*/ `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-image-plus-icon" part="edit-icon">
        <path d="M16 5h6"/>
        <path d="M19 2v6"/>
        <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        <circle cx="9" cy="9" r="2"/>
      </svg>
    `;
    this.#overlay.appendChild(this.#editButton);

    // Create the hidden file input element
    this.#fileInput = document.createElement("input");
    this.#fileInput.type = "file";
    this.#fileInput.accept = "image/*"; // Accept only image files
    this.#fileInput.style.display = "none"; // Keep it hidden
    this.#fileInput.setAttribute("aria-hidden", "true"); // Hide from accessibility tree
    this.#container.appendChild(this.#fileInput);

    // Create the style element for Shadow DOM styles
    const styleEl = document.createElement("style");
    styleEl.textContent = /*css*/ `
      /* --- Host Styles & CSS Custom Properties --- */
      :host {
        /* Define CSS custom properties for easy theming */
        --editable-image-overlay-bg: rgba(0, 0, 0, 0.5);
        --editable-image-button-bg: white;
        --editable-image-button-color: black;
        --editable-image-button-hover-bg: #f0f0f0;
        --editable-image-disabled-opacity: 0.6;
        --editable-image-border-radius: 0px; /* Default: no rounding */
        --editable-image-aspect-ratio: auto; /* Default: image determines aspect ratio */
        --editable-image-button-position: top-right; /* Default button position */

        /* Basic display and positioning for the host element */
        display: inline-block; /* Behaves like an inline element but respects width/height */
        position: relative; /* Needed for absolute positioning of overlay */
        vertical-align: top; /* Align with the top of the text line */
      }

      /* Hide the component if the 'hidden' attribute is present */
      :host([hidden]) {
        display: none;
      }

      /* --- Container Styles --- */
      .editable-image-container {
        position: relative; /* Context for overlay */
        display: block; /* Take up available width */
        overflow: hidden; /* Clip contents, e.g., if image is larger */
        cursor: pointer; /* Indicate interactivity */
        border-radius: var(--editable-image-border-radius); /* Apply custom border radius */
        aspect-ratio: var(--editable-image-aspect-ratio); /* Apply custom aspect ratio */
        width: 100%; /* Fill the host element */
        height: 100%; /* Fill the host element */
        background-color: #eee; /* Basic background for loading/error states */
      }

      /* --- Disabled/Readonly State Styles --- */
      /* Apply opacity and non-interactive cursor when disabled */
      :host([disabled]) .editable-image-container {
        opacity: var(--editable-image-disabled-opacity);
        cursor: not-allowed;
      }
      /* Use default cursor when readonly or in preview mode (not editable) */
      :host([readonly]) .editable-image-container,
      :host([preview]) .editable-image-container {
        cursor: default;
      }

      /* --- Image Styles --- */
      img {
        display: block; /* Remove extra space below inline images */
        width: 100%; /* Scale image to fit container width */
        height: 100%; /* Scale image to fit container height */
        object-fit: cover; /* Cover the container, cropping if necessary */
        border-radius: var(--editable-image-border-radius); /* Match container rounding */
        background-color: transparent; /* Ensure container background shows if image fails */
      }

      /* --- Overlay Styles --- */
      .editable-image-overlay {
        position: absolute; /* Position relative to container */
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--editable-image-overlay-bg); /* Customizable background */
        display: flex; /* Use flexbox for positioning the button */
        opacity: 0; /* Hidden by default */
        transition: opacity 0.2s ease-in-out; /* Smooth fade-in/out */
        pointer-events: none; /* Don't intercept clicks by default */
        border-radius: var(--editable-image-border-radius); /* Match container */
      }

      /* --- Button Positioning within Overlay (using CSS variable) --- */
      /* Default (top-right) and fallback if variable is not set */
      :host([style*="--editable-image-button-position: top-right"]) .editable-image-overlay,
      :host(:not([style*="--editable-image-button-position"])) .editable-image-overlay {
        align-items: flex-start; /* Align button to the top */
        justify-content: flex-end; /* Align button to the right */
      }
      :host([style*="--editable-image-button-position: top-left"]) .editable-image-overlay {
        align-items: flex-start; /* Align button to the top */
        justify-content: flex-start; /* Align button to the left */
      }
      :host([style*="--editable-image-button-position: bottom-right"]) .editable-image-overlay {
        align-items: flex-end; /* Align button to the bottom */
        justify-content: flex-end; /* Align button to the right */
      }
      :host([style*="--editable-image-button-position: bottom-left"]) .editable-image-overlay {
        align-items: flex-end; /* Align button to the bottom */
        justify-content: flex-start; /* Align button to the left */
      }
      :host([style*="--editable-image-button-position: center"]) .editable-image-overlay {
        align-items: center; /* Align button vertically center */
        justify-content: center; /* Align button horizontally center */
      }


      /* --- Hover Interaction --- */
      /* Show overlay when hovering over the container */
      .editable-image-container:hover .editable-image-overlay {
         opacity: 1;
      }
      /* Hide overlay and prevent interaction if disabled, readonly, or preview */
       :host([disabled]) .editable-image-overlay,
       :host([readonly]) .editable-image-overlay,
       :host([preview]) .editable-image-overlay {
         opacity: 0 !important; /* Ensure it stays hidden */
         pointer-events: none;
       }

      /* --- Edit Button Styles --- */
      .editable-image-edit-button {
        background-color: var(--editable-image-button-bg);
        color: var(--editable-image-button-color);
        border: none; /* Remove default border */
        padding: 8px; /* Spacing inside the button */
        border-radius: 50%; /* Make it circular */
        cursor: pointer; /* Indicate it's clickable */
        font-family: inherit; /* Use host's font */
        outline: none; /* Remove default focus outline (rely on :focus-visible) */
        transition: background-color 0.2s ease-in-out; /* Smooth background change */
        display: flex; /* Center the SVG icon */
        align-items: center;
        justify-content: center;
        width: 36px; /* Fixed size */
        height: 36px; /* Fixed size */
        margin: 8px; /* Spacing from the overlay edges */
        pointer-events: auto; /* Allow clicks on the button itself */
        flex-shrink: 0; /* Prevent shrinking if container is small */
      }

      /* Style the SVG icon inside the button */
      .editable-image-edit-button svg {
        width: 20px;
        height: 20px;
      }

      /* Style button on hover and keyboard focus */
      .editable-image-edit-button:hover,
      .editable-image-edit-button:focus-visible { /* Use focus-visible for accessibility */
        background-color: var(--editable-image-button-hover-bg);
      }
    `;

    // Append the styles and the container to the Shadow DOM
    this.#shadowRoot.appendChild(styleEl);
    this.#shadowRoot.appendChild(this.#container);
  }

  /**
   * @method #addEventListeners
   * Attaches necessary event listeners to the internal elements (edit button, file input).
   * @private
   */
  #addEventListeners() {
    // Listen for clicks on the edit button
    this.#editButton.addEventListener("click", this.#handleEditButtonClick);
    // Listen for changes on the hidden file input (when a file is selected)
    this.#fileInput.addEventListener("change", this.#handleFileChange);
  }

  /**
   * @method #handleEditButtonClick
   * Event handler for clicks on the edit button. Triggers a click on the hidden file input.
   * Prevents action if the component is disabled, readonly, or in preview mode.
   * Uses an arrow function to maintain the correct `this` context.
   * @param {MouseEvent} event - The click event object.
   * @private
   */
  #handleEditButtonClick = (event) => {
    // Ignore clicks if not editable
    if (this.disabled || this.readOnly || this.preview) {
      event.stopPropagation(); // Prevent event bubbling if needed
      return;
    }
    // Programmatically click the hidden file input to open the file picker
    this.#fileInput.click();
    // Prevent default button behavior (like form submission if it were in a form)
    event.preventDefault();
  };

  /**
   * @method #handleFileChange
   * Event handler for the 'change' event on the hidden file input.
   * Reads the selected image file as a Data URL and updates the component's `src`.
   * Dispatches 'input' and 'change' events.
   * Uses an arrow function to maintain the correct `this` context.
   * @param {Event} event - The change event object from the file input.
   * @private
   */
  #handleFileChange = (event) => {
    // Ignore if not editable
    if (this.disabled || this.readOnly || this.preview) return;

    // Get the selected file (first file in the list)
    const file = event.target.files?.[0];

    // Check if a file was selected and if it's an image
    if (file && file.type.startsWith("image/")) {
      // Create a FileReader to read the file content
      const reader = new FileReader();

      // Define what happens when the file is successfully read
      reader.onload = (e) => {
        // Set the component's src property to the Data URL result
        // This will trigger the 'src' setter and attributeChangedCallback
        this.src = e.target.result;
        // Dispatch custom events to notify external listeners about the change
        this.#dispatchInputEvent();
        this.#dispatchChangeEvent();
      };

      // Define what happens if there's an error reading the file
      reader.onerror = (e) => {
        console.error("EditableImage: Error reading file:", e);
        // Optionally, provide user feedback here (e.g., show an error message)
      };

      // Start reading the file as a Data URL
      reader.readAsDataURL(file);
    }

    // Reset the file input value. This allows selecting the same file again
    // if the user cancels and then re-selects it.
    event.target.value = "";
  };

  /**
   * @method #updateRendering
   * Updates the `src` and `alt` attributes of the internal `<img>` element
   * based on the component's current `src` and `alt` properties/attributes.
   * Handles falling back to the placeholder if `src` is empty or invalid.
   * @private
   */
  #updateRendering() {
    const currentSrc = this.src; // Get current src value via getter
    const currentAlt = this.alt || "Editable image"; // Get current alt or provide default

    if (this.#imageElement) {
      // Update the alt text
      this.#imageElement.alt = currentAlt;
      // Ensure the img element is visible (it might have been hidden on placeholder error)
      this.#imageElement.style.display = "";

      // Check if there's a valid source provided
      if (currentSrc) {
        // IMPORTANT: Only update the img.src if it's different from the current value.
        // This prevents infinite loops if the src fails to load and the onerror handler
        // tries to set it again (e.g., when falling back to placeholder).
        if (this.#imageElement.src !== currentSrc) {
          this.#imageElement.src = currentSrc;
        }
      } else {
        // If the component's src is empty, use the placeholder.
        // Again, only set if it's not already the placeholder to avoid reload loops.
        if (this.#imageElement.src !== this.#placeholderSrc) {
          this.#imageElement.src = this.#placeholderSrc;
        }
      }
    }
  }

  /**
   * @method #updateEditableState
   * Updates the visual and interactive state of the component based on the
   * `disabled`, `readonly`, and `preview` attributes/properties.
   * Toggles overlay visibility, cursor style, and the `disabled` attribute on the host.
   * @private
   */
  #updateEditableState() {
    // Determine if the component should be interactive
    const isEditable = !(this.disabled || this.readOnly || this.preview);

    // Control overlay interaction based on editable state
    if (this.#overlay) {
      // Allow pointer events (like hover) on overlay only if editable
      this.#overlay.style.pointerEvents = isEditable ? "" : "none";
      // Note: CSS rules also hide the overlay visually in non-editable states
    }

    // Adjust cursor style for the container
    if (this.#container) {
      this.#container.style.cursor = isEditable
        ? "pointer" // Editable: show pointer
        : this.disabled
        ? "not-allowed" // Disabled: show not-allowed cursor
        : "default"; // Readonly/Preview: show default cursor
    }

    // Reflect the disabled state onto the host element itself for potential external styling
    // Note: The :host([disabled]) CSS rule handles the opacity styling.
    this.toggleAttribute("disabled", this.disabled);
  }

  /**
   * @method #dispatchInputEvent
   * Dispatches a non-standard 'input' event when the image source is changed by the user.
   * This mimics the behavior of native form elements.
   * @private
   */
  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { src: this.src }, // Include the new source in the event detail
        bubbles: true, // Allow the event to bubble up the DOM tree
        composed: true, // Allow the event to cross Shadow DOM boundaries
      })
    );
  }

  /**
   * @method #dispatchChangeEvent
   * Dispatches a standard 'change' event after the 'input' event when the image source is changed.
   * This also mimics the behavior of native form elements.
   * @private
   */
  #dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { src: this.src }, // Include the new source in the event detail
        bubbles: true, // Allow the event to bubble up the DOM tree
        composed: true, // Allow the event to cross Shadow DOM boundaries
      })
    );
  }

  /**
   * @method #getDefaultStorageKey
   * Generates a default key for localStorage persistence if `storage-key` attribute is not set.
   * Prefers using the element's ID, falls back to element name + index,
   * and finally uses a random key as a last resort.
   * @returns {string} The generated or determined storage key.
   * @private
   */
  #getDefaultStorageKey() {
    // Prefer using the element's ID if available
    if (this.id) {
      return `editable-image-${this.id}`;
    }
    // Fallback: Try to generate a key based on tag name and position in the DOM
    // This is less reliable, especially with dynamic content changes.
    try {
      // Find all elements with the same tag name in the document
      const siblings = document.querySelectorAll(this.localName);
      // Find the index of this specific element within that list
      const index = Array.from(siblings).indexOf(this);
      // Create a key using the tag name and index
      return `editable-image-${this.localName}-${index}`;
    } catch (e) {
      // Last resort: If the index method fails (e.g., element not in main DOM yet),
      // generate a pseudo-random key. This is not stable across page loads.
      console.warn(
        "EditableImage: Could not determine stable default storage key. Using random key."
      );
      return `editable-image-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }
  }

  /**
   * @method #saveToLocalStorage
   * Saves the current `src` and `alt` values to localStorage using the determined storage key.
   * Only executes if the `persist` attribute is present.
   * Includes basic error handling for localStorage operations.
   * @private
   */
  #saveToLocalStorage() {
    // Only proceed if persistence is enabled
    if (!this.persist) return;

    // Get the primary key and derive a key for the alt text
    const key = this.storageKey;
    const altKey = `${key}-alt`; // Store alt separately

    try {
      const currentSrc = this.src;
      const currentAlt = this.alt;

      // Save src, or remove if empty
      if (currentSrc) {
        localStorage.setItem(key, currentSrc);
      } else {
        // If src is cleared, remove the item from storage
        localStorage.removeItem(key);
      }

      // Save alt, or remove if empty
      if (currentAlt) {
        localStorage.setItem(altKey, currentAlt);
      } else {
        // If alt is cleared, remove the item from storage
        localStorage.removeItem(altKey);
      }
    } catch (error) {
      // Catch potential localStorage errors (e.g., storage full, security restrictions)
      console.warn(
        `EditableImage: Failed to save state to localStorage (key: ${key}). Error:`,
        error
      );
    }
  }

  /**
   * @method #loadFromLocalStorage
   * Loads the `src` and `alt` values from localStorage using the determined storage key.
   * Updates the component's properties and rendering if saved values are found and differ
   * from the current values. Only executes if the `persist` attribute is present.
   * Includes basic error handling.
   * @private
   */
  #loadFromLocalStorage() {
    // Only proceed if persistence is enabled
    if (!this.persist) return;

    // Get the primary key and the key for the alt text
    const key = this.storageKey;
    const altKey = `${key}-alt`;

    try {
      // Retrieve saved values from localStorage
      const savedSrc = localStorage.getItem(key);
      const savedAlt = localStorage.getItem(altKey);

      let changed = false; // Flag to track if any property was updated

      // --- Update src ---
      // Check if a saved source exists and if it's different from the current src
      if (savedSrc !== null && savedSrc !== this.src) {
        this.src = savedSrc; // Update the src property (will trigger setter/attribute update)
        changed = true;
      }
      // Check if there's no saved source, but the component currently has a source
      // This handles the case where the persisted image was removed/cleared.
      else if (savedSrc === null && this.src !== "") {
        this.src = ""; // Clear the src property
        changed = true;
      }

      // --- Update alt ---
      // Check if saved alt text exists and differs from the current alt
      if (savedAlt !== null && savedAlt !== this.alt) {
        this.alt = savedAlt; // Update the alt property
        changed = true;
      }
      // Check if there's no saved alt, but the component currently has alt text
      else if (savedAlt === null && this.alt !== "") {
        this.alt = ""; // Clear the alt property
        changed = true;
      }

      // If either src or alt was updated from localStorage, re-render the image element
      if (changed) {
        this.#updateRendering();
      }
    } catch (error) {
      // Catch potential localStorage errors
      console.warn(
        `EditableImage: Failed to load state from localStorage (key: ${key}). Error:`,
        error
      );
    }
  }
}

// --- Custom Element Registration ---
// Define the custom element if it hasn't been defined already.
// This prevents errors if the script is loaded multiple times.
if (!customElements.get("editable-image")) {
  customElements.define("editable-image", EditableImage);
}

// Export the class for potential use in modules
export default EditableImage;
