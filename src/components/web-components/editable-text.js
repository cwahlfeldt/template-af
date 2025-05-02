/**
 * EditableText Web Component (Enhancer Version with Toolbar, Auto Color, Font/Weight Controls, Reset, and State Reflection)
 *
 * Enhances the first slotted HTML element, making it directly editable
 * inline. Manages state, persistence, and events. Provides a formatting
 * toolbar with dynamic font selection (loads all weights), weight adjustment,
 * color picker, reset button, and reflects the current selection's format.
 * Toolbar visibility is tied to focus within the editable element.
 *
 * NOTE: Font family, font weight, and the bold button now apply to the *entire*
 * element's content for consistency and simplicity.
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
 * @fires font-load-error - If a selected Google Font stylesheet (all weights) fails to load. Detail: { fontName: string, error: Error }
 * @fires reset - When the reset button is clicked.
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
 * @cssprop --editable-toolbar-button-active-background - Default: #d0ebff;
 * @cssprop --editable-toolbar-color-input-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-border - Default: #ced4da.
 * @cssprop --editable-toolbar-select-background - Default: #fff.
 * @cssprop --editable-toolbar-slider-thumb-background - Default: #4dabf7.
 * @cssprop --editable-toolbar-slider-track-background - Default: #dee2e6.
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
  #fontWeightSliderElement = null;
  #fontWeightValueElement = null;
  #resetButtonElement = null;
  #boldButtonElement = null;
  #italicButtonElement = null;
  #currentValue = "";
  #initialComponentValue = "";
  #initialValueOnFocus = null;
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null;
  #toolbarFocusTimeout = null;
  #currentFontFamily = "inherit";
  #currentFontWeight = 400;
  #requestedFontFamilies = new Set();
  #updateToolbarStateTimeout = null;
  #hasFocusWithin = false; // Track focus within component

  // Bound event listeners
  _boundHandleFocusIn = null;
  _boundHandleFocusOut = null;
  _boundHandleSlottedInput = null;
  _boundHandleSlottedKeydown = null;
  _boundHandleSlottedMouseUp = null;
  _boundHandleMutation = null;
  _boundHandleToolbarMouseDown = null; // Changed: Now handles bold toggle
  _boundHandleToolbarColorInput = null;
  _boundHandleFontChange = null;
  _boundHandleFontWeightChange = null;
  _boundHandleReset = null;
  _boundHandleSelectionChange = null;

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

  // Constants for font weights
  static FONT_WEIGHT_NORMAL = 400;
  static FONT_WEIGHT_BOLD = 700;

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
    if (!this.#isInitialized && this.#initialComponentValue === "") {
      this.#initialComponentValue = strVal;
    }
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
      this.#applyCurrentStyles();
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
    /* ... unchanged ... */
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

      // --- Determine Initial Value, Font, and Weight ---
      let valueSource = "slot";
      let initialValueToSet = null;
      const hasToolbarAttr = this.toolbar;
      if (this.persist) {
        const key = this.#getStorageKey();
        if (key) {
          try {
            const persistedValue = localStorage.getItem(key);
            if (persistedValue !== null) {
              initialValueToSet = persistedValue;
              valueSource = "persist";
            }
          } catch (e) {
            console.warn("EditableText: Failed to read from localStorage.", e);
          }
        } else {
          console.warn("EditableText: 'persist' attribute requires an 'id'.");
        }
      }
      if (initialValueToSet === null && this.hasAttribute("value")) {
        initialValueToSet = this.getAttribute("value");
        valueSource = "attribute";
      }
      if (initialValueToSet === null) {
        initialValueToSet = hasToolbarAttr
          ? this.#slottedElement.innerHTML?.trim() ?? ""
          : this.#slottedElement.textContent?.trim() ?? "";
        valueSource = "slot";
      }
      this.#initialComponentValue = initialValueToSet ?? "";

      this.#currentFontFamily =
        this.#slottedElement.style.fontFamily || "inherit";
      const initialWeight = parseInt(
        this.#slottedElement.style.fontWeight || "400",
        10
      );
      // Use constants for default weight
      this.#currentFontWeight =
        isNaN(initialWeight) || initialWeight < 100 || initialWeight > 900
          ? EditableText.FONT_WEIGHT_NORMAL
          : initialWeight;

      // --- Apply Initial State ---
      const contentProp = hasToolbarAttr ? "innerHTML" : "textContent";
      if (this.#slottedElement[contentProp] !== this.#initialComponentValue) {
        this.#slottedElement[contentProp] = this.#initialComponentValue;
      }
      this.#isProgrammaticChange =
        this.getAttribute("value") === this.#initialComponentValue;
      this.value = this.#initialComponentValue;
      this.#isProgrammaticChange = false;

      // --- Setup ---
      this.#populateFontSelector();
      this.#updateFontWeightSliderValue();
      this.#attachEventListeners();
      this.#updateEditableState(); // Sets initial attributes, applies styles
      this.#observeHostMutations();
      this.#render();
      // Toolbar state will be updated on first focus/selection change

      this.#isInitialized = true;
      console.debug(`EditableText (${this.id || "no-id"}): Initialized.`);
    });
  }

  disconnectedCallback() {
    /* ... unchanged ... */
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    clearTimeout(this.#toolbarFocusTimeout);
    clearTimeout(this.#updateToolbarStateTimeout);
    this.#requestedFontFamilies.clear();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    /* ... unchanged ... */
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
    /* ... unchanged ... */ const id = idOverride ?? this.id;
    return id ? `editable-text-persist-v1-${id}` : null;
  }
  #saveToLocalStorage() {
    /* ... unchanged ... */ if (!this.#isInitialized || !this.persist) return;
    const key = this.#getStorageKey();
    if (key) {
      try {
        localStorage.setItem(
          key,
          this.#currentValue
        ); /* Optionally save font/weight */
      } catch (e) {
        console.warn(e);
      }
    } else if (this.persist && !this.hasWarnedAboutMissingId) {
      console.warn("EditableText: Need 'id' to persist.");
      this.hasWarnedAboutMissingId = true;
    }
  }
  #clearFromLocalStorage() {
    /* ... unchanged ... */ if (!this.#isInitialized) return;
    const key = this.#getStorageKey();
    if (key) {
      try {
        console.debug("EditableText: Clearing persisted data for key:", key);
        localStorage.removeItem(
          key
        ); /* localStorage.removeItem(key + '-font'); localStorage.removeItem(key + '-weight'); */
      } catch (e) {
        console.warn(e);
      }
    }
  }

  #rgbToHex(rgb) {
    /* ... unchanged ... */
    if (!rgb || typeof rgb !== "string") return "#000000";
    if (rgb.startsWith("#")) {
      return rgb.length === 4
        ? `#${rgb[1]}${rgb[1]}${rgb[2]}${rgb[2]}${rgb[3]}${rgb[3]}`
        : rgb;
    }
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return "#000000";
    const r = parseInt(result[0], 10),
      g = parseInt(result[1], 10),
      b = parseInt(result[2], 10);
    const toHex = (c) => {
      const clamped = Math.max(0, Math.min(255, c));
      const hex = clamped.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  #setupShadowDOM() {
    /* ... unchanged ... */
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        /* Base styles */
        :host { display: inline-block; vertical-align: baseline; position: relative; border-radius: 1px; outline: none; line-height: inherit; cursor: text; padding: 1px 2px; box-shadow: inset 0 -1px 0 transparent; transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; --editable-hover-border-color: #ccc; --editable-focus-border-color: #4dabf7; --editable-hover-background-color: #f0f9ff; --editable-focus-background-color: #e7f5ff; --editable-highlight-color: rgba(255, 255, 0, 0.2); --editable-disabled-opacity: 0.6; --editable-toolbar-background: #f8f9fa; --editable-toolbar-border: #dee2e6; --editable-toolbar-button-hover-background: #e9ecef; --editable-toolbar-button-active-background: #d0ebff; /* Light blue for active */ --editable-toolbar-color-input-border: #ced4da; --editable-toolbar-select-border: #ced4da; --editable-toolbar-select-background: #fff; --editable-toolbar-slider-thumb-background: #4dabf7; --editable-toolbar-slider-track-background: #dee2e6; }
        /* ... other base styles ... */
        :host([highlight]) { background-color: var(--editable-highlight-color); box-shadow: inset 0 -1px 0 transparent; }
        :host(:not([disabled]):not([readonly]):hover) { box-shadow: inset 0 -1px 0 var(--editable-hover-border-color); background-color: var(--editable-hover-background-color); }
        :host(:not([disabled]):not([readonly]):focus-within) { box-shadow: inset 0 -1.5px 0 var(--editable-focus-border-color), 0 0 0 2px rgba(77, 171, 247, 0.2); background-color: var(--editable-focus-background-color); }
        :host([readonly]) { cursor: default; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; user-select: text; }
        :host([disabled]) { opacity: var(--editable-disabled-opacity); cursor: not-allowed; user-select: none; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; }

        /* Toolbar styles */
        #toolbar { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 10; background-color: var(--editable-toolbar-background); border: 1px solid var(--editable-toolbar-border); border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 3px 5px; display: none; white-space: nowrap; user-select: none; }
        #toolbar.visible { display: inline-flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        #toolbar button { display: inline-flex; align-items: center; justify-content: center; font: inherit; font-weight: bold; background: none; border: none; padding: 4px 6px; cursor: pointer; border-radius: 3px; line-height: 1; transition: background-color 0.15s ease-in-out; min-width: 28px; min-height: 24px; text-align: center; color: inherit; }
        #toolbar button:hover:not(:disabled) { background-color: var(--editable-toolbar-button-hover-background); }
        /* Added: Style for active buttons */
        #toolbar button[data-active="true"]:not(:disabled) { background-color: var(--editable-toolbar-button-active-background); box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
        #toolbar button[data-command="italic"] { font-style: italic; font-weight: normal; }
        #toolbar button svg { width: 1em; height: 1em; fill: currentColor; }
        #toolbar input[type="color"] { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 22px; height: 22px; padding: 0; border: 1px solid var(--editable-toolbar-color-input-border); border-radius: 3px; background-color: transparent; cursor: pointer; vertical-align: middle; }
        #toolbar input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        #toolbar input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]::-moz-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]:hover:not(:disabled) { border-color: var(--editable-focus-border-color); }
        :host([auto-color]) #color-input { display: none; }

        /* Font Selector Styles */
        #font-select { font-size: 0.85em; padding: 3px 5px; border: 1px solid var(--editable-toolbar-select-border, #ced4da); border-radius: 3px; background-color: var(--editable-toolbar-select-background, #fff); cursor: pointer; margin-left: 2px; height: 24px; vertical-align: middle; line-height: 1; max-width: 110px; }
        #font-select:hover:not(:disabled) { border-color: var(--editable-focus-border-color); }
        #font-select:disabled { opacity: 0.6; cursor: not-allowed; background-color: #eee; }

        /* Font Weight Slider Styles */
        .font-weight-control { display: inline-flex; align-items: center; gap: 4px; vertical-align: middle; margin-left: 4px; }
        #font-weight-slider { width: 80px; height: 10px; cursor: pointer; appearance: none; background: var(--editable-toolbar-slider-track-background, #dee2e6); border-radius: 5px; outline: none; transition: opacity .2s; }
        #font-weight-slider::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; background: var(--editable-toolbar-slider-thumb-background, #4dabf7); border-radius: 50%; cursor: pointer; }
        #font-weight-slider::-moz-range-thumb { width: 14px; height: 14px; background: var(--editable-toolbar-slider-thumb-background, #4dabf7); border-radius: 50%; cursor: pointer; border: none; }
        #font-weight-value { font-size: 0.8em; min-width: 25px; text-align: right; color: #555; }
        #font-weight-slider:disabled { opacity: 0.5; cursor: not-allowed; }
        #font-weight-slider:disabled::-webkit-slider-thumb { background: #bbb; }
        #font-weight-slider:disabled::-moz-range-thumb { background: #bbb; }

        /* Slotted element styles */
        ::slotted(*) { outline: none; line-height: inherit; min-height: 1em; padding: 0 !important; border: none !important; margin: 0 !important; display: inline; }
        :host { padding: 1px 2px; }
      </style>
      <div id="toolbar" part="toolbar">
        <button type="button" id="bold-button" data-command="bold" title="Bold (Ctrl+B)">B</button>
        <button type="button" id="italic-button" data-command="italic" title="Italic (Ctrl+I)">I</button>
        <input type="color" id="color-input" data-command="foreColor" title="Text Color" value="#000000">
        <select id="font-select" title="Font Family"></select>
        <div class="font-weight-control">
          <input type="range" id="font-weight-slider" min="100" max="900" step="100" title="Font Weight">
          <span id="font-weight-value">400</span>
        </div>
        <button type="button" id="reset-button" title="Reset Formatting and Content">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
      <slot></slot>
    `;
    this.#toolbarElement = this.shadowRoot.getElementById("toolbar");
    this.#colorInputElement = this.shadowRoot.getElementById("color-input");
    this.#fontSelectElement = this.shadowRoot.getElementById("font-select");
    this.#fontWeightSliderElement =
      this.shadowRoot.getElementById("font-weight-slider");
    this.#fontWeightValueElement =
      this.shadowRoot.getElementById("font-weight-value");
    this.#resetButtonElement = this.shadowRoot.getElementById("reset-button");
    this.#boldButtonElement = this.shadowRoot.getElementById("bold-button");
    this.#italicButtonElement = this.shadowRoot.getElementById("italic-button");
  }

  #populateFontSelector() {
    /* ... unchanged ... */
    if (!this.#fontSelectElement) return;
    this.#fontSelectElement.innerHTML = ""; // Clear
    EditableText.availableFonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.family; // CSS family value
      option.textContent = font.name; // Display name
      this.#fontSelectElement.appendChild(option);
    });
    this.#fontSelectElement.value = this.#currentFontFamily;
  }

  #updateFontWeightSliderValue() {
    /* ... unchanged ... */
    if (this.#fontWeightSliderElement) {
      this.#fontWeightSliderElement.value = this.#currentFontWeight;
    }
    if (this.#fontWeightValueElement) {
      this.#fontWeightValueElement.textContent = this.#currentFontWeight;
    }
  }

  #attachEventListeners() {
    /* ... unchanged ... */
    if (!this.#slottedElement || this._boundHandleFocusIn) return; // Check if already attached

    this._boundHandleFocusIn = this.#handleFocusIn.bind(this); // Changed
    this._boundHandleFocusOut = this.#handleFocusOut.bind(this); // Changed
    this._boundHandleSlottedInput = this.#handleSlottedInput.bind(this);
    this._boundHandleSlottedKeydown = this.#handleSlottedKeydown.bind(this);
    this._boundHandleSlottedMouseUp = this.#handleSlottedMouseUp.bind(this);
    this._boundHandleToolbarMouseDown = this.#handleToolbarMouseDown.bind(this);
    this._boundHandleToolbarColorInput =
      this.#handleToolbarColorInput.bind(this);
    this._boundHandleFontChange = this.#handleFontChange.bind(this);
    this._boundHandleFontWeightChange = this.#handleFontWeightChange.bind(this);
    this._boundHandleReset = this.#handleReset.bind(this);
    this._boundHandleSelectionChange = this.#handleSelectionChange.bind(this);

    // Listen on the host element for focus events bubbling up
    this.addEventListener("focusin", this._boundHandleFocusIn); // Changed
    this.addEventListener("focusout", this._boundHandleFocusOut); // Changed

    // Listeners on the slotted element
    this.#slottedElement.addEventListener(
      "input",
      this._boundHandleSlottedInput
    );
    this.#slottedElement.addEventListener(
      "keydown",
      this._boundHandleSlottedKeydown
    );
    this.#slottedElement.addEventListener(
      "mouseup",
      this._boundHandleSlottedMouseUp
    );

    // Listeners within the shadow DOM
    this.#toolbarElement?.addEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown
    );
    this.#colorInputElement?.addEventListener(
      "input",
      this._boundHandleToolbarColorInput
    );
    this.#fontSelectElement?.addEventListener(
      "change",
      this._boundHandleFontChange
    );
    this.#fontWeightSliderElement?.addEventListener(
      "input",
      this._boundHandleFontWeightChange
    );
    this.#resetButtonElement?.addEventListener("click", this._boundHandleReset);

    // Listener on the document
    document.addEventListener(
      "selectionchange",
      this._boundHandleSelectionChange
    );
  }

  #removeEventListeners() {
    /* ... unchanged ... */
    this.removeEventListener("focusin", this._boundHandleFocusIn); // Changed
    this.removeEventListener("focusout", this._boundHandleFocusOut); // Changed
    this.#slottedElement?.removeEventListener(
      "input",
      this._boundHandleSlottedInput
    );
    this.#slottedElement?.removeEventListener(
      "keydown",
      this._boundHandleSlottedKeydown
    );
    this.#slottedElement?.removeEventListener(
      "mouseup",
      this._boundHandleSlottedMouseUp
    );
    this.#toolbarElement?.removeEventListener(
      "mousedown",
      this._boundHandleToolbarMouseDown
    );
    this.#colorInputElement?.removeEventListener(
      "input",
      this._boundHandleToolbarColorInput
    );
    this.#fontSelectElement?.removeEventListener(
      "change",
      this._boundHandleFontChange
    );
    this.#fontWeightSliderElement?.removeEventListener(
      "input",
      this._boundHandleFontWeightChange
    );
    this.#resetButtonElement?.removeEventListener(
      "click",
      this._boundHandleReset
    );
    document.removeEventListener(
      "selectionchange",
      this._boundHandleSelectionChange
    );

    // Clear bound functions
    this._boundHandleFocusIn = null;
    this._boundHandleFocusOut = null; // Changed
    this._boundHandleSlottedInput = null;
    this._boundHandleSlottedKeydown = null;
    this._boundHandleSlottedMouseUp = null;
    this._boundHandleToolbarMouseDown = null;
    this._boundHandleToolbarColorInput = null;
    this._boundHandleFontChange = null;
    this._boundHandleFontWeightChange = null;
    this._boundHandleReset = null;
    this._boundHandleSelectionChange = null;
  }

  #observeHostMutations() {
    /* ... unchanged ... */
    if (!this.#slottedElement || this.#mutationObserver) return;
    this._boundHandleMutation = this.#handleMutation.bind(this);
    this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
    this.#mutationObserver.observe(this, { childList: true });
  }

  #handleMutation(mutationsList) {
    /* ... unchanged ... */
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
    /* ... unchanged ... */
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
    /* ... unchanged ... */
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
      this.#slottedElement.setAttribute("tabindex", "-1");
      if (useAutoColor) {
        this.#applyAutoColor();
      } else {
        if (this.#slottedElement.style.color) {
          this.#slottedElement.style.color = "";
        }
      }
      this.#applyCurrentStyles();
    }

    // Toolbar State (Visibility handled by focus/selection now)
    if (this.#toolbarElement) {
      const enableToolbarItems = hasToolbar && !isDisabled && !isReadOnly;
      const items = this.#toolbarElement.querySelectorAll(
        'button, input, select, input[type="range"]'
      );
      items.forEach((item) => {
        const isColorInput = item === this.#colorInputElement;
        item.disabled = !enableToolbarItems || (isColorInput && useAutoColor);
        item.style.opacity = item.disabled ? "0.5" : "1";
        item.style.cursor = item.disabled ? "not-allowed" : "pointer";
      });
      // Initial state update if toolbar should be enabled
      if (enableToolbarItems && this.#hasFocusWithin) {
        this.#requestToolbarStateUpdate();
      } else if (!enableToolbarItems) {
        this.#hideToolbar(); // Ensure hidden if disabled/readonly
      }
    }
  }

  #applyAutoColor() {
    /* ... unchanged ... */
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
    // Also reset active states when hiding
    this.#boldButtonElement?.removeAttribute("data-active");
    this.#italicButtonElement?.removeAttribute("data-active");
  }

  // --- Event Handlers ---

  #handleFocusIn(event) {
    /* ... unchanged ... */
    this.#hasFocusWithin = true;
    // Show toolbar only if focus lands on the editable element itself
    if (event.target === this.#slottedElement) {
      clearTimeout(this.#toolbarFocusTimeout); // Prevent hiding if focus moves back quickly
      if (this.#initialValueOnFocus === null) {
        this.#initialValueOnFocus = this.#currentValue;
      }
      this.#showToolbar();
      this.#requestToolbarStateUpdate();
    }
  }

  #handleFocusOut(event) {
    /* ... unchanged ... */
    this.#hasFocusWithin = false;
    // Use timeout to allow focus to shift within the component (e.g., to toolbar)
    // without hiding the toolbar immediately.
    clearTimeout(this.#toolbarFocusTimeout);
    this.#toolbarFocusTimeout = setTimeout(() => {
      // Check if focus is *still* outside the component after the delay
      if (
        !this.shadowRoot.activeElement &&
        document.activeElement !== this &&
        !this.contains(document.activeElement)
      ) {
        this.#hideToolbar();
        if (
          this.#initialValueOnFocus !== null &&
          this.#initialValueOnFocus !== this.#currentValue
        ) {
          this.#dispatchChangeEvent();
        }
        this.#initialValueOnFocus = null;
      }
    }, 150); // Increased delay slightly
  }

  #handleSlottedInput(event) {
    /* ... unchanged ... */
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
    this.#requestToolbarStateUpdate();
  }

  #handleSlottedKeydown(event) {
    /* ... unchanged ... */
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
      // Italic shortcut still uses execCommand
      if (this.toolbar && isMeta && event.key.toLowerCase() === "i") {
        event.preventDefault();
        this.#executeFormatCommand("italic");
      }
      // Bold shortcut now uses the new toggle logic
      if (this.toolbar && isMeta && event.key.toLowerCase() === "b") {
        event.preventDefault();
        this.#toggleBoldState();
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
    if (isNavigation || ["Backspace", "Delete"].includes(event.key)) {
      this.#requestToolbarStateUpdate();
    }
  }

  #handleSlottedMouseUp(event) {
    /* ... unchanged ... */
    this.#requestToolbarStateUpdate();
  }

  #handleToolbarMouseDown(event) {
    // Prevent default only for command buttons to allow select/input interaction
    const button = event.target.closest(
      "button[data-command], button#reset-button"
    );
    if (button && !button.disabled) {
      event.preventDefault(); // Prevent blur when clicking buttons

      const command = button.dataset.command;

      if (command === "bold") {
        this.#toggleBoldState(); // Use new method for bold
      } else if (command && command !== "foreColor") {
        // Handle other execCommands (italic)
        this.#executeFormatCommand(command);
      }
      // Reset is handled by 'click' listener
      // foreColor is handled by 'input' listener on color input
    }
  }

  // Added: Toggle bold state by adjusting font weight
  #toggleBoldState() {
    const currentWeight = this.#currentFontWeight;
    const isCurrentlyBold = currentWeight >= EditableText.FONT_WEIGHT_BOLD;

    // Toggle: If bold, set to normal (400), otherwise set to bold (700)
    this.#currentFontWeight = isCurrentlyBold
      ? EditableText.FONT_WEIGHT_NORMAL
      : EditableText.FONT_WEIGHT_BOLD;

    console.debug(`Toggling bold: Weight set to ${this.#currentFontWeight}`);

    // Apply the new weight and update slider/toolbar state
    this.#applyCurrentStyles();
    this.#updateFontWeightSliderValue();
    this.#requestToolbarStateUpdate(); // Update active state of button
    this.#slottedElement?.focus({ preventScroll: true }); // Keep focus
  }

  #handleToolbarColorInput(event) {
    /* ... unchanged ... */
    if (
      !this.#colorInputElement ||
      event.target !== this.#colorInputElement ||
      !this.#slottedElement ||
      this.autoColor ||
      this.#colorInputElement.disabled
    )
      return;
    const cmd = this.#colorInputElement.dataset.command; // foreColor
    const value = this.#colorInputElement.value; // hex value
    if (cmd && value) {
      this.#executeFormatCommand(cmd, value);
    }
  }

  #handleFontChange(event) {
    /* ... unchanged ... */
    if (
      !this.#fontSelectElement ||
      event.target !== this.#fontSelectElement ||
      !this.#slottedElement ||
      this.#fontSelectElement.disabled
    )
      return;
    const selectedFontFamily = this.#fontSelectElement.value;
    this.#currentFontFamily = selectedFontFamily;
    if (selectedFontFamily !== "inherit") {
      this.#currentFontWeight = EditableText.FONT_WEIGHT_NORMAL; // Use constant
      this.#updateFontWeightSliderValue();
    } else {
      this.#updateFontWeightSliderValue();
    }
    this.#applyCurrentStyles(); // Apply font family change (will load if needed)
    // Don't need #updateEditableState here, focus/selectionchange handles toolbar state
    this.#slottedElement?.focus({ preventScroll: true }); // Refocus editor
  }

  #handleFontWeightChange(event) {
    /* ... unchanged ... */
    if (
      !this.#fontWeightSliderElement ||
      event.target !== this.#fontWeightSliderElement ||
      this.#fontWeightSliderElement.disabled
    )
      return;
    const newWeight = parseInt(event.target.value, 10);
    if (isNaN(newWeight)) return;
    this.#currentFontWeight = newWeight;
    this.#updateFontWeightSliderValue();
    this.#applyCurrentStyles(); // Apply font weight change
  }

  #handleReset(event) {
    /* ... unchanged ... */
    if (!this.#slottedElement || this.disabled || this.readOnly) return;
    console.debug("EditableText: Resetting component state.");
    this.value = this.#initialComponentValue;
    this.#currentFontFamily = "inherit";
    this.#currentFontWeight = EditableText.FONT_WEIGHT_NORMAL; // Use constant
    this.#updateFontWeightSliderValue();
    if (this.#fontSelectElement) this.#fontSelectElement.value = "inherit";
    if (!this.autoColor && this.#slottedElement.style.color) {
      this.#slottedElement.style.color = "";
    }
    if (this.#colorInputElement) this.#colorInputElement.value = "#000000";
    this.#applyCurrentStyles();
    if (this.persist) this.#clearFromLocalStorage();
    this.dispatchEvent(
      new CustomEvent("reset", { bubbles: true, composed: true })
    );
    this.#requestToolbarStateUpdate();
    this.focus();
  }

  #handleSelectionChange(event) {
    /* ... unchanged ... */
    const selection = document.getSelection();
    // Only update if the focus is still considered within our component
    if (
      this.#hasFocusWithin &&
      selection &&
      this.#slottedElement &&
      this.#slottedElement.contains(selection.anchorNode)
    ) {
      this.#requestToolbarStateUpdate();
    }
    // If focus is lost but selectionchange fires, don't update toolbar
    else if (!this.#hasFocusWithin) {
      // Optionally hide toolbar if selection moves outside while component doesn't have focus
      // this.#hideToolbar();
    }
  }

  #requestToolbarStateUpdate() {
    /* ... unchanged ... */
    clearTimeout(this.#updateToolbarStateTimeout);
    this.#updateToolbarStateTimeout = setTimeout(() => {
      this.#updateToolbarState();
    }, 50);
  }

  #updateToolbarState() {
    if (
      !this.#isInitialized ||
      !this.toolbar ||
      this.disabled ||
      this.readOnly ||
      !this.#slottedElement ||
      !this.#hasFocusWithin
    ) {
      return;
    }

    try {
      // --- Bold / Italic ---
      // Italic still uses queryCommandState
      const isItalic = document.queryCommandState("italic");
      this.#italicButtonElement?.setAttribute("data-active", isItalic);

      // Bold state is now based on our internal weight property
      const isBold = this.#currentFontWeight >= EditableText.FONT_WEIGHT_BOLD;
      this.#boldButtonElement?.setAttribute("data-active", isBold);

      // --- Color, Font Family, Font Weight (from selection/cursor) ---
      const selection = window.getSelection();
      let targetNode = null;
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        targetNode = range.startContainer;
        if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
          targetNode = targetNode.parentElement;
        }
      }
      // Fallback to slotted element if no node or node is outside
      if (!targetNode || !this.#slottedElement.contains(targetNode)) {
        targetNode = this.#slottedElement;
      }

      if (targetNode) {
        const computedStyle = window.getComputedStyle(targetNode);

        // --- Color ---
        if (this.#colorInputElement && !this.autoColor) {
          const currentColor = computedStyle.color;
          this.#colorInputElement.value = this.#rgbToHex(currentColor);
        }

        // --- Font Family ---
        // Update font dropdown based on the *overall* element style,
        // as font-family applies globally.
        if (this.#fontSelectElement) {
          this.#fontSelectElement.value = this.#currentFontFamily;
        }

        // --- Font Weight ---
        // Update slider based on the *overall* element style (our internal state)
        if (this.#fontWeightSliderElement) {
          // Ensure slider reflects the internal state, not computed style
          this.#updateFontWeightSliderValue();
        }
      }
    } catch (e) {
      console.warn("EditableText: Error updating toolbar state.", e);
    }
  }

  /** Applies the current font family and weight, loading full font family stylesheet if needed */
  #applyCurrentStyles() {
    /* ... unchanged (keeps applying styles globally) ... */
    if (!this.#slottedElement) return;

    const targetFontFamily = this.#currentFontFamily || "inherit";
    const targetFontWeight =
      this.#currentFontWeight || EditableText.FONT_WEIGHT_NORMAL; // Use constant

    // --- Apply styles ---
    // NOTE: Applying font family and weight directly to the slotted element.
    // This affects the *entire* element, not just the selection.
    let stylesChanged = false;
    if (this.#slottedElement.style.fontFamily !== targetFontFamily) {
      this.#slottedElement.style.fontFamily = targetFontFamily;
      stylesChanged = true;
    }
    if (this.#slottedElement.style.fontWeight !== String(targetFontWeight)) {
      this.#slottedElement.style.fontWeight = targetFontWeight;
      stylesChanged = true;
    }

    // --- Load font family (all weights) if needed ---
    if (targetFontFamily === "inherit") {
      return; // No need to load for inherit
    }

    const fontDefinition = EditableText.availableFonts.find(
      (f) => f.family === targetFontFamily
    );
    const fontName = fontDefinition?.name;

    if (!fontName || fontName === "Default") {
      return;
    }

    if (this.#requestedFontFamilies.has(fontName)) {
      return; // Already requested/loaded all weights
    }

    try {
      /* ... font loading logic (unchanged) ... */
      const encodedFontName = fontName.replace(/ /g, "+");
      const weights = "100;200;300;400;500;600;700;800;900";
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@${weights}&display=swap`;

      if (document.head.querySelector(`link[href="${fontUrl}"]`)) {
        this.#requestedFontFamilies.add(fontName);
        return;
      }

      console.debug(
        `EditableText: Injecting stylesheet for ${fontName} (all weights): ${fontUrl}`
      );
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;
      link.onload = () => {
        console.debug(
          `EditableText: Font stylesheet for ${fontName} (all weights) loaded.`
        );
      };
      link.onerror = (err) => {
        console.error(
          `EditableText: Failed to load font stylesheet for ${fontName} (all weights).`,
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
        if (this.#slottedElement.style.fontFamily === targetFontFamily) {
          this.#slottedElement.style.fontFamily = "inherit";
          this.#slottedElement.style.fontWeight = "normal";
        }
        if (this.#currentFontFamily === targetFontFamily) {
          this.#currentFontFamily = "inherit";
          this.#currentFontWeight = EditableText.FONT_WEIGHT_NORMAL; // Use constant
          if (this.#fontSelectElement)
            this.#fontSelectElement.value = "inherit";
          this.#updateFontWeightSliderValue();
          this.#updateEditableState();
        }
        this.#requestedFontFamilies.add(fontName);
      };

      document.head.appendChild(link);
      this.#requestedFontFamilies.add(fontName);
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
      if (this.#slottedElement.style.fontFamily === targetFontFamily) {
        this.#slottedElement.style.fontFamily = "inherit";
        this.#slottedElement.style.fontWeight = "normal";
      }
      if (this.#currentFontFamily === targetFontFamily) {
        this.#currentFontFamily = "inherit";
        this.#currentFontWeight = EditableText.FONT_WEIGHT_NORMAL; // Use constant
        if (this.#fontSelectElement) this.#fontSelectElement.value = "inherit";
        this.#updateFontWeightSliderValue();
        this.#updateEditableState();
      }
    }
  }

  #executeFormatCommand(command, value = null) {
    // NOTE: This function no longer handles 'bold'. It's handled by #toggleBoldState.
    if (!this.toolbar || this.readOnly || this.disabled) return;
    if (command === "foreColor" && this.autoColor) return;
    // Prevent calling this for 'bold'
    if (command === "bold") {
      console.warn(
        "EditableText: 'bold' command should be handled by #toggleBoldState."
      );
      return;
    }

    const selection = window.getSelection();
    let restoreSelection = false;
    let collapsedSelection = true;
    let selectionRange = null;

    // Check if selection exists and is within the element
    if (
      selection &&
      selection.rangeCount > 0 &&
      this.#slottedElement?.contains(selection.anchorNode)
    ) {
      selectionRange = selection.getRangeAt(0);
      collapsedSelection = selectionRange.collapsed;
    } else {
      collapsedSelection = true;
      if (!this.#slottedElement?.contains(document.activeElement)) {
        this.#slottedElement?.focus({ preventScroll: true });
      }
    }

    // Requirement: If command is formatting and selection is collapsed, select all
    // Applies only to italic and foreColor now
    const isFormattingCommand = ["italic", "foreColor"].includes(command);
    if (isFormattingCommand && collapsedSelection) {
      console.debug(
        `EditableText: No selection for ${command}, selecting all.`
      );
      selection?.selectAllChildren(this.#slottedElement);
      restoreSelection = true;
      if (selection && selection.rangeCount > 0) {
        selectionRange = selection.getRangeAt(0);
      }
    }

    // Ensure focus if needed
    if (
      selectionRange &&
      !this.#slottedElement?.contains(selection.focusNode)
    ) {
      this.#slottedElement?.focus({ preventScroll: true });
    }

    try {
      // Execute the command (italic, foreColor)
      document.execCommand(command, false, value);
    } catch (e) {
      console.error(`EditableText: Error executing command '${command}'.`, e);
      return;
    } finally {
      // Collapse selection if we selected all programmatically
      if (restoreSelection && selection) {
        console.debug("EditableText: Restoring collapsed selection.");
        selection.collapseToEnd();
      }
    }

    // Read the updated HTML *after* the command executes
    const newHtml = this.#slottedElement?.innerHTML ?? "";
    if (this.#currentValue !== newHtml) {
      this.#isProgrammaticChange = true;
      this.value = newHtml; // Use setter
      this.#isProgrammaticChange = false;
      this.#dispatchInputEvent();
      this.#render();
    }

    // Update toolbar state after executing command
    this.#requestToolbarStateUpdate();
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
