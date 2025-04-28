/**
 * EditableText Web Component (Enhancer Version)
 *
 * Enhances the first slotted HTML element, making it directly editable
 * inline. Manages state, persistence, and events for the slotted element.
 *
 * @element editable-text
 *
 * @attr {string} value - The text value. If set initially, overrides slotted content.
 * Updates based on edits to the slotted element.
 * @attr {string} placeholder - Placeholder text shown *on the slotted element* when its content is empty.
 * Requires global CSS to style `[data-placeholder]::before`.
 * @attr {number} maxlength - Maximum number of characters allowed in the slotted element.
 * @attr {boolean} readonly - If true, the slotted element's text cannot be edited.
 * @attr {boolean} disabled - If true, the component and slotted element are disabled.
 * @attr {boolean} highlight - If true, applies a highlight background style *to the host*.
 * @attr {number} tabindex - Sets the tab index *on the host* for accessibility.
 * @attr {boolean} persist - If true, saves/loads the value to/from localStorage based on the host's 'id'.
 *
 * @prop {string} value - Gets or sets the current text value. Syncs with the slotted element's textContent.
 * @prop {string} placeholder - Gets or sets the placeholder text.
 * @prop {number | null} maxLength - Gets or sets the maximum character length.
 * @prop {boolean} readOnly - Gets or sets the readonly state.
 * @prop {boolean} disabled - Gets or sets the disabled state.
 * @prop {boolean} persist - Gets or sets the persistence state.
 * @prop {boolean} highlight - Gets or sets the highlight state.
 * @prop {HTMLElement | null} editableElement - Gets the actual slotted element being edited.
 *
 * @fires input - Fired synchronously when the slotted element's value is changed by user input. Detail: { value: string }
 * @fires change - Fired when the value is committed (on blur or Enter) after being changed. Detail: { value: string }
 * @fires char-count - Fired whenever the value changes. Detail: { value: string, length: number, maxLength: number | null }
 * @fires max-length - Fired when user input attempts to exceed the maxlength. Detail: { value: string, length: number, maxLength: number }
 * @fires slotted-element-missing - Fired if no suitable element is found in the slot during initialization.
 *
 * @cssprop --editable-hover-border-color - Host border color on hover (default: #ccc).
 * @cssprop --editable-focus-border-color - Host border color on focus (default: #4dabf7).
 * @cssprop --editable-hover-background-color - Host background color on hover (default: rgba(240, 249, 255, 0.6)).
 * @cssprop --editable-focus-background-color - Host background color on focus (default: rgba(231, 245, 255, 0.8)).
 * @cssprop --editable-highlight-color - Host background color when `highlight` attribute is present (default: rgba(255, 255, 0, 0.2)).
 * @cssprop --editable-placeholder-color - *Used by required global CSS* for placeholder text color (default: #999).
 * @cssprop --editable-disabled-opacity - Host opacity when disabled (default: 0.6).
 *
 * @slot - Default slot. Expects a single HTML element (e.g., h1, p, div).
 * The component will make this element editable. Text nodes are ignored
 * for determining the editable element.
 *
 * @example Required Global CSS for Placeholder:
 * ```css
 * [data-editable-placeholder]:empty::before {
 * content: attr(data-editable-placeholder);
 * color: var(--editable-placeholder-color, #999);
 * font-style: italic;
 * pointer-events: none;
 * display: inline;
 * user-select: none;
 * opacity: 0.8;
 * }
 * ```
 */
class EditableText extends HTMLElement {
  // --- Private Class Fields ---
  #internals;
  #slottedElement = null; // Reference to the actual editable element in the light DOM
  #currentValue = "";
  #initialValueOnFocus = null;
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null; // To detect if slotted element is removed

  // Bound event listeners
  _boundHandleFocus = null;
  _boundHandleBlur = null;
  _boundHandleSlottedInput = null;
  _boundHandleSlottedKeydown = null;
  _boundHandleMutation = null;


  static get observedAttributes() {
    return [
      "value", "placeholder", "maxlength", "readonly", "disabled",
      "highlight", "tabindex", "persist", "id"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM(); // Setup styles early
  }

  // --- Public Property Getters/Setters ---

  get value() {
    return this.#currentValue;
  }

  set value(newValue) {
    const stringValue = String(newValue ?? "");
    const maxLength = this.maxLength;
    let finalValue = stringValue;

    if (maxLength !== null && stringValue.length > maxLength) {
      finalValue = stringValue.substring(0, maxLength);
    }

    if (this.#currentValue !== finalValue) {
      this.#currentValue = finalValue;

      // Reflect property change to attribute
      this.#isProgrammaticChange = true;
      if (this.getAttribute('value') !== finalValue) {
        this.setAttribute("value", finalValue);
      }
      this.#isProgrammaticChange = false;

      // Update the actual slotted element's content ONLY if initialized and element exists
      if (this.#isInitialized && this.#slottedElement && this.#slottedElement.textContent !== finalValue) {
          this.#slottedElement.textContent = finalValue;
      }

      this.#saveToLocalStorage();
      this.#render(); // Update placeholder state

      if (this.isConnected) {
        this.#dispatchCharCountEvent();
      }
    }
    // Ensure render happens during init even if value doesn't change
    else if (!this.#isInitialized) {
       this.#render();
    }
  }

  get placeholder() {
    return this.getAttribute("placeholder") ?? "";
  }

  set placeholder(value) {
    const strValue = String(value ?? "");
    if (strValue) {
      this.setAttribute("placeholder", strValue);
    } else {
      this.removeAttribute("placeholder");
    }
    if (this.#isInitialized) this.#render(); // Update placeholder attribute on slotted element
  }

  get maxLength() {
    const attr = this.getAttribute("maxlength");
    if (attr === null) return null;
    const num = parseInt(attr, 10);
    return !isNaN(num) && num >= 0 ? num : null;
  }

  set maxLength(value) {
    if (value === null || value === undefined) {
      this.removeAttribute("maxlength");
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        this.setAttribute("maxlength", String(num));
      } else {
        this.removeAttribute("maxlength");
      }
    }
    // Re-validate current value
    if (this.#isInitialized) {
      this.value = this.#currentValue; // Use setter to potentially truncate
    }
  }

  get readOnly() {
    return this.hasAttribute("readonly");
  }

  set readOnly(value) {
    this.toggleAttribute("readonly", Boolean(value));
    if (this.#isInitialized) this.#updateEditableState();
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
    if (this.#isInitialized) this.#updateEditableState();
  }

  get highlight() {
    return this.hasAttribute("highlight");
  }

  set highlight(value) {
    this.toggleAttribute("highlight", Boolean(value));
  }

  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    const shouldPersist = Boolean(value);
    this.toggleAttribute("persist", shouldPersist);
    if (shouldPersist && this.#isInitialized) this.#saveToLocalStorage();
    else if (!shouldPersist && this.#isInitialized) this.#clearFromLocalStorage();
  }

  /**
   * Gets the actual slotted element being edited.
   * @returns {HTMLElement | null}
   */
  get editableElement() {
      return this.#slottedElement;
  }

  // --- Lifecycle Callbacks ---

  connectedCallback() {
    if (this.#isInitialized) return;

    // --- Find the Slotted Element ---
    // We look for the first direct child element *after* the initial connection phase.
    // Using setTimeout ensures children are likely parsed and available.
    // A MutationObserver is more robust but adds complexity. Let's try setTimeout first.
    // Update: Using requestAnimationFrame is slightly better than setTimeout(0)
    requestAnimationFrame(() => {
        this.#slottedElement = this.firstElementChild; // Find first direct element child

        if (!this.#slottedElement) {
            console.error("EditableText: No suitable element found in the default slot.", this);
            this.dispatchEvent(new CustomEvent('slotted-element-missing', { bubbles: true, composed: true }));
            // Optionally create a default span? Or just fail gracefully? Let's fail for now.
            // this.#slottedElement = document.createElement('span');
            // this.appendChild(this.#slottedElement);
            return; // Stop initialization if no element
        }

        // --- Determine Initial Value ---
        // Priority: value attribute > slotted content > localStorage > empty string
        let initialValueSource = this.getAttribute("value"); // 1. Attribute
        let sourceName = "attribute";

        if (initialValueSource === null) {
            initialValueSource = this.#slottedElement.textContent?.trim() ?? ""; // 2. Slotted Content
            sourceName = "slot";
        }

        let initialValueToSet = initialValueSource;

        // --- Persistence Read ---
        if (this.persist) {
            const storageKey = this.#getStorageKey();
            if (storageKey) {
                try {
                    const storedValue = localStorage.getItem(storageKey);
                    if (storedValue !== null) {
                        initialValueToSet = storedValue; // 3. LocalStorage overrides others
                        sourceName = "localStorage";
                    }
                } catch (e) {
                    console.warn(`EditableText (${this.id || 'no-id'}): Failed to read localStorage.`, e);
                }
            } else if (this.hasAttribute('persist')) {
                console.warn(`EditableText: 'persist' attribute requires an 'id'.`);
            }
        }

        console.debug(`EditableText (${this.id || 'no-id'}): Initial value ("${initialValueToSet}") from ${sourceName}.`);

        // --- Initialize State ---
        // Use the setter to establish the initial value. It handles:
        // - Setting #currentValue
        // - Setting the 'value' attribute (if needed)
        // - Updating slotted element's textContent (if needed)
        // - Persistence save (if needed)
        // - Initial render() call (placeholder)
        // - Initial char-count event
        this.value = initialValueToSet;

        this.#attachEventListeners();
        this.#updateEditableState(); // Set initial contenteditable, ARIA, etc.
        this.#observeMutations(); // Watch if slotted element is removed

        this.#isInitialized = true;
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    // Resetting #isInitialized allows re-initialization if re-connected.
    // Keep #slottedElement reference in case it's reconnected quickly? Or clear it? Let's clear it.
    // this.#slottedElement = null; // Uncomment if needed
    // this.#isInitialized = false; // Uncomment if full re-init on re-connect is desired
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;

    switch (name) {
      case "value":
        // Update internal value via setter ONLY if change didn't originate from setter
        if (!this.#isProgrammaticChange) {
          // This handles cases where the attribute is changed externally (e.g., via devtools or JS)
          this.value = newValue ?? ""; // Use setter to sync property, slotted content, etc.
        }
        break;
      case "readonly":
        this.readOnly = this.hasAttribute("readonly"); // Sync property via setter
        break;
      case "disabled":
        this.disabled = this.hasAttribute("disabled"); // Sync property via setter
        break;
      case "tabindex":
        this.#updateEditableState(); // Re-evaluate host tabindex
        break;
      case "placeholder":
        this.placeholder = newValue; // Sync property via setter (updates render)
        break;
      case "highlight":
        this.highlight = this.hasAttribute("highlight"); // Sync property via setter
        break;
      case "maxlength":
        this.maxLength = newValue; // Sync property via setter
        break;
      case "persist":
        this.persist = this.hasAttribute("persist"); // Sync property via setter
        break;
      case "id":
        if (this.persist && oldValue !== null && oldValue !== newValue) {
          console.warn(`EditableText: 'id' changed. localStorage key will change.`);
          // Re-save immediately using the new ID/key
          this.#saveToLocalStorage();
        }
        break;
    }
  }

  // --- Private Helper Methods ---

  #getStorageKey(idOverride = null) {
    const id = idOverride ?? this.id;
    if (!id) return null;
    return `editable-text-persist-${id}`;
  }

  #saveToLocalStorage() {
    if (!this.#isInitialized || !this.persist) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, this.#currentValue);
      } catch (e) {
        console.warn(`EditableText (${this.id || 'no-id'}): Failed to write localStorage.`, e);
      }
    }
  }

  #clearFromLocalStorage() {
    if (!this.#isInitialized) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn(`EditableText (${this.id || 'no-id'}): Failed to remove localStorage item.`, e);
      }
    }
  }

  /** Sets up the Shadow DOM with only styles for the host */
  #setupShadowDOM() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host {
          display: inline-block; /* Or block, depending on desired layout */
          vertical-align: baseline;
          position: relative;
          border-radius: 1px;
          outline: none; /* Focus managed visually */
          line-height: inherit; /* Inherit line height from context */
          cursor: text; /* Default cursor */
          padding: 1px 2px; /* Minimal padding around slotted content */
          box-shadow: inset 0 -1px 0 transparent;
          transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

          /* CSS Variables */
          --editable-hover-border-color: #ccc;
          --editable-focus-border-color: #4dabf7;
          --editable-hover-background-color: #f0f9ff; /* Lighter blue background on hover */
          --editable-focus-background-color: #e7f5ff; /* Slightly darker blue on focus */
          --editable-highlight-color: rgba(255, 255, 0, 0.2);
          /* --editable-placeholder-color is used by global CSS */
          --editable-disabled-opacity: 0.6;
        }

        /* Apply styles directly to the host based on state */
        :host([highlight]) {
          background-color: var(--editable-highlight-color);
          box-shadow: inset 0 -1px 0 transparent;
        }
        :host(:not([disabled]):not([readonly]):hover) {
          box-shadow: inset 0 -1px 0 var(--editable-hover-border-color);
          background-color: var(--editable-hover-background-color);
        }
        /* Use :focus-within since focus is on the slotted element */
        :host(:not([disabled]):not([readonly]):focus-within) {
          box-shadow: inset 0 -1.5px 0 var(--editable-focus-border-color), 0 0 0 2px rgba(77, 171, 247, 0.2);
          background-color: var(--editable-focus-background-color);
        }
        :host([readonly]) {
          cursor: default;
          background-color: transparent !important;
          box-shadow: inset 0 -1px 0 transparent !important;
          user-select: text; /* Allow selection */
        }
        :host([disabled]) {
          opacity: var(--editable-disabled-opacity);
          cursor: not-allowed;
          user-select: none;
          background-color: transparent !important;
          box-shadow: inset 0 -1px 0 transparent !important;
        }

        /* Hide the ::slotted content visually if needed, though generally not required */
        /* ::slotted(*) { } */

      </style>
      <slot></slot> `;
    // No internal #editableSpan anymore
  }

  /** Attaches event listeners to host and slotted element */
  #attachEventListeners() {
      if (!this.#slottedElement || this._boundHandleFocus) return; // Don't attach if no element or already attached

      // Store bound listeners
      this._boundHandleFocus = this.#handleFocus.bind(this);
      this._boundHandleBlur = this.#handleBlur.bind(this);
      this._boundHandleSlottedInput = this.#handleSlottedInput.bind(this);
      this._boundHandleSlottedKeydown = this.#handleSlottedKeydown.bind(this);

      // Listen on the HOST element for focus/blur delegation
      this.addEventListener('focus', this._boundHandleFocus);
      this.addEventListener('blur', this._boundHandleBlur);

      // Listen on the SLOTTED element for input/keydown
      this.#slottedElement.addEventListener('input', this._boundHandleSlottedInput);
      this.#slottedElement.addEventListener('keydown', this._boundHandleSlottedKeydown);
  }

  /** Removes event listeners */
  #removeEventListeners() {
      // Remove from host
      this.removeEventListener('focus', this._boundHandleFocus);
      this.removeEventListener('blur', this._boundHandleBlur);

      // Remove from slotted element (if it exists)
      this.#slottedElement?.removeEventListener('input', this._boundHandleSlottedInput);
      this.#slottedElement?.removeEventListener('keydown', this._boundHandleSlottedKeydown);

      // Clear stored bounds
      this._boundHandleFocus = null;
      this._boundHandleBlur = null;
      this._boundHandleSlottedInput = null;
      this._boundHandleSlottedKeydown = null;
  }

  /** Watch for removal of the slotted element */
  #observeMutations() {
      if (!this.#slottedElement) return;
      this._boundHandleMutation = this.#handleMutation.bind(this);
      this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
      // Observe the host element for changes in its direct children
      this.#mutationObserver.observe(this, { childList: true });
  }

  /** Handle mutations, specifically removal of the slotted element */
  #handleMutation(mutationsList) {
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
              // Check if our tracked slotted element was among those removed
              let elementRemoved = false;
              mutation.removedNodes.forEach(removedNode => {
                  if (removedNode === this.#slottedElement) {
                      elementRemoved = true;
                  }
              });

              if (elementRemoved) {
                  console.warn("EditableText: Slotted element was removed.", this);
                  this.#removeEventListeners(); // Clean up listeners associated with it
                  this.#slottedElement = null; // Clear reference
                  this.#mutationObserver?.disconnect(); // Stop observing
                  // Maybe dispatch an event? Or try to find a new element?
                  // For now, the component becomes inactive.
                  break; // Exit loop once found
              }
          }
      }
  }

  /** Updates placeholder attribute on the slotted element */
  #render() {
    if (!this.#slottedElement) return;

    const placeholderText = this.placeholder;
    if (placeholderText && this.#currentValue === "") {
      // Add attribute for global CSS to target ::before
      this.#slottedElement.setAttribute("data-editable-placeholder", placeholderText);
    } else {
      this.#slottedElement.removeAttribute("data-editable-placeholder");
    }
  }

  /** Updates contenteditable on slotted element, ARIA/tabindex on host */
  #updateEditableState() {
    const isDisabled = this.disabled;
    const isReadOnly = this.readOnly;
    const explicitTabIndex = this.getAttribute("tabindex");

    // --- Host Element State ---
    let targetTabIndex = "0"; // Host is generally focusable unless disabled
    if (isDisabled) {
      targetTabIndex = "-1";
    } else if (explicitTabIndex !== null) {
      targetTabIndex = explicitTabIndex; // Respect explicit tabindex
    }
    if (this.getAttribute("tabindex") !== targetTabIndex) {
        this.setAttribute("tabindex", targetTabIndex);
    }
    this.toggleAttribute("aria-disabled", isDisabled);
    this.toggleAttribute("aria-readonly", isReadOnly && !isDisabled);

    // --- Slotted Element State ---
    if (this.#slottedElement) {
        const canEdit = !isDisabled && !isReadOnly;
        // Set contenteditable directly on the slotted element
        this.#slottedElement.setAttribute("contenteditable", canEdit ? "plaintext-only" : "false");

        // Optionally, mirror ARIA states if needed, though host state is primary
        // this.#slottedElement.setAttribute("aria-disabled", isDisabled ? "true" : "false");
        // this.#slottedElement.setAttribute("aria-readonly", isReadOnly && !isDisabled ? "true" : "false");

        // Ensure slotted element isn't focusable itself if host handles focus
        // If host has tabindex >= 0, slotted element should have -1 to avoid double stops.
        // If host has tabindex -1 (disabled), slotted should also be non-focusable.
        this.#slottedElement.setAttribute("tabindex", "-1");
    }

    // Host cursor style is handled by CSS :host rules
  }

  // --- Event Handlers ---

  /** Handles focus landing *on the host* element */
  #handleFocus(event) {
    // Store initial value when the component gains focus interaction
    this.#initialValueOnFocus = this.#currentValue;
    // Optionally delegate focus to the slotted element if it's editable
    // if (!this.disabled && !this.readOnly && this.#slottedElement) {
    //     this.#slottedElement.focus({ preventScroll: true }); // preventScroll might be useful
    // }
  }

  /** Handles focus leaving the host or the slotted element */
  #handleBlur(event) {
    // relatedTarget is where focus is going next
    const relatedTarget = event.relatedTarget;

    // Check if focus is moving *within* the component (host to slotted or vice versa)
    // or staying within the shadow root (though less likely now)
    if (relatedTarget === this || relatedTarget === this.#slottedElement || this.shadowRoot.contains(relatedTarget)) {
      return; // Don't treat internal focus shifts as blur
    }

    // If focus is truly leaving the component and value changed, fire 'change'
    if (this.#initialValueOnFocus !== null && this.#initialValueOnFocus !== this.#currentValue) {
      this.#dispatchChangeEvent();
    }
    this.#initialValueOnFocus = null;
  }

  /** Handles 'input' event *on the slotted element* */
  #handleSlottedInput(event) {
    if (this.#isProgrammaticChange || !this.#slottedElement) return;

    // Stop propagation if needed? Usually not necessary unless nested.
    // event.stopPropagation();

    // Ensure the event target is indeed our slotted element (sanity check)
    if (event.target !== this.#slottedElement) return;

    // Double-check editability state
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      // Restore visual state (might be tricky if browser already updated)
      this.#slottedElement.textContent = this.#currentValue;
      return;
    }

    let currentSlottedValue = this.#slottedElement.textContent ?? "";
    const maxLength = this.maxLength;
    let maxLengthExceeded = false;

    // Enforce maxLength
    if (maxLength !== null && currentSlottedValue.length > maxLength) {
      maxLengthExceeded = true;
      currentSlottedValue = currentSlottedValue.substring(0, maxLength);
      this.#slottedElement.textContent = currentSlottedValue; // Truncate directly
      this.#moveCursorToEnd(); // Move cursor after truncation
    }

    // Update the component's value using the public setter.
    // This syncs #currentValue, 'value' attribute, persistence, and dispatches 'char-count'.
    this.value = currentSlottedValue;

    // Dispatch the 'input' event *from the host* AFTER the value property is updated
    this.#dispatchInputEvent();

    if (maxLengthExceeded) {
      this.#dispatchMaxLengthEvent(currentSlottedValue, maxLength);
    }
  }

  /** Handles 'keydown' event *on the slotted element* */
  #handleSlottedKeydown(event) {
    if (!this.#slottedElement) return;

    // Allow navigation/selection/copy even if readonly/disabled
    const isReadOnlyOrDisabled = this.readOnly || this.disabled;
    const isAllowedKey =
      [
        "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End", "PageUp", "PageDown",
        "Shift", "Control", "Alt", "Meta", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
      ].includes(event.key) ||
      ((event.ctrlKey || event.metaKey) && ["a", "c", "x"].includes(event.key.toLowerCase()));

    if (isReadOnlyOrDisabled && !isAllowedKey) {
      event.preventDefault();
      return;
    }

    // Handle specific keys when editable
    if (!isReadOnlyOrDisabled) {
      switch (event.key) {
        case "Enter":
          // Prevent newlines if desired (often yes for single-line inputs)
          // TODO: Maybe add a 'multiline' attribute/property later?
          event.preventDefault();
          this.blur(); // Commit changes by blurring the host
          break;
        case "Escape":
          event.preventDefault();
          if (this.#initialValueOnFocus !== null && this.#currentValue !== this.#initialValueOnFocus) {
            // Use setter to revert value and slotted content
            this.value = this.#initialValueOnFocus;
          }
          this.blur(); // Remove focus
          break;
      }

      // Prevent typing if maxLength will be exceeded (check *before* character is added)
      const maxLength = this.maxLength;
      if (
        maxLength !== null &&
        this.#currentValue.length >= maxLength &&
        !event.ctrlKey && !event.metaKey && !event.altKey &&
        event.key.length === 1 && // Basic check for printable char
        !["Backspace", "Delete"].includes(event.key) && // Allow deletion keys
        !isAllowedKey // Don't block navigation keys already checked
      ) {
        // Check if text is selected - allow typing if it replaces selection
        const selection = window.getSelection(); // Selection is within the slotted element
        if (!selection || selection.isCollapsed || !this.#slottedElement.contains(selection.anchorNode)) {
            event.preventDefault();
            this.#dispatchMaxLengthEvent(this.#currentValue, maxLength);
        }
      }
    }
  }

  /** Helper to move cursor to end of the slotted element's content */
  #moveCursorToEnd() {
    if (!this.#slottedElement || !window.getSelection) return;
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this.#slottedElement);
      range.collapse(false); // Collapse to the end
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (e) {
      console.warn(`EditableText (${this.id || 'no-id'}): Could not set cursor position.`, e);
    }
  }

  // --- Custom Event Dispatchers (Dispatch from Host) ---

  #dispatchInputEvent() {
    this.dispatchEvent(new CustomEvent("input", {
      detail: { value: this.#currentValue }, bubbles: true, composed: true
    }));
  }

  #dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.#currentValue }, bubbles: true, composed: true
    }));
  }

  #dispatchCharCountEvent() {
    this.dispatchEvent(new CustomEvent("char-count", {
      detail: { value: this.#currentValue, length: this.#currentValue.length, maxLength: this.maxLength },
      bubbles: true, composed: true
    }));
  }

  #dispatchMaxLengthEvent(currentValue, maxLength) {
    this.dispatchEvent(new CustomEvent("max-length", {
      detail: { value: currentValue, length: currentValue.length, maxLength: maxLength },
      bubbles: true, composed: true
    }));
  }
}

// Define the custom element
if (!customElements.get("editable-text")) {
  customElements.define("editable-text", EditableText);
}

// Optional: Export the class if using modules
export default EditableText;

