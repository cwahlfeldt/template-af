/**
 * EditableText Web Component (Enhancer Version with Toolbar, Auto Color, and DYNAMIC Font Selector)
 *
 * Enhances the first slotted HTML element, making it directly editable
 * inline. Manages state, persistence, and events. Provides a formatting
 * toolbar with dynamic font selection (loads from CDN on demand).
 *
 * @element editable-text
 *
 * @attr {string} value - The text value (potentially containing HTML).
 * @attr {string} placeholder - Placeholder text.
 * @attr {number} maxlength - Maximum character length (ignored if `toolbar` is active).
 * @attr {boolean} readonly - Makes the text non-editable.
 * @attr {boolean} disabled - Disables the component.
 * @attr {boolean} highlight - Applies a highlight background style.
 * @attr {number} tabindex - Sets the host's tab index.
 * @attr {boolean} persist - Saves/loads value to/from localStorage via 'id'.
 * @attr {boolean} toolbar - Enables rich text editing and shows the toolbar.
 * @attr {boolean} auto-color - If set, applies the text color defined by the CSS variable
 * `--color-changer-icon-color`. Hides the manual color picker.
 *
 * @prop {string} value - Gets or sets the current value (potentially HTML).
 * @prop {string} placeholder - Gets or sets the placeholder text.
 * @prop {number | null} maxLength - Gets or sets the max length (ignored if `toolbar`).
 * @prop {boolean} readOnly - Gets or sets the readonly state.
 * @prop {boolean} disabled - Gets or sets the disabled state.
 * @prop {boolean} persist - Gets or sets the persistence state.
 * @prop {boolean} highlight - Gets or sets the highlight state.
 * @prop {boolean} toolbar - Gets or sets the toolbar state.
 * @prop {boolean} autoColor - Gets or sets the auto-color state.
 * @prop {HTMLElement | null} editableElement - Gets the slotted element being edited.
 *
 * @fires input - When the value changes due to user input. Detail: { value: string }
 * @fires change - When the value is committed (blur/Enter). Detail: { value: string }
 * @fires char-count - On value change. Detail: { value: string, length: number, maxLength: number | null }
 * @fires max-length - On attempt to exceed maxlength (no toolbar). Detail: { value: string, length: number, maxLength: number }
 * @fires slotted-element-missing - If no suitable element found in slot.
 * @fires font-load-error - If a selected Google Font fails to load. Detail: { fontName: string, error: Error }
 *
 * @cssprop --editable-hover-border-color - Default: #ccc.
 * @cssprop --editable-focus-border-color - Default: #4dabf7.
 * @cssprop --editable-hover-background-color - Default: rgba(240, 249, 255, 0.6).
 * @cssprop --editable-focus-background-color - Default: rgba(231, 245, 255, 0.8).
 * @cssprop --editable-highlight-color - Default: rgba(255, 255, 0, 0.2).
 * @cssprop --editable-placeholder-color - Default: #999 (Used by global CSS).
 * @cssprop --editable-disabled-opacity - Default: 0.6.
 * @cssprop --editable-toolbar-background - Default: #f8f9fa.
 * @cssprop --editable-toolbar-border - Default: #dee2e6.
 * @cssprop --editable-toolbar-button-hover-background - Default: #e9ecef.
 * @cssprop --editable-toolbar-button-active-background - Default: #ced4da.
 * @cssprop --editable-toolbar-color-input-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-background - Default: #fff.
 * @cssprop --color-changer-icon-color - **Read by the component** when `auto-color` is set.
 *
 * @slot - Default slot. Expects a single HTML element (e.g., h1, p, div).
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
  #slottedElement = null;
  #toolbarElement = null;
  #colorInputElement = null;
  #fontSelectElement = null;
  #currentValue = "";
  #initialValueOnFocus = null;
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null;
  #toolbarFocusTimeout = null;
  #currentFontFamily = ""; // Store applied font family CSS value
  #requestedFontStylesheets = new Set(); // Track requested font *stylesheets*

  // Bound event listeners
  _boundHandleFocus = null;
  _boundHandleBlur = null;
  _boundHandleSlottedInput = null;
  _boundHandleSlottedKeydown = null;
  _boundHandleMutation = null;
  _boundHandleToolbarMouseDown = null;
  _boundHandleToolbarColorChange = null;
  _boundHandleFontChange = null;

  // --- Static Properties ---
  static get observedAttributes() {
    return [
      "value",
      "placeholder",
      "maxlength",
      "readonly",
      "disabled",
      "highlight",
      "tabindex",
      "persist",
      "id",
      "toolbar",
      "auto-color",
    ];
  }

  // List of Fonts to offer - 'family' should be the CSS value, 'name' is for display and URL construction
  static availableFonts = [
    { name: "Default", family: "inherit" },
    { name: "Roboto", family: "'Roboto', sans-serif" },
    { name: "Open Sans", family: "'Open Sans', sans-serif" },
    { name: "Lato", family: "'Lato', sans-serif" },
    { name: "Montserrat", family: "'Montserrat', sans-serif" },
    { name: "Source Code Pro", family: "'Source Code Pro', monospace" },
    { name: "Merriweather", family: "'Merriweather', serif" },
    { name: "Poppins", family: "'Poppins', sans-serif" },
    { name: "Nunito", family: "'Nunito', sans-serif" },
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM();
  }

  // --- Public Property Getters/Setters ---
  get value() {
    return this.#currentValue;
  }
  set value(newValue) {
    const strVal = String(newValue ?? "");
    if (this.#currentValue === strVal) {
      if (!this.#isInitialized) this.#render();
      return;
    }
    this.#currentValue = strVal;
    if (!this.#isProgrammaticChange && this.getAttribute("value") !== strVal) {
      this.#isProgrammaticChange = true;
      this.setAttribute("value", strVal);
      this.#isProgrammaticChange = false;
    }
    if (this.#slottedElement) {
      const prop = this.toolbar ? "innerHTML" : "textContent";
      if (this.#slottedElement[prop] !== strVal) {
        this.#slottedElement[prop] = strVal;
      }
      this.#applyCurrentFont(); /* Re-apply font style */
    }
    this.#saveToLocalStorage();
    this.#render();
    if (this.isConnected && this.#isInitialized) {
      this.#dispatchCharCountEvent();
    }
  }
  get placeholder() {
    return this.getAttribute("placeholder") ?? "";
  }
  set placeholder(value) {
    const strVal = String(value ?? "");
    if (strVal) this.setAttribute("placeholder", strVal);
    else this.removeAttribute("placeholder");
    if (this.#isInitialized) this.#render();
  }
  get maxLength() {
    if (this.toolbar) return null;
    const attr = this.getAttribute("maxlength");
    if (attr === null) return null;
    const num = parseInt(attr, 10);
    return !isNaN(num) && num >= 0 ? num : null;
  }
  set maxLength(value) {
    if (value == null) this.removeAttribute("maxlength");
    else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) this.setAttribute("maxlength", String(num));
      else this.removeAttribute("maxlength");
    }
    if (this.#isInitialized && !this.toolbar) {
      const txt = this.#slottedElement?.textContent ?? "";
      const max = this.maxLength;
      if (max !== null && txt.length > max) this.value = txt.substring(0, max);
    }
  }
  get readOnly() {
    return this.hasAttribute("readonly");
  }
  set readOnly(value) {
    const should = Boolean(value);
    if (this.readOnly !== should) {
      this.toggleAttribute("readonly", should);
      if (this.#isInitialized) this.#updateEditableState();
    }
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    const should = Boolean(value);
    if (this.disabled !== should) {
      this.toggleAttribute("disabled", should);
      if (this.#isInitialized) this.#updateEditableState();
    }
  }
  get highlight() {
    return this.hasAttribute("highlight");
  }
  set highlight(value) {
    const should = Boolean(value);
    if (this.highlight !== should) {
      this.toggleAttribute("highlight", should);
    }
  }
  get persist() {
    return this.hasAttribute("persist");
  }
  set persist(value) {
    const should = Boolean(value);
    if (this.persist !== should) {
      this.toggleAttribute("persist", should);
      if (should && this.#isInitialized) this.#saveToLocalStorage();
      else if (!should && this.#isInitialized) this.#clearFromLocalStorage();
    }
  }
  get toolbar() {
    return this.hasAttribute("toolbar");
  }
  set toolbar(value) {
    const needs = Boolean(value);
    if (this.toolbar !== needs) {
      this.toggleAttribute("toolbar", needs);
      if (this.#isInitialized) {
        this.#updateEditableState();
        if (!needs) {
          const txt = this.#slottedElement?.textContent ?? "";
          if (this.value !== txt) this.value = txt;
        }
        this.#render();
      }
    }
  }
  get autoColor() {
    return this.hasAttribute("auto-color");
  }
  set autoColor(value) {
    const should = Boolean(value);
    if (this.autoColor !== should) {
      this.toggleAttribute(
        "auto-color",
        should
      ); /* attributeChangedCallback handles update */
    }
  }
  get editableElement() {
    return this.#slottedElement;
  }

  // --- Lifecycle Callbacks ---

  connectedCallback() {
    if (this.#isInitialized) return;

    requestAnimationFrame(() => {
      this.#slottedElement = this.querySelector(
        ":scope > *:not(style):not(script)"
      );
      if (!this.#slottedElement) {
        console.error(
          "EditableText: No suitable editable element found in the slot."
        );
        this.dispatchEvent(new CustomEvent("slotted-element-missing"));
        return;
      }

      // --- Determine Initial Value & Font ---
      let initialValueToSet = null;
      const hasToolbarAttr = this.toolbar;
      // 1. Persistence
      if (this.persist) {
        const key = this.#getStorageKey();
        if (key) {
          try {
            initialValueToSet = localStorage.getItem(key);
            // Optionally load persisted font
            // this.#currentFontFamily = localStorage.getItem(key + '-font') || 'inherit';
          } catch (e) {
            console.warn("EditableText: Failed to read from localStorage.", e);
          }
        } else {
          console.warn("EditableText: 'persist' attribute requires an 'id'.");
        }
      }
      // 2. 'value' attribute
      if (initialValueToSet === null)
        initialValueToSet = this.getAttribute("value");
      // 3. Slotted content
      if (initialValueToSet === null)
        initialValueToSet = hasToolbarAttr
          ? this.#slottedElement.innerHTML?.trim() ?? ""
          : this.#slottedElement.textContent?.trim() ?? "";
      // 4. Initial Font (if not loaded from persistence)
      if (!this.#currentFontFamily) {
        this.#currentFontFamily =
          this.#slottedElement.style.fontFamily || "inherit";
      }

      // --- Apply Initial State ---
      const contentProp = hasToolbarAttr ? "innerHTML" : "textContent";
      if (this.#slottedElement[contentProp] !== initialValueToSet) {
        this.#slottedElement[contentProp] = initialValueToSet;
      }
      this.#isProgrammaticChange =
        this.getAttribute("value") === initialValueToSet;
      this.value = initialValueToSet; // Use setter
      this.#isProgrammaticChange = false;

      // --- Setup ---
      this.#populateFontSelector();
      this.#attachEventListeners();
      this.#updateEditableState(); // Sets initial state, applies initial font/color
      this.#observeHostMutations();
      this.#render();

      this.#isInitialized = true;
      console.debug(`EditableText (${this.id || "no-id"}): Initialized.`);
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    clearTimeout(this.#toolbarFocusTimeout);
    this.#requestedFontStylesheets.clear(); // Clear cache of requested fonts
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;

    switch (name) {
      case "value":
        if (!this.#isProgrammaticChange) {
          this.value = newValue ?? "";
        }
        break;
      case "readonly":
      case "disabled":
      case "toolbar":
      case "auto-color":
        this.#updateEditableState();
        break;
      case "highlight":
        this.highlight = this.hasAttribute("highlight");
        break;
      case "tabindex":
        this.#updateEditableState();
        break;
      case "placeholder":
        this.placeholder = newValue;
        break;
      case "maxlength":
        this.maxLength = newValue;
        break;
      case "persist":
        this.persist = this.hasAttribute("persist");
        break;
      case "id":
        if (this.persist && oldValue !== null) {
          this.#saveToLocalStorage();
        }
        break;
    }
  }

  // --- Private Helper Methods ---

  #getStorageKey(idOverride = null) {
    const id = idOverride ?? this.id;
    return id ? `editable-text-persist-v1-${id}` : null;
  }
  #saveToLocalStorage() {
    if (!this.#isInitialized || !this.persist) return;
    const key = this.#getStorageKey();
    if (key) {
      try {
        localStorage.setItem(
          key,
          this.#currentValue
        ); /* Optionally save font: localStorage.setItem(key + '-font', this.#currentFontFamily); */
      } catch (e) {
        console.warn(e);
      }
    } else if (this.persist && !this.hasWarnedAboutMissingId) {
      console.warn("EditableText: Need 'id' to persist.");
      this.hasWarnedAboutMissingId = true;
    }
  }
  #clearFromLocalStorage() {
    if (!this.#isInitialized) return;
    const key = this.#getStorageKey();
    if (key) {
      try {
        localStorage.removeItem(
          key
        ); /* localStorage.removeItem(key + '-font'); */
      } catch (e) {
        console.warn(e);
      }
    }
  }

  #setupShadowDOM() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        /* Base styles */
        :host { display: inline-block; vertical-align: baseline; position: relative; border-radius: 1px; outline: none; line-height: inherit; cursor: text; padding: 1px 2px; box-shadow: inset 0 -1px 0 transparent; transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; --editable-hover-border-color: #ccc; --editable-focus-border-color: #4dabf7; --editable-hover-background-color: #f0f9ff; --editable-focus-background-color: #e7f5ff; --editable-highlight-color: rgba(255, 255, 0, 0.2); --editable-disabled-opacity: 0.6; --editable-toolbar-background: #f8f9fa; --editable-toolbar-border: #dee2e6; --editable-toolbar-button-hover-background: #e9ecef; --editable-toolbar-button-active-background: #ced4da; --editable-toolbar-color-input-border: #ced4da; --editable-toolbar-select-border: #ced4da; --editable-toolbar-select-background: #fff; }
        :host([highlight]) { background-color: var(--editable-highlight-color); box-shadow: inset 0 -1px 0 transparent; }
        :host(:not([disabled]):not([readonly]):hover) { box-shadow: inset 0 -1px 0 var(--editable-hover-border-color); background-color: var(--editable-hover-background-color); }
        :host(:not([disabled]):not([readonly]):focus-within) { box-shadow: inset 0 -1.5px 0 var(--editable-focus-border-color), 0 0 0 2px rgba(77, 171, 247, 0.2); background-color: var(--editable-focus-background-color); }
        :host([readonly]) { cursor: default; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; user-select: text; }
        :host([disabled]) { opacity: var(--editable-disabled-opacity); cursor: not-allowed; user-select: none; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; }

        /* Toolbar styles */
        #toolbar { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 10; background-color: var(--editable-toolbar-background); border: 1px solid var(--editable-toolbar-border); border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 2px; display: none; white-space: nowrap; user-select: none; }
        #toolbar.visible { display: inline-flex; gap: 3px; align-items: center; }
        #toolbar button { font: inherit; font-weight: bold; background: none; border: none; padding: 4px 6px; cursor: pointer; border-radius: 3px; line-height: 1; transition: background-color 0.15s ease-in-out; min-width: 28px; text-align: center; color: inherit; }
        #toolbar button:hover:not(:disabled) { background-color: var(--editable-toolbar-button-hover-background); }
        #toolbar button:active:not(:disabled) { background-color: var(--editable-toolbar-button-active-background); }
        #toolbar button[data-command="italic"] { font-style: italic; font-weight: normal; }
        #toolbar input[type="color"] { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 22px; height: 22px; padding: 0; border: 1px solid var(--editable-toolbar-color-input-border); border-radius: 3px; background-color: transparent; cursor: pointer; vertical-align: middle; }
        #toolbar input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        #toolbar input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]::-moz-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]:hover:not(:disabled) { border-color: var(--editable-focus-border-color); }
        :host([auto-color]) #color-input { display: none; }

        /* Font Selector Styles */
        #font-select { font-size: 0.85em; padding: 3px 5px; border: 1px solid var(--editable-toolbar-select-border, #ced4da); border-radius: 3px; background-color: var(--editable-toolbar-select-background, #fff); cursor: pointer; margin-left: 2px; height: 24px; vertical-align: middle; line-height: 1; max-width: 120px; }
        #font-select:hover:not(:disabled) { border-color: var(--editable-focus-border-color); }
        #font-select:disabled { opacity: 0.6; cursor: not-allowed; background-color: #eee; }

        /* Slotted element styles */
        ::slotted(*) { outline: none; line-height: inherit; min-height: 1em; transition: font-family 0.1s ease-in-out; padding: 0 !important; border: none !important; margin: 0 !important; display: inline; /* Or block */ }
        :host { padding: 1px 2px; /* Restore host padding */ }
      </style>
      <div id="toolbar" part="toolbar">
        <button type="button" data-command="bold" title="Bold (Ctrl+B)">B</button>
        <button type="button" data-command="italic" title="Italic (Ctrl+I)">I</button>
        <input type="color" id="color-input" data-command="foreColor" title="Text Color" value="#000000">
        <select id="font-select" title="Font Family"></select>
      </div>
      <slot></slot>
    `;
    this.#toolbarElement = this.shadowRoot.getElementById("toolbar");
    this.#colorInputElement = this.shadowRoot.getElementById("color-input");
    this.#fontSelectElement = this.shadowRoot.getElementById("font-select");
  }

  #populateFontSelector() {
    if (!this.#fontSelectElement) return;
    this.#fontSelectElement.innerHTML = ""; // Clear
    EditableText.availableFonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.family; // CSS family value
      option.textContent = font.name; // Display name
      this.#fontSelectElement.appendChild(option);
    });
    // Set initial selection based on current font family
    this.#fontSelectElement.value = this.#currentFontFamily;
  }

  #attachEventListeners() {
    if (!this.#slottedElement || this._boundHandleFocus) return; // Already attached

    this._boundHandleFocus = this.#handleFocus.bind(this);
    this._boundHandleBlur = this.#handleBlur.bind(this);
    this._boundHandleSlottedInput = this.#handleSlottedInput.bind(this);
    this._boundHandleSlottedKeydown = this.#handleSlottedKeydown.bind(this);
    this._boundHandleToolbarMouseDown = this.#handleToolbarMouseDown.bind(this);
    this._boundHandleToolbarColorChange =
      this.#handleToolbarColorChange.bind(this);
    this._boundHandleFontChange = this.#handleFontChange.bind(this);

    this.addEventListener("focusin", this._boundHandleFocus);
    this.addEventListener("focusout", this._boundHandleBlur);
    this.#slottedElement.addEventListener(
      "input",
      this._boundHandleSlottedInput
    );
    this.#slottedElement.addEventListener(
      "keydown",
      this._boundHandleSlottedKeydown
    );
    // Listen for mousedown on the toolbar to handle button clicks correctly
    this.#toolbarElement?.addEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown
    );
    // Use 'change' for inputs/selects as it fires after selection is made
    this.#colorInputElement?.addEventListener(
      "change",
      this._boundHandleToolbarColorChange
    );
    this.#fontSelectElement?.addEventListener(
      "change",
      this._boundHandleFontChange
    );
  }

  #removeEventListeners() {
    this.removeEventListener("focusin", this._boundHandleFocus);
    this.removeEventListener("focusout", this._boundHandleBlur);
    this.#slottedElement?.removeEventListener(
      "input",
      this._boundHandleSlottedInput
    );
    this.#slottedElement?.removeEventListener(
      "keydown",
      this._boundHandleSlottedKeydown
    );
    this.#toolbarElement?.removeEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown
    );
    this.#colorInputElement?.removeEventListener(
      "change",
      this._boundHandleToolbarColorChange
    );
    this.#fontSelectElement?.removeEventListener(
      "change",
      this._boundHandleFontChange
    );

    this._boundHandleFocus = null;
    this._boundHandleBlur = null;
    this._boundHandleSlottedInput = null;
    this._boundHandleSlottedKeydown = null;
    this._boundHandleToolbarMouseDown = null;
    this._boundHandleToolbarColorChange = null;
    this._boundHandleFontChange = null;
  }

  #observeHostMutations() {
    if (!this.#slottedElement || this.#mutationObserver) return;
    this._boundHandleMutation = this.#handleMutation.bind(this);
    this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
    this.#mutationObserver.observe(this, { childList: true });
  }

  #handleMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
        let elementRemoved = false;
        mutation.removedNodes.forEach((node) => {
          if (node === this.#slottedElement) elementRemoved = true;
        });
        if (elementRemoved) {
          console.warn("EditableText: Slotted element removed.");
          this.#removeEventListeners();
          this.#mutationObserver?.disconnect();
          this.#mutationObserver = null;
          this.#slottedElement = null;
          this.#hideToolbar();
          break;
        }
      }
    }
  }

  #render() {
    if (!this.#slottedElement) return;
    const placeholderText = this.placeholder;
    const contentToCheck = this.toolbar
      ? this.#slottedElement.innerHTML
      : this.#slottedElement.textContent;
    const isEmpty = (contentToCheck ?? "").trim() === "";
    if (placeholderText && isEmpty) {
      this.#slottedElement.setAttribute(
        "data-editable-placeholder",
        placeholderText
      );
    } else {
      this.#slottedElement.removeAttribute("data-editable-placeholder");
    }
  }

  #updateEditableState() {
    const isDisabled = this.disabled;
    const isReadOnly = this.readOnly;
    const hasToolbar = this.toolbar;
    const useAutoColor = this.autoColor;
    const explicitTabIndex = this.getAttribute("tabindex");

    // Host State
    let targetTabIndex = isDisabled ? "-1" : explicitTabIndex ?? "0";
    if (this.getAttribute("tabindex") !== targetTabIndex)
      this.setAttribute("tabindex", targetTabIndex);
    this.toggleAttribute("aria-disabled", isDisabled);
    this.toggleAttribute("aria-readonly", isReadOnly && !isDisabled);

    // Slotted Element State
    if (this.#slottedElement) {
      const canEdit = !isDisabled && !isReadOnly;
      const editableMode = canEdit
        ? hasToolbar
          ? "true"
          : "plaintext-only"
        : "false";
      this.#slottedElement.setAttribute("contenteditable", editableMode);
      this.#slottedElement.setAttribute("tabindex", "-1"); // Host is focusable
      if (useAutoColor) {
        this.#applyAutoColor();
      } else {
        if (this.#slottedElement.style.color) {
          this.#slottedElement.style.color = "";
        }
      }
      this.#applyCurrentFont(); // Apply font style
    }

    // Toolbar State
    if (this.#toolbarElement) {
      const showToolbar = hasToolbar && !isDisabled && !isReadOnly;
      if (showToolbar) {
        this.#showToolbar();
        const items = this.#toolbarElement.querySelectorAll(
          "button, input, select"
        );
        items.forEach((item) => {
          const isColorInput = item === this.#colorInputElement;
          item.disabled = isColorInput && useAutoColor;
          item.style.opacity = item.disabled ? "0.5" : "1";
          item.style.cursor = item.disabled ? "not-allowed" : "pointer";
        });
      } else {
        this.#hideToolbar();
        const items = this.#toolbarElement.querySelectorAll(
          "button, input, select"
        );
        items.forEach((item) => {
          item.disabled = true;
          item.style.opacity = "0.5";
          item.style.cursor = "not-allowed";
        });
      }
    }
  }

  #applyAutoColor() {
    if (!this.autoColor || !this.#slottedElement) return;
    try {
      const hostStyle = window.getComputedStyle(this);
      const targetColor =
        hostStyle.getPropertyValue("--color-changer-icon-color").trim() ||
        "inherit";
      if (this.#slottedElement.style.color !== targetColor)
        this.#slottedElement.style.color = targetColor;
    } catch (e) {
      console.error("EditableText: Error applying auto color.", e);
      if (this.#slottedElement.style.color !== "inherit")
        this.#slottedElement.style.color = "inherit";
    }
  }

  #showToolbar() {
    if (!this.toolbar || this.readOnly || this.disabled) return;
    this.#toolbarElement?.classList.add("visible");
  }
  #hideToolbar() {
    this.#toolbarElement?.classList.remove("visible");
  }

  // --- Event Handlers ---
  #handleFocus(event) {
    if (event.target === this || this.contains(event.target)) {
      clearTimeout(this.#toolbarFocusTimeout);
      if (this.#initialValueOnFocus === null)
        this.#initialValueOnFocus = this.#currentValue;
      this.#showToolbar();
    }
  }

  #handleBlur(event) {
    clearTimeout(this.#toolbarFocusTimeout);
    this.#toolbarFocusTimeout = setTimeout(() => {
      const relatedTarget = event.relatedTarget;
      const focusStillInside =
        relatedTarget === this ||
        this.contains(relatedTarget) ||
        (relatedTarget && this.shadowRoot.contains(relatedTarget));
      if (!focusStillInside) {
        this.#hideToolbar();
        if (
          this.#initialValueOnFocus !== null &&
          this.#initialValueOnFocus !== this.#currentValue
        )
          this.#dispatchChangeEvent();
        this.#initialValueOnFocus = null;
      }
    }, 100);
  }

  #handleSlottedInput(event) {
    if (
      this.#isProgrammaticChange ||
      !this.#slottedElement ||
      event.target !== this.#slottedElement
    )
      return;
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      const prop = this.toolbar ? "innerHTML" : "textContent";
      this.#slottedElement[prop] = this.#currentValue;
      return;
    }
    const newValue = this.toolbar
      ? this.#slottedElement.innerHTML
      : this.#slottedElement.textContent ?? "";
    const max = this.maxLength;
    if (max !== null) {
      const textContentLength = this.#slottedElement.textContent?.length ?? 0;
      if (textContentLength > max) {
        console.warn("EditableText: Exceeded max length on input.");
        this.#slottedElement.textContent =
          this.#slottedElement.textContent.substring(0, max);
        const correctedValue = this.toolbar
          ? this.#slottedElement.innerHTML
          : this.#slottedElement.textContent;
        this.#isProgrammaticChange = true;
        this.value = correctedValue;
        this.#isProgrammaticChange = false;
        this.#dispatchInputEvent();
        this.#dispatchMaxLengthEvent(correctedValue, max);
        this.#render();
        return;
      }
    }
    this.#isProgrammaticChange = true;
    this.value = newValue;
    this.#isProgrammaticChange = false;
    this.#dispatchInputEvent();
    this.#render();
  }

  #handleSlottedKeydown(event) {
    if (!this.#slottedElement) return;
    const isReadOnlyOrDisabled = this.readOnly || this.disabled;
    const isMeta = event.ctrlKey || event.metaKey;
    const isNavigation = [
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(event.key);
    const isModifier = ["Shift", "Control", "Alt", "Meta"].includes(event.key);
    const isFunctionKey = event.key.startsWith("F");
    const isAllowedReadOnly =
      isNavigation ||
      isModifier ||
      isFunctionKey ||
      event.key === "Escape" ||
      (isMeta && ["a", "c"].includes(event.key.toLowerCase()));
    const isAllowedWriteAction =
      !isReadOnlyOrDisabled &&
      isMeta &&
      ["x", "v"].includes(event.key.toLowerCase());
    if (isReadOnlyOrDisabled && !isAllowedReadOnly && !isAllowedWriteAction) {
      event.preventDefault();
      return;
    }
    if (!isReadOnlyOrDisabled) {
      switch (event.key) {
        case "Enter":
          if (!event.shiftKey && !this.toolbar) {
            event.preventDefault();
            this.#slottedElement.blur();
          }
          break;
        case "Escape":
          event.preventDefault();
          if (
            this.#initialValueOnFocus !== null &&
            this.#currentValue !== this.#initialValueOnFocus
          ) {
            this.value = this.#initialValueOnFocus;
          }
          this.#slottedElement.blur();
          break;
      }
      if (this.toolbar && isMeta) {
        let cmd = null;
        if (event.key.toLowerCase() === "b") cmd = "bold";
        if (event.key.toLowerCase() === "i") cmd = "italic";
        if (cmd) {
          event.preventDefault();
          this.#executeFormatCommand(cmd);
        }
      }
      const max = this.maxLength;
      const isPotentiallyLengthChanging =
        event.key.length === 1 && !isMeta && !event.altKey && !isModifier;
      if (max !== null && isPotentiallyLengthChanging) {
        const currentLength = this.#slottedElement.textContent?.length ?? 0;
        const selection = window.getSelection();
        const isReplacingSelection =
          selection &&
          !selection.isCollapsed &&
          this.#slottedElement.contains(selection.anchorNode);
        if (currentLength >= max && !isReplacingSelection) {
          event.preventDefault();
          this.#dispatchMaxLengthEvent(this.#currentValue, max);
        }
      }
    }
  }

  #handleToolbarMouseDown(event) {
    // Only prevent default for actual command buttons,
    // allow default for select, color input, etc.
    const button = event.target.closest("button[data-command]");
    if (button && !button.disabled) {
      event.preventDefault(); // Prevent blur when clicking buttons
      const cmd = button.dataset.command;
      if (cmd) {
        this.#executeFormatCommand(cmd);
      }
    }
    // Do NOT prevent default if the target is the select or color input
  }

  #handleToolbarColorChange(event) {
    // This handler uses the 'change' event, which fires *after* the color picker is closed.
    if (
      !this.#colorInputElement ||
      event.target !== this.#colorInputElement ||
      !this.#slottedElement ||
      this.autoColor ||
      this.#colorInputElement.disabled
    )
      return;
    const cmd = this.#colorInputElement.dataset.command;
    const value = this.#colorInputElement.value;
    if (cmd && value) {
      this.#executeFormatCommand(cmd, value);
    }
  }

  // Handle Font Selection Change
  #handleFontChange(event) {
    // This handler uses the 'change' event, which fires *after* a font is selected.
    if (
      !this.#fontSelectElement ||
      event.target !== this.#fontSelectElement ||
      !this.#slottedElement ||
      this.#fontSelectElement.disabled
    )
      return;

    const selectedFontFamily = this.#fontSelectElement.value; // CSS family value
    this.#currentFontFamily = selectedFontFamily; // Store the selection

    // Apply the font (will load via #applyCurrentFont if needed)
    this.#applyCurrentFont();

    // Optional: Persist font choice
    // this.#saveToLocalStorage();

    // Optional: Refocus editor after selection (might be slightly jarring)
    // this.#slottedElement.focus({ preventScroll: true });
  }

  /** Applies the font stored in #currentFontFamily, loading stylesheet if needed */
  #applyCurrentFont() {
    if (!this.#slottedElement) return;

    const targetFontFamily = this.#currentFontFamily || "inherit";

    // Always apply the style immediately for responsiveness
    if (this.#slottedElement.style.fontFamily !== targetFontFamily) {
      // console.debug(`Applying font-family: ${targetFontFamily}`);
      this.#slottedElement.style.fontFamily = targetFontFamily;
    }

    // Find the font definition to get the name for URL construction
    const fontDefinition = EditableText.availableFonts.find(
      (f) => f.family === targetFontFamily
    );
    const fontName = fontDefinition?.name; // e.g., "Roboto", "Source Code Pro"

    // Don't try to load "inherit" or if font name is missing
    if (!fontName || fontName === "Default") {
      return;
    }

    // Check if the stylesheet for this font *name* has already been requested
    if (this.#requestedFontStylesheets.has(fontName)) {
      // console.debug(`Stylesheet for ${fontName} already requested.`);
      return;
    }

    // --- Load font stylesheet by injecting <link> into document.head ---
    try {
      // Construct Google Font URL (simple version, regular weight 400)
      // Note: Replace spaces with '+' for the URL
      const encodedFontName = fontName.replace(/ /g, "+");
      // Request regular (400) weight. Add other weights if needed: &wght@400;700
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@400&display=swap`;

      // Check if this exact URL is already in the head
      if (document.head.querySelector(`link[href="${fontUrl}"]`)) {
        console.debug(
          `Stylesheet link for ${fontName} already exists in head.`
        );
        this.#requestedFontStylesheets.add(fontName); // Mark as requested
        return;
      }

      console.debug(
        `EditableText: Injecting stylesheet for ${fontName}: ${fontUrl}`
      );
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      link.onload = () => {
        console.debug(`EditableText: Font stylesheet for ${fontName} loaded.`);
        // Font should be ready due to display=swap.
      };
      link.onerror = (err) => {
        console.error(
          `EditableText: Failed to load font stylesheet for ${fontName}.`,
          err
        );
        this.dispatchEvent(
          new CustomEvent("font-load-error", {
            detail: {
              fontName: fontName,
              error: new Error("Stylesheet load failed"),
            },
            bubbles: true,
            composed: true,
          })
        );
        // Attempt to revert style if loading fails
        if (this.#slottedElement.style.fontFamily === targetFontFamily) {
          this.#slottedElement.style.fontFamily = "inherit";
        }
        // Reset internal state and dropdown if current selection failed
        if (this.#currentFontFamily === targetFontFamily) {
          this.#currentFontFamily = "inherit";
          if (this.#fontSelectElement)
            this.#fontSelectElement.value = "inherit";
        }
        // Keep track that we tried to load it to avoid infinite loops on error
        this.#requestedFontStylesheets.add(fontName);
      };

      document.head.appendChild(link);
      this.#requestedFontStylesheets.add(fontName); // Mark as requested
    } catch (error) {
      console.error(
        `EditableText: Error injecting stylesheet for ${fontName}:`,
        error
      );
      this.dispatchEvent(
        new CustomEvent("font-load-error", {
          detail: { fontName: fontName, error },
          bubbles: true,
          composed: true,
        })
      );
      // Revert style on error
      if (this.#slottedElement.style.fontFamily === targetFontFamily) {
        this.#slottedElement.style.fontFamily = "inherit";
      }
      if (this.#currentFontFamily === targetFontFamily) {
        this.#currentFontFamily = "inherit";
        if (this.#fontSelectElement) this.#fontSelectElement.value = "inherit";
      }
    }
  }

  #executeFormatCommand(command, value = null) {
    if (!this.toolbar || this.readOnly || this.disabled) return;
    if (command === "foreColor" && this.autoColor) return;

    const selection = window.getSelection();
    // Try to focus the element if selection is not inside it
    if (!selection || !this.#slottedElement?.contains(selection.anchorNode)) {
      this.#slottedElement?.focus({ preventScroll: true });
      // Re-check selection after focus attempt
      const postFocusSelection = window.getSelection();
      if (
        !postFocusSelection ||
        !this.#slottedElement?.contains(postFocusSelection.anchorNode)
      ) {
        console.warn(
          `EditableText: Could not set focus for command '${command}'. Command might fail.`
        );
        // Proceed anyway, some commands might work without explicit focus/selection
      }
    }

    try {
      // Execute the command
      document.execCommand(command, false, value);
    } catch (e) {
      console.error(`EditableText: Error executing command '${command}'.`, e);
      return; // Stop if command fails
    }

    // Read the updated HTML *after* the command executes
    const newHtml = this.#slottedElement?.innerHTML ?? "";

    // Update internal value only if it actually changed
    if (this.#currentValue !== newHtml) {
      this.#isProgrammaticChange = true;
      this.value = newHtml; // Use setter to update attribute and save
      this.#isProgrammaticChange = false;
      this.#dispatchInputEvent(); // Dispatch input event on successful command
      this.#render(); // Update placeholder if needed
    }
  }

  // --- Custom Event Dispatchers ---
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
    const len = this.#slottedElement?.textContent?.length ?? 0;
    this.dispatchEvent(
      new CustomEvent("char-count", {
        detail: {
          value: this.#currentValue,
          length: len,
          maxLength: this.maxLength,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
  #dispatchMaxLengthEvent(currentValue, maxLength) {
    const len = this.#slottedElement?.textContent?.length ?? 0;
    this.dispatchEvent(
      new CustomEvent("max-length", {
        detail: { value: currentValue, length: len, maxLength: maxLength },
        bubbles: true,
        composed: true,
      })
    );
  }
} // End of EditableText class

// Define the custom element
if (!customElements.get("editable-text")) {
  customElements.define("editable-text", EditableText);
}

// Export the class if using modules
export default EditableText;
