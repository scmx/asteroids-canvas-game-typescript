const EFFECTS = ["projectile", "enemy-hit2", "game-over", "buzz"] as const;
type Effect = (typeof EFFECTS)[number];

const AUDIO = new Map(
  EFFECTS.map((name) => {
    const audio = document.createElement("audio");
    audio.src = `${import.meta.env.BASE_URL}audio/${name}.mp3`;
    audio.volume = 0.2;
    return [name, { audio }];
  }),
);

export const handleAudio = () => {
  let enabled = false;
  return {
    start() {
      enabled = true;
    },

    play(name: Effect) {
      if (!enabled) return;
      let { audio } = AUDIO.get(name)!;
      audio.play();
    },
  };
};
