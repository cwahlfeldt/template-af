// Assumes './contrastUtils.js' default exports a function like:
// getContrastingTextColor(rgbString) => '#000000' | '#FFFFFF'
import getContrastingTextColor from "./contrastUtils.js"; // Adjust path as needed

/**
 * ColorChanger Web Component
 *
 * Allows changing the background color of the first slotted HTML element
 * via a custom icon button that triggers the native color picker.
 * Positioned absolutely, without affecting layout.
 * Optionally persists the selected color to localStorage.
 * The icon color automatically adjusts for contrast against the selected background,
 * updating live during color selection where supported.
 *
 * If an 'id' attribute is provided, it also sets a global CSS variable on
 * document.documentElement named '--color-changer-contrast-{id}' with the
 * calculated contrast color (e.g., #000000 or #FFFFFF), allowing other
 * elements in the light DOM to use this value.
 *
 * @element color-changer
 *
 * @attr {string} color - Background color value (e.g., #RRGGBB, color name). Defaults 'transparent'.
 * @attr {boolean} disabled - Disables the color picker button.
 * @attr {boolean} persist - Saves/loads color to localStorage based on host 'id'. Requires 'id'.
 * @attr {string} id - Required for 'persist' and for setting the global contrast CSS variable.
 *
 * @prop {string} color - Gets/sets the current background color. Syncs with attribute, style, localStorage.
 * @prop {boolean} disabled - Gets/sets the disabled state.
 * @prop {boolean} persist - Gets/sets the persistence state.
 * @prop {HTMLElement | null} slottedElement - Gets the actual slotted element.
 *
 * @fires change - When color selection is finalized (picker closed). Detail: { color: string }
 * @fires slotted-element-missing - If no suitable element found in slot on init.
 *
 * @cssprop --color-changer-button-size - Size of the button (default: 3em).
 * @cssprop --color-changer-button-border-color - Button border color (default: #ccc). Fallback. Uses --color-changer-icon-color by default.
 * @cssprop --color-changer-button-hover-background - Button hover background (default: rgba(200, 200, 200, 0.2)).
 * @cssprop --color-changer-button-disabled-opacity - Component opacity when disabled (default: 0.5).
 * @cssprop --color-changer-button-offset-top - Button top offset (default: 12px).
 * @cssprop --color-changer-button-offset-right - Button right offset (default: 8px).
 * @cssprop --color-changer-icon-color - SVG icon color (default: #000000). Auto-calculated for contrast. Applied to host.
 *
 * @csspart button - The color picker button element.
 *
 * @globalcssvar --color-changer-contrast-{id} - Set on document.documentElement if the component has an 'id'. Contains the calculated contrast color ('#000000' or '#FFFFFF').
 */
class ColorChanger extends HTMLElement {
  // --- Private Class Fields ---
  #internals;
  #slottedElement = null;
  #colorButton = null;
  #hiddenColorInput = null;
  #currentColor = "transparent";
  #currentContrastColor = "#000000"; // Store the calculated contrast color
  #isProgrammaticChange = false;
  #isInitialized = false;
  #mutationObserver = null;
  _boundHandleButtonClick = null;
  _boundHandleHiddenInputChange = null;
  _boundHandleHiddenInputInput = null;
  _boundHandleMutation = null;
  hasWarnedAboutMissingIdOnSave = false;
  hasWarnedAboutMissingIdForGlobalVar = false; // Track warning for global var

  static get observedAttributes() {
    return ["color", "disabled", "persist", "id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals?.();
    this.#setupShadowDOM();
    this.#colorButton = this.shadowRoot.getElementById("color-button");
    this.#hiddenColorInput = this.shadowRoot.getElementById(
      "color-picker-hidden"
    );
  }

  // --- Public Property Getters/Setters ---

  get color() {
    return this.#currentColor;
  }

  set color(newValue) {
    const stringValue = String(newValue ?? "transparent").trim();
    const colorForInput =
      stringValue === "transparent" ? "#ffffff" : stringValue;

    if (this.#currentColor !== stringValue) {
      this.#currentColor = stringValue;

      if (
        !this.#isProgrammaticChange &&
        this.getAttribute("color") !== stringValue
      ) {
        this.#isProgrammaticChange = true;
        this.setAttribute("color", stringValue);
        this.#isProgrammaticChange = false;
      }

      this.#applyVisualUpdates(stringValue, colorForInput);
      // Note: #saveToLocalStorage is called only on final 'change' event
    } else {
      this.#updateHiddenInputValue(colorForInput);
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    const shouldBeDisabled = Boolean(value);
    if (this.disabled !== shouldBeDisabled) {
      this.toggleAttribute("disabled", shouldBeDisabled);
      if (this.#isInitialized) this.#updateDisabledState();
    }
  }

  get persist() {
    return this.hasAttribute("persist");
  }

  set persist(value) {
    const shouldPersist = Boolean(value);
    if (this.persist !== shouldPersist) {
      this.toggleAttribute("persist", shouldPersist);
      if (this.#isInitialized) {
        if (shouldPersist) {
          this.#saveToLocalStorage();
        } else {
          this.#clearFromLocalStorage();
        }
      }
    }
  }

  get slottedElement() {
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
          "ColorChanger: No suitable element found in the default slot.",
          this
        );
        this.dispatchEvent(
          new CustomEvent("slotted-element-missing", {
            bubbles: true,
            composed: true,
          })
        );
        this.disabled = true;
        return;
      }

      let initialColor = "transparent";
      let sourceName = "default";

      if (this.hasAttribute("persist")) {
        const storageKey = this.#getStorageKey();
        if (storageKey) {
          try {
            const storedValue = localStorage.getItem(storageKey);
            if (storedValue !== null) {
              initialColor = storedValue;
              sourceName = "localStorage";
            }
          } catch (e) {
            console.warn(
              `ColorChanger (${
                this.id || "no-id"
              }): Failed to read localStorage.`,
              e
            );
          }
        } else if (!this.hasWarnedAboutMissingIdOnSave) {
          console.warn(
            `ColorChanger: 'persist' attribute enabled but 'id' is missing. Cannot load from localStorage.`
          );
          this.hasWarnedAboutMissingIdOnSave = true;
        }
      }

      if (sourceName === "default") {
        const attributeValue = this.getAttribute("color");
        if (attributeValue !== null) {
          initialColor = attributeValue;
          sourceName = "attribute";
        }
      }

      this.#isProgrammaticChange = this.getAttribute("color") === initialColor;
      this.#currentColor = initialColor;
      this.#applyVisualUpdates(
        initialColor,
        initialColor === "transparent" ? "#ffffff" : initialColor
      );
      if (this.getAttribute("color") !== initialColor) {
        this.setAttribute("color", initialColor);
      }
      this.#isProgrammaticChange = false;

      this.#attachEventListeners();
      this.#updateDisabledState();
      this.#observeMutations();

      this.#isInitialized = true;
      console.debug(
        `ColorChanger (${
          this.id || "no-id"
        }): Initialized (color source: ${sourceName}).`
      );
    });
  }

  disconnectedCallback() {
    this.#removeEventListeners();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    // --- NEW: Remove global CSS variable on disconnect ---
    this.#removeGlobalContrastVariable(this.id);
    // ---
    console.debug(`ColorChanger (${this.id || "no-id"}): Disconnected.`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#isInitialized || oldValue === newValue) return;

    console.debug(
      `ColorChanger Attribute Changed: ${name}, Old: ${oldValue}, New: ${newValue}`
    );

    switch (name) {
      case "color":
        if (!this.#isProgrammaticChange) {
          this.color = newValue ?? "transparent";
        }
        break;
      case "disabled":
        this.disabled = this.hasAttribute("disabled");
        break;
      case "persist":
        this.persist = this.hasAttribute("persist");
        break;
      case "id":
        // --- NEW: Manage global variable when ID changes ---
        if (oldValue) {
          this.#removeGlobalContrastVariable(oldValue); // Remove var associated with old ID
        }
        // Update the global variable with the current contrast color for the new ID
        this.#updateGlobalContrastVariable();
        // ---
        if (this.persist && oldValue !== null) {
          // Handle storage key change if persisting
          console.warn(
            `ColorChanger: 'id' changed from '${oldValue}' to '${newValue}'. localStorage key will change.`
          );
          this.#saveToLocalStorage(); // Save current color under new key
        }
        break;
    }
  }

  // --- Private Helper Methods ---

  /** Applies all visual updates (slotted bg, icon color, global var, hidden input) */
  #applyVisualUpdates(currentColor, colorForInput) {
    // 1. Apply color to slotted element
    this.#applyColorToSlottedElement(currentColor);

    // 2. Update icon contrast (needs computed style from step 1)
    // Use rAF to ensure styles are computed *after* background change
    requestAnimationFrame(() => {
      this.#updateIconAndGlobalContrastColor(); // Renamed to reflect global var update
    });

    // 3. Update hidden input value
    this.#updateHiddenInputValue(colorForInput);
  }

  /** Updates the value of the hidden color input */
  #updateHiddenInputValue(colorForInput) {
    if (
      this.#hiddenColorInput &&
      this.#hiddenColorInput.value !== colorForInput
    ) {
      try {
        this.#hiddenColorInput.value = colorForInput;
      } catch (e) {
        console.warn(
          `ColorChanger: Could not set hidden color input value to "${colorForInput}". Resetting to black.`,
          e
        );
        this.#hiddenColorInput.value = "#000000"; // Fallback
      }
    }
  }

  #getStorageKey() {
    const id = this.id;
    if (!id) return null;
    return `color-changer-persist-v1-${id}`;
  }

  #saveToLocalStorage() {
    if (!this.#isInitialized || !this.persist) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, this.#currentColor);
      } catch (e) {
        console.warn(
          `ColorChanger (${
            this.id || "no-id"
          }): Failed to write localStorage ('${storageKey}').`,
          e
        );
      }
    } else if (this.persist && !this.hasWarnedAboutMissingIdOnSave) {
      console.warn(
        `ColorChanger: Cannot persist color without an 'id' attribute.`
      );
      this.hasWarnedAboutMissingIdOnSave = true;
    }
  }

  #clearFromLocalStorage() {
    if (!this.#isInitialized) return;
    const storageKey = this.#getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
        console.debug(
          `ColorChanger (${
            this.id || "no-id"
          }): Removed color from localStorage ('${storageKey}').`
        );
      } catch (e) {
        console.warn(
          `ColorChanger (${
            this.id || "no-id"
          }): Failed to remove localStorage item ('${storageKey}').`,
          e
        );
      }
    }
  }

  #setupShadowDOM() {
    const defaultIconColor = "#000000";
    this.shadowRoot.innerHTML = /*html*/ `
            <style>
                :host {
                    display: block;
                    position: relative;
                    /* CSS Variables */
                    --color-changer-button-size: 3em;
                    --color-changer-button-border-color: #ccc; /* Fallback border */
                    --color-changer-button-hover-background: rgba(200, 200, 200, 0.2);
                    --color-changer-button-disabled-opacity: 0.5;
                    --color-changer-button-offset-top: 12px;
                    --color-changer-button-offset-right: 8px;
                    /* Icon color is controlled by JS via this variable on the HOST */
                    --color-changer-icon-color: ${defaultIconColor};
                }

                slot::hover #color-button {
                    display: inline-flex;
                }

                #color-button {
                    position: absolute;
                    top: var(--color-changer-button-offset-top);
                    right: var(--color-changer-button-offset-right);
                    z-index: 21;
                    display: inline-flex;
                    /* display: none; */
                    align-items: center;
                    justify-content: center;
                    width: var(--color-changer-button-size);
                    height: var(--color-changer-button-size);
                    padding: 0;
                    /* Button border uses the HOST's icon color variable */
                    border: 2px solid var(--color-changer-icon-color);
                    border-radius: 8px;
                    background-color: transparent;
                    cursor: pointer;
                    transition: background-color 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
                    box-sizing: border-box;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                #color-button:hover:not([disabled]) {
                    background-color: var(--color-changer-button-hover-background);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                }
                 #color-button:focus-visible {
                     outline: 2px solid Highlight;
                     outline: 2px solid -webkit-focus-ring-color;
                     outline-offset: 2px;
                }

                #color-button svg {
                    width: 70%;
                    height: 70%;
                    /* SVG stroke/fill also uses the HOST's icon color variable */
                    stroke: var(--color-changer-icon-color);
                    fill: none;
                    display: block;
                    transition: stroke 0.1s ease-out, fill 0.1s ease-out;
                }
                #color-button svg circle {
                    fill: var(--color-changer-icon-color);
                    stroke: none;
                }

                #color-picker-hidden {
                    position: absolute;
                    top: var(--color-changer-button-offset-top);
                    right: var(--color-changer-button-offset-right);
                    width: var(--color-changer-button-size);
                    height: var(--color-changer-button-size);
                    opacity: 0;
                    border: none;
                    padding: 0;
                    pointer-events: none;
                    visibility: visible;
                }

                /* Disabled state */
                :host([disabled]) {
                    opacity: var(--color-changer-button-disabled-opacity);
                    cursor: not-allowed;
                    pointer-events: none;
                }
                #color-button[disabled] {
                    cursor: not-allowed;
                    background-color: rgba(238, 238, 238, 0.3);
                    border-color: #ddd !important; /* Override variable border */
                    box-shadow: none;
                }
                #color-button[disabled] svg {
                   stroke: #aaa !important;
                }
                #color-button[disabled] svg circle {
                   fill: #aaa !important;
                }

                /* Slotted content */
                ::slotted(*) {
                    background-color: inherit;
                    margin: 0;
                    position: relative;
                    z-index: 1;
                }
            </style>
            <slot></slot>
            <button type="button" id="color-button" part="button" aria-label="Change background color">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paint-bucket-icon lucide-paint-bucket"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>
            </button>
            <input type="color" id="color-picker-hidden" tabindex="-1" aria-hidden="true">
        `;
  }

  #attachEventListeners() {
    if (this._boundHandleButtonClick) return;

    this._boundHandleButtonClick = this.#handleButtonClick.bind(this);
    this._boundHandleHiddenInputChange =
      this.#handleHiddenInputChange.bind(this);
    this._boundHandleHiddenInputInput = this.#handleHiddenInputInput.bind(this);

    this.#colorButton?.addEventListener("click", this._boundHandleButtonClick);
    this.#hiddenColorInput?.addEventListener(
      "change",
      this._boundHandleHiddenInputChange
    );
    this.#hiddenColorInput?.addEventListener(
      "input",
      this._boundHandleHiddenInputInput
    );

    console.debug(
      `ColorChanger (${this.id || "no-id"}): Event listeners attached.`
    );
  }

  #removeEventListeners() {
    this.#colorButton?.removeEventListener(
      "click",
      this._boundHandleButtonClick
    );
    this.#hiddenColorInput?.removeEventListener(
      "change",
      this._boundHandleHiddenInputChange
    );
    this.#hiddenColorInput?.removeEventListener(
      "input",
      this._boundHandleHiddenInputInput
    );

    this._boundHandleButtonClick = null;
    this._boundHandleHiddenInputChange = null;
    this._boundHandleHiddenInputInput = null;

    console.debug(
      `ColorChanger (${this.id || "no-id"}): Event listeners removed.`
    );
  }

  #observeMutations() {
    if (!this.#slottedElement || this.#mutationObserver) return;

    this._boundHandleMutation = this.#handleMutation.bind(this);
    this.#mutationObserver = new MutationObserver(this._boundHandleMutation);
    this.#mutationObserver.observe(this, { childList: true });
    console.debug(
      `ColorChanger (${this.id || "no-id"}): MutationObserver attached.`
    );
  }

  #handleMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        let elementRemoved = false;
        mutation.removedNodes.forEach((node) => {
          if (node === this.#slottedElement) elementRemoved = true;
        });

        if (elementRemoved) {
          console.warn("ColorChanger: Slotted element was removed.", this);
          this.#slottedElement = null;
          this.#mutationObserver?.disconnect();
          this.#mutationObserver = null;
          this.disabled = true;
          this.#updateIconAndGlobalContrastColor(); // Reset icon/global var if element removed
          break;
        }

        if (!this.#slottedElement && mutation.addedNodes.length > 0) {
          const newElement = this.querySelector(
            ":scope > *:not(style):not(script)"
          );
          if (newElement) {
            console.log(
              "ColorChanger: New slotted element detected.",
              newElement
            );
            this.#slottedElement = newElement;
            this.#applyVisualUpdates(
              this.#currentColor,
              this.#currentColor === "transparent"
                ? "#ffffff"
                : this.#currentColor
            );
            this.disabled = false;
            if (!this.#mutationObserver) this.#observeMutations();
          }
        }
      }
    }
  }

  #applyColorToSlottedElement(colorToApply) {
    if (this.#slottedElement) {
      try {
        this.#slottedElement.style.backgroundColor = colorToApply;
      } catch (e) {
        console.error(
          `ColorChanger: Failed to apply background color "${colorToApply}".`,
          e
        );
      }
    }
  }

  /** Calculates contrast, updates host CSS var, and updates global CSS var */
  #updateIconAndGlobalContrastColor() {
    if (!this.#isInitialized) {
      // Don't run before init
      this.#currentContrastColor = "#000000"; // Ensure default
      this.style.setProperty(
        "--color-changer-icon-color",
        this.#currentContrastColor
      );
      this.#updateGlobalContrastVariable(); // Try to set global var even if slotted el isn't ready
      return;
    }

    let calculatedContrastColor = "#000000"; // Default contrast color

    if (this.#slottedElement) {
      const computedStyle = window.getComputedStyle(this.#slottedElement);
      const computedBgColor = computedStyle.backgroundColor;

      if (
        computedBgColor &&
        computedBgColor !== "transparent" &&
        !computedBgColor.startsWith("rgba(0, 0, 0, 0)")
      ) {
        try {
          calculatedContrastColor = getContrastingTextColor(computedBgColor);
        } catch (e) {
          console.error(
            "ColorChanger: Error calculating contrast color. Using default.",
            e
          );
          calculatedContrastColor = "#000000";
        }
      }
      // console.debug(`ColorChanger: Calculated contrast ${calculatedContrastColor} for bg ${computedBgColor}`);
    } else {
      // console.debug("ColorChanger: No slotted element, using default contrast color.");
    }

    // Store the calculated color
    this.#currentContrastColor = calculatedContrastColor;

    // 1. Update host CSS variable for internal styling (icon, border)
    this.style.setProperty(
      "--color-changer-icon-color",
      this.#currentContrastColor
    );

    // 2. Update global CSS variable
    this.#updateGlobalContrastVariable();
  }

  /** Sets the global CSS variable based on current contrast color and ID */
  #updateGlobalContrastVariable() {
    const currentId = this.id;
    if (currentId) {
      const globalVarName = `--color-changer-contrast-${currentId}`;
      try {
        document.documentElement.style.setProperty(
          globalVarName,
          this.#currentContrastColor
        );
        // console.debug(`ColorChanger: Set global var ${globalVarName} to ${this.#currentContrastColor}`);
      } catch (e) {
        console.error(
          `ColorChanger: Failed to set global CSS variable ${globalVarName}.`,
          e
        );
      }
    } else if (!this.hasWarnedAboutMissingIdForGlobalVar) {
      // Warn only once if trying to set global var without ID
      // console.debug("ColorChanger: No 'id' attribute present, cannot set global contrast CSS variable.");
      // this.hasWarnedAboutMissingIdForGlobalVar = true;
    }
  }

  /** Removes the global CSS variable associated with a given ID */
  #removeGlobalContrastVariable(idToRemove) {
    if (idToRemove) {
      const globalVarName = `--color-changer-contrast-${idToRemove}`;
      try {
        document.documentElement.style.removeProperty(globalVarName);
        console.debug(`ColorChanger: Removed global var ${globalVarName}`);
      } catch (e) {
        console.error(
          `ColorChanger: Failed to remove global CSS variable ${globalVarName}.`,
          e
        );
      }
    }
  }

  #updateDisabledState() {
    const isDisabled = this.disabled;
    if (this.#colorButton) {
      this.#colorButton.disabled = isDisabled;
      this.#colorButton.setAttribute("aria-disabled", String(isDisabled));
    }
    if (this.#hiddenColorInput) {
      this.#hiddenColorInput.disabled = isDisabled;
    }
    console.debug(`ColorChanger UpdateDisabledState: Disabled=${isDisabled}`);
  }

  // --- Event Handlers ---

  #handleButtonClick(event) {
    if (this.disabled || !this.#hiddenColorInput) return;
    console.debug(`ColorChanger Button Click: Triggering hidden color input.`);
    try {
      const currentVal =
        this.#currentColor === "transparent" ? "#ffffff" : this.#currentColor;
      this.#updateHiddenInputValue(currentVal);
      this.#hiddenColorInput.click();
    } catch (e) {
      console.error(
        "ColorChanger: Could not programmatically click hidden color input.",
        e
      );
    }
  }

  /** Handles the 'input' event (live update) */
  #handleHiddenInputInput(event) {
    if (this.disabled) return;
    const liveColor = event.target.value;
    this.#currentColor = liveColor; // Update internal state directly
    this.#applyVisualUpdates(liveColor, liveColor); // Apply visuals immediately
    // Do NOT set attribute, save, or dispatch 'change' here
  }

  /** Handles the 'change' event (final selection) */
  #handleHiddenInputChange(event) {
    if (this.disabled) return;
    const finalColor = event.target.value;
    console.debug(
      `ColorChanger Final Change: New color selected "${finalColor}".`
    );

    this.#isProgrammaticChange = false; // Allow potential attribute update
    this.color = finalColor; // Use setter to finalize state (incl. attribute if needed)

    // Explicitly save and dispatch event on final change
    this.#saveToLocalStorage();
    this.#dispatchChangeEvent(finalColor);
  }

  // --- Custom Event Dispatchers ---

  #dispatchChangeEvent(colorValue) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { color: colorValue },
        bubbles: true,
        composed: true,
      })
    );
    console.debug(
      `ColorChanger Dispatched 'change' event with color "${colorValue}".`
    );
  }
}

if (!customElements.get("color-changer")) {
  customElements.define("color-changer", ColorChanger);
}

export default ColorChanger;
