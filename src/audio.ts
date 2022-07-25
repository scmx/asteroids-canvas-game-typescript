const EFFECTS = ["projectile", "enemy-hit2", "game-over", "buzz"] as const;
type Effect = typeof EFFECTS[number];

const AUDIO = new Map(
  EFFECTS.map((name) => {
    const audio = document.createElement("audio");
    audio.src = `/audio/${name}.mp3`;
    audio.volume = 0.2;
    return [name, { audio }];
  })
);

export const handleAudio = () => {
  return {
    play(name: Effect) {
      let { audio } = AUDIO.get(name)!;
      audio.play();
    },
  };
};
