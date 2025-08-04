import type { LevelData } from "@/types/game"

export class CampaignLevels {
  private static levels: LevelData[] = [
    // Nivel 1 - Tutorial básico
    {
      board: Array(6)
        .fill(null)
        .map(() =>
          Array(6)
            .fill(null)
            .map(() => ({ colors: [], isEmpty: true })),
        ),
      targetBoard: [
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: ["red"], isEmpty: false },
          { colors: ["red"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: ["red"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
      ],
      pieces: [
        {
          id: "tutorial_1",
          shape: [
            [{ color: "red" }, { color: "red" }],
            [{ color: "red" }, { color: "empty" }],
          ],
          rotation: 0,
          flipped: false,
        },
      ],
      difficulty: 1,
      seed: "campaign_1",
    },

    // Nivel 2 - Introducción a mezcla de colores
    {
      board: Array(6)
        .fill(null)
        .map(() =>
          Array(6)
            .fill(null)
            .map(() => ({ colors: [], isEmpty: true })),
        ),
      targetBoard: [
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: ["orange"], isEmpty: false },
          { colors: ["orange"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: ["orange"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
      ],
      pieces: [
        {
          id: "mix_1",
          shape: [
            [{ color: "red" }, { color: "red" }],
            [{ color: "red" }, { color: "empty" }],
          ],
          rotation: 0,
          flipped: false,
        },
        {
          id: "mix_2",
          shape: [
            [{ color: "yellow" }, { color: "yellow" }],
            [{ color: "yellow" }, { color: "empty" }],
          ],
          rotation: 0,
          flipped: false,
        },
      ],
      difficulty: 1,
      seed: "campaign_2",
    },

    // Nivel 3 - Formas más complejas
    {
      board: Array(6)
        .fill(null)
        .map(() =>
          Array(6)
            .fill(null)
            .map(() => ({ colors: [], isEmpty: true })),
        ),
      targetBoard: [
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: ["blue"], isEmpty: false },
          { colors: ["green"], isEmpty: false },
          { colors: ["green"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: ["blue"], isEmpty: false },
          { colors: ["green"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: ["blue"], isEmpty: false },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
        [
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
          { colors: [], isEmpty: true },
        ],
      ],
      pieces: [
        {
          id: "complex_1",
          shape: [[{ color: "blue" }], [{ color: "blue" }], [{ color: "blue" }]],
          rotation: 0,
          flipped: false,
        },
        {
          id: "complex_2",
          shape: [
            [{ color: "blue" }, { color: "yellow" }],
            [{ color: "yellow" }, { color: "empty" }],
          ],
          rotation: 0,
          flipped: false,
        },
      ],
      difficulty: 2,
      seed: "campaign_3",
    },
  ]

  static getLevel(levelNumber: number): LevelData | null {
    if (levelNumber < 1 || levelNumber > this.levels.length) {
      return null
    }
    return JSON.parse(JSON.stringify(this.levels[levelNumber - 1])) // Deep copy
  }

  static getTotalLevels(): number {
    return this.levels.length
  }

  static getAllLevels(): LevelData[] {
    return this.levels.map((level) => JSON.parse(JSON.stringify(level))) // Deep copy
  }
}
