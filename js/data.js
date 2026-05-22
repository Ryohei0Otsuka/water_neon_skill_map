export const groups = {
  problem: [
    {
      icon: "◉",
      name: "問題検知",
      score: 92,
      badge: "自力",
      detail: "業務・データ・人の流れにある違和感を拾い、問題の火種を早めに見つける力。"
    },
    {
      icon: "▣",
      name: "確認観点整理",
      score: 88,
      badge: "自力",
      detail: "断定ではなく、確認すべき観点として整理する力。導入前確認や仕様差異の切り分けに活かす。"
    },
    {
      icon: "▦",
      name: "構造化思考",
      score: 84,
      badge: "自力",
      detail: "混ざった問題を分解し、原因・影響範囲・関係性として捉える思考。"
    },
    {
      icon: "🔒",
      name: "スコープ管理",
      score: 70,
      badge: "自力",
      detail: "気づいたことを全部背負わず、確認・共有・判断の役割を分けるための管理意識。"
    }
  ],

  work: [
    {
      icon: "↗",
      name: "業務改善",
      score: 87,
      badge: "自力",
      detail: "現場の詰まりを見つけ、手順・データ・ツールで軽くする業務改善力。"
    },
    {
      icon: "✦",
      name: "最適設計",
      score: 86,
      badge: "自力",
      detail: "最強ではなく最適。人が残るべきところを残し、詰まる部分だけ仕組みにする考え方。"
    },
    {
      icon: "👥",
      name: "認識合わせ",
      score: 80,
      badge: "自力",
      detail: "関係者の認識をそろえ、会話を構造化して共通理解へ運ぶ力。"
    },
    {
      icon: "▰",
      name: "継続実行",
      score: 80,
      badge: "自力",
      detail: "波があってもゼロにしない継続力。小さく観察・記録・改善を回す。"
    },
    {
      icon: "☷",
      name: "運用意識",
      score: 72,
      badge: "自力",
      detail: "作って終わりにせず、引き継ぎ・手順・変更点・運用を意識する姿勢。"
    }
  ],

  tech: [
    {
      icon: "◫",
      name: "VBA / CSV / ETL",
      score: 78,
      badge: "自力",
      detail: "業務データの分割・変換・整形。文字コード、クォート、改行、データ仕様差異を考慮した処理。"
    },
    {
      icon: "◎",
      name: "WordPress / PHP",
      score: 68,
      badge: "自力",
      detail: "WordPress運用、子テーマ、CSS / jQuery / PHPによる表示調整・既存コード調査・改修。"
    },
    {
      icon: "</>",
      name: "Vanilla JS / Visual",
      score: 68,
      badge: "支援",
      detail: "ブラウザ表現、Canvas、UI、インタラクション。AI支援を使いながら試作・調整。"
    },
    {
      icon: "⬡",
      name: "Python Tools",
      score: 62,
      badge: "支援",
      detail: "CSV加工やGUIツールなどの個人開発。AI支援を使いながら実用品寄りに試作。"
    },
    {
      icon: "▧",
      name: "TypeScript / Electron",
      score: 60,
      badge: "支援",
      detail: "Electron / TypeScriptによるデスクトップアプリ試作。表現・支援ツール系の個人開発。"
    },
    {
      icon: "✎",
      name: "命名・設計",
      score: 48,
      badge: "課題",
      detail: "今後伸ばす領域。命名、責務分割、読みやすい設計、保守しやすい構成。"
    }
  ],

  projects: [
    {
      type: "github",
      icon: "◆",
      name: "GitHub Works",
      score: 82,
      badge: "公開",
      detail: "GitHub上で公開している個人開発・検証制作群。業務改善、進行支援、CSV処理、UI試作など、実務で感じた詰まりをもとに試作したものを中心に並べています。",
      works: [
        {
          icon: "🧭",
          name: "stuck-map",
          url: "https://github.com/Ryohei0Otsuka/stuck-map"
        },
        {
          icon: "▤",
          name: "taskticket",
          url: "https://github.com/Ryohei0Otsuka/taskticket"
        },
        {
          icon: "▧",
          name: "CSVjoiner",
          url: "https://github.com/Ryohei0Otsuka/CSVjoiner"
        },
        {
          icon: "▣",
          name: "CardHub",
          url: "https://github.com/Ryohei0Otsuka/CardHub"
        },
        {
          icon: "✚",
          name: "MedProof",
          url: "https://github.com/Ryohei0Otsuka/MedProof"
        },
        {
          icon: "◺",
          name: "Pizzatempo",
          url: "https://github.com/Ryohei0Otsuka/Pizzatempo"
        },
        {
          icon: "⌁",
          name: "rhythm-signal",
          url: "https://github.com/Ryohei0Otsuka/rhythm-signal"
        },
        {
          icon: "🎮",
          name: "pipotarou-daken-game",
          url: "https://github.com/Ryohei0Otsuka/pipotarou-daken-game"
        }
      ]
    },
    {
      icon: "✦",
      name: "LP Prototype",
      score: 74,
      badge: "支援",
      detail: "HTML / CSS / JavaScript、Canvas API、Three.jsで構成したインタラクティブLP試作。水面・波紋・ホログラム風グローブなどの視覚表現を検証。"
    }
  ]
};