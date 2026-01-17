"use client";
import { AnimatePresence, motion, MotionProps } from "motion/react";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState, useLayoutEffect } from "react";

export type TransitionType = "fade" | "slide" | "scale" | "blur" | "slideScale";

interface FadeEffectsProps extends MotionProps {
  children: React.ReactNode;
  type?: TransitionType;
  options?: {
    initial?: MotionProps["initial"];
    animate?: MotionProps["animate"];
    exit?: MotionProps["exit"];
    transition?: MotionProps["transition"];
  };
}

export default function FadeEffects({
  children,
  type = "slideScale",
  options = {},
  ...props
}: FadeEffectsProps) {
  const pathname = usePathname();

  // Define transition presets with smooth, modern animations
  const transitionPresets = useMemo(
    () => ({
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      slide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: {
          type: "spring" as const,
          stiffness: 260,
          damping: 20,
          mass: 1,
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: {
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      blur: {
        initial: { opacity: 0, filter: "blur(100px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(10px)" },
        transition: {
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      slideScale: {
        initial: { opacity: 0, y: 24, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -24, scale: 0.96 },
        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
    }),
    []
  );

  // Merge preset with custom options
  const animationConfig = useMemo(() => {
    const preset = transitionPresets[type];
    return {
      initial: {
        ...preset.initial,
        ...(typeof options.initial === "object" ? options.initial : {}),
      },
      animate: {
        ...preset.animate,
        ...(typeof options.animate === "object" ? options.animate : {}),
      },
      exit: {
        ...preset.exit,
        ...(typeof options.exit === "object" ? options.exit : {}),
      },
      transition: {
        ...preset.transition,
        ...(typeof options.transition === "object" ? options.transition : {}),
      },
    };
  }, [type, options, transitionPresets]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        {...props}
        initial={animationConfig.initial}
        animate={animationConfig.animate}
        transition={animationConfig.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
