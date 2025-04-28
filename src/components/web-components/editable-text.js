/**
 * Calculates contrasting text color (black or white) for a given RGB background color.
 * @param {string} rgbString - Background color in "rgb(r, g, b)" or "rgba(r, g, b, a)" format.
 * @returns {'#000000' | '#FFFFFF'} - Black ('#000000') or White ('#FFFFFF').
 */
// NOTE: This function is no longer used by the component's auto-color logic
// but is kept here in case it's needed elsewhere or for future reference.
function getContrastingTextColor(rgbString) {
  const defaultTextColor = '#000000';
  if (!rgbString || rgbString === 'transparent' || rgbString === 'rgba(0, 0, 0, 0)') { return defaultTextColor; }
  const match = rgbString.match(/rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\)/);
  if (!match) { console.warn("Could not parse RGB string:", rgbString); return defaultTextColor; }
  const r = parseInt(match[1], 10), g = parseInt(match[2], 10), b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) { console.warn("Invalid RGBA:", match[1], match[2], match[3], match[4]); return defaultTextColor; }
  if (a < 0.5) { return '#000000'; }
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return (brightness >= 128) ? '#000000' : '#FFFFFF';
}


/**
 * EditableText Web Component (Enhancer Version with Toolbar and Auto Color)
 *
 * Enhances the first slotted HTML element, making it directly editable
 * inline. Manages state, persistence, and events for the slotted element.
 * Optionally provides a simple formatting toolbar. Can automatically
 * set text color based on a CSS variable.
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
 * `--color-changer-icon-color` (read from the host element's computed style).
 * Hides the manual color picker in the toolbar.
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
 * @cssprop --color-changer-icon-color - **Read by the component** when `auto-color` is set,
 * to determine the text color to apply. Should be defined on the host or an ancestor.
 * Defaults to 'inherit' if not set.
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
 * @example Defining the auto-color variable:
 * ```css
 * editable-text.my-component {
 * --color-changer-icon-color: #e0e0e0;
 * }
 * ```
 * ```html
 * <editable-text auto-color class="my-component">
 * <p>This text will be light grey.</p>
 * </editable-text>
 * ```
 */
class EditableText extends HTMLElement {
  // --- Private Class Fields ---
  #internals;
  #slottedElement = null;
  #toolbarElement = null;
  #colorInputElement = null;
  #currentValue = "";
  #initialValueOnFocus = null;
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null; // Observes host childList changes ONLY
  #toolbarFocusTimeout = null;
  // Removed fields related to style/resize observers and RAF debouncing

  // Bound event listeners
  _boundHandleFocus = null;
  _boundHandleBlur = null;
  _boundHandleSlottedInput = null;
  _boundHandleSlottedKeydown = null;
  _boundHandleMutation = null;
  _boundHandleToolbarMouseDown = null;
  _boundHandleToolbarColorChange = null;
  // Removed bound handlers for style/resize observers


  static get observedAttributes() {
    return [
      "value", "placeholder", "maxlength", "readonly", "disabled",
      "highlight", "tabindex", "persist", "id", "toolbar", "auto-color"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM();
  }

  // --- Public Property Getters/Setters ---
  // (Getters/Setters remain the same as v4 - omitted for brevity)
  get value() { return this.#currentValue; }
  set value(newValue) { const strVal = String(newValue ?? ""); if (this.#currentValue === strVal) { if (!this.#isInitialized) this.#render(); return; } this.#currentValue = strVal; if (!this.#isProgrammaticChange && this.getAttribute('value') !== strVal) { this.#isProgrammaticChange = true; this.setAttribute("value", strVal); this.#isProgrammaticChange = false; } if (this.#slottedElement) { const prop = this.toolbar ? 'innerHTML' : 'textContent'; if (this.#slottedElement[prop] !== strVal) { this.#slottedElement[prop] = strVal; } } this.#saveToLocalStorage(); this.#render(); if (this.isConnected && this.#isInitialized) { this.#dispatchCharCountEvent(); } }
  get placeholder() { return this.getAttribute("placeholder") ?? ""; }
  set placeholder(value) { const strVal = String(value ?? ""); if (strVal) this.setAttribute("placeholder", strVal); else this.removeAttribute("placeholder"); if (this.#isInitialized) this.#render(); }
  get maxLength() { if (this.toolbar) return null; const attr = this.getAttribute("maxlength"); if (attr === null) return null; const num = parseInt(attr, 10); return !isNaN(num) && num >= 0 ? num : null; }
  set maxLength(value) { if (value == null) this.removeAttribute("maxlength"); else { const num = parseInt(value, 10); if (!isNaN(num) && num >= 0) this.setAttribute("maxlength", String(num)); else this.removeAttribute("maxlength"); } if (this.#isInitialized && !this.toolbar) { const txt = this.#slottedElement?.textContent ?? ''; const max = this.maxLength; if (max !== null && txt.length > max) this.value = txt.substring(0, max); } }
  get readOnly() { return this.hasAttribute("readonly"); }
  set readOnly(value) { const should = Boolean(value); if (this.readOnly !== should) { this.toggleAttribute("readonly", should); if (this.#isInitialized) this.#updateEditableState(); } }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { const should = Boolean(value); if (this.disabled !== should) { this.toggleAttribute("disabled", should); if (this.#isInitialized) this.#updateEditableState(); } }
  get highlight() { return this.hasAttribute("highlight"); }
  set highlight(value) { const should = Boolean(value); if (this.highlight !== should) { this.toggleAttribute("highlight", should); /* No longer need to trigger auto-color on highlight change */ } }
  get persist() { return this.hasAttribute("persist"); }
  set persist(value) { const should = Boolean(value); if (this.persist !== should) { this.toggleAttribute("persist", should); if (should && this.#isInitialized) this.#saveToLocalStorage(); else if (!should && this.#isInitialized) this.#clearFromLocalStorage(); } }
  get toolbar() { return this.hasAttribute("toolbar"); }
  set toolbar(value) { const needs = Boolean(value); if (this.toolbar !== needs) { this.toggleAttribute("toolbar", needs); if (this.#isInitialized) { this.#updateEditableState(); if (!needs) { const txt = this.#slottedElement?.textContent ?? ''; if (this.value !== txt) this.value = txt; } this.#render(); } } }
  get autoColor() { return this.hasAttribute("auto-color"); }
  set autoColor(value) { const should = Boolean(value); if (this.autoColor !== should) { this.toggleAttribute("auto-color", should); /* attributeChangedCallback handles update */ } }
  get editableElement() { return this.#slottedElement; }


  // --- Lifecycle Callbacks ---

  connectedCallback() {
    if (this.#isInitialized) return;
    requestAnimationFrame(() => {
        this.#slottedElement = this.querySelector(':scope > *:not(style):not(script)');
        if (!this.#slottedElement) { /* ... error handling ... */ return; }
        // Determine Initial Value (same as v4)
        let initialValueToSet = null; const hasToolbarAttr = this.toolbar;
        if (this.persist) { const key = this.#getStorageKey(); if (key) { try { initialValueToSet = localStorage.getItem(key); } catch (e) { console.warn(e); } } else { console.warn("'persist' requires 'id'."); } }
        if (initialValueToSet === null) initialValueToSet = this.getAttribute("value");
        if (initialValueToSet === null) initialValueToSet = hasToolbarAttr ? (this.#slottedElement.innerHTML?.trim() ?? "") : (this.#slottedElement.textContent?.trim() ?? "");
        const contentProp = hasToolbarAttr ? 'innerHTML' : 'textContent';
        if (this.#slottedElement[contentProp] !== initialValueToSet) this.#slottedElement[contentProp] = initialValueToSet;
        this.#isProgrammaticChange = (this.getAttribute('value') === initialValueToSet); this.value = initialValueToSet; this.#isProgrammaticChange = false;

        // Setup
        this.#attachEventListeners();
        this.#updateEditableState(); // Sets initial state & applies initial auto-color
        this.#observeHostMutations(); // Setup only the host observer
        this.#render();

        this.#isInitialized = true;
        console.debug(`EditableText (${this.id || 'no-id'}): Initialized.`);
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect(); // Disconnect only host observer
    this.#mutationObserver = null;
    clearTimeout(this.#toolbarFocusTimeout);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;
    // console.debug(`Attr Changed: ${name}, Old: ${oldValue}, New: ${newValue}`);
    switch (name) {
      case "value": if (!this.#isProgrammaticChange) { this.value = newValue ?? ""; } break;
      case "readonly":
      case "disabled":
      case "toolbar":
      case "auto-color": // When auto-color attr changes...
        this.#updateEditableState(); // ...update state (applies/removes color)
        break;
      // No longer need special handling for highlight regarding auto-color
      case "highlight": this.highlight = this.hasAttribute("highlight"); break;
      case "tabindex": this.#updateEditableState(); break;
      case "placeholder": this.placeholder = newValue; break;
      case "maxlength": this.maxLength = newValue; break;
      case "persist": this.persist = this.hasAttribute("persist"); break;
      case "id": if (this.persist && oldValue !== null) { this.#saveToLocalStorage(); } break;
    }
  }


  // --- Private Helper Methods ---

  #getStorageKey(idOverride = null) { const id = idOverride ?? this.id; return id ? `editable-text-persist-v1-${id}` : null; }
  #saveToLocalStorage() { if (!this.#isInitialized || !this.persist) return; const key = this.#getStorageKey(); if (key) { try { localStorage.setItem(key, this.#currentValue); } catch (e) { console.warn(e); } } else if (this.persist && !this.hasWarnedAboutMissingId) { console.warn("Need 'id' to persist."); this.hasWarnedAboutMissingId = true; } }
  #clearFromLocalStorage() { if (!this.#isInitialized) return; const key = this.#getStorageKey(); if (key) { try { localStorage.removeItem(key); } catch (e) { console.warn(e); } } }

  #setupShadowDOM() {
    // Styles are identical to v4
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host { display: inline-block; vertical-align: baseline; position: relative; border-radius: 1px; outline: none; line-height: inherit; cursor: text; padding: 1px 2px; box-shadow: inset 0 -1px 0 transparent; transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; --editable-hover-border-color: #ccc; --editable-focus-border-color: #4dabf7; --editable-hover-background-color: #f0f9ff; --editable-focus-background-color: #e7f5ff; --editable-highlight-color: rgba(255, 255, 0, 0.2); --editable-disabled-opacity: 0.6; --editable-toolbar-background: #f8f9fa; --editable-toolbar-border: #dee2e6; --editable-toolbar-button-hover-background: #e9ecef; --editable-toolbar-button-active-background: #ced4da; --editable-toolbar-color-input-border: #ced4da; }
        :host([highlight]) { background-color: var(--editable-highlight-color); box-shadow: inset 0 -1px 0 transparent; }
        :host(:not([disabled]):not([readonly]):hover) { box-shadow: inset 0 -1px 0 var(--editable-hover-border-color); background-color: var(--editable-hover-background-color); }
        :host(:not([disabled]):not([readonly]):focus-within) { box-shadow: inset 0 -1.5px 0 var(--editable-focus-border-color), 0 0 0 2px rgba(77, 171, 247, 0.2); background-color: var(--editable-focus-background-color); }
        :host([readonly]) { cursor: default; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; user-select: text; }
        :host([disabled]) { opacity: var(--editable-disabled-opacity); cursor: not-allowed; user-select: none; background-color: transparent !important; box-shadow: inset 0 -1px 0 transparent !important; }
        #toolbar { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 10; background-color: var(--editable-toolbar-background); border: 1px solid var(--editable-toolbar-border); border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 2px; display: none; white-space: nowrap; user-select: none; }
        #toolbar.visible { display: inline-flex; gap: 3px; align-items: center; }
        #toolbar button { font: inherit; font-weight: bold; background: none; border: none; padding: 4px 6px; cursor: pointer; border-radius: 3px; line-height: 1; transition: background-color 0.15s ease-in-out; min-width: 28px; text-align: center; color: inherit; }
        #toolbar button:hover { background-color: var(--editable-toolbar-button-hover-background); }
        #toolbar button:active { background-color: var(--editable-toolbar-button-active-background); }
        #toolbar button[data-command="italic"] { font-style: italic; font-weight: normal; }
        #toolbar input[type="color"] { appearance: none; -webkit-appearance: none; -moz-appearance: none; width: 22px; height: 22px; padding: 0; border: 1px solid var(--editable-toolbar-color-input-border); border-radius: 3px; background-color: transparent; cursor: pointer; vertical-align: middle; }
        #toolbar input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        #toolbar input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]::-moz-color-swatch { border: none; border-radius: 2px; }
        #toolbar input[type="color"]:hover { border-color: var(--editable-focus-border-color); }
        :host([auto-color]) #color-input { display: none; } /* Hides color input when auto-color is active */
        ::slotted(*) { outline: none; line-height: inherit; min-height: 1em; }
      </style>
      <div id="toolbar" part="toolbar">
        <button type="button" data-command="bold" title="Bold (Ctrl+B)">B</button>
        <button type="button" data-command="italic" title="Italic (Ctrl+I)">I</button>
        <input type="color" id="color-input" data-command="foreColor" title="Text Color" value="#000000">
      </div>
      <slot></slot>
    `;
    this.#toolbarElement = this.shadowRoot.getElementById("toolbar");
    this.#colorInputElement = this.shadowRoot.getElementById("color-input");
  }

  #attachEventListeners() { // Identical to v4
      if (!this.#slottedElement || this._boundHandleFocus) return;
      this._boundHandleFocus = this.#handleFocus.bind(this);
      this._boundHandleBlur = this.#handleBlur.bind(this);
      this._boundHandleSlottedInput = this.#handleSlottedInput.bind(this);
      this._boundHandleSlottedKeydown = this.#handleSlottedKeydown.bind(this);
      this._boundHandleToolbarMouseDown = this.#handleToolbarMouseDown.bind(this);
      this._boundHandleToolbarColorChange = this.#handleToolbarColorChange.bind(this);
      this.addEventListener('focusin', this._boundHandleFocus);
      this.addEventListener('focusout', this._boundHandleBlur);
      this.#slottedElement.addEventListener('input', this._boundHandleSlottedInput);
      this.#slottedElement.addEventListener('keydown', this._boundHandleSlottedKeydown);
      this.#toolbarElement?.addEventListener('mousedown', this._boundHandleToolbarMouseDown);
      this.#colorInputElement?.addEventListener('change', this._boundHandleToolbarColorChange);
  }

  #removeEventListeners() { // Identical to v4
      this.removeEventListener('focusin', this._boundHandleFocus);
      this.removeEventListener('focusout', this._boundHandleBlur);
      this.#slottedElement?.removeEventListener('input', this._boundHandleSlottedInput);
      this.#slottedElement?.removeEventListener('keydown', this._boundHandleSlottedKeydown);
      this.#toolbarElement?.removeEventListener('mousedown', this._boundHandleToolbarMouseDown);
      this.#colorInputElement?.removeEventListener('change', this._boundHandleToolbarColorChange);
      this._boundHandleFocus = null; this._boundHandleBlur = null; this._boundHandleSlottedInput = null;
      this._boundHandleSlottedKeydown = null; this._boundHandleToolbarMouseDown = null; this._boundHandleToolbarColorChange = null;
  }

  /** Sets up only the host childList observer */
  #observeHostMutations() {
      if (!this.#slottedElement || this.#mutationObserver) return; // Only observe if needed and not already observing
      this._boundHandleMutation = this.#handleMutation.bind(this);
      this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
      this.#mutationObserver.observe(this, { childList: true });
      // console.debug(`EditableText (${this.id || 'no-id'}): Host childList observer attached.`);
  }

  /** Handle host childList mutations (slotted element removal) */
  #handleMutation(mutationsList) { // Now only handles slotted element removal
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
              let elementRemoved = false;
              mutation.removedNodes.forEach(node => { if (node === this.#slottedElement) elementRemoved = true; });
              if (elementRemoved) {
                  console.warn("Slotted element removed.");
                  this.#removeEventListeners();
                  this.#mutationObserver?.disconnect(); // Disconnect this specific observer
                  this.#mutationObserver = null;
                  this.#slottedElement = null;
                  this.#hideToolbar();
                  break;
              }
          }
      }
  }

  // Removed #handleStyleChange, #handleResize, #requestAutoColorUpdate,
  // #setupStyleObservers, #disconnectObservers (partially integrated into disconnectCallback/handleMutation)

  #render() { // Identical to v4
    if (!this.#slottedElement) return;
    const placeholderText = this.placeholder; const isEmpty = (this.#slottedElement.textContent ?? "").trim() === "";
    if (placeholderText && isEmpty) this.#slottedElement.setAttribute("data-editable-placeholder", placeholderText);
    else this.#slottedElement.removeAttribute("data-editable-placeholder");
  }

  #updateEditableState() { // Applies auto-color directly now
    const isDisabled = this.disabled; const isReadOnly = this.readOnly; const hasToolbar = this.toolbar; const useAutoColor = this.autoColor; const explicitTabIndex = this.getAttribute("tabindex");
    let targetTabIndex = isDisabled ? "-1" : (explicitTabIndex ?? "0"); if (this.getAttribute("tabindex") !== targetTabIndex) this.setAttribute("tabindex", targetTabIndex);
    this.toggleAttribute("aria-disabled", isDisabled); this.toggleAttribute("aria-readonly", isReadOnly && !isDisabled);

    if (this.#slottedElement) {
        const canEdit = !isDisabled && !isReadOnly;
        const editableMode = canEdit ? (hasToolbar ? "true" : "plaintext-only") : "false";
        this.#slottedElement.setAttribute("contenteditable", editableMode);
        this.#slottedElement.setAttribute("tabindex", "-1");

        // Apply/remove auto-color based on attribute
        if (useAutoColor) {
            this.#applyAutoColor(); // Apply color from CSS variable
        } else {
            if (this.#slottedElement.style.color) {
                this.#slottedElement.style.color = ""; // Remove inline style
            }
        }
    }

    // Toolbar visibility/state (same as v4)
    if ((isDisabled || isReadOnly || !hasToolbar)) { this.#hideToolbar(); }
    if (this.#toolbarElement && hasToolbar && !isDisabled && !isReadOnly) { const items = this.#toolbarElement.querySelectorAll('button, input'); items.forEach(i => { i.disabled = false; if (i.tagName === 'INPUT') { i.style.opacity = '1'; i.style.cursor = 'pointer'; } }); }
    else if (this.#toolbarElement) { const items = this.#toolbarElement.querySelectorAll('button, input'); items.forEach(i => { i.disabled = true; if (i.tagName === 'INPUT') { i.style.opacity = '0.5'; i.style.cursor = 'not-allowed'; } }); }
  }

  /** Applies text color based on the --color-changer-icon-color CSS variable */
  #applyAutoColor() {
      if (!this.autoColor || !this.#slottedElement) {
          return; // Only apply if enabled and element exists
      }
      try {
          // Get the variable value from the HOST element's computed style
          const hostStyle = window.getComputedStyle(this);
          // Read the variable, trim whitespace, default to 'inherit' if not set or empty
          const targetColor = hostStyle.getPropertyValue('--color-changer-icon-color').trim() || 'inherit';

          // Apply directly to the slotted element's style
          if (this.#slottedElement.style.color !== targetColor) {
              console.debug(`EditableText AutoColor: Applying color from CSS variable: ${targetColor}`);
              this.#slottedElement.style.color = targetColor;
          }
      } catch (e) {
          console.error("EditableText: Error applying auto color from CSS variable.", e);
          // Fallback if reading variable fails
          if (this.#slottedElement.style.color !== 'inherit') {
             this.#slottedElement.style.color = 'inherit'; // Default to inherit on error
          }
      }
  }

  #showToolbar() { if (!this.toolbar || this.readOnly || this.disabled) return; this.#toolbarElement?.classList.add('visible'); }
  #hideToolbar() { this.#toolbarElement?.classList.remove('visible'); }

  // --- Event Handlers --- (Identical to v4)
  #handleFocus(event) { clearTimeout(this.#toolbarFocusTimeout); if (this.#initialValueOnFocus === null) this.#initialValueOnFocus = this.#currentValue; this.#showToolbar(); }
  #handleBlur(event) { clearTimeout(this.#toolbarFocusTimeout); this.#toolbarFocusTimeout = setTimeout(() => { const related = event.relatedTarget; const inside = related === this || related === this.#slottedElement || (related && this.#toolbarElement?.contains(related)) || related === this.#colorInputElement; if (!inside) { this.#hideToolbar(); if (this.#initialValueOnFocus !== null && this.#initialValueOnFocus !== this.#currentValue) this.#dispatchChangeEvent(); this.#initialValueOnFocus = null; } }, 0); }
  #handleSlottedInput(event) { if (this.#isProgrammaticChange || !this.#slottedElement || event.target !== this.#slottedElement) return; if (this.readOnly || this.disabled) { event.preventDefault(); const prop = this.toolbar ? 'innerHTML' : 'textContent'; this.#slottedElement[prop] = this.#currentValue; return; } const val = this.toolbar ? this.#slottedElement.innerHTML : this.#slottedElement.textContent ?? ""; this.#isProgrammaticChange = true; this.value = val; this.#isProgrammaticChange = false; this.#dispatchInputEvent(); const max = this.maxLength; if (max !== null) { const len = this.#slottedElement.textContent?.length ?? 0; if (len > max) this.#dispatchMaxLengthEvent(this.#currentValue, max); } this.#render(); }
  #handleSlottedKeydown(event) { if (!this.#slottedElement) return; const isROrD = this.readOnly || this.disabled; const isMeta = event.ctrlKey || event.metaKey; const isNav = ["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key); const isMod = ["Shift", "Control", "Alt", "Meta"].includes(event.key); const isFunc = event.key.startsWith("F"); const isAllowedRO = isNav || isMod || isFunc || event.key === "Escape" || (isMeta && ["a", "c"].includes(event.key.toLowerCase())); const isAllowedWrite = !isROrD && isMeta && ["x", "v"].includes(event.key.toLowerCase()); if (isROrD && !isAllowedRO && !isAllowedWrite) { event.preventDefault(); return; } if (!isROrD) { switch (event.key) { case "Enter": if (!event.shiftKey) { event.preventDefault(); this.#slottedElement.blur(); } break; case "Escape": event.preventDefault(); if (this.#initialValueOnFocus !== null && this.#currentValue !== this.#initialValueOnFocus) this.value = this.#initialValueOnFocus; this.#slottedElement.blur(); break; } if (this.toolbar && isMeta) { let cmd = null; if (event.key.toLowerCase() === 'b') cmd = 'bold'; if (event.key.toLowerCase() === 'i') cmd = 'italic'; if (cmd) { event.preventDefault(); if (cmd !== 'foreColor' || !this.autoColor) this.#executeFormatCommand(cmd); } } const max = this.maxLength; const isPrint = event.key.length === 1 && !isMeta && !event.altKey; if (max !== null && isPrint && (this.#slottedElement.textContent?.length ?? 0) >= max) { const sel = window.getSelection(); const isRep = sel && !sel.isCollapsed && this.#slottedElement.contains(sel.anchorNode); if (!isRep) { event.preventDefault(); this.#dispatchMaxLengthEvent(this.#currentValue, max); } } } }
  #handleToolbarMouseDown(event) { if (event.target === this.#colorInputElement || this.autoColor) return; const btn = event.target.closest('button[data-command]'); if (!btn || !this.#slottedElement) return; event.preventDefault(); const cmd = btn.dataset.command; if (cmd) { this.#executeFormatCommand(cmd); this.#slottedElement.focus({ preventScroll: true }); } }
  #handleToolbarColorChange(event) { if (!this.#colorInputElement || event.target !== this.#colorInputElement || !this.#slottedElement || this.autoColor) return; const cmd = this.#colorInputElement.dataset.command; const val = this.#colorInputElement.value; if (cmd && val) { this.#executeFormatCommand(cmd, val); this.#slottedElement.focus({ preventScroll: true }); } }


  #executeFormatCommand(command, value = null) { // Identical to v4
      if (!this.toolbar || this.readOnly || this.disabled || (command === 'foreColor' && this.autoColor)) { console.warn(`Command '${command}' blocked.`); return; }
      const selection = window.getSelection(); let needsRefocus = false; if (!selection || !this.#slottedElement?.contains(selection.anchorNode)) { this.#slottedElement?.focus({ preventScroll: true }); needsRefocus = true; }
      try { document.execCommand(command, false, value); } catch (e) { console.error(`Error executing '${command}'.`, e); return; }
      const newHtml = this.#slottedElement?.innerHTML ?? ''; if (this.#currentValue !== newHtml) { this.#isProgrammaticChange = true; this.value = newHtml; this.#isProgrammaticChange = false; this.#dispatchInputEvent(); this.#render(); }
      if (needsRefocus) this.#slottedElement?.focus({ preventScroll: true });
  }

  // --- Custom Event Dispatchers --- (Identical to v4)
  #dispatchInputEvent() { this.dispatchEvent(new CustomEvent("input", { detail: { value: this.#currentValue }, bubbles: true, composed: true })); }
  #dispatchChangeEvent() { this.dispatchEvent(new CustomEvent("change", { detail: { value: this.#currentValue }, bubbles: true, composed: true })); }
  #dispatchCharCountEvent() { const len = this.#slottedElement?.textContent?.length ?? 0; this.dispatchEvent(new CustomEvent("char-count", { detail: { value: this.#currentValue, length: len, maxLength: this.maxLength }, bubbles: true, composed: true })); }
  #dispatchMaxLengthEvent(currentValue, maxLength) { const len = this.#slottedElement?.textContent?.length ?? 0; this.dispatchEvent(new CustomEvent("max-length", { detail: { value: currentValue, length: len, maxLength: maxLength }, bubbles: true, composed: true })); }

}

// Define the custom element
if (!customElements.get("editable-text")) {
  customElements.define("editable-text", EditableText);
}

// Export the class if using modules
export default EditableText;
