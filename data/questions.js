window.QUIZ_QUESTIONS = [
  {
    id: "math-eq-001",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "方程式 5x - 3 = 2x + 12 を解くと、x はいくつですか。",
    choices: ["3", "5", "9", "15"],
    answer: 1,
    explanation: "両辺から2xを引くと 3x - 3 = 12。両辺に3を足して 3x = 15、だから x = 5 です。"
  },
  {
    id: "math-eq-002",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "(x - 3) / 4 = 2 を解くと、x はいくつですか。",
    choices: ["5", "8", "11", "14"],
    answer: 2,
    explanation: "両辺に4をかけて x - 3 = 8。両辺に3を足して x = 11 です。"
  },
  {
    id: "math-eq-003",
    subject: "数学",
    unit: "連立方程式",
    priority: "S",
    prompt: "連立方程式 x + y = 7、x - y = 1 の解として正しいものはどれですか。",
    choices: ["x=3, y=4", "x=4, y=3", "x=5, y=2", "x=2, y=5"],
    answer: 1,
    explanation: "2つの式を足すと 2x = 8 なので x = 4。x + y = 7 に入れて y = 3 です。"
  },
  {
    id: "math-eq-004",
    subject: "数学",
    unit: "連立方程式",
    priority: "S",
    prompt: "連立方程式 0.3x + 0.2y = 1.2、x + y = 5 を解くと、x はいくつですか。",
    choices: ["1", "2", "3", "4"],
    answer: 1,
    explanation: "小数の式を10倍して 3x + 2y = 12。x + y = 5 を2倍して 2x + 2y = 10。差をとると x = 2 です。"
  },
  {
    id: "math-eq-005",
    subject: "数学",
    unit: "方程式の利用",
    priority: "S",
    prompt: "1個120円の品物を x 個、80円の品物を y 個買い、合計10個で960円でした。式として正しい組み合わせはどれですか。",
    choices: ["x+y=960, 120x+80y=10", "x+y=10, 120x+80y=960", "120x+80y=10, x-y=960", "x+y=10, 80x+120y=10"],
    answer: 1,
    explanation: "個数の合計は x + y = 10、金額の合計は 120x + 80y = 960 です。単位をそろえるのが大事です。"
  },
  {
    id: "math-eq-006",
    subject: "数学",
    unit: "方程式の利用",
    priority: "S",
    prompt: "時速4kmで歩く時間を x 時間、時速6kmで歩く時間を y 時間として、合計2時間で10km進んだ。正しい式はどれですか。",
    choices: ["x+y=10, 4x+6y=2", "x+y=2, 4x+6y=10", "4x+6y=2, x-y=10", "x+y=2, 6x+4y=2"],
    answer: 1,
    explanation: "時間の合計は x + y = 2、距離は 速さ × 時間 なので 4x + 6y = 10 です。"
  },
  {
    id: "math-alg-001",
    subject: "数学",
    unit: "式の計算",
    priority: "S",
    prompt: "1/2 a + 2/3 a を計算するとどうなりますか。",
    choices: ["3/5 a", "5/6 a", "7/6 a", "1a"],
    answer: 2,
    explanation: "係数だけを通分します。1/2 + 2/3 = 3/6 + 4/6 = 7/6 なので、7/6 a です。"
  },
  {
    id: "math-alg-002",
    subject: "数学",
    unit: "等式変形",
    priority: "S",
    prompt: "S = ah / 2 を h について解くと、どれになりますか。",
    choices: ["h = 2S/a", "h = S/2a", "h = a/2S", "h = 2a/S"],
    answer: 0,
    explanation: "両辺に2をかけて 2S = ah。両辺を a で割って h = 2S/a です。"
  },
  {
    id: "math-alg-003",
    subject: "数学",
    unit: "式の値",
    priority: "S",
    prompt: "x = -2 のとき、3x^2 - 4x + 1 の値はいくつですか。",
    choices: ["5", "13", "21", "-19"],
    answer: 2,
    explanation: "3x^2 は 3 × 4 = 12、-4x は -4 × -2 = 8。12 + 8 + 1 = 21 です。"
  },
  {
    id: "math-fn-001",
    subject: "数学",
    unit: "1次関数",
    priority: "S",
    prompt: "y = 2x - 3 で、x が 1 から 4 まで動くとき、y の範囲はどれですか。",
    choices: ["-1 から 5", "1 から 8", "-5 から 3", "2 から 11"],
    answer: 0,
    explanation: "x=1 のとき y=-1、x=4 のとき y=5。傾きが正なので y は -1 から 5 までです。"
  },
  {
    id: "math-fn-002",
    subject: "数学",
    unit: "1次関数",
    priority: "S",
    prompt: "傾きが3で、点 (2, 5) を通る直線の式はどれですか。",
    choices: ["y = 3x + 5", "y = 3x - 1", "y = 2x + 3", "y = -3x + 11"],
    answer: 1,
    explanation: "y = 3x + b に (2,5) を入れると 5 = 6 + b。b = -1 なので y = 3x - 1 です。"
  },
  {
    id: "math-fn-003",
    subject: "数学",
    unit: "反比例",
    priority: "A",
    prompt: "y は x に反比例し、x=3 のとき y=4 です。x=6 のとき y はいくつですか。",
    choices: ["1", "2", "8", "12"],
    answer: 1,
    explanation: "反比例では xy が一定です。3 × 4 = 12 なので y = 12 / 6 = 2 です。"
  },
  {
    id: "math-data-001",
    subject: "数学",
    unit: "データの活用",
    priority: "A",
    prompt: "データ 2, 4, 5, 7, 9 の中央値はどれですか。",
    choices: ["4", "5", "6", "7"],
    answer: 1,
    explanation: "小さい順に並んだ5個の真ん中は3番目なので、中央値は5です。"
  },
  {
    id: "math-data-002",
    subject: "数学",
    unit: "データの活用",
    priority: "A",
    prompt: "箱ひげ図で、箱の左端と右端が表すものはどれですか。",
    choices: ["最小値と最大値", "平均値と中央値", "第1四分位数と第3四分位数", "最頻値と範囲"],
    answer: 2,
    explanation: "箱の左端は第1四分位数、右端は第3四分位数です。ひげの端が最小値と最大値です。"
  },
  {
    id: "math-geo-001",
    subject: "数学",
    unit: "図形",
    priority: "S",
    prompt: "三角形の内角の和は何度ですか。",
    choices: ["90度", "120度", "180度", "360度"],
    answer: 2,
    explanation: "三角形の内角の和は常に180度です。角度問題の最初の土台です。"
  },
  {
    id: "math-geo-002",
    subject: "数学",
    unit: "多角形",
    priority: "S",
    prompt: "五角形の内角の和は何度ですか。",
    choices: ["360度", "480度", "540度", "720度"],
    answer: 2,
    explanation: "n角形の内角の和は 180 × (n - 2)。五角形なら 180 × 3 = 540度です。"
  },
  {
    id: "math-geo-003",
    subject: "数学",
    unit: "作図",
    priority: "A",
    prompt: "線分ABの垂直二等分線上にある点Pについて、必ず成り立つことはどれですか。",
    choices: ["PA = PB", "PA と PB は垂直", "P はABの中点", "角APBは90度"],
    answer: 0,
    explanation: "垂直二等分線上の点は、線分の両端からの距離が等しくなります。"
  },
  {
    id: "math-geo-004",
    subject: "数学",
    unit: "円",
    priority: "A",
    prompt: "円の接線と、接点を通る半径の関係として正しいものはどれですか。",
    choices: ["平行になる", "垂直になる", "長さが等しい", "必ず二等分する"],
    answer: 1,
    explanation: "円の接線は、接点を通る半径と垂直です。接線問題の基本です。"
  },
  {
    id: "math-geo-005",
    subject: "数学",
    unit: "空間図形",
    priority: "A",
    prompt: "空間で、交わらず平行でもない2直線の関係を何といいますか。",
    choices: ["垂直", "ねじれの位置", "対称", "合同"],
    answer: 1,
    explanation: "同じ平面上にないため交わらず、平行でもない2直線は、ねじれの位置です。"
  },
  {
    id: "math-geo-006",
    subject: "数学",
    unit: "合同",
    priority: "S",
    prompt: "三角形の合同条件として正しいものはどれですか。",
    choices: ["3つの角がそれぞれ等しい", "2辺とその間の角がそれぞれ等しい", "面積が等しい", "周の長さが等しい"],
    answer: 1,
    explanation: "合同条件の1つは、2辺とその間の角がそれぞれ等しいことです。3角が等しいだけでは相似です。"
  },
  {
    id: "math-geo-007",
    subject: "数学",
    unit: "等積変形",
    priority: "A",
    prompt: "三角形で、底辺が同じで高さも同じなら、何が等しくなりますか。",
    choices: ["周の長さ", "面積", "3辺の長さ", "3つの角"],
    answer: 1,
    explanation: "三角形の面積は 底辺 × 高さ / 2。同じ底辺と高さなら面積が等しくなります。"
  },
  {
    id: "math-eq-007",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "方程式 -3x + 7 = 16 を解くと、x はいくつですか。",
    choices: ["-3", "3", "-9", "9"],
    answer: 0,
    explanation: "両辺から7を引くと -3x = 9。両辺を -3 で割って x = -3 です。負の数で割るところを丁寧に確認します。"
  },
  {
    id: "math-eq-008",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "方程式 2(x - 3) = 10 を解くと、x はいくつですか。",
    choices: ["2", "5", "8", "13"],
    answer: 2,
    explanation: "先に両辺を2で割ると x - 3 = 5。両辺に3を足して x = 8 です。"
  },
  {
    id: "math-eq-009",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "(2/3)x = 4 を解くと、x はいくつですか。",
    choices: ["6", "8/3", "12", "2"],
    answer: 0,
    explanation: "両辺に 3/2 をかけます。x = 4 × 3/2 = 6 です。分数係数は逆数をかけるのが基本です。"
  },
  {
    id: "math-eq-010",
    subject: "数学",
    unit: "方程式",
    priority: "S",
    prompt: "方程式 4x + 5 = -7 を解くと、x はいくつですか。",
    choices: ["-3", "-2", "2", "3"],
    answer: 0,
    explanation: "両辺から5を引くと 4x = -12。両辺を4で割って x = -3 です。"
  },
  {
    id: "math-eq-011",
    subject: "数学",
    unit: "連立方程式",
    priority: "S",
    prompt: "連立方程式 2x + y = 9、x - y = 3 の解として正しいものはどれですか。",
    choices: ["x=2, y=5", "x=3, y=3", "x=4, y=1", "x=5, y=-1"],
    answer: 2,
    explanation: "2つの式を足すと 3x = 12。x = 4、x - y = 3 に入れて y = 1 です。"
  },
  {
    id: "math-eq-012",
    subject: "数学",
    unit: "連立方程式",
    priority: "S",
    prompt: "連立方程式 y = 2x + 1、x + y = 10 を解くと、x はいくつですか。",
    choices: ["2", "3", "4", "5"],
    answer: 1,
    explanation: "x + y = 10 に y = 2x + 1 を代入すると x + 2x + 1 = 10。3x = 9 なので x = 3 です。"
  },
  {
    id: "math-eq-013",
    subject: "数学",
    unit: "連立方程式",
    priority: "S",
    prompt: "連立方程式 3x + 2y = 16、x + 2y = 8 を解くと、x はいくつですか。",
    choices: ["2", "3", "4", "5"],
    answer: 2,
    explanation: "2つの式を引くと 2x = 8。x = 4 です。同じ項を消す形を見つけるのがポイントです。"
  },
  {
    id: "math-eq-014",
    subject: "数学",
    unit: "方程式の利用",
    priority: "S",
    prompt: "ある数の3倍から5を引くと16になる。ある数を x とすると、正しい式はどれですか。",
    choices: ["3x - 5 = 16", "3(x - 5) = 16", "x/3 - 5 = 16", "5x - 3 = 16"],
    answer: 0,
    explanation: "ある数の3倍は 3x。そのあと5を引くので 3x - 5 = 16 です。文章を左から式にします。"
  },
  {
    id: "math-eq-015",
    subject: "数学",
    unit: "方程式の利用",
    priority: "S",
    prompt: "1冊120円のノートと1本80円のペンを合わせて8個買い、合計800円でした。ノートを x 冊、ペンを y 本としたとき、正しい式はどれですか。",
    choices: ["x+y=8, 120x+80y=800", "x+y=800, 120x+80y=8", "120x+80y=8, x-y=800", "x+y=8, 80x+120y=800"],
    answer: 0,
    explanation: "個数は x + y = 8、金額は 120x + 80y = 800 です。個数と金額を混ぜないようにします。"
  },
  {
    id: "math-alg-004",
    subject: "数学",
    unit: "式の計算",
    priority: "S",
    prompt: "3(2a - 5) - 2(a + 1) を簡単にすると、どれになりますか。",
    choices: ["4a - 17", "4a - 13", "8a - 17", "6a - 7"],
    answer: 0,
    explanation: "3(2a - 5)=6a-15、-2(a+1)=-2a-2。合わせて 4a - 17 です。符号に注意します。"
  },
  {
    id: "math-alg-005",
    subject: "数学",
    unit: "等式変形",
    priority: "S",
    prompt: "v = d / t を d について解くと、どれになりますか。",
    choices: ["d = vt", "d = v/t", "d = t/v", "d = v + t"],
    answer: 0,
    explanation: "両辺に t をかけると vt = d。つまり d = vt です。理科の公式にもつながる等式変形です。"
  },
  {
    id: "math-fn-004",
    subject: "数学",
    unit: "1次関数",
    priority: "S",
    prompt: "y = -2x + 6 で、x が -1 から 3 まで動くとき、y の範囲はどれですか。",
    choices: ["0 から 8", "-1 から 3", "3 から 6", "-8 から 0"],
    answer: 0,
    explanation: "x=-1 なら y=8、x=3 なら y=0。傾きが負なので、y は 0 から 8 までです。"
  },
  {
    id: "math-fn-005",
    subject: "数学",
    unit: "1次関数",
    priority: "S",
    prompt: "点 (0, 2) と点 (3, 8) を通る直線の傾きはどれですか。",
    choices: ["1", "2", "3", "6"],
    answer: 1,
    explanation: "x が 0 から3へ増えると、y は2から8へ6増えます。傾きは 6 / 3 = 2 です。"
  },
  {
    id: "math-fn-006",
    subject: "数学",
    unit: "1次関数",
    priority: "S",
    prompt: "2直線 y = 2x + 1 と y = -x + 7 の交点の x 座標はどれですか。",
    choices: ["1", "2", "3", "4"],
    answer: 1,
    explanation: "交点では y が等しいので、2x + 1 = -x + 7。3x = 6 だから x = 2 です。"
  },
  {
    id: "math-geo-008",
    subject: "数学",
    unit: "図形",
    priority: "S",
    prompt: "三角形の2つの角が50度、60度のとき、残りの角は何度ですか。",
    choices: ["60度", "70度", "80度", "90度"],
    answer: 1,
    explanation: "三角形の内角の和は180度。180 - 50 - 60 = 70度です。"
  },
  {
    id: "math-geo-009",
    subject: "数学",
    unit: "多角形",
    priority: "S",
    prompt: "どんな多角形でも、外角の和は何度ですか。",
    choices: ["90度", "180度", "270度", "360度"],
    answer: 3,
    explanation: "多角形の外角の和はいつでも360度です。内角の和の公式と区別します。"
  },
  {
    id: "math-geo-010",
    subject: "数学",
    unit: "合同",
    priority: "S",
    prompt: "合同証明で「ABは共通」であることを使うとき、理由として最も自然なのはどれですか。",
    choices: ["共通な辺だから等しい", "平行だから等しい", "円周角だから等しい", "平均だから等しい"],
    answer: 0,
    explanation: "同じ線分を2つの三角形で使っているときは、共通な辺だから等しい、と書けます。"
  },
  {
    id: "math-data-003",
    subject: "数学",
    unit: "データの活用",
    priority: "A",
    prompt: "データ 1, 2, 4, 6, 9, 10 の第1四分位数はどれですか。",
    choices: ["2", "3", "4", "5"],
    answer: 0,
    explanation: "下半分 1, 2, 4 の中央値が第1四分位数です。真ん中は2です。"
  },
  {
    id: "math-data-004",
    subject: "数学",
    unit: "データの活用",
    priority: "A",
    prompt: "データの最大値が18、最小値が5のとき、範囲はいくつですか。",
    choices: ["9", "13", "18", "23"],
    answer: 1,
    explanation: "範囲は 最大値 - 最小値。18 - 5 = 13 です。"
  },
  {
    id: "science-phy-001",
    subject: "理科",
    unit: "力",
    priority: "A",
    prompt: "ばねに加える力とばねののびの関係として正しいものはどれですか。",
    choices: ["力が大きいほど、のびは小さくなる", "力とのびは比例する", "のびはいつも一定", "力とのびは無関係"],
    answer: 1,
    explanation: "ばねののびは加える力に比例します。これをフックの法則といいます。"
  },
  {
    id: "science-phy-002",
    subject: "理科",
    unit: "力",
    priority: "A",
    prompt: "50gのおもりでばねが2cmのびる。150gのおもりでは何cmのびますか。",
    choices: ["3cm", "4cm", "6cm", "8cm"],
    answer: 2,
    explanation: "150gは50gの3倍なので、のびも3倍。2cm × 3 = 6cmです。"
  },
  {
    id: "science-elec-001",
    subject: "理科",
    unit: "電流と磁界",
    priority: "A",
    prompt: "コイルに棒磁石を近づけたり遠ざけたりすると電流が流れる現象を何といいますか。",
    choices: ["電磁誘導", "静電気", "蒸留", "慣性"],
    answer: 0,
    explanation: "磁界が変化すると電流が流れます。この現象が電磁誘導です。"
  },
  {
    id: "science-elec-002",
    subject: "理科",
    unit: "電流と磁界",
    priority: "A",
    prompt: "導線に電流を流すと、そのまわりに何ができますか。",
    choices: ["磁界", "火成岩", "水蒸気", "中枢神経"],
    answer: 0,
    explanation: "電流のまわりには磁界ができます。方位磁針の向きが変わるのはこのためです。"
  },
  {
    id: "science-chem-001",
    subject: "理科",
    unit: "水溶液",
    priority: "A",
    prompt: "食塩水100gに食塩が5g含まれるとき、質量パーセント濃度はいくつですか。",
    choices: ["2%", "5%", "10%", "20%"],
    answer: 1,
    explanation: "質量パーセント濃度は 溶質の質量 / 水溶液の質量 × 100。5 / 100 × 100 = 5%です。"
  },
  {
    id: "science-chem-002",
    subject: "理科",
    unit: "溶解度",
    priority: "A",
    prompt: "水に溶けきれなかった物質が、温度を下げたときに結晶として出てくることがあります。この考え方に関係が深いものはどれですか。",
    choices: ["溶解度", "慣性", "消化", "湿度"],
    answer: 0,
    explanation: "物質が水に溶ける量は温度で変わります。この限界量が溶解度です。"
  },
  {
    id: "science-bio-001",
    subject: "理科",
    unit: "人体",
    priority: "A",
    prompt: "脳とせきずいをまとめて何といいますか。",
    choices: ["感覚器官", "中枢神経", "消化管", "末しょう神経"],
    answer: 1,
    explanation: "脳とせきずいは中枢神経です。体の命令や情報処理の中心になります。"
  },
  {
    id: "science-bio-002",
    subject: "理科",
    unit: "人体",
    priority: "A",
    prompt: "小腸の内側にある、養分を吸収しやすくする小さな突起を何といいますか。",
    choices: ["気孔", "柔毛", "肺胞", "柱頭"],
    answer: 1,
    explanation: "小腸の内側には柔毛があり、表面積を広げて養分を吸収しやすくしています。"
  },
  {
    id: "science-earth-001",
    subject: "理科",
    unit: "地学",
    priority: "A",
    prompt: "マグニチュードが1大きくなると、地震のエネルギーはおよそ何倍になりますか。",
    choices: ["約2倍", "約10倍", "約32倍", "約100倍"],
    answer: 2,
    explanation: "マグニチュードが1大きくなると、地震のエネルギーは約32倍になります。"
  },
  {
    id: "science-earth-002",
    subject: "理科",
    unit: "火山",
    priority: "A",
    prompt: "石英や長石を多く含み、白っぽい火山岩として代表的なものはどれですか。",
    choices: ["玄武岩", "流紋岩", "石灰岩", "れき岩"],
    answer: 1,
    explanation: "流紋岩は白っぽい火山岩で、石英や長石を多く含みます。"
  },
  {
    id: "social-geo-001",
    subject: "社会",
    unit: "日本地理",
    priority: "A",
    prompt: "夏に東北地方の太平洋側へ吹き、冷害の原因になることがある風はどれですか。",
    choices: ["やませ", "季節風", "偏西風", "からっ風"],
    answer: 0,
    explanation: "やませは冷たく湿った北東風で、東北地方の太平洋側に冷害をもたらすことがあります。"
  },
  {
    id: "social-geo-002",
    subject: "社会",
    unit: "世界地理",
    priority: "A",
    prompt: "南アメリカ大陸の西側に連なる長い山脈はどれですか。",
    choices: ["ヒマラヤ山脈", "アンデス山脈", "アルプス山脈", "ロッキー山脈"],
    answer: 1,
    explanation: "アンデス山脈は南アメリカ大陸の西側に南北に長く連なっています。"
  },
  {
    id: "social-geo-003",
    subject: "社会",
    unit: "時差",
    priority: "A",
    prompt: "東経135度の日本と、東経15度の地域の時差は何時間ですか。",
    choices: ["4時間", "6時間", "8時間", "10時間"],
    answer: 2,
    explanation: "経度差は120度。15度で1時間なので、120 / 15 = 8時間です。"
  },
  {
    id: "social-history-001",
    subject: "社会",
    unit: "古代",
    priority: "A",
    prompt: "奈良時代に聖武天皇の宝物などを納めた建物として有名なものはどれですか。",
    choices: ["正倉院", "金閣", "首里城", "中尊寺金色堂"],
    answer: 0,
    explanation: "正倉院は奈良時代の宝物を伝える建物として有名です。"
  },
  {
    id: "social-history-002",
    subject: "社会",
    unit: "中世",
    priority: "A",
    prompt: "鎌倉幕府が御家人を統制するために定めた武家の法律はどれですか。",
    choices: ["十七条の憲法", "御成敗式目", "大日本帝国憲法", "武家諸法度"],
    answer: 1,
    explanation: "御成敗式目は鎌倉幕府が定めた武家社会の法律です。"
  },
  {
    id: "social-history-003",
    subject: "社会",
    unit: "中世",
    priority: "A",
    prompt: "元が日本に攻めてきたできごとを何といいますか。",
    choices: ["応仁の乱", "承久の乱", "元寇", "大化の改新"],
    answer: 2,
    explanation: "13世紀に元が日本へ攻めてきたできごとを元寇といいます。"
  },
  {
    id: "english-001",
    subject: "英語",
    unit: "語句",
    priority: "B",
    prompt: "benefit の意味として最も近いものはどれですか。",
    choices: ["利益", "危険", "約束", "混乱"],
    answer: 0,
    explanation: "benefit は「利益、恩恵」という意味です。文中では何にとっての利益かを確認します。"
  },
  {
    id: "english-002",
    subject: "英語",
    unit: "文法",
    priority: "B",
    prompt: "They will not come tomorrow. と同じ意味になる短縮形はどれですか。",
    choices: ["They don't come tomorrow.", "They won't come tomorrow.", "They didn't come tomorrow.", "They aren't come tomorrow."],
    answer: 1,
    explanation: "will not の短縮形は won't です。未来の否定を表します。"
  },
  {
    id: "japanese-001",
    subject: "国語",
    unit: "説明文",
    priority: "C",
    prompt: "説明文で「筆者の主張」を選ぶとき、最も重視すべきものはどれですか。",
    choices: ["例として出された数字", "最初に出た人物名", "結論や繰り返し述べられる考え", "知らない漢字の数"],
    answer: 2,
    explanation: "筆者の主張は、結論部分や本文中で繰り返される考えに表れやすいです。"
  },
  {
    id: "japanese-002",
    subject: "国語",
    unit: "古典",
    priority: "C",
    prompt: "古典を読むとき、現代語訳の前にまず確認したいものはどれですか。",
    choices: ["主語と助動詞の意味", "作者の身長", "漢字の画数", "紙の大きさ"],
    answer: 0,
    explanation: "古典では主語が省略されやすく、助動詞の意味も内容理解に直結します。"
  }
];
