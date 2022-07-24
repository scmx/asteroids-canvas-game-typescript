const EFFECTS = ["projectile", "enemy-hit2", "game-over"] as const;
type Effect = typeof EFFECTS[number];

const AUDIO = new Map<string, null | HTMLAudioElement>(
  EFFECTS.map((name) => {
    const audio = document.createElement("audio");
    audio.src = `/audio/${name}.mp3`;
    audio.volume = 0.2;
    return [name, audio];
  })
);

export const audio = (() => {
  return {
    play(name: Effect) {
      let audio = AUDIO.get(name)!;
      audio.play();
    },
  };
})();
