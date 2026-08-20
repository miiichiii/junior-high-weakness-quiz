(function () {
  "use strict";

  const pack = {
    id: "eiken-grade4",
    contentVersion: 1,
    title: "英検4級 100問トレーニング",
    shortTitle: "英検4級100問",
    subject: "英語",
    focus: "英検4級の語彙・文法・会話・語順・読解・リスニング",
    childIds: ["child-2"],
    sessionSize: 10,
    finalTimeLimitSeconds: 900,
    maxEnabled: false,
    tierCounts: { core: 35, challenge: 35, final: 30 },
    tierLabels: {
      core: "語彙・文法 35問",
      challenge: "会話・語順・聞き取り 35問",
      final: "長文・聞き取り 30問"
    },
    subjectCounts: {
      core: { "英語": 35 },
      challenge: { "英語": 35 },
      final: { "英語": 30 },
      total: { "英語": 100 }
    },
    corners: [
      {
        id: "e4-foundations",
        label: "語彙・文法",
        shortLabel: "語彙・文法",
        description: "短文の空所補充で、中学中級の語彙と文法を固める",
        tierCounts: { core: 35 }
      },
      {
        id: "e4-dialogue-order",
        label: "会話・語順",
        shortLabel: "会話・語順",
        description: "会話の流れと、日本文に合う英文の語順を選ぶ",
        tierCounts: { challenge: 20 }
      },
      {
        id: "e4-listening",
        label: "リスニング",
        shortLabel: "聞き取り",
        description: "英語音声を聞き、応答や会話・説明の内容を選ぶ",
        tierCounts: { challenge: 15, final: 15 }
      },
      {
        id: "e4-reading",
        label: "長文読解",
        shortLabel: "長文",
        description: "案内・Eメール・説明文を読み、必要な情報を見つける",
        tierCounts: { final: 15 }
      }
    ],
    unlock: {
      challengeEarly: { answered: 8, accuracy: 70 },
      challengeFull: { answered: 16, accuracy: 70 },
      final: { answered: 16, accuracy: 70 }
    },
    mix: { review: 0.5, unseen: 0.4, mastered: 0.1 },
    mastery: { correctSessions: 2, cooldownAnswers: 5, distinctDirections: 2, distinctSessions: 2 },
    copy: {
      eyebrow: "英検4級・中学中級レベルを100問で練習",
      lead: "公式の出題形式を参考にしたオリジナル100問です。語彙・文法から始め、会話・語順、長文、音声の聞き取りへ進みます。",
      privacy: "英検の過去問は転載せず、出題形式と中学中級レベルを参考に新しく作成しています。音声は端末の英語読み上げ機能を使います。",
      startButton: "英検4級を10問やる",
      reviewButton: "間違えた問題だけ",
      tierLead: {
        core: "まず短文の語彙と文法を、文全体の意味から選ぼう。",
        challenge: "会話の流れと語順を確認し、聞き取りにも慣れよう。",
        final: "案内・Eメール・説明文と音声から、必要な情報を正確につかもう。"
      },
      complete: "100問の範囲を確認できました。間違えた表現と、聞き取れなかった音声をもう一度練習しよう。"
    }
  };

  window.QUIZ_PACKS = window.QUIZ_PACKS || {};
  window.QUIZ_PACKS[pack.id] = pack;
})();
