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

  let resizeDebounce: number;
  addEventListener("resize", () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      updateScale();
    }, 100);
  });

  updateScale();
}
