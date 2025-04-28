/**
 * EditableText Web Component
 *
 * A custom element that provides an inline editable text field with optional
 * localStorage persistence based on the element's 'id'.
 *
 * @element editable-text
 *
 * @attr {string} value - The current text value of the element.
 * @attr {string} placeholder - Placeholder text shown when the value is empty.
 * @attr {number} maxlength - Maximum number of characters allowed.
 * @attr {boolean} readonly - If true, the text cannot be edited.
 * @attr {boolean} disabled - If true, the element is disabled and cannot be interacted with.
 * @attr {boolean} highlight - If true, applies a highlight background style.
 * @attr {number} tabindex - Sets the tab index for accessibility. Defaults are handled based on readonly/disabled state.
 * @attr {boolean} persist - If true, the component will attempt to load its initial value from
 * localStorage based on its 'id' and save subsequent changes back to
 * localStorage. Requires the element to have a unique 'id'.
 *
 * @prop {string} value - Gets or sets the current text value. Will interact with localStorage if 'persist' is true.
 * @prop {string} placeholder - Gets or sets the placeholder text.
 * @prop {number | null} maxLength - Gets or sets the maximum character length.
 * @prop {boolean} readOnly - Gets or sets the readonly state.
 * @prop {boolean} disabled - Gets or sets the disabled state.
 * @prop {boolean} persist - Gets or sets the persistence state.
 * @prop {boolean} highlight - Gets or sets the highlight state.
 *
 * @fires input - Fired synchronously when the value is changed by user input. Detail: { value: string }
 * @fires change - Fired when the value is committed (on blur or Enter) after being changed. Detail: { value: string }
 * @fires char-count - Fired whenever the value changes (programmatically or via user input). Detail: { value: string, length: number, maxLength: number | null }
 * @fires max-length - Fired when user input attempts to exceed the maxlength. Detail: { value: string, length: number, maxLength: number }
 *
 * @cssprop --editable-hover-border-color - Border color on hover (default: #ccc).
 * @cssprop --editable-focus-border-color - Border color on focus (default: #4dabf7).
 * @cssprop --editable-hover-background-color - Background color on hover (default: rgba(240, 249, 255, 0.5)).
 * @cssprop --editable-focus-background-color - Background color on focus (default: rgba(240, 249, 255, 0.7)).
 * @cssprop --editable-highlight-color - Background color when `highlight` attribute is present (default: rgba(255, 255, 0, 0.2)).
 * @cssprop --editable-placeholder-color - Color of the placeholder text (default: #999).
 * @cssprop --editable-disabled-opacity - Opacity when disabled (default: 0.6).
 */
class EditableText extends HTMLElement {
  // --- Private Class Fields ---
  #internals; // ElementInternals for potential future form association
  #editableSpan = null; // Reference to the internal span element
  #currentValue = ""; // Internal tracking of the value
  #initialValueOnFocus = null; // Value when the element received focus
  #isProgrammaticChange = false; // Flag to prevent event loops between setter and attributeChangedCallback
  #isInitialized = false; // Flag to track if component setup is complete

  static get observedAttributes() {
    // Attributes to monitor for changes
    return [
      "value",
      "placeholder",
      "maxlength",
      "readonly",
      "disabled",
      "highlight",
      "tabindex",
      "persist", // Observe the new persist attribute
      "id", // Observe id changes as it affects the storage key
    ];
  }

  constructor() {
    super();
    // Attach Shadow DOM
    this.attachShadow({ mode: "open" });
    // Initialize ElementInternals (useful for form participation if needed later)
    this.#internals = this.attachInternals?.(); // Use attachInternals if available

    // Read initial value from attribute/content early for potential use before connection
    // This might be overridden by localStorage in connectedCallback
    this.#currentValue =
      this.getAttribute("value") ?? this.textContent?.trim() ?? "";

    // Note: Event handlers are bound in #attachEventListeners using .bind()
  }

  // --- Getters and Setters for Public Properties ---

  get value() {
    return this.#currentValue;
  }

  set value(newValue) {
    // Coerce to string and handle null/undefined
    const stringValue = String(newValue ?? "");
    const maxLength = this.maxLength; // Use the public getter
    let finalValue = stringValue;

    // Enforce maxLength if set
    if (maxLength !== null && stringValue.length > maxLength) {
      finalValue = stringValue.substring(0, maxLength);
      // Note: We could dispatch max-length event here too if needed for programmatic sets
    }

    // Only update if the value has actually changed
    if (this.#currentValue !== finalValue) {
      const oldValue = this.#currentValue; // Store old value before update
      this.#currentValue = finalValue;

      // Reflect property change to attribute for consistency
      // Avoid triggering attributeChangedCallback loop by setting flag
      this.#isProgrammaticChange = true;
      this.setAttribute("value", finalValue);
      this.#isProgrammaticChange = false;

      // Persist to localStorage if enabled AFTER internal value is set
      this.#saveToLocalStorage(); // Use private helper

      // Update rendering if the element is already set up
      if (this.#editableSpan) {
        this.#render(); // Use private helper
      }

      // Dispatch events if connected to the DOM
      if (this.isConnected) {
        this.#dispatchCharCountEvent(); // Use private helper
        // Note: Programmatic changes typically don't fire 'input' or 'change'
        // 'change' fires on blur/commit, 'input' is for direct user interaction
      }
    }
    // --- FIX ---
    // Ensure render is called even if the value hasn't changed during initialization
    // This is important if the initial value comes from textContent and matches #currentValue
    else if (!this.#isInitialized && this.#editableSpan) {
      this.#render();
    }
    // --- END FIX ---
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
    // Re-render if needed to update visual placeholder
    if (this.#isInitialized) this.#render();
  }

  get maxLength() {
    const attr = this.getAttribute("maxlength");
    if (attr === null) return null;
    const num = parseInt(attr, 10);
    // Return the number if it's a non-negative integer, otherwise null
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
        // Remove attribute if value is invalid
        this.removeAttribute("maxlength");
      }
    }
    // Re-validate current value after setting maxLength
    if (this.#isInitialized) {
      const currentVal = this.value; // Get current value
      // Set it again via setter for potential truncation and event dispatch
      this.value = currentVal;
    }
  }

  get readOnly() {
    return this.hasAttribute("readonly");
  }

  set readOnly(value) {
    const shouldBeReadOnly = Boolean(value);
    this.toggleAttribute("readonly", shouldBeReadOnly);
    // Update state if component is initialized
    if (this.#isInitialized) this.#updateEditableState();
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    const shouldBeDisabled = Boolean(value);
    this.toggleAttribute("disabled", shouldBeDisabled);
    // Update state if component is initialized
    if (this.#isInitialized) this.#updateEditableState();
  }

  get highlight() {
    return this.hasAttribute("highlight");
  }

  set highlight(value) {
    this.toggleAttribute("highlight", Boolean(value));
    // CSS handles rendering based on the attribute presence
  }

  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    const shouldPersist = Boolean(value);
    this.toggleAttribute("persist", shouldPersist);
    // If persistence is newly enabled after initialization, save the current value
    if (shouldPersist && this.#isInitialized) {
      this.#saveToLocalStorage();
    }
    // If persistence is disabled, we might want to clear the stored value (optional)
    else if (!shouldPersist && this.#isInitialized) {
      this.#clearFromLocalStorage();
    }
  }

  // --- Lifecycle Callbacks ---

  connectedCallback() {
    // Prevent re-initialization if already connected and initialized
    if (this.#isInitialized) {
      return;
    }

    this.#setupShadowDOM(); // Use private helper
    this.#attachEventListeners(); // Use private helper

    let initialValueToSet = this.#currentValue; // Start with constructor value (attribute/textContent)

    // --- Persistence Read ---
    if (this.persist) {
      // Check if the persist attribute is present
      const storageKey = this.#getStorageKey(); // Use private helper
      if (storageKey) {
        // Check if we got a valid key (requires ID)
        try {
          const storedValue = localStorage.getItem(storageKey);
          if (storedValue !== null) {
            // Value from localStorage overrides constructor/attribute value
            initialValueToSet = storedValue;
            console.info(
              `EditableText (${this.id}): Loaded value from localStorage.`
            );
          }
        } catch (e) {
          console.warn(
            `EditableText (${this.id}): Failed to read from localStorage for key "${storageKey}".`,
            e
          );
        }
      } else {
        console.warn(
          `EditableText: 'persist' attribute is present, but the element lacks an 'id'. Persistence disabled.`
        );
      }
    }
    // --- End Persistence Read ---

    // Use the setter to finalize the initial value. This handles:
    // - Setting #currentValue
    // - Applying maxLength validation
    // - Setting the 'value' attribute
    // - Triggering the initial render via the setter's call to #render() (if value changes or fix is applied)
    // - Triggering the initial save to localStorage if persist is enabled
    // - Triggering the initial char-count event dispatch
    this.value = initialValueToSet;

    // Ensure light DOM is clear *after* potential initial value reading and setting
    this.textContent = "";

    // Set initial editable state (contentEditable, ARIA, tabindex)
    this.#updateEditableState(); // Use private helper

    // Initial render and char count dispatch are handled by the `this.value = ...` call above.
    // The fix in the setter ensures render is called even if the value didn't change from constructor.

    this.#isInitialized = true; // Mark initialization complete
  }

  disconnectedCallback() {
    // Cleanup when element is removed from the DOM
    this.#removeEventListeners(); // Use private helper
    // Note: We don't clear localStorage on disconnect by default.
    // Resetting #isInitialized allows re-initialization if re-connected.
    // this.#isInitialized = false; // Uncomment if full re-init on re-connect is desired
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Don't run attribute logic until component is initialized in connectedCallback
    // Also ignore if the value hasn't actually changed
    if (!this.#isInitialized || oldValue === newValue) return;

    switch (name) {
      case "value":
        // Update internal value via the setter ONLY if the change didn't originate
        // from the setter itself (checked by #isProgrammaticChange flag).
        if (!this.#isProgrammaticChange) {
          this.value = newValue ?? ""; // Use setter to sync property and trigger side effects
        }
        break;
      case "readonly":
        this.readOnly = this.hasAttribute("readonly"); // Sync property via setter
        break;
      case "disabled":
        this.disabled = this.hasAttribute("disabled"); // Sync property via setter
        break;
      case "tabindex":
        // No dedicated setter, just update the state directly
        this.#updateEditableState(); // Re-evaluate tabindex logic
        break;
      case "placeholder":
        this.placeholder = newValue; // Sync property via setter
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
        // If the ID changes while persisting, the storage key changes.
        // We should save the current value associated with the *old* ID
        // before potentially loading/saving with the new ID.
        // However, simpler is just to warn and let the next save use the new key.
        if (this.persist && oldValue !== null && oldValue !== newValue) {
          console.warn(
            `EditableText: The 'id' attribute changed from "${oldValue}" to "${newValue}" while 'persist' is enabled. The localStorage key will change. Value associated with the old key "${this.#getStorageKey(
              oldValue
            )}" might be orphaned.`
          );
          // Re-save immediately using the new ID/key
          this.#saveToLocalStorage();
        }
        break;
    }
  }

  // --- Private Helper Methods ---

  /**
   * Gets the localStorage key for this instance.
   * Requires the element to have an ID.
   * @param {string | null} [idOverride] - Optional ID to use instead of this.id (for attributeChangedCallback)
   * @returns {string | null} The storage key or null if no valid ID.
   */
  #getStorageKey(idOverride = null) {
    const id = idOverride ?? this.id;
    if (!id) {
      // Avoid console spam by only warning if persist is explicitly set
      // if (this.hasAttribute('persist')) {
      //     console.warn("EditableText: Persistence requires the element to have an 'id'.", this);
      // }
      return null;
    }
    // Using a prefix to avoid potential collisions with other localStorage items
    return `editable-text-persist-${id}`;
  }

  /**
   * Saves the current value to localStorage if persistence is enabled and possible.
   */
  #saveToLocalStorage() {
    // Only save if initialized, persist is enabled, and has an ID
    if (!this.#isInitialized || !this.persist) {
      return;
    }

    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, this.#currentValue);
        // console.debug(`EditableText (${this.id}): Saved value to localStorage.`); // Optional debug log
      } catch (e) {
        console.warn(
          `EditableText (${this.id}): Failed to write to localStorage for key "${storageKey}". (Quota possibly exceeded)`,
          e
        );
      }
    }
    // No warning if storageKey is null, as #getStorageKey handles the ID check/warning logic
  }

  /**
   * Optional: Clears the value from localStorage for this instance.
   */
  #clearFromLocalStorage() {
    if (!this.#isInitialized) return; // Don't clear if not set up

    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
        console.info(
          `EditableText (${this.id}): Removed value from localStorage.`
        );
      } catch (e) {
        console.warn(
          `EditableText (${this.id}): Failed to remove item from localStorage for key "${storageKey}".`,
          e
        );
      }
    }
  }

  /**
   * Sets up the initial Shadow DOM structure and styles.
   */
  #setupShadowDOM() {
    // (No changes needed in styles or structure for persistence)
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host {
          display: inline-block;
          vertical-align: baseline;
          position: relative;
          border-radius: 2px;
          border-bottom: 1px solid transparent;
          vertical-align: 0;
          outline: none;
          width: max-content;
          line-height: inherit;
          cursor: text;
          white-space: normal;
          box-shadow: inset 0 -1px 0 transparent; /* Default state */
          transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Adjust transition */
          
          /* CSS Variables for customization */
          --editable-hover-border-color: #ccc;
          --editable-focus-border-color: #4dabf7; /* A slightly brighter blue */
          --editable-hover-background-color: #f0f9ff; /* Lighter blue background on hover */
          --editable-focus-background-color: #e7f5ff; /* Slightly darker blue on focus */
          --editable-highlight-color: rgba(255, 255, 0, 0.2);
          --editable-placeholder-color: #999;
          --editable-disabled-opacity: 0.6;
        }
        #editable {
          display: inline;
          outline: none;
          word-wrap: break-word;
          white-space: inherit; /* Inherit from host */
        }
        #editable:empty::before {
          content: attr(data-placeholder);
          color: var(--editable-placeholder-color);
          font-style: italic;
          pointer-events: none;
          display: inline;
          user-select: none;
          opacity: 0.8;
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :host([highlight]) { /* Apply highlight background to host */
          background-color: var(--editable-highlight-color);
        }
        :host(:not([disabled]):not([readonly]):hover) {
          border-bottom-color: var(--editable-hover-border-color);
          background-color: var(--editable-hover-background-color);
        }
        :host(:not([disabled]):not([readonly]):focus-within) {
          box-shadow: inset 0 -1px 0 var(--editable-focus-border-color), 0 0 0 2px rgba(77, 171, 247, 0.2); /* Combine inset shadow and focus ring */
          background-color: var(--editable-focus-background-color);
        }
        :host([readonly]) {
          cursor: default;
          background-color: transparent !important;
          border-bottom-color: transparent !important;
          user-select: text;
        }
        :host([readonly]) #editable {
             user-select: text;
         }
        :host([disabled]) {
          opacity: var(--editable-disabled-opacity);
          cursor: not-allowed;
          user-select: none;
          background-color: transparent !important;
          border-bottom-color: transparent !important;
        }
         :host([disabled]) #editable {
             user-select: none;
         }

      </style>
      <span id="editable" role="textbox" aria-multiline="false"></span>
    `;
    this.#editableSpan = this.shadowRoot.getElementById("editable");
  }

  /**
   * Attaches event listeners. Uses .bind() to ensure correct 'this' context.
   */
  #attachEventListeners() {
    // Store bound listeners to ensure correct removal
    this._boundHandleFocus = this.#handleFocus.bind(this);
    this._boundHandleBlur = this.#handleBlur.bind(this);
    this._boundHandleInput = this.#handleInput.bind(this);
    this._boundHandleKeydown = this.#handleKeydown.bind(this);

    this.addEventListener("focus", this._boundHandleFocus);
    this.addEventListener("blur", this._boundHandleBlur);
    this.#editableSpan?.addEventListener("input", this._boundHandleInput);
    this.#editableSpan?.addEventListener("keydown", this._boundHandleKeydown);
  }

  /**
   * Removes event listeners using the stored bound references.
   */
  #removeEventListeners() {
    this.removeEventListener("focus", this._boundHandleFocus);
    this.removeEventListener("blur", this._boundHandleBlur);
    this.#editableSpan?.removeEventListener("input", this._boundHandleInput);
    this.#editableSpan?.removeEventListener(
      "keydown",
      this._boundHandleKeydown
    );
  }

  /**
   * Updates the component's rendering based on the current state.
   */
  #render() {
    // (No changes needed in rendering logic for persistence)
    if (!this.#editableSpan) return;

    // Update the text content only if it differs
    if (this.#editableSpan.textContent !== this.#currentValue) {
      this.#editableSpan.textContent = this.#currentValue;
    }

    // Update the placeholder data attribute for the ::before pseudo-element
    const placeholderText = this.placeholder; // Reads from <editable-text placeholder="...">
    if (placeholderText && this.#currentValue === "") {
      this.#editableSpan.setAttribute("data-placeholder", placeholderText); // Sets attribute ON THE SPAN
    } else {
      this.#editableSpan.removeAttribute("data-placeholder");
    }
  }

  /**
   * Updates contentEditable, ARIA attributes, and tabindex based on disabled/readonly state.
   */
  #updateEditableState() {
    // (No changes needed in state update logic for persistence)
    if (!this.#editableSpan) return;

    const isDisabled = this.disabled;
    const isReadOnly = this.readOnly;
    const explicitTabIndex = this.getAttribute("tabindex");

    let targetTabIndex = "0"; // Default focusable
    if (isDisabled) {
      targetTabIndex = "-1"; // Not focusable
    } else if (isReadOnly) {
      targetTabIndex = explicitTabIndex ?? "0"; // Focusable unless explicitly removed
    } else {
      targetTabIndex = explicitTabIndex ?? "0"; // Editable is focusable
    }

    if (this.getAttribute("tabindex") !== targetTabIndex) {
      this.setAttribute("tabindex", targetTabIndex);
    }

    const canEdit = !isDisabled && !isReadOnly;
    // Use 'plaintext-only' to prevent accidental HTML pasting, common for single-line inputs
    this.#editableSpan.setAttribute(
      "contenteditable",
      canEdit ? "plaintext-only" : "false"
    );

    this.toggleAttribute("aria-disabled", isDisabled);
    this.toggleAttribute("aria-readonly", isReadOnly && !isDisabled);

    this.#editableSpan.setAttribute(
      "aria-disabled",
      isDisabled ? "true" : "false"
    );
    this.#editableSpan.setAttribute(
      "aria-readonly",
      isReadOnly && !isDisabled ? "true" : "false"
    );

    // Update cursor via CSS for better separation of concerns
    this.style.cursor = isDisabled
      ? "not-allowed"
      : isReadOnly
      ? "default"
      : "text";
  }

  // --- Private Event Handlers ---

  #handleFocus(event) {
    // (No changes needed)
    this.#initialValueOnFocus = this.#currentValue;
  }

  #handleBlur(event) {
    // (No changes needed - change event dispatched if value differs)
    // Persistence saving happens on input/value change via the setter.
    if (
      this.#initialValueOnFocus !== null &&
      this.#initialValueOnFocus !== this.#currentValue
    ) {
      this.#dispatchChangeEvent(); // Dispatch committed change event
    }
    this.#initialValueOnFocus = null;
    // Re-render on blur might be needed if placeholder visibility depends on focus state (it doesn't currently)
    // this.#render();
  }

  #handleInput(event) {
    // This event fires on the internal span when its content changes via user input
    if (this.#isProgrammaticChange || !this.#editableSpan) return;

    // Double-check editability state (belt-and-suspenders)
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      this.#render(); // Restore visual state if somehow changed
      return;
    }

    let currentSpanValue = this.#editableSpan.textContent ?? "";
    const maxLength = this.maxLength;

    // Check and enforce maxLength BEFORE updating the component's value property
    let maxLengthExceeded = false;
    if (maxLength !== null && currentSpanValue.length > maxLength) {
      maxLengthExceeded = true;
      // Truncate the value directly in the span first
      currentSpanValue = currentSpanValue.substring(0, maxLength);
      this.#editableSpan.textContent = currentSpanValue;

      // Try to move cursor to the end after truncation (best-effort)
      this.#moveCursorToEnd();
    }

    // Update the component's value using the public setter.
    // This ensures consistency: updates #currentValue, 'value' attribute,
    // handles persistence (#saveToLocalStorage), and dispatches 'char-count'.
    // The setter internally handles the #isProgrammaticChange flag.
    this.value = currentSpanValue; // Use the setter

    // Dispatch the 'input' event AFTER the value property is updated
    this.#dispatchInputEvent();

    // Dispatch max-length event *after* input and value setting if truncation occurred
    if (maxLengthExceeded) {
      this.#dispatchMaxLengthEvent(currentSpanValue, maxLength);
    }

    // Render is called within the setter if the value changed.
  }

  /** Helper to move cursor to end of span content */
  #moveCursorToEnd() {
    if (!this.#editableSpan || !this.shadowRoot) return;
    try {
      const range = document.createRange();
      const sel = this.shadowRoot.getSelection(); // Get selection within shadow DOM
      if (this.#editableSpan.firstChild && sel) {
        // Check if there's a text node and selection object
        const textNode = this.#editableSpan.firstChild;
        const length = textNode.length; // Get length of the text node
        range.setStart(textNode, length); // Set start and end to the end
        range.collapse(true); // Collapse the range to the start point (which is the end)
        sel.removeAllRanges(); // Remove any existing selection
        sel.addRange(range); // Add the new collapsed range
      } else if (sel) {
        // Handle empty span case: simply ensure focus is inside
        this.#editableSpan.focus();
      }
    } catch (e) {
      console.warn(
        `EditableText (${this.id}): Could not set cursor position.`,
        e
      );
    }
  }

  #handleKeydown(event) {
    // (No changes needed for persistence logic)
    if (this.readOnly || this.disabled) {
      // Allow navigation, selection, copy keys even when read-only/disabled
      const isAllowedKey =
        [
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          "PageUp",
          "PageDown",
          "Shift",
          "Control",
          "Alt",
          "Meta",
        ].includes(event.key) ||
        ((event.ctrlKey || event.metaKey) &&
          ["a", "c", "x"].includes(event.key.toLowerCase())); // Allow Ctrl+A/C/X

      if (!isAllowedKey) {
        // Prevent any key that modifies content or could trigger actions
        event.preventDefault();
      }
      return;
    }

    // Handle specific key actions when editable
    switch (event.key) {
      case "Enter":
        // Prevent new lines in single-line mode
        event.preventDefault();
        // Explicitly trigger blur to commit changes (which might dispatch 'change' event)
        this.blur();
        break;
      case "Escape":
        event.preventDefault();
        if (
          this.#initialValueOnFocus !== null &&
          this.#currentValue !== this.#initialValueOnFocus
        ) {
          // Use setter to revert, ensuring consistency (incl. persistence save of reverted value)
          this.value = this.#initialValueOnFocus;
        }
        // Remove focus after reverting or if no change occurred
        this.blur();
        break;
    }

    // Prevent typing if maxLength will be exceeded (check *before* character is added)
    const maxLength = this.maxLength;
    if (
      maxLength !== null &&
      this.#currentValue.length >= maxLength &&
      // Check if it's a character key that would increase length
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key.length === 1 && // Basic check for printable character
      // Allow keys that don't add characters (Backspace, Delete, Arrows, etc.)
      ![
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Tab",
        "Enter",
        "Escape",
      ].includes(event.key)
    ) {
      // Check if text is selected - allow typing if it will replace selected text
      const selection = this.shadowRoot?.getSelection();
      if (!selection || selection.isCollapsed) {
        event.preventDefault(); // Prevent typing the character
        // Dispatch event to indicate the limit was actively hit by typing attempt
        this.#dispatchMaxLengthEvent(this.#currentValue, maxLength);
      }
      // If text is selected, the browser handles replacement, and the 'input'
      // event handler will perform the length check *after* the change.
    }
  }

  // --- Private Custom Event Dispatchers ---
  // (No changes needed)

  #dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.#currentValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  #dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.#currentValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  #dispatchCharCountEvent() {
    const maxLength = this.maxLength;
    this.dispatchEvent(
      new CustomEvent("char-count", {
        detail: {
          value: this.#currentValue,
          length: this.#currentValue.length,
          maxLength: maxLength,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  #dispatchMaxLengthEvent(currentValue, maxLength) {
    this.dispatchEvent(
      new CustomEvent("max-length", {
        detail: {
          value: currentValue,
          length: currentValue.length,
          maxLength: maxLength,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

// Define the custom element if it hasn't been defined already
if (!customElements.get("editable-text")) {
  customElements.define("editable-text", EditableText);
}

// Optional: Export the class if using modules
export default EditableText;
