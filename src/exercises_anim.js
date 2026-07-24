// Animierte SVG-Bewegungsbilder für die klassischen Grundübungen.
// Skelett-System: pro Bewegungsmuster eine Vorlage (Pose A <-> B), viele Übungen teilen sie.
// Reine SVG/SMIL-Animation: winzig, offline, ohne Lizenz.

const DUR = "2.6s";
const an = (attr, a, b) =>
  `<animate attributeName="${attr}" dur="${DUR}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" values="${a};${b};${a}"/>`;

function build(t) {
  const A = t.A, B = t.B;
  let s = '<svg viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg">';
  s += (t.extra || "");
  s += '<line x1="8" y1="168" x2="122" y2="168" stroke="#39434F" stroke-width="2" stroke-dasharray="5 4"/>';
  for (const [j1, j2, w] of t.bones) {
    const a1 = A[j1], a2 = A[j2], b1 = B[j1], b2 = B[j2];
    s += `<line stroke="#DDE4EC" stroke-width="${w}" stroke-linecap="round" x1="${a1[0]}" y1="${a1[1]}" x2="${a2[0]}" y2="${a2[1]}">`
       + an("x1", a1[0], b1[0]) + an("y1", a1[1], b1[1]) + an("x2", a2[0], b2[0]) + an("y2", a2[1], b2[1]) + "</line>";
  }
  const ha = A.head, hb = B.head;
  s += `<circle fill="#DDE4EC" cx="${ha[0]}" cy="${ha[1]}" r="11">` + an("cx", ha[0], hb[0]) + an("cy", ha[1], hb[1]) + "</circle>";
  if (t.bar) {
    const [j, half] = t.bar, a = A[j], b = B[j];
    s += `<line stroke="#6FA3FF" stroke-width="6" stroke-linecap="round" x1="${a[0]-half}" y1="${a[1]}" x2="${a[0]+half}" y2="${a[1]}">`
       + an("x1", a[0]-half, b[0]-half) + an("y1", a[1], b[1]) + an("x2", a[0]+half, b[0]+half) + an("y2", a[1], b[1]) + "</line>";
    for (const sg of [-1, 1])
      s += `<circle fill="#6FA3FF" cx="${a[0]+sg*half}" cy="${a[1]}" r="6">` + an("cx", a[0]+sg*half, b[0]+sg*half) + an("cy", a[1], b[1]) + "</circle>";
  }
  return s + "</svg>";
}

const T = {
  squat: { A:{head:[65,24],sho:[64,44],hip:[63,88],knee:[61,122],ankle:[59,160],elbL:[48,46],elbR:[80,46]},
           B:{head:[59,46],sho:[58,60],hip:[65,100],knee:[45,116],ankle:[54,160],elbL:[42,62],elbR:[74,62]},
           bones:[["sho","hip",8],["hip","knee",8],["knee","ankle",7],["sho","elbL",6],["sho","elbR",6]], bar:["sho",22] },
  bench: { A:{head:[34,103],sho:[48,103],hip:[92,103],knee:[104,130],ankle:[104,160],hand:[60,72]},
           B:{head:[34,103],sho:[48,103],hip:[92,103],knee:[104,130],ankle:[104,160],hand:[60,92]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","hand",6]], bar:["hand",18],
           extra:'<rect x="26" y="108" width="84" height="12" rx="3" fill="#29313B" stroke="#39434F" stroke-width="2"/><line x1="40" y1="120" x2="40" y2="160" stroke="#39434F" stroke-width="4"/><line x1="96" y1="120" x2="96" y2="160" stroke="#39434F" stroke-width="4"/>' },
  hinge: { A:{head:[74,50],sho:[76,58],hip:[60,90],knee:[58,124],ankle:[60,160],hand:[52,126]},
           B:{head:[65,28],sho:[64,40],hip:[62,90],knee:[60,124],ankle:[62,160],hand:[58,98]},
           bones:[["sho","hip",8],["hip","knee",8],["knee","ankle",7],["sho","hand",6]], bar:["hand",26] },
  ohp:   { A:{head:[65,34],sho:[64,48],hip:[63,100],knee:[61,134],ankle:[60,162],hand:[60,48]},
           B:{head:[65,40],sho:[64,54],hip:[63,104],knee:[61,136],ankle:[60,162],hand:[60,18]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","hand",6]], bar:["hand",18] },
  row:   { A:{head:[80,48],sho:[74,58],hip:[54,86],knee:[50,120],ankle:[58,158],hand:[66,120]},
           B:{head:[80,48],sho:[74,58],hip:[54,86],knee:[50,120],ankle:[58,158],hand:[64,88]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","hand",6]], bar:["hand",22] },
  pull:  { A:{head:[65,46],sho:[64,58],hip:[63,108],knee:[80,122],ankle:[82,158],hand:[60,20]},
           B:{head:[65,40],sho:[64,52],hip:[63,104],knee:[80,120],ankle:[82,158],hand:[60,48]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","hand",6]], bar:["hand",20] },
  curl:  { A:{head:[65,30],sho:[64,46],hip:[63,100],knee:[61,134],ankle:[60,162],elbow:[58,74],hand:[60,98]},
           B:{head:[65,30],sho:[64,46],hip:[63,100],knee:[61,134],ankle:[60,162],elbow:[58,74],hand:[66,58]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","elbow",6],["elbow","hand",6]], bar:["hand",14] },
  pushdown: { A:{head:[65,30],sho:[64,46],hip:[63,100],knee:[61,134],ankle:[60,162],elbow:[62,74],hand:[62,74]},
           B:{head:[65,30],sho:[64,46],hip:[63,100],knee:[61,134],ankle:[60,162],elbow:[62,74],hand:[62,104]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","elbow",6],["elbow","hand",6]] },
  hipthrust: { A:{head:[28,92],sho:[44,96],hip:[80,128],knee:[100,122],ankle:[106,158]},
           B:{head:[28,92],sho:[44,96],hip:[80,102],knee:[100,118],ankle:[106,158]},
           bones:[["sho","hip",9],["hip","knee",8],["knee","ankle",7]], bar:["hip",16],
           extra:'<rect x="18" y="98" width="34" height="10" rx="3" fill="#29313B" stroke="#39434F" stroke-width="2"/>' },
  legext: { A:{head:[40,58],sho:[46,70],hip:[62,104],knee:[94,104],ankle:[98,140]},
           B:{head:[40,58],sho:[46,70],hip:[62,104],knee:[94,104],ankle:[116,106]},
           bones:[["sho","hip",8],["hip","knee",8],["knee","ankle",7]],
           extra:'<rect x="40" y="104" width="34" height="10" rx="3" fill="#29313B" stroke="#39434F" stroke-width="2"/><line x1="46" y1="114" x2="46" y2="158" stroke="#39434F" stroke-width="4"/>' },
  lunge: { A:{head:[65,30],sho:[64,46],hip:[63,90],kneeF:[78,124],ankleF:[78,160],kneeB:[48,128],ankleB:[40,160]},
           B:{head:[62,42],sho:[61,58],hip:[62,100],kneeF:[84,128],ankleF:[80,160],kneeB:[46,150],ankleB:[40,160]},
           bones:[["sho","hip",8],["hip","kneeF",8],["kneeF","ankleF",7],["hip","kneeB",8],["kneeB","ankleB",7]] },
  dips:  { A:{head:[60,36],sho:[60,52],hip:[62,92],knee:[64,118],ankle:[72,148],hand:[46,58]},
           B:{head:[60,50],sho:[60,68],hip:[62,104],knee:[64,128],ankle:[72,156],hand:[46,58]},
           bones:[["sho","hip",8],["hip","knee",7],["knee","ankle",6],["sho","hand",6]],
           extra:'<line x1="40" y1="58" x2="40" y2="120" stroke="#39434F" stroke-width="3"/>' },
};

// Welche Übung nutzt welche Bewegungsvorlage
const MAP = {
  squat_lh:"squat", frontsquat:"squat", gobletsquat:"squat", hacksquat:"squat", pausesquat:"squat", overheadsquat:"squat",
  bench_lh:"bench", smith_flat:"bench", smith_incl:"bench", bench_kh:"bench", incline_lh:"bench", incline_kh:"bench", incline_m:"bench", chestpress_m:"bench", chestpress_c:"bench",
  deadlift:"hinge", rdl_lh:"hinge", rdl_kh:"hinge", goodmorning:"hinge",
  ohp_lh:"ohp", ohp_kh:"ohp", ohp_m:"ohp", pushpress:"ohp",
  row_lh:"row", row_kh:"row", row_c:"row", row_m:"row", row_tbar:"row",
  pullup:"pull", weightedpull:"pull", chinup:"pull", pulldown_w:"pull", pulldown_c:"pull",
  curl_lh:"curl", curl_kh:"curl", curl_c:"curl", hammercurl:"curl", preacher:"curl",
  triceps_c:"pushdown", overheadtri:"pushdown", skullcrusher:"pushdown",
  hipthrust:"hipthrust",
  legext:"legext",
  lunges:"lunge", bulgarian:"lunge", stepup:"lunge",
  dips:"dips", ringdips:"dips",
};

const cache = {};
export function exerciseAnim(id) {
  const key = MAP[id];
  if (!key) return null;
  if (!cache[key]) cache[key] = build(T[key]);
  return cache[key];
}
export function hasAnim(id) { return !!MAP[id]; }
