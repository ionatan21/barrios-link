import { forwardRef } from "react";
import "./GlassElement.css";

const GlassElement = forwardRef(function GlassElement(
  {
    as: Component = "div",
    children,
    className = "",
    size = 200,
    width,
    height,
    radius = 20,
    style,
    ...props
  },
  ref,
) {
  const dimension = typeof size === "number" ? `${size}px` : size;
  const elementWidth =
    typeof width === "number" ? `${width}px` : width || dimension;
  const elementHeight =
    typeof height === "number" ? `${height}px` : height || dimension;
  const borderRadius = typeof radius === "number" ? `${radius}px` : radius;

  return (
    <Component
      ref={ref}
      className={`glass-element ${className}`.trim()}
      style={{
        "--glass-element-width": elementWidth,
        "--glass-element-height": elementHeight,
        "--glass-element-radius": borderRadius,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

export default GlassElement;
