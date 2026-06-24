export const groups = {
  problem: [
    {
      icon: "◉",
      name: "問題検知",
      score: 92,
      badge: "自力",
      detail: "業務・データ・人の流れにある違和感を拾い、問題の火種を早めに見つける力。誰が悪いかではなく、どこで止まっているかを見る。"
    },
    {
      icon: "▣",
      name: "確認観点整理",
      score: 89,
      badge: "自力",
      detail: "断定ではなく、確認すべき観点として整理する力。目的、手順、入力、処理、出力、関係者、影響範囲を分けて考える。"
    },
    {
      icon: "⬡",
      name: "抽象化",
      score: 86,
      badge: "自力",
      detail: "実名・実パス・顧客名などの具体情報を避けながら、流れや役割だけを取り出して扱える形にする力。"
    },
    {
      icon: "▦",
      name: "構造化思考",
      score: 84,
      badge: "自力",
      detail: "混ざった問題を分解し、原因・前提・影響範囲・関係性として捉える思考。文章だけでは見えにくい流れを地図にする。"
    }
  ],

  work: [
    {
      icon: "↗",
      name: "業務改善",
      score: 87,
      badge: "自力",
      detail: "現場の違和感を見つけ、手順・データ・ツール・確認観点で軽くする業務改善力。作って終わりではなく、使われる形を考える。"
    },
    {
      icon: "✦",
      name: "最適設計",
      score: 86,
      badge: "自力",
      detail: "最強ではなく最適。人が判断すべきところを残し、止まりやすい部分だけを仕組みで軽くする考え方。"
    },
    {
      icon: "👥",
      name: "認識合わせ",
      score: 82,
      badge: "自力",
      detail: "関係者の認識をそろえ、会話を構造化して共通理解へ運ぶ力。画面やメモを、説明ではなく会話の材料として使う。"
    },
    {
      icon: "☷",
      name: "運用意識",
      score: 76,
      badge: "自力",
      detail: "作って終わりにせず、引き継ぎ・手順・変更点・運用負荷を意識する姿勢。継続して使われるかを考える。"
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
      name: "WordPress / PHP / jQuery",
      score: 68,
      badge: "自力",
      detail: "WordPress運用、CSS / jQuery / PHPによる表示調整、既存コード調査・改修。"
    },
    {
      icon: "</>",
      name: "JavaScript / UI Prototype",
      score: 67,
      badge: "支援",
      detail: "HTML / CSS / JavaScriptを使ったUI調整・ブラウザ表現・インタラクション試作。静的サイトや小さな画面検証に活用。"
    },
    {
      icon: "▧",
      name: "React / Vite / TypeScript",
      score: 62,
      badge: "支援",
      detail: "React、Vite、TypeScriptを使った個人開発プロトタイプ。AI支援を活用しながら、構造理解と差し替え可能な実装を進めている。"
    },
    {
      icon: "⌁",
      name: "Supabase / Vercel",
      score: 58,
      badge: "検証",
      detail: "Supabase、PostgreSQL、Realtime、Vercelを使った同期・公開検証。ローカル保存版から共有版への拡張を試している。"
    }
  ],

  projects: [
    {
      type: "github",
      icon: "◆",
      name: "Selected Works",
      score: 88,
      badge: "選抜",
      detail: "代表的な制作物を、現場由来の業務地図、進行支援、体制整理、データ処理、UI試作の観点で選抜しています。数を並べるより、何を見て何を作る人かが伝わる構成にしています。",
      works: [
        {
          icon: "🗺️",
          name: "Pathless Map",
          url: "https://github.com/Ryohei0Otsuka/pathless-map"
        },
        {
          icon: "🛡️",
          name: "Staff Guard Map",
          url: "https://github.com/Ryohei0Otsuka/staff-guard-map"
        },
        {
          icon: "🧭",
          name: "Stuck Map",
          url: "https://github.com/Ryohei0Otsuka/stuck-map"
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
          icon: "▤",
          name: "taskticket",
          url: "https://github.com/Ryohei0Otsuka/taskticket"
        },
        {
          icon: "💧",
          name: "Water Neon Skill Map",
          url: "https://github.com/Ryohei0Otsuka/water_neon_skill_map"
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
      icon: "⬡",
      name: "Concept Portfolio",
      score: 80,
      badge: "整理",
      detail: "スキル一覧ではなく、思考特性・制作物・現場での違和感をひとつの地図として見せるポートフォリオ。技術だけでなく、何を見て何を作る人かを伝える。"
    }
  ]
};