/**
 * Calculates whether black or white text provides better contrast against a given RGB background color.
 * Uses a simplified perceived brightness calculation (YIQ formula coefficients).
 *
 * @param {string} rgbString - The background color in rgb() or rgba() format (e.g., "rgb(255, 0, 0)", "rgba(0, 0, 0, 0.5)").
 * @returns {string} The recommended text color ('#000000' for black or '#FFFFFF' for white).
 */
export default function getContrastingTextColor(rgbString) {
  // Default color in case of parsing errors
  const defaultTextColor = '#000000'; // Black

  // Try to parse the RGB values from the string
  const match = rgbString.match(/rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*[\d.]+)?\)/);

  if (!match) {
    console.warn("Could not parse RGB string:", rgbString);
    return defaultTextColor; // Return default if parsing fails
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // Calculate perceived brightness using the YIQ formula's coefficients (approximation)
  // Formula: (R*299 + G*587 + B*114) / 1000
  // Values range from 0 (black) to 255 (white)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Determine text color based on brightness threshold
  // 128 is the midpoint of the 0-255 range
  const textColor = (brightness >= 128) ? '#000000' : '#FFFFFF'; // Black text for light backgrounds, White text for dark backgrounds

  return textColor;
}

/**
 * Applies the contrasting text color logic to a given HTML element.
 * @param {HTMLElement} element - The HTML element to update.
 */
function updateElementTextColor(element) {
  if (!element) return;

  // Get the *actual* computed background color
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;

  // Handle cases where the background is transparent or not set
  // 'transparent' or rgba(..., 0) means we can't determine contrast based on this element alone
  if (!backgroundColor || backgroundColor === 'transparent' || (backgroundColor.startsWith('rgba') && backgroundColor.endsWith(', 0)'))) {
    // You might want to reset the color, inherit, or leave it as is
    // element.style.color = ''; // Reset to CSS default/inherited
    console.warn("Element background is transparent or invalid, cannot set contrast text color.", element);
    return; // Stop processing for this element
  }


  // Calculate the best contrasting text color
  const optimalTextColor = getContrastingTextColor(backgroundColor);

  // Apply the calculated text color
  element.style.color = optimalTextColor;

  // Optional: Log for debugging
  // console.log(`Element:`, element, `Background: ${backgroundColor}, Setting text color to: ${optimalTextColor}`);
}