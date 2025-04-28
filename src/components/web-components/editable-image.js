/**
 * @class EditableImage
 * @extends HTMLElement
 * @description A custom web component that wraps a slotted `<img>` element,
 * allowing users to replace its source by selecting a new image file.
 * It expects an `<img>` tag to be provided via the default slot.
 * Supports features like read-only/disabled states, preview mode,
 * placeholder fallback on error, and optional persistence to localStorage.
 *
 * @slot - Default slot. Expects a single `<img>` element. The component will manage this image's `src` and `alt`.
 *
 * @fires input - Dispatched when the image source is changed by the user via file selection. Contains `{ detail: { src: newSrc } }`.
 * @fires change - Dispatched after the 'input' event when the image source is changed. Contains `{ detail: { src: newSrc } }`.
 *
 * @attr {string} src - Gets/sets the source URL of the managed `<img>` element. If not set initially, it may adopt the `src` from the slotted image.
 * @attr {string} alt - Gets/sets the alternative text of the managed `<img>` element. If not set initially, it may adopt the `alt` from the slotted image.
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
 * @cssprop --editable-image-border-radius - Border radius for the container and slotted image (default: 0px).
 * @cssprop --editable-image-aspect-ratio - Aspect ratio for the container (default: auto). Slotted image `object-fit` is set to `cover`.
 * @cssprop --editable-image-button-position - Position of the edit button within the overlay (default: top-right). Options: top-right, top-left, bottom-right, bottom-left, center.
 *
 * @csspart container - The main container div element.
 * @csspart image - The slotted `<img>` element. This part is dynamically added to the slotted image.
 * @csspart overlay - The overlay `<div>` shown on hover.
 * @csspart edit-button - The `<button>` element used to trigger file selection.
 * @csspart edit-icon - The SVG icon inside the edit button.
 */
class EditableImage extends HTMLElement {
  /**
   * @static
   * @property {string[]} observedAttributes - Attributes to monitor for changes.
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
  #shadowRoot;
  #container;
  #imageElement = null; // Reference to the slotted <img> element
  #overlay;
  #editButton;
  #fileInput;
  #slot; // Reference to the default slot
  #placeholderSrc = "https://placehold.co/400x400/eee/aaa?text=Error"; // Placeholder for load errors
  #isInitialized = false; // Flag to prevent premature updates

  /**
   * @constructor
   */
  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "open" });
    this.#createStructureAndStyles();
    this.#addEventListeners(); // Basic listeners (button, file input)
  }

  /**
   * @method connectedCallback
   * Called when the element is added to the DOM.
   * Finds the slotted image, syncs attributes, and sets initial state.
   */
  connectedCallback() {
    // Find the slot and listen for changes
    this.#slot = this.#shadowRoot.querySelector("slot");
    this.#slot.addEventListener("slotchange", this.#handleSlotChange);

    // Initial attempt to find the slotted image
    this.#findAndInitializeSlottedImage();

    // Upgrade properties set before definition/connection
    this.#upgradeProperty("src");
    this.#upgradeProperty("alt");
    this.#upgradeProperty("readOnly");
    this.#upgradeProperty("disabled");
    this.#upgradeProperty("preview");
    this.#upgradeProperty("persist");
    this.#upgradeProperty("storageKey");

    // Set visual/interactive state based on current attributes
    this.#updateEditableState();

    // Load from localStorage if persistence is enabled *after* initial setup
    if (this.persist) {
      this.#loadFromLocalStorage();
    }

    this.#isInitialized = true; // Mark initialization complete
  }

  /**
   * @method disconnectedCallback
   * Called when the element is removed from the DOM. Cleans up listeners.
   */
  disconnectedCallback() {
    if (this.#slot) {
      this.#slot.removeEventListener("slotchange", this.#handleSlotChange);
    }
    // Remove error listener from the potentially detached image element
    if (this.#imageElement) {
        this.#imageElement.onerror = null;
    }
    this.#isInitialized = false;
  }

  /**
   * @method attributeChangedCallback
   * Called when observed attributes change.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Don't run updates until connectedCallback has finished basic setup
    if (!this.#isInitialized || oldValue === newValue) {
      return;
    }

    switch (name) {
      case "src":
      case "alt":
        // Update the slotted image rendering
        this.#updateRendering();
        // Save to localStorage if persistence is enabled
        if (this.persist) {
          this.#saveToLocalStorage();
        }
        break;
      case "readonly":
      case "disabled":
      case "preview":
        // Update interactive state
        this.#updateEditableState();
        break;
      case "persist":
        // If persist is added, try loading data
        if (this.persist) {
          this.#loadFromLocalStorage();
        }
        // Note: Removing persist doesn't clear localStorage, just stops saving/loading.
        break;
      case "storage-key":
        // If key changes and persist is on, reload using the new key
        if (this.persist) {
          this.#loadFromLocalStorage(); // Load data associated with the new key
        }
        break;
    }
  }

  // --- Public Property Accessors ---

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(value) {
    const stringValue = String(value || "");
    this.setAttribute("src", stringValue);
    // attributeChangedCallback handles the update
  }

  get alt() {
    return this.getAttribute("alt") || "";
  }

  set alt(value) {
    const stringValue = String(value || "");
    this.setAttribute("alt", stringValue);
    // attributeChangedCallback handles the update
  }

  get readOnly() {
    return this.hasAttribute("readonly");
  }

  set readOnly(value) {
    this.toggleAttribute("readonly", Boolean(value));
    // attributeChangedCallback handles the update
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
    // attributeChangedCallback handles the update
  }

  get preview() {
    return this.hasAttribute("preview");
  }

  set preview(value) {
    this.toggleAttribute("preview", Boolean(value));
    // attributeChangedCallback handles the update
  }

  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    this.toggleAttribute("persist", Boolean(value));
    // attributeChangedCallback handles the update
  }

  get storageKey() {
    return this.getAttribute("storage-key") || this.#getDefaultStorageKey();
  }

  set storageKey(value) {
    this.setAttribute("storage-key", String(value));
    // attributeChangedCallback handles the update
  }

  // --- Private Helper Methods ---

  /**
   * @method #upgradeProperty
   * Ensures properties set before upgrade are handled by setters.
   * @param {string} prop - Property name.
   * @private
   */
  #upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  /**
   * @method #createStructureAndStyles
   * Creates the Shadow DOM structure with a slot and styles.
   * @private
   */
  #createStructureAndStyles() {
    // Container
    this.#container = document.createElement("div");
    this.#container.className = "editable-image-container";
    this.#container.setAttribute("part", "container");

    // Slot for the user-provided <img> element
    const slot = document.createElement("slot");
    // No name attribute means it's the default slot
    this.#container.appendChild(slot);

    // Overlay
    this.#overlay = document.createElement("div");
    this.#overlay.className = "editable-image-overlay";
    this.#overlay.setAttribute("part", "overlay");
    this.#container.appendChild(this.#overlay);

    // Edit Button
    this.#editButton = document.createElement("button");
    this.#editButton.className = "editable-image-edit-button";
    this.#editButton.setAttribute("part", "edit-button");
    this.#editButton.setAttribute("aria-label", "Edit image");
    this.#editButton.innerHTML = /*html*/ `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-image-plus-icon" part="edit-icon">
        <path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>
      </svg>`;
    this.#overlay.appendChild(this.#editButton);

    // Hidden File Input
    this.#fileInput = document.createElement("input");
    this.#fileInput.type = "file";
    this.#fileInput.accept = "image/*";
    this.#fileInput.style.display = "none";
    this.#fileInput.setAttribute("aria-hidden", "true");
    this.#container.appendChild(this.#fileInput);

    // Styles
    const styleEl = document.createElement("style");
    styleEl.textContent = /*css*/ `
      /* --- Host Styles & CSS Custom Properties --- */
      :host {
        /* CSS custom properties for theming */
        --editable-image-overlay-bg: rgba(0, 0, 0, 0.5);
        --editable-image-button-bg: white;
        --editable-image-button-color: black;
        --editable-image-button-hover-bg: #f0f0f0;
        --editable-image-disabled-opacity: 0.6;
        --editable-image-border-radius: 0px;
        --editable-image-aspect-ratio: auto;
        --editable-image-button-position: top-right;

        /* Basic display and positioning */
        display: inline-block;
        position: relative;
        vertical-align: top;
        width: inherit; /* Default width, override as needed */
        height: inherit; /* Default height, override as needed */
      }
      :host([hidden]) { display: none; }

      /* --- Container Styles --- */
      .editable-image-container {
        position: relative;
        display: block;
        overflow: hidden;
        cursor: pointer;
        border-radius: var(--editable-image-border-radius);
        aspect-ratio: var(--editable-image-aspect-ratio);
        background-color: #eee; /* Background shown if image fails badly */
      }

      /* --- Disabled/Readonly State Styles --- */
      :host([disabled]) .editable-image-container {
        opacity: var(--editable-image-disabled-opacity);
        cursor: not-allowed;
      }
      :host([readonly]) .editable-image-container,
      :host([preview]) .editable-image-container {
        cursor: default;
      }

      /* --- Slotted Image Styles --- */
      /* Target the <img> element provided by the user via the slot */
      ::slotted(img) {
        display: block;
        border-radius: var(--editable-image-border-radius); /* Match container rounding */
        background-color: transparent; /* Allow container background to show */
      }

      /* --- Overlay Styles --- */
      .editable-image-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background-color: var(--editable-image-overlay-bg);
        display: flex;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        pointer-events: none; /* Don't block interactions below by default */
        border-radius: var(--editable-image-border-radius);
      }

      /* --- Button Positioning within Overlay --- */
      /* Default (top-right) & fallback */
      :host([style*="--editable-image-button-position: top-right"]) .editable-image-overlay,
      :host(:not([style*="--editable-image-button-position"])) .editable-image-overlay {
        align-items: flex-start; justify-content: flex-end;
      }
      :host([style*="--editable-image-button-position: top-left"]) .editable-image-overlay {
        align-items: flex-start; justify-content: flex-start;
      }
      :host([style*="--editable-image-button-position: bottom-right"]) .editable-image-overlay {
        align-items: flex-end; justify-content: flex-end;
      }
      :host([style*="--editable-image-button-position: bottom-left"]) .editable-image-overlay {
        align-items: flex-end; justify-content: flex-start;
      }
      :host([style*="--editable-image-button-position: center"]) .editable-image-overlay {
        align-items: center; justify-content: center;
      }

      /* --- Hover Interaction --- */
      /* Show overlay on hover */
      .editable-image-container:hover .editable-image-overlay {
         opacity: 1;
      }
      /* Hide overlay if not editable */
       :host([disabled]) .editable-image-overlay,
       :host([readonly]) .editable-image-overlay,
       :host([preview]) .editable-image-overlay {
         opacity: 0 !important;
         pointer-events: none;
       }

      /* --- Edit Button Styles --- */
      .editable-image-edit-button {
        background-color: var(--editable-image-button-bg);
        color: var(--editable-image-button-color);
        border: none; padding: 8px; border-radius: 50%;
        cursor: pointer; font-family: inherit; outline: none;
        transition: background-color 0.2s ease-in-out;
        display: flex; align-items: center; justify-content: center;
        width: 36px; height: 36px; margin: 8px;
        pointer-events: auto; /* Button is always clickable if visible */
        flex-shrink: 0;
      }
      .editable-image-edit-button svg { width: 20px; height: 20px; }
      .editable-image-edit-button:hover,
      .editable-image-edit-button:focus-visible {
        background-color: var(--editable-image-button-hover-bg);
      }

      /* --- Slot Styles --- */
      /* Ensure slot takes up space to receive the image */
      slot {
          display: block; /* Or flex, grid depending on layout needs */
          width: 100%;
          height: 100%;
          border-radius: var(--editable-image-border-radius); /* Match container */
      }
    `;

    this.#shadowRoot.appendChild(styleEl);
    this.#shadowRoot.appendChild(this.#container);
  }

  /**
   * @method #addEventListeners
   * Attaches event listeners for button clicks and file input changes.
   * Slot change listener is added in connectedCallback.
   * @private
   */
  #addEventListeners() {
    this.#editButton.addEventListener("click", this.#handleEditButtonClick);
    this.#fileInput.addEventListener("change", this.#handleFileChange);
    // Note: slotchange listener added in connectedCallback
  }

   /**
   * @method #handleSlotChange
   * Called when the content of the default slot changes.
   * Re-finds the slotted image and updates the component's state.
   * @private
   */
  #handleSlotChange = () => {
    console.log("EditableImage: Slot content changed.");
    // Clean up listener on the old image if it exists
    if (this.#imageElement) {
        this.#imageElement.onerror = null;
    }
    // Find the new image and re-initialize
    this.#findAndInitializeSlottedImage();
    // Re-apply current state (src, alt, editable status)
    this.#updateRendering();
    this.#updateEditableState();
  };

  /**
   * @method #findAndInitializeSlottedImage
   * Finds the first `<img>` element in the default slot, sets it as
   * `this.#imageElement`, syncs attributes, and attaches the error handler.
   * @private
   */
  #findAndInitializeSlottedImage() {
    const assignedNodes = this.#slot.assignedNodes({ flatten: true });
    const newImageElement = assignedNodes.find(node => node.nodeName === 'IMG');

    if (newImageElement) {
        this.#imageElement = newImageElement;
        console.log("EditableImage: Found slotted image:", this.#imageElement);

        // Add the 'image' part for CSS targeting and external styling hooks
        this.#imageElement.setAttribute('part', 'image');

        // Attach the error handler to the slotted image
        this.#imageElement.onerror = this.#handleImageError;

        // --- Initial Attribute Synchronization ---
        // Sync component state TO slotted image if component attrs are set.
        // Sync slotted image state TO component attrs if component attrs are NOT set.
        const componentSrc = this.getAttribute('src');
        const componentAlt = this.getAttribute('alt');
        const imageSrc = this.#imageElement.getAttribute('src');
        const imageAlt = this.#imageElement.getAttribute('alt');

        if (componentSrc !== null) {
            // If component has src, ensure image matches
            if (this.#imageElement.src !== componentSrc) { // Check .src property for resolved URL
                 this.#imageElement.src = componentSrc;
            }
        } else if (imageSrc !== null) {
            // If component has no src, adopt image's src
            // Use setAttribute to trigger attributeChangedCallback if needed later
             this.setAttribute('src', imageSrc);
        }

        if (componentAlt !== null) {
            // If component has alt, ensure image matches
            if (this.#imageElement.alt !== componentAlt) {
                this.#imageElement.alt = componentAlt;
            }
        } else if (imageAlt !== null) {
            // If component has no alt, adopt image's alt
             this.setAttribute('alt', imageAlt);
        } else {
            // Default alt if neither has one
            this.#imageElement.alt = "Editable image";
            // Optionally set the component attribute too
            // this.setAttribute('alt', "Editable image");
        }

    } else {
        console.warn('EditableImage: No <img> element found in the default slot.');
        this.#imageElement = null;
        // Optionally display an error/placeholder message in the container
        // this.#container.innerHTML = '<p>Please slot an &lt;img&gt; element.</p>';
    }
  }


  /**
   * @method #handleImageError
   * Event handler for the `onerror` event of the slotted `<img>`.
   * Attempts to load a placeholder image.
   * Arrow function preserves `this` context.
   * @private
   */
  #handleImageError = () => {
    if (!this.#imageElement) return; // Should not happen if called from onerror

    const currentImageSrc = this.#imageElement.src; // The src that failed

    // Avoid infinite loop if the placeholder itself fails
    if (currentImageSrc !== this.#placeholderSrc) {
      console.warn(
        `EditableImage: Failed to load src "${currentImageSrc}". Falling back to placeholder.`
      );
      // Set the image element's src directly to the placeholder
      this.#imageElement.src = this.#placeholderSrc;
      // Optionally, update the component's src attribute to reflect the fallback state
      // this.setAttribute('src', this.#placeholderSrc); // Be cautious with this - might trigger saves
    } else {
      // Placeholder failed to load
      console.error(
        `EditableImage: Failed to load placeholder image "${this.#placeholderSrc}". Hiding image.`
      );
      // Hide the broken image icon
      this.#imageElement.style.setProperty('display', 'none', 'important');
      // Optionally, show an error message in the container background
      this.#container.style.backgroundColor = '#fdd'; // Light red background
    }
  };


  /**
   * @method #handleEditButtonClick
   * Opens the file picker when the edit button is clicked.
   * Arrow function preserves `this` context.
   * @param {MouseEvent} event
   * @private
   */
  #handleEditButtonClick = (event) => {
    if (this.disabled || this.readOnly || this.preview) {
      event.stopPropagation();
      return;
    }
    this.#fileInput.click();
    event.preventDefault();
  };

  /**
   * @method #handleFileChange
   * Reads the selected file, updates the component `src`, and dispatches events.
   * Arrow function preserves `this` context.
   * @param {Event} event
   * @private
   */
  #handleFileChange = (event) => {
    if (this.disabled || this.readOnly || this.preview) return;

    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update the component's src property.
        // This triggers attributeChangedCallback -> updateRendering -> updates slotted img.
        this.src = e.target.result;
        // Dispatch events *after* src has been set
        this.#dispatchInputEvent();
        this.#dispatchChangeEvent();
      };
      reader.onerror = (e) => {
        console.error("EditableImage: Error reading file:", e);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ""; // Reset file input
  };

  /**
   * @method #updateRendering
   * Updates the `src` and `alt` attributes of the slotted `<img>` element
   * based on the component's current `src` and `alt` properties/attributes.
   * @private
   */
  #updateRendering() {
    // Only proceed if we have a reference to the slotted image
    if (!this.#imageElement) {
        // If no image is slotted, perhaps clear the container or show a message?
        // console.log("EditableImage: Cannot update rendering, no slotted image.");
        return;
    }

    const componentSrc = this.src; // Get current src via getter
    const componentAlt = this.alt || "Editable image"; // Get current alt or default

    // Ensure the image element is visible (might have been hidden by error handler)
    this.#imageElement.style.display = '';
    // Ensure container background is reset if it was changed on error
    this.#container.style.backgroundColor = ''; // Reset potential error background

    // Update alt text
    if (this.#imageElement.alt !== componentAlt) {
        this.#imageElement.alt = componentAlt;
    }

    // Update src, preventing potential loops if src fails and onerror runs
    // Check against the resolved `src` property of the image element
    const currentImageSrc = this.#imageElement.src;

    if (componentSrc) {
        // Only update if the component's src is different from the image's current resolved src
        if (currentImageSrc !== componentSrc) {
            this.#imageElement.src = componentSrc;
            // Note: onerror handler (#handleImageError) will catch loading failures
        }
    } else {
        // If component's src is empty, should we clear the image src or show placeholder?
        // Option 1: Clear the image src (might show broken icon if alt is also empty)
        // if (currentImageSrc !== '') { // Check against empty string resolved URL? Tricky.
        //    this.#imageElement.removeAttribute('src'); // Or set src = ''?
        // }
        // Option 2: Set to placeholder if component src is empty
         if (currentImageSrc !== this.#placeholderSrc && currentImageSrc !== '') { // Avoid setting if already placeholder or truly empty
            console.log("EditableImage: Component src is empty, setting image to placeholder.");
            this.#imageElement.src = this.#placeholderSrc;
         } else if (currentImageSrc === '' && this.#imageElement.hasAttribute('src')) {
             // If image src resolved to empty but attribute exists, remove attribute
             this.#imageElement.removeAttribute('src');
         }
    }
  }


  /**
   * @method #updateEditableState
   * Updates visual/interactive state based on disabled/readonly/preview attributes.
   * @private
   */
  #updateEditableState() {
    const isEditable = !(this.disabled || this.readOnly || this.preview);

    if (this.#overlay) {
      // Overlay pointer events are handled by CSS hover + attribute selectors now
      // We just need to ensure the attributes are correctly reflected.
    }

    if (this.#container) {
      // Cursor is mainly handled by CSS attribute selectors now
    }

    // Reflect disabled state onto the host for potential external styling
    this.toggleAttribute("disabled", this.disabled);
    // Reflect readonly and preview for CSS selectors
    this.toggleAttribute("readonly", this.readOnly);
    this.toggleAttribute("preview", this.preview);
  }

  /**
   * @method #dispatchInputEvent
   * Dispatches a non-standard 'input' event.
   * @private
   */
  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { src: this.src },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * @method #dispatchChangeEvent
   * Dispatches a standard 'change' event.
   * @private
   */
  #dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { src: this.src },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * @method #getDefaultStorageKey
   * Generates a default key for localStorage persistence.
   * @returns {string} The storage key.
   * @private
   */
  #getDefaultStorageKey() {
    if (this.id) {
      return `editable-image-${this.id}`;
    }
    try {
      const siblings = document.querySelectorAll(this.localName);
      const index = Array.from(siblings).indexOf(this);
      return `editable-image-${this.localName}-${index}`;
    } catch (e) {
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
   * Saves the component's current `src` and `alt` to localStorage.
   * @private
   */
  #saveToLocalStorage() {
    if (!this.persist) return;
    const key = this.storageKey;
    const altKey = `${key}-alt`;
    try {
      const currentSrc = this.src; // Use component's property
      const currentAlt = this.alt; // Use component's property

      // Don't save placeholder src or data URLs that might be huge? (Optional check)
      // if (currentSrc && currentSrc.startsWith('data:')) {
      //   console.warn("EditableImage: Skipping localStorage save for Data URL.");
      //   return;
      // }

      if (currentSrc) {
        localStorage.setItem(key, currentSrc);
      } else {
        localStorage.removeItem(key);
      }

      if (currentAlt) {
        localStorage.setItem(altKey, currentAlt);
      } else {
        localStorage.removeItem(altKey);
      }
    } catch (error) {
      console.warn(`EditableImage: Failed to save state to localStorage (key: ${key}). Error:`, error);
    }
  }

  /**
   * @method #loadFromLocalStorage
   * Loads `src` and `alt` from localStorage and updates the component.
   * @private
   */
  #loadFromLocalStorage() {
    if (!this.persist || !this.#isInitialized) return; // Don't load if not persisting or not ready

    const key = this.storageKey;
    const altKey = `${key}-alt`;
    try {
      const savedSrc = localStorage.getItem(key);
      const savedAlt = localStorage.getItem(altKey);
      let changed = false;

      // Update src property if saved value exists and differs
      if (savedSrc !== null && savedSrc !== this.src) {
        this.src = savedSrc; // Setter triggers attributeChangedCallback -> updateRendering
        changed = true;
      }
      // Handle case where saved value was removed
      else if (savedSrc === null && this.src !== "") {
         this.src = "";
         changed = true;
      }

      // Update alt property if saved value exists and differs
      if (savedAlt !== null && savedAlt !== this.alt) {
        this.alt = savedAlt; // Setter triggers attributeChangedCallback -> updateRendering
        changed = true;
      }
       // Handle case where saved value was removed
      else if (savedAlt === null && this.alt !== "") {
         this.alt = "";
         changed = true;
      }

      // No explicit #updateRendering call needed here because
      // setting this.src/this.alt triggers attributeChangedCallback,
      // which calls #updateRendering.

    } catch (error) {
      console.warn(`EditableImage: Failed to load state from localStorage (key: ${key}). Error:`, error);
    }
  }
}

// --- Custom Element Registration ---
if (!customElements.get("editable-image")) {
  customElements.define("editable-image", EditableImage);
}

// Export the class for potential use in modules
export default EditableImage;
