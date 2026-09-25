import { useEffect, useRef, useState } from "react";

export function AnimatedReveal({
  as: Tag = "div",
  transition,
  className = "",
  style,
  children,
  ...props
}) {
  const ref = useRef(null);
  const type = transition?.type || "none";
  const [revealed, setRevealed] = useState(type === "none");

  useEffect(() => {
    if (type === "none") {
      setRevealed(true);
      return undefined;
    }
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }

    const node = ref.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.14, rootMargin: "0px 0px -5% 0px" });

    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [type]);

  return (
    <Tag
      {...props}
      ref={ref}
      className={`${className} reveal reveal-${type}${revealed ? " is-revealed" : ""}`}
      style={{
        ...style,
        "--reveal-duration": `${transition?.duration ?? 0}ms`,
        "--reveal-delay": `${transition?.delay ?? 0}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
