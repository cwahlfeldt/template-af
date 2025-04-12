import React, { useState, useRef, useCallback, useEffect } from "react";

// --- Configuration ---
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_SENSITIVITY = 0.005; // Keep sensitivity lower for deliberate zoom

// --- Types ---
interface Coords {
  x: number;
  y: number;
}

interface FlowBoardProps {
  children: React.ReactNode;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  zoomSensitivity?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// --- Component ---
const FlowBoard: React.FC<FlowBoardProps> = ({
  children,
  initialScale: initialScaleProp = 1,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
  zoomSensitivity = ZOOM_SENSITIVITY,
  disabled = false,
  className = "",
  style = {},
}) => {
  // --- State ---
  const [scale, setScale] = useState<number>(() =>
    Math.max(minScale, Math.min(maxScale, initialScaleProp))
  );
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  // --- Refs ---
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef<boolean>(false);
  const startCoords = useRef<Coords>({ x: 0, y: 0 });
  const panStartTranslate = useRef<Coords>({ x: 0, y: 0 });
  const didCenterInitially = useRef<boolean>(false);
  // Ref to store initial content dimensions for center zoom calculation
  const initialContentDims = useRef<{ width: number; height: number } | null>(
    null
  );

  // --- Helper: Clamp Scale ---
  const clampScale = useCallback(
    (newScale: number): number => {
      return Math.max(minScale, Math.min(maxScale, newScale));
    },
    [minScale, maxScale]
  );

  // --- Event Handlers (Panning - unchanged logic, logs removed assuming unmount fixed) ---

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = event.clientX - startCoords.current.x;
    const dy = event.clientY - startCoords.current.y;
    setTranslateX(panStartTranslate.current.x + dx);
    setTranslateY(panStartTranslate.current.y + dy);
  }, []);

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!isPanning.current) return;
      isPanning.current = false;
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = "grab";
        wrapperRef.current.style.userSelect = "auto";
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0 || !wrapperRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      isPanning.current = true;
      startCoords.current = { x: event.clientX, y: event.clientY };
      panStartTranslate.current = { x: translateX, y: translateY };
      wrapperRef.current.style.cursor = "grabbing";
      wrapperRef.current.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [translateX, translateY, disabled, handleMouseMove, handleMouseUp]
  );

  // --- Touch Event Handlers (Placeholders for Pinch Zoom) ---
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      // TODO: Handle touch start for panning (1 finger) or pinch (2 fingers)
      // If 2 fingers, record initial distance and midpoint
      console.log("Touch Start:", event.touches);
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      // TODO: Handle touch move for panning (1 finger) or pinch zoom (2 fingers)
      // If 2 fingers, calculate new distance and midpoint, apply scale and translation
      console.log("Touch Move:", event.touches);
      if (event.touches.length === 1 && isPanning.current) {
        // Basic touch panning - similar to mouse move but use event.touches[0]
      } else if (event.touches.length === 2) {
        // Pinch zoom logic needed here
        event.preventDefault(); // Prevent default pinch zoom page behavior
      }
    },
    [disabled /*, other needed state/refs */]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      // TODO: Handle touch end, cleanup state (e.g., reset isPanning, pinch state)
      console.log("Touch End:", event.touches);
      if (isPanning.current) {
        // End panning state
      }
      // Reset pinch state if applicable
    },
    [disabled]
  );

  // --- Effects ---

  // Effect for Initial Centering & Getting Initial Dims
  useEffect(() => {
    if (
      disabled ||
      didCenterInitially.current ||
      !wrapperRef.current ||
      !contentRef.current
    ) {
      return;
    }
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    // Get initial dimensions before any transforms significantly alter layout/size perception
    const contentEl = contentRef.current;
    initialContentDims.current = {
      width: contentEl.offsetWidth,
      height: contentEl.offsetHeight,
    };

    // Use getBoundingClientRect for centering calculation as it reflects scaled size if initialScale != 1
    const contentRect = contentEl.getBoundingClientRect();

    if (
      wrapperRect.width &&
      wrapperRect.height &&
      initialContentDims.current.width &&
      initialContentDims.current.height
    ) {
      // Use already-scaled rect for centering calculation
      const initialX = (wrapperRect.width - contentRect.width) / 2;
      const initialY = (wrapperRect.height - contentRect.height) / 2;

      setTranslateX(initialX);
      setTranslateY(initialY);
      didCenterInitially.current = true;
      console.log(
        "Initial Centering Done. Initial Dims:",
        initialContentDims.current
      );
    }
  }, [initialScaleProp, disabled]); // Rerun if initial scale / disabled changes

  // Effect for attaching Wheel listener manually (Handles Shift+Wheel Zoom)
  useEffect(() => {
    const wrapperElement = wrapperRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (disabled || !wrapperElement) return;

      // *** ZOOM ONLY ON SHIFT + SCROLL ***
      if (!event.shiftKey) {
        // If not holding shift, don't zoom, allow default scroll or do nothing
        // console.log("Wheel event without shift ignored");
        return;
      }

      // If holding shift, prevent default page scroll/zoom and handle board zoom
      event.preventDefault();
      event.stopPropagation();

      const currentScale = scale;
      const currentTranslateX = translateX;
      const currentTranslateY = translateY;

      const delta = -event.deltaY * zoomSensitivity;
      const newScale = clampScale(currentScale * Math.exp(delta)); // Calculate new scale first

      // *** ZOOM ORIGIN: CENTER OF CONTENT ***
      if (!initialContentDims.current) return; // Need initial dims

      // Calculate the current visual center of the content within the wrapper coordinate system
      const currentContentWidthScaled =
        initialContentDims.current.width * currentScale;
      const currentContentHeightScaled =
        initialContentDims.current.height * currentScale;
      const centerX = currentTranslateX + currentContentWidthScaled / 2;
      const centerY = currentTranslateY + currentContentHeightScaled / 2;

      // Point we want to keep fixed (the content center) relative to the content's own coordinate system
      const pointXContent = initialContentDims.current.width / 2;
      const pointYContent = initialContentDims.current.height / 2;

      // Calculate the new translation needed to keep the content's center
      // at the same visual position (centerX, centerY) after applying the new scale
      const newTranslateX = centerX - pointXContent * newScale;
      const newTranslateY = centerY - pointYContent * newScale;

      setScale(newScale);
      setTranslateX(newTranslateX);
      setTranslateY(newTranslateY);
    };

    if (wrapperElement && !disabled) {
      wrapperElement.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (wrapperElement) {
        wrapperElement.removeEventListener("wheel", handleWheel);
      }
      if (isPanning.current) {
        console.error(
          "!!! FlowBoard UNMOUNTED during active pan - PROBLEM !!!"
        );

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [
    disabled,
    scale,
    translateX,
    translateY,
    zoomSensitivity,
    clampScale,
    handleMouseMove,
    handleMouseUp,
  ]);

  // Effect to handle component becoming disabled during a pan (Unchanged)
  useEffect(() => {
    if (disabled && isPanning.current) {
      isPanning.current = false;
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = "default";
        wrapperRef.current.style.userSelect = "auto";
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    } else if (!disabled && wrapperRef.current) {
      wrapperRef.current.style.cursor = isPanning.current ? "grabbing" : "grab";
    }
  }, [disabled, handleMouseMove, handleMouseUp]);

  // --- Styles ---
  const wrapperStyles: React.CSSProperties = {
    overflow: "hidden",
    cursor: disabled ? "default" : isPanning.current ? "grabbing" : "grab",
    touchAction: "none", // Important for preventing conflicts with browser touch actions
    width: "100%",
    height: "100%",
    position: "relative",
    // border: '1px dashed lightgrey', // Keep for debugging if needed
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    transformOrigin: "0 0", // Keep origin top-left; center zoom adjusts translate
    willChange: "transform",
    display: "inline-block", // Fit content size
    // border: '1px dashed red', // Keep for debugging if needed
  };

  // --- Render ---
  return (
    <div
      ref={wrapperRef}
      className={`flow-board-wrapper ${className}`}
      style={wrapperStyles}
      onMouseDown={handleMouseDown}
      // Add touch handlers
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Other listeners handled manually
    >
      <div
        ref={contentRef}
        className="flow-board-content"
        style={contentStyles}
      >
        {children}
      </div>
    </div>
  );
};

export default FlowBoard;
