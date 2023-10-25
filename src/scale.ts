export let scale: {
  factor: number;
  offsetX: number;
  offsetY: number;
};

export function autoScale(canvas: HTMLCanvasElement) {
  function updateScale() {
    if (innerWidth > innerHeight) {
      scale = {
        factor: innerWidth / 50,
        offsetX: 0,
        offsetY: innerWidth - innerHeight,
      };
    } else {
      scale = {
        factor: innerHeight / 50,
        offsetX: innerHeight - innerWidth,
        offsetY: 0,
      };
    }
    canvas.width = innerWidth * 2;
    canvas.height = innerHeight * 2;

    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  }

  updateScale();

  let resizeDebounce: number;

  function resize() {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      updateScale();
    }, 100);
  }

  addEventListener("resize", resize);
  addEventListener("orientationchange", resize);

  // Disable swipes etc interrupting game on iOS
  addEventListener("touchstart", prevent, { passive: false });
  addEventListener("touchmove", prevent, { passive: false });
  addEventListener("contextmenu", prevent, { passive: false });
  addEventListener("selectstart", prevent, { passive: false });
  addEventListener("selectionchange", prevent, { passive: false });

  function prevent(event: Event) {
    event.preventDefault();
  }
}
