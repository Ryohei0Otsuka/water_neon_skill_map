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
      detail: "VBAによるCSV・ETL処理。文字コード、クォート、改行、データ仕様差異を考慮した業務データ加工。"
    },
    {
      icon: "◎",
      name: "WordPress / PHP / jQuery",
      score: 68,
      badge: "自力",
      detail: "WordPress改修、PHP・jQuery調整、CSSによる表示調整。既存コードを読み、Web運用上の崩れや改善点に対応。"
    },
    {
      icon: "</>",
      name: "HTML / CSS / JavaScript",
      score: 66,
      badge: "自力",
      detail: "LPやUI調整で使う基本技術。画面の見え方、余白、配置、簡単なインタラクションを整える。"
    },
    {
      icon: "⬢",
      name: "React / Vite",
      score: 64,
      badge: "AI支援",
      detail: "AI支援を使いながら、個人開発・UIプロトタイプの実装に使用。状態管理やコンポーネント構成を検証中。"
    },
    {
      icon: "☁",
      name: "Supabase / PostgreSQL / Vercel",
      score: 58,
      badge: "検証",
      detail: "クラウドDB保存、複数端末同期、Vercelデプロイの検証。同期プロトタイプの仕組み理解と試作に使用。"
    },
    {
      icon: "▧",
      name: "Python / TypeScript / Electron",
      score: 60,
      badge: "支援",
      detail: "PythonによるCSV加工やGUIツール、TypeScript / Electronによるデスクトップアプリ試作。AI支援を使いながら制作。"
    },
    {
      icon: "◌",
      name: "Three.js / Canvas API",
      score: 56,
      badge: "試作",
      detail: "水面・波紋・ホログラム風グローブなど、ブラウザ上のビジュアル表現を試作。LPの演出表現に使用。"
    },
    {
      icon: "☷",
      name: "ローコード / SaaS比較",
      score: 62,
      badge: "検証",
      detail: "ローコードツールや業務系SaaSの比較・検証補助。業務フロー、導入観点、運用上の確認点を整理。"
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
    },
    {
      icon: "♜",
      name: "Skill Scope",
      score: 76,
      badge: "整理",
      detail: "自力実装、AI支援での実装・検証、制作支援・試作、経験領域を分けて整理。できることを盛らずに、実務経験と検証範囲を見える化。"
    }
  ]
};