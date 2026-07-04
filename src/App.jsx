import React, { useState, useMemo, useEffect, useRef } from "react";
import { loadState, saveState } from "./db.js";
import { EXERCISE_INFO } from "./exercises_info.js";
import { exerciseAnim, hasAnim } from "./exercises_anim.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FOCI = ["strength", "hypertrophy", "definition", "skill", "hybrid", "endurance", "weightlifting", "crossfit", "hyrox"];
const ex = (id,name,cat,muscles,pattern,fatigue,skill,equip,eff) => ({id,name,cat,muscles,pattern,fatigue,skill,equip,eff});
const EXERCISES = [
  ex("bench_lh","Bankdrücken (Langhantel)","main",["Brust","Trizeps","Schulter"],"push",3,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("bench_kh","Bankdrücken (Kurzhantel)","main",["Brust","Trizeps","Schulter"],"push",3,0,["kh"],[7,10,10,2,7,2,5,6,6]),
  ex("chestpress_m","Chest Press (Maschine)","assist",["Brust","Trizeps"],"push",2,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("chestpress_c","Chest Press (Kabel)","assist",["Brust","Trizeps"],"push",2,0,["kabel"],[4,9,9,2,7,2,5,6,6]),
  ex("incline_lh","Schrägbank (Langhantel)","assist",["Brust","Schulter"],"push",2,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("incline_kh","Schrägbank (Kurzhantel)","assist",["Brust","Schulter"],"push",2,0,["kh"],[7,10,10,2,7,2,5,6,6]),
  ex("incline_m","Schrägbank (Maschine)","assist",["Brust","Schulter"],"push",2,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("dips","Dips (Barren)","assist",["Brust","Trizeps","Schulter"],"push",2,2,["barren"],[6,7,7,6,7,4,5,8,6]),
  ex("ringdips","Dips an Ringen","assist",["Brust","Trizeps","Schulter"],"push",3,4,["barren"],[5,7,7,7,7,4,4,8,6]),
  ex("pushup","Liegestütze","assist",["Brust","Trizeps","Core"],"push",1,1,["kg"],[6,7,7,6,7,4,5,8,6]),
  ex("flyes_c","Cable Flyes","isolation",["Brust"],"push",1,0,["kabel"],[3,10,10,2,4,2,3,4,3]),
  ex("flyes_kh","KH Flyes","isolation",["Brust"],"push",1,0,["kh"],[3,9,9,2,4,2,3,4,3]),
  ex("pecdeck","Butterfly (Maschine)","isolation",["Brust"],"push",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("pullup","Klimmzüge","main",["Rücken","Bizeps"],"pull",2,3,["stange"],[6,7,7,6,7,4,5,8,6]),
  ex("weightedpull","Gewichtete Klimmzüge","main",["Rücken","Bizeps"],"pull",2,3,["stange"],[6,7,7,6,7,4,5,8,6]),
  ex("chinup","Chin-Ups (Untergriff)","assist",["Bizeps","Rücken"],"pull",2,2,["stange"],[6,7,7,6,7,4,5,8,6]),
  ex("pulldown_w","Latzug breit","assist",["Rücken","Bizeps"],"pull",1,0,["kabel"],[4,8,8,2,7,2,5,6,6]),
  ex("pulldown_c","Latzug eng","assist",["Rücken","Bizeps"],"pull",1,0,["kabel"],[4,8,8,2,7,2,5,6,6]),
  ex("row_lh","Langhantelrudern","main",["Rücken","Bizeps"],"pull",2,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("row_kh","Kurzhantelrudern","assist",["Rücken","Bizeps"],"pull",1,0,["kh"],[7,10,10,2,7,2,5,6,6]),
  ex("row_c","Sitzendes Rudern (Kabel)","assist",["Rücken","Bizeps"],"pull",1,0,["kabel"],[4,8,8,2,7,2,5,6,6]),
  ex("row_m","Rudern (Maschine)","assist",["Rücken","Bizeps"],"pull",1,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("row_tbar","T-Bar Rudern","assist",["Rücken"],"pull",2,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("ohp_lh","Überkopfdrücken (LH)","main",["Schulter","Trizeps"],"push",2,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("ohp_kh","Schulterdrücken (KH)","assist",["Schulter","Trizeps"],"push",2,0,["kh"],[7,10,10,2,7,2,5,6,6]),
  ex("ohp_m","Schulterdrücken (Maschine)","assist",["Schulter","Trizeps"],"push",2,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("pushpress","Push Press","assist",["Schulter","Trizeps"],"push",2,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("latraise_kh","Seitheben (KH)","isolation",["Schulter"],"push",1,0,["kh"],[3,8,8,2,4,2,3,4,3]),
  ex("latraise_c","Seitheben (Kabel)","isolation",["Schulter"],"push",1,0,["kabel"],[3,10,10,2,4,2,3,4,3]),
  ex("rearfly_kh","Reverse Flyes (KH)","isolation",["Schulter","Rücken"],"pull",1,0,["kh"],[3,8,8,2,4,2,3,4,3]),
  ex("facepull","Face Pulls","isolation",["Schulter","Rücken"],"pull",1,0,["kabel"],[3,9,9,2,4,2,3,4,3]),
  ex("squat_lh","Kniebeuge (Langhantel)","main",["Quadrizeps","Glutes","Core"],"squat",3,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("frontsquat","Frontkniebeuge","main",["Quadrizeps","Core"],"squat",3,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("gobletsquat","Goblet Squat","assist",["Quadrizeps","Glutes"],"squat",2,0,["kh"],[7,9,9,2,7,2,5,6,6]),
  ex("hacksquat","Hack Squat (Maschine)","assist",["Quadrizeps"],"squat",2,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("legpress","Beinpresse","assist",["Quadrizeps","Glutes"],"squat",2,0,["maschine"],[6,8,8,2,7,2,5,6,6]),
  ex("lunges","Ausfallschritte","assist",["Quadrizeps","Glutes"],"squat",2,0,["kh"],[7,9,9,2,7,2,5,6,6]),
  ex("bulgarian","Bulgarian Split Squat","assist",["Quadrizeps","Glutes"],"squat",2,0,["kh"],[7,9,9,2,7,2,5,6,6]),
  ex("pausesquat","Pause-Kniebeuge","assist",["Quadrizeps","Core"],"squat",3,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("legext","Beinstrecker","isolation",["Quadrizeps"],"squat",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("deadlift","Kreuzheben","main",["Rücken","Glutes","Hamstrings"],"hinge",3,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("rdl_lh","Rumänisches KH (LH)","assist",["Hamstrings","Glutes"],"hinge",2,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("rdl_kh","Rumänisches KH (KH)","assist",["Hamstrings","Glutes"],"hinge",2,0,["kh"],[7,10,10,2,7,2,5,6,6]),
  ex("goodmorning","Good Morning","assist",["Hamstrings","Rücken"],"hinge",2,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("hipthrust","Hip Thrust","assist",["Glutes","Hamstrings"],"hinge",2,0,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("legcurl_l","Beinbeuger liegend","isolation",["Hamstrings"],"hinge",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("legcurl_s","Beinbeuger sitzend","isolation",["Hamstrings"],"hinge",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("hyper","Hyperextension","isolation",["Rücken","Glutes"],"hinge",1,0,["kg"],[3,7,7,2,4,2,3,4,3]),
  ex("calf_st","Wadenheben stehend","isolation",["Waden"],"squat",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("calf_se","Wadenheben sitzend","isolation",["Waden"],"squat",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("curl_lh","Bizeps-Curls (LH)","isolation",["Bizeps"],"pull",1,0,["lh"],[3,7,7,2,4,2,3,4,3]),
  ex("curl_kh","Bizeps-Curls (KH)","isolation",["Bizeps"],"pull",1,0,["kh"],[3,9,9,2,4,2,3,4,3]),
  ex("curl_c","Bizeps-Curls (Kabel)","isolation",["Bizeps"],"pull",1,0,["kabel"],[3,10,10,2,4,2,3,4,3]),
  ex("hammercurl","Hammer-Curls","isolation",["Bizeps","Unterarm"],"pull",1,0,["kh"],[3,8,8,2,4,2,3,4,3]),
  ex("preacher","Scott-Curls","isolation",["Bizeps"],"pull",1,0,["maschine"],[3,8,8,2,4,2,3,4,3]),
  ex("triceps_c","Trizeps-Drücken (Kabel)","isolation",["Trizeps"],"push",1,0,["kabel"],[3,9,9,2,4,2,3,4,3]),
  ex("overheadtri","Overhead Trizeps","isolation",["Trizeps"],"push",1,0,["kabel"],[3,10,10,2,4,2,3,4,3]),
  ex("skullcrusher","Skullcrusher","isolation",["Trizeps"],"push",1,0,["lh"],[3,7,7,2,4,2,3,4,3]),
  ex("cgbench","Enges Bankdrücken","assist",["Trizeps","Brust"],"push",2,1,["lh"],[10,9,9,2,9,2,7,8,6]),
  ex("legraise","Hängendes Beinheben","isolation",["Core"],"core",1,1,["stange"],[3,7,7,2,4,2,3,4,3]),
  ex("plank","Plank","isolation",["Core"],"core",1,0,["kg"],[3,7,7,2,4,2,3,4,3]),
  ex("cablecrunch","Kabel-Crunch","isolation",["Core"],"core",1,0,["kabel"],[3,9,9,2,4,2,3,4,3]),
  ex("abwheel","Ab Wheel","isolation",["Core"],"core",1,1,["kg"],[3,7,7,2,4,2,3,4,3]),
  ex("snatch","Reißen (Snatch)","main",["Rücken","Schulter","Quadrizeps","Glutes"],"olympic",3,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("cleanjerk","Stoßen (Clean & Jerk)","main",["Rücken","Schulter","Quadrizeps","Glutes"],"olympic",3,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("powerclean","Power Clean","main",["Rücken","Glutes","Schulter"],"olympic",3,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("powersnatch","Power Snatch","assist",["Rücken","Schulter","Glutes"],"olympic",3,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("hangclean","Hang Clean","assist",["Rücken","Glutes","Schulter"],"olympic",2,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("overheadsquat","Überkopfkniebeuge","assist",["Quadrizeps","Schulter","Core"],"squat",3,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("pushjerk","Push Jerk","assist",["Schulter","Quadrizeps"],"olympic",2,2,["lh"],[7,9,9,2,9,2,10,9,6]),
  ex("thruster","Thruster","assist",["Quadrizeps","Schulter","Glutes"],"squat",2,1,["lh"],[10,9,7,2,9,8,7,9,9]),
  ex("wallball","Wall Balls","assist",["Quadrizeps","Schulter"],"squat",2,1,["kg"],[4,2,7,2,8,8,7,9,9]),
  ex("burpee","Burpees","assist",["Brust","Quadrizeps","Core"],"push",2,1,["kg"],[1,2,6,2,8,10,2,9,10]),
  ex("boxjump","Box Jumps","assist",["Quadrizeps","Glutes"],"squat",2,1,["box"],[4,2,7,2,8,8,7,9,9]),
  ex("kbswing","Kettlebell Swing","assist",["Glutes","Hamstrings","Rücken"],"hinge",2,1,["kettlebell"],[4,2,7,2,8,8,7,9,9]),
  ex("kbsnatch","Kettlebell Snatch","assist",["Schulter","Glutes"],"hinge",2,2,["kettlebell"],[4,2,7,2,8,8,7,9,9]),
  ex("sledpush","Sled Push","assist",["Quadrizeps","Glutes"],"squat",2,0,["schlitten"],[4,2,7,2,8,8,5,9,10]),
  ex("sledpull","Sled Pull","assist",["Rücken","Quadrizeps"],"pull",2,0,["schlitten"],[4,2,7,2,8,8,5,9,10]),
  ex("farmers","Farmer's Carry","assist",["Unterarm","Core","Trapez"],"carry",2,0,["kh"],[4,2,7,2,8,8,5,9,10]),
  ex("sandbag","Sandbag Lunges","assist",["Quadrizeps","Glutes","Core"],"squat",2,0,["sandsack"],[4,2,7,2,8,8,5,9,10]),
  ex("doubleunders","Double Unders (Seil)","skill",["Waden","Core"],"skill",1,2,["seil"],[1,2,6,6,8,10,2,9,10]),
  ex("run","Laufen (draußen)","conditioning",["Beine","Herz"],"cardio",2,0,["kg"],[1,3,6,2,6,10,2,7,10]),
  ex("jogging","Lockeres Joggen","conditioning",["Beine","Herz"],"cardio",1,0,["kg"],[1,3,6,2,6,10,2,7,10]),
  ex("sprint","Sprint-Intervalle","conditioning",["Beine","Herz"],"cardio",2,0,["kg"],[1,2,6,2,8,10,2,9,10]),
  ex("row_erg","Rudergerät (Erg)","conditioning",["Rücken","Beine","Herz"],"cardio",2,0,["erg"],[1,2,6,2,8,10,2,9,10]),
  ex("ski_erg","Ski-Erg","conditioning",["Rücken","Core","Herz"],"cardio",2,0,["erg"],[1,2,6,2,8,10,2,9,10]),
  ex("bike_erg","Bike-Erg / Assault Bike","conditioning",["Beine","Herz"],"cardio",2,0,["erg"],[1,2,6,2,8,10,2,9,10]),
  ex("stairmaster","Stairmaster","conditioning",["Beine","Herz"],"cardio",1,0,["maschine"],[1,3,6,2,6,10,2,7,10]),
  ex("incline_walk","Steigungs-Gehen","conditioning",["Beine","Herz"],"cardio",1,0,["maschine"],[1,3,6,2,6,10,2,7,10]),
  ex("swimming","Schwimmen","conditioning",["Ganzkörper","Herz"],"cardio",2,0,["kg"],[1,3,6,2,6,10,2,7,10]),
  ex("speedrope","Seilspringen","conditioning",["Waden","Herz"],"cardio",1,1,["seil"],[1,2,6,2,8,10,2,9,10]),
  ex("handstand","Handstand","skill",["Schulter","Core"],"skill",1,3,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("planche","Planche","skill",["Schulter","Brust","Core"],"skill",2,3,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("frontlever","Front-Lever","skill",["Rücken","Core"],"skill",2,3,["stange"],[4,3,3,10,4,2,2,6,3]),
  ex("backlever","Back-Lever","skill",["Rücken","Brust"],"skill",1,3,["stange"],[4,3,3,10,4,2,2,6,3]),
  ex("muscleup","Muscle-Up","skill",["Rücken","Brust","Trizeps"],"skill",2,3,["stange"],[4,3,3,10,4,2,2,6,3]),
  ex("oap","Einarmiger Liegestütz","skill",["Brust","Trizeps","Core"],"skill",1,3,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("lsit","L-Sit","skill",["Core"],"skill",1,2,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("pistol","Pistol Squat","skill",["Quadrizeps","Glutes"],"skill",1,2,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("tireflip","Reifen-Flip (Tire Flip)","assist",["Glutes","Rücken","Quadrizeps"],"hinge",3,1,["sandsack"],[4,2,7,2,8,8,7,9,10]),
  ex("atlasstone","Atlas Stone over Shoulder","assist",["Rücken","Glutes","Core"],"hinge",3,1,["sandsack"],[4,2,7,2,8,8,7,9,9]),
  ex("yoke","Yoke Walk","assist",["Core","Quadrizeps","Trapez"],"carry",3,0,["schlitten"],[4,2,7,2,8,8,5,9,10]),
  ex("logpress","Log Press","assist",["Schulter","Trizeps"],"push",2,1,["lh"],[4,2,7,2,8,8,7,9,9]),
  ex("ropeclimb","Tauklettern","assist",["Rücken","Bizeps","Core"],"pull",2,2,["seil"],[6,7,7,6,8,8,5,9,9]),
  ex("devilspress","Devil's Press","assist",["Brust","Schulter","Glutes"],"push",2,1,["kh"],[4,2,7,2,8,8,7,9,9]),
  ex("manmaker","Man Makers","assist",["Brust","Rücken","Core"],"push",2,1,["kh"],[4,2,7,2,8,8,7,9,9]),
  ex("dballclean","D-Ball Clean (Slam Ball)","assist",["Glutes","Rücken"],"hinge",2,1,["sandsack"],[4,2,7,2,8,8,7,9,9]),
  ex("turkishget","Turkish Get-Up","assist",["Core","Schulter"],"core",2,2,["kettlebell"],[4,2,7,2,8,8,5,9,9]),
  ex("kbclean","Kettlebell Clean","assist",["Glutes","Schulter"],"hinge",2,1,["kettlebell"],[4,2,7,2,8,8,7,9,9]),
  ex("stepup","Step-ups (gewichtet)","assist",["Quadrizeps","Glutes"],"squat",2,0,["kh"],[7,9,9,2,7,2,5,6,6]),
  ex("prowler","Prowler Push","assist",["Quadrizeps","Glutes"],"squat",2,0,["schlitten"],[4,2,7,2,8,8,5,9,10]),
  ex("broadjump","Standweitsprung","assist",["Quadrizeps","Glutes"],"squat",1,1,["kg"],[4,2,7,2,8,8,7,9,9]),
  ex("ghdsitup","GHD Sit-ups","isolation",["Core"],"core",1,1,["maschine"],[3,7,7,2,8,8,3,9,9]),
  ex("toestobar","Toes-to-Bar","isolation",["Core"],"core",1,1,["stange"],[4,2,7,2,8,8,2,9,9]),
  ex("wallwalk","Wall Walk","skill",["Schulter","Core"],"skill",1,2,["kg"],[4,2,7,10,8,8,2,9,9]),
  ex("hspu","Handstand-Liegestütz (HSPU)","skill",["Schulter","Trizeps"],"skill",2,3,["kg"],[4,3,3,10,4,2,2,6,3]),
  ex("battlerope","Battle Ropes","conditioning",["Schulter","Core","Herz"],"cardio",2,0,["seil"],[1,2,6,2,8,10,2,9,10]),
  ex("assaultrun","Laufband-Sprint (Assault Runner)","conditioning",["Beine","Herz"],"cardio",2,0,["maschine"],[1,2,6,2,8,10,2,9,10]),
];

/* ---------- FOKUS-BAUSTEINE (mit Konditionierungs-Anteil condW) ----------- */
const FOCUSES = {
  strength:    { label: "Maximalkraft",    mainReps: 4,  mainPct: 0.87, accReps: 6,  isoReps: 10, volBias: 0.2, skillW: 0,   volTarget: 12, condW: 0.1, prot: 2.0, kcalAdj: 0 },
  hypertrophy: { label: "Muskelaufbau",    mainReps: 8,  mainPct: 0.73, accReps: 10, isoReps: 14, volBias: 1.0, skillW: 0,   volTarget: 18, condW: 0.1, prot: 2.0, kcalAdj: 200 },
  definition:  { label: "Definition",      mainReps: 12, mainPct: 0.68, accReps: 14, isoReps: 17, volBias: 0.9, skillW: 0.1, volTarget: 15, condW: 0.5, prot: 2.2, kcalAdj: -400 },
  skill:       { label: "Calisthenics",    mainReps: 5,  mainPct: 0.80, accReps: 8,  isoReps: 12, volBias: 0.3, skillW: 1.0, volTarget: 10, condW: 0.1, prot: 1.8, kcalAdj: 0 },
  hybrid:      { label: "Hybrid",          mainReps: 6,  mainPct: 0.78, accReps: 8,  isoReps: 12, volBias: 0.6, skillW: 0.3, volTarget: 13, condW: 0.6, prot: 2.0, kcalAdj: 0 },
  endurance:   { label: "Ausdauer",        mainReps: 15, mainPct: 0.55, accReps: 18, isoReps: 20, volBias: 0.3, skillW: 0,   volTarget: 9, condW: 1.0, prot: 1.6, kcalAdj: -200 },
  weightlifting:{ label: "Gewichtheben",   mainReps: 3,  mainPct: 0.85, accReps: 5,  isoReps: 8,  volBias: 0.3, skillW: 0.2, volTarget: 11, condW: 0.2, prot: 2.0, kcalAdj: 100 },
  crossfit:    { label: "CrossFit",        mainReps: 8,  mainPct: 0.72, accReps: 10, isoReps: 12, volBias: 0.6, skillW: 0.4, volTarget: 13, condW: 0.9, prot: 2.0, kcalAdj: 0 },
  hyrox:       { label: "Hyrox",           mainReps: 12, mainPct: 0.62, accReps: 12, isoReps: 15, volBias: 0.4, skillW: 0.1, volTarget: 10, condW: 1.0, prot: 1.9, kcalAdj: -200 },
};
const FOCUS_KEYS = Object.keys(FOCUSES);
const effOf = (e, fkey) => e.eff[FOCI.indexOf(fkey)] || 0;

function blendFocus(focuses) {
  const valid = focuses.filter((f) => f.weight > 0);
  const tot = valid.reduce((s, f) => s + f.weight, 0) || 1;
  const acc = { mainReps: 0, mainPct: 0, accReps: 0, isoReps: 0, volBias: 0, skillW: 0, condW: 0, volTarget: 0, prot: 0, kcalAdj: 0 };
  valid.forEach((f) => { const F = FOCUSES[f.key], w = f.weight / tot; for (const k in acc) acc[k] += F[k] * w; });
  return { mainReps: Math.max(1, Math.round(acc.mainReps)), mainPct: Math.max(0.5, Math.min(0.92, acc.mainPct)), accReps: Math.round(acc.accReps), isoReps: Math.round(acc.isoReps), volBias: acc.volBias, skillW: acc.skillW, condW: acc.condW, volTarget: Math.round(acc.volTarget), prot: acc.prot, kcalAdj: Math.round(acc.kcalAdj / 50) * 50, weights: valid.map((f) => ({ key: f.key, w: f.weight / tot })) };
}
/* gewichteter Effektivitäts-Score einer Übung über den Fokus-Mix (0-10) */
function blendEff(e, blend) { return blend.weights.reduce((s, w) => s + effOf(e, w.key) * w.w, 0); }
const primaryFocus = (focuses) => { const v = [...focuses].filter((f) => f.weight > 0).sort((a, b) => b.weight - a.weight); return v[0]?.key; };

/* Empfehlungen: beste Übungen je Kategorie nach gewichtetem Effektivitäts-Score */
function recommend(blend, cat, equip, injuries, n) {
  return EXERCISES.filter((e) => e.cat === cat)
    .filter((e) => (e.equip.some((q) => equip[q]) || e.equip.includes("kg")) && !e.muscles.some((m) => injuries[m]))
    .map((e) => ({ e, score: blendEff(e, blend) }))
    .sort((a, b) => b.score - a.score).slice(0, n);
}
/* Komplemente zu einer Grundübung: gleiche Muskel/Pattern-Familie, nach Effektivität */
function complementsFor(mainEx, blend, equip, injuries) {
  const fam = (e) => e.muscles.some((m) => mainEx.muscles.includes(m)) || e.pattern === mainEx.pattern;
  const pick = (cat) => EXERCISES.filter((e) => e.cat === cat && e.id !== mainEx.id && fam(e))
    .filter((e) => (e.equip.some((q) => equip[q]) || e.equip.includes("kg")) && !e.muscles.some((m) => injuries[m]))
    .map((e) => ({ e, score: Math.round(blendEff(e, blend) * 10) / 10 }))
    .sort((a, b) => b.score - a.score);
  return { assist: pick("assist").slice(0, 6), isolation: pick("isolation").slice(0, 5) };
}

const EQUIP_LABELS = { lh:"Langhantel", kh:"Kurzhanteln", kabel:"Kabelzug", maschine:"Maschinen", kg:"Körpergewicht", stange:"Klimmzugstange", barren:"Dip-Barren", erg:"Ergometer/Rudergerät", schlitten:"Schlitten (Sled)", sandsack:"Sandsack", kettlebell:"Kettlebell", box:"Box (Sprungbox)", seil:"Springseil" };
const ALL_EQUIP = Object.keys(EQUIP_LABELS);
const MUSCLE_LIST = ["Brust","Rücken","Schulter","Quadrizeps","Hamstrings","Glutes","Bizeps","Trizeps","Core","Waden"];
const CAT_LABELS = { main:"Grundübungen", assist:"Assistenz", isolation:"Isolation", skill:"Calisthenics-Skills", conditioning:"Cardio / Ausdauer" };
const byId = (id) => EXERCISES.find((e) => e.id === id);

const EXP = { beginner:{label:"Anfänger",sets:3}, intermediate:{label:"Fortgeschritten",sets:4}, advanced:{label:"Sehr erfahren",sets:5} };
const PHASES = [
  { key:"P1", label:"P1 · Eingewöhnung", repsAdd:2, pctAdd:-0.07, note:"Technik & Volumen" },
  { key:"P2", label:"P2 · Aufbau", repsAdd:0, pctAdd:0, note:"Ziel-Intensität" },
  { key:"P3", label:"P3 · Intensivierung", repsAdd:-1, pctAdd:0.05, note:"schwerer" },
  { key:"DL", label:"Deload", repsAdd:1, pctAdd:-0.2, note:"Erholung" },
];
function phaseForWeek(week, total){ if(total<=1)return 1; if(week>=total)return 3; const p=(week-1)/Math.max(1,total-2); if(p<=0.34)return 0; if(p<=0.67)return 1; return 2; }
const PHASE_COLORS = ["#0F766E","#7A4A00","#8B0A0A","#15803D"];
const WEEKDAYS = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const TIME_COST = { main:12, assist:8, isolation:5, skill:7, conditioning:14 };
const WARMUP = 12;

function available(picked, equip, injuries){ return EXERCISES.filter((e)=>picked[e.id]).filter((e)=>(e.equip.some((q)=>equip[q])||e.equip.includes("kg"))&&!e.muscles.some((m)=>injuries[m])); }

function scoreSelection(sel, blend, budget){
  if(sel.length===0) return { pct:0, reasons:[{ok:false,t:"Noch keine Übungen verfügbar/gewählt"}], perDay:0 };
  const reasons=[]; let score=100;
  const time=WARMUP+sel.reduce((s,e)=>s+TIME_COST[e.cat],0);
  const push=sel.filter((e)=>e.pattern==="push").length, pull=sel.filter((e)=>e.pattern==="pull").length;
  if(push||pull){ const r=pull===0?push:push/pull; if(push&&pull&&r>=0.7&&r<=1.4)reasons.push({ok:true,t:`Push:Pull ausgewogen (${push}:${pull})`}); else {score-=Math.min(20,Math.abs(push-pull)*5); reasons.push({ok:false,t:`Push:Pull unausgewogen (${push}:${pull})`});} }
  const cov=new Set(); sel.forEach((e)=>e.muscles.forEach((m)=>cov.add(m)));
  const miss=["Brust","Rücken","Quadrizeps","Hamstrings","Schulter"].filter((m)=>!cov.has(m));
  if(!miss.length)reasons.push({ok:true,t:"Große Muskelgruppen abgedeckt"}); else {score-=miss.length*5; reasons.push({ok:false,t:`Fehlt: ${miss.join(", ")}`});}
  const mains=sel.filter((e)=>e.cat==="main").length;
  if(mains)reasons.push({ok:true,t:`${mains} Grundübung(en) als Anker`}); else {score-=22; reasons.push({ok:false,t:"Kein Kraftanker"});}
  const avgEff=sel.reduce((s,e)=>s+blendEff(e,blend),0)/sel.length;
  if(avgEff>=7)reasons.push({ok:true,t:`Übungswahl top für dein Ziel (Ø ${avgEff.toFixed(1)}/10)`});
  else if(avgEff>=5)reasons.push({ok:true,t:`Übungswahl solide (Ø ${avgEff.toFixed(1)}/10)`});
  else {score-=12; reasons.push({ok:false,t:`Übungen wenig zielgerichtet (Ø ${avgEff.toFixed(1)}/10)`});}
  const cond=sel.filter((e)=>e.cat==="conditioning").length;
  if(blend.condW>=0.6&&cond===0){score-=12; reasons.push({ok:false,t:"Ziel braucht Cardio/Kondition – keine gewählt"});}
  else if(blend.condW>=0.5&&cond>=1)reasons.push({ok:true,t:`Cardio/Kondition vorhanden (${cond})`});
  const skill=sel.filter((e)=>e.pattern==="skill").length;
  if(blend.skillW>=0.5&&skill<3){score-=10; reasons.push({ok:false,t:"Skill-Fokus, aber wenige Skills"});}
  const perDay=mains?Math.round(time/mains):time;
  if(perDay>budget){score-=Math.min(15,Math.round((perDay-budget)/3)); reasons.push({ok:false,t:`~${perDay} min/Tag über Budget`});} else reasons.push({ok:true,t:`~${perDay} min/Tag im Budget`});
  return { pct:Math.max(0,Math.min(100,Math.round(score))), reasons, perDay };
}

function buildPlan(sel, blend, expKey, budget, phaseIdx, oneRM, trainDays){
  const baseSets=EXP[expKey].sets, ph=PHASES[phaseIdx];
  const sets=baseSets+(blend.volBias>=0.7?1:0);
  const reps=Math.max(1,blend.mainReps+ph.repsAdd);
  const repHi=reps+(blend.volBias>=0.7?3:blend.mainPct>=0.85?1:2); // obere Grenze für Double Progression
  const pct=Math.max(0.5,Math.min(0.95,blend.mainPct+ph.pctAdd));
  const accSets=blend.volBias>=0.7?4:3;
  const mains=sel.filter((e)=>e.cat==="main"), assist=sel.filter((e)=>e.cat==="assist"), iso=sel.filter((e)=>e.cat==="isolation"), skills=sel.filter((e)=>e.cat==="skill"), cond=sel.filter((e)=>e.cat==="conditioning");
  const days=[];
  // Wöchentliches Volumen-Budget pro Muskelgruppe (fokus-abhängig) + Frequenz-Steuerung.
  const target=blend.volTarget||14;
  const maxFreq=blend.volBias>=0.9?3:2;            // max. Tage pro Muskel/Woche
  const vol={};                                    // Muskel -> geplante Sätze/Woche
  const dayCount={};                               // Muskel -> an wie vielen Tagen schon
  const addVol=(ms,n)=>ms.forEach((mm)=>{vol[mm]=(vol[mm]||0)+n;});
  const needs=(e)=>e.muscles.some((mm)=>(vol[mm]||0)<target);
  const freqOk=(e)=>e.muscles.some((mm)=>(dayCount[mm]||0)<maxFreq);
  const usedIds=new Set();
  // Grundübungen nach Effektivität sortieren, dann auf Tage nach Muster gruppieren
  const mainsByEff=mains.map((e)=>({e,s:blendEff(e,blend)})).sort((a,b)=>b.s-a.s).map((x)=>x.e);
  const skillDay=skills.length>0, cardioDay=cond.length>0&&blend.condW>=0.4;
  const mainDays=Math.max(1,(trainDays||5)-(skillDay?1:0)-(cardioDay?1:0));
  const templates=sessionTemplates(mainDays);
  const usage={};  // id -> wie oft schon als Hauptübung genutzt (für Rotation/Variation)
  const pickMain=(pats,exclMove,diffFrom,exclId)=>{
    let cands=mainsByEff.filter((m)=>pats.includes(m.pattern));
    if(exclId) cands=cands.filter((m)=>m.id!==exclId);
    if(!cands.length) return null;
    let pool=exclMove?cands.filter((m)=>moveKey(m)!==exclMove):cands;
    if(diffFrom){ const d=pool.filter((m)=>m.muscles[0]!==diffFrom.muscles[0]); if(d.length) pool=d; }
    if(!pool.length){ if(exclMove) return null; pool=cands; } // Sekundär: kein Fallback auf gleiche Bewegung/Primär
    pool=pool.slice().sort((a,b)=>(usage[a.id]||0)-(usage[b.id]||0)||blendEff(b,blend)-blendEff(a,blend));
    return pool[0];
  };
  templates.forEach((pats)=>{
    const primary=pickMain(pats);
    if(!primary) return;
    usage[primary.id]=(usage[primary.id]||0)+1;
    // Bein-Tag: Quadrizeps + hintere Kette koppeln (sichert Kreuzheben auf dem Bein-Tag)
    let secondary;
    const legDay=pats.includes("hinge")&&(pats.includes("squat")||pats.includes("olympic"));
    if(legDay&&["squat","hinge","olympic"].includes(primary.pattern)){
      const wantPat=primary.pattern==="hinge"?"squat":"hinge";
      secondary=pickMain([wantPat],moveKey(primary),primary,primary.id);
    }
    if(!secondary) secondary=pickMain(pats,moveKey(primary),primary,primary.id); // sonst: andere Bewegung, anderer Muskel, nie = Primär
    if(secondary) usage[secondary.id]=(usage[secondary.id]||0)+1;
    let dayMains=secondary?[primary,secondary]:[primary];
    // Garantie: enthält der Tag das Hüftmuster, ist auch ein Hüftscharnier (z.B. Kreuzheben) dabei
    if(pats.includes("hinge")&&!dayMains.some((x)=>x.pattern==="hinge")){
      const h=pickMain(["hinge"],null,null,primary.id);
      if(h){ if(dayMains.length>1){usage[dayMains[1].id]--;dayMains[1]=h;}else{dayMains.push(h);} usage[h.id]=(usage[h.id]||0)+1; }
    }
    const dayMuscles=new Set();
    let used=WARMUP;
    const first=dayMains[0];
    const mob=first.muscles.includes("Quadrizeps")||first.muscles.includes("Glutes")?"5 min Rad/Gehen + Hüft-/Sprunggelenk-Mobility":"5 min Seil/Rudern + Schulterkreisen + Band Pull-aparts";
    const ramp=warmupRamp(oneRM[first.id],pct);
    const blocks=[{ tag:"Warm-up", color:"#B45309", items:[{id:"wu_"+first.id,n:mob+(ramp?" → Aufwärmsätze: "+ramp:" + 2 leichte Aufwärmsätze"),s:"~8 min",w:""}] }];
    // Kraft-Block(s) für die Grundübungen des Tages
    const overlaps=(a,b)=>a.muscles[0]===b.muscles[0]||a.muscles.filter((x)=>b.muscles.includes(x)).length>=2;
    const kraftItems=dayMains.map((m,idx)=>{ const isOly=m.pattern==="olympic";
      const reduced=idx>0&&overlaps(m,primary);          // nur reduzieren, wenn gleiche Muskeln wie Primärübung
      const mSets=idx===0?(isOly?5:sets):(reduced?Math.max(2,Math.round(sets/2)):(isOly?4:sets));
      const repStr=isOly?"2\u20133":`${reps}\u2013${repHi}`;
      addVol(m.muscles,mSets); m.muscles.forEach((mm)=>dayMuscles.add(mm)); usedIds.add(m.id); used+=TIME_COST.main;
      return {id:m.id,n:m.name+(reduced?" (ergänzend)":"")+(isOly?" · explosiv":""),s:`${mSets}×${repStr}`,w:oneRM[m.id]?`${(Math.round((oneRM[m.id]*(isOly?0.75:pct))/2.5)*2.5).toFixed(1)} kg`:(isOly?"~75% · Technik":`${Math.round(pct*100)}% 1RM`),track:true}; });
    blocks.push({ tag:"Kraft", color:"#8B0A0A", rest:restFor("main",blend), rir:RIR_BY_PHASE[phaseIdx], items:kraftItems });
    // Assistenz: passend zu den Tagesmuskeln, nach Effektivität, Volumen + Zeit begrenzt
    const fam=(e)=>e.muscles.some((mm)=>dayMuscles.has(mm))||dayMains.some((dm)=>dm.pattern===e.pattern);
    const dA=assist.filter(fam).filter((e)=>!usedIds.has(e.id)&&e.pattern!=="olympic").map((e)=>({e,s:blendEff(e,blend)})).sort((a,b)=>b.s-a.s).map((x)=>x.e);
    const pA=[]; for(const a of dA){ if(used+TIME_COST.assist<=budget&&pA.length<3&&needs(a)){pA.push(a);used+=TIME_COST.assist;addVol(a.muscles,accSets);a.muscles.forEach((mm)=>dayMuscles.add(mm));usedIds.add(a.id);} }
    if(pA.length)blocks.push({ tag:"Volumen", color:"#7A4A00", rest:restFor("assist",blend), rir:Math.max(1,RIR_BY_PHASE[phaseIdx]-1), items:pA.map((a)=>{const aw=assistWeight(a.id,oneRM,pct); return {id:a.id,n:a.name,s:`${accSets}×${blend.accReps}\u2013${blend.accReps+4}`,w:aw?`${aw} kg`:"nach Gefühl",track:true};}) });
    // Isolation
    const dI=iso.filter((e)=>e.muscles.some((mm)=>dayMuscles.has(mm))).filter((e)=>!usedIds.has(e.id)).map((e)=>({e,s:blendEff(e,blend)})).sort((a,b)=>b.s-a.s).map((x)=>x.e);
    const pI=[]; for(const a of dI){ if(used+TIME_COST.isolation<=budget&&pI.length<2&&needs(a)){pI.push(a);used+=TIME_COST.isolation;addVol(a.muscles,2);usedIds.add(a.id);} }
    if(pI.length)blocks.push({ tag:"Finisher", color:"#15803D", rest:restFor("isolation",blend), rir:0, items:pI.map((a)=>({id:a.id,n:a.name,s:`2×${blend.isoReps}\u2013${blend.isoReps+5}`,w:"nach Gefühl"})) });
    blocks.push({ tag:"Cool-down", color:"#0F766E", items:[{id:"cd_"+first.id,n:"Dehnen der trainierten Muskeln ("+[...dayMuscles].slice(0,3).join(", ")+") + lockeres Auslaufen",s:"~6 min",w:""}] });
    // Frequenz hochzählen (distinct Tage je Muskel)
    dayMuscles.forEach((mm)=>{dayCount[mm]=(dayCount[mm]||0)+1;});
    const label=SESSION_LABEL(pats);
    days.push({ title:`${label}: ${dayMains.map((m)=>m.name).join(" + ")}`, time:used+14, blocks });
  });
  skills.forEach((sk)=>usedIds.add(sk.id)); cond.forEach((c)=>usedIds.add(c.id));
  if(skills.length)days.push({ title:"Calisthenics", time:WARMUP+skills.length*TIME_COST.skill, blocks:[{tag:"Skill",color:"#2A0F45",items:skills.map((s)=>({id:s.id,n:s.name,s:"4×Prog.",w:"RPE 7"}))}] });
  if(cond.length&&blend.condW>=0.4)days.push({ title:"Cardio / Kondition", time:WARMUP+cond.length*TIME_COST.conditioning+14, blocks:[
    {tag:"Warm-up",color:"#B45309",items:[{id:"wu_cardio",n:"5 min lockeres Einrollen + dynamisches Dehnen",s:"~5 min",w:""}]},
    {tag:"Cardio",color:"#0F766E",items:cond.map((c)=>({id:c.id,n:c.name,s:blend.condW>=0.8?"20–30 min":"15–20 min",w:blend.condW>=0.8?"zügig (zonen 3–4)":"locker (zone 2)"}))},
    {tag:"Cool-down",color:"#0F766E",items:[{id:"cd_cardio",n:"Auslaufen + Beine/Hüfte dehnen",s:"~6 min",w:""}]}
  ] });
  return { days, usedIds, vol, target };
}

const DAYPAT={1:[3],2:[1,4],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,4,5],6:[0,1,2,3,4,5],7:[0,1,2,3,4,5,6]};
function weeklySchedule(plan, daysPerWeek, budget){
  if(plan.length===0) return WEEKDAYS.map((d)=>({day:d,trainings:[]}));
  const slots=Math.min(Math.max(1,daysPerWeek),7);
  const used=plan.length<=slots?plan.length:slots;
  const pat=DAYPAT[used]||[0,1,2,3,4,5,6].slice(0,used);
  const buckets=Array.from({length:used},()=>[]);
  // Reihenfolge der Einheiten beibehalten — die Template-Reihenfolge (Push/Pull/Beine…)
  // verteilt die Muskelgruppen bereits gleichmäßig über die Woche.
  if(plan.length<=used){
    plan.forEach((w,i)=>buckets[i].push(w));
  } else {
    // mehr Einheiten als Tage: der Reihe nach round-robin verteilen (Reihenfolge bleibt grob erhalten)
    plan.forEach((w,i)=>buckets[i%used].push(w));
  }
  return WEEKDAYS.map((d,i)=>{const idx=pat.indexOf(i); return {day:d,trainings:idx>=0?buckets[idx]:[]};});
}
/* Double Progression: erst Wdh. bis Bereichs-Maximum, dann Gewicht hoch */
function nextFromSets(weight,setsArr,lo,hi){const w=parseFloat(weight);if(isNaN(w))return "";const a=(setsArr||[]).map((x)=>parseInt(x)).filter((x)=>!isNaN(x));if(!a.length)return "";const allTop=a.every((r)=>r>=hi);const missLo=a.some((r)=>r<lo-1);const f=allTop?1.025:missLo?0.975:1;return (Math.round((w*f)/2.5)*2.5).toFixed(1);}
function setsStatus(setsArr,lo,hi){const a=(setsArr||[]).map((x)=>parseInt(x)).filter((x)=>!isNaN(x));if(!a.length)return null;const allTop=a.every((r)=>r>=hi);const allLo=a.every((r)=>r>=lo);const missLo=a.some((r)=>r<lo-1);if(allTop)return {t:`Bereichs-Maximum (${hi}) erreicht → nächste Woche Gewicht +2,5 %, Wdh. zurück auf ${lo}`,c:"#15803D"};if(allLo)return {t:`im Bereich → gleiche Last, Wdh. Richtung ${hi} steigern`,c:"#B45309"};if(missLo)return {t:`unter ${lo} → Gewicht reduzieren`,c:"#9D174D"};return {t:"gemischt → Last halten",c:"#B45309"};}
/* geschätztes 1RM (Epley) aus bestem Satz */
function e1rm(weight,reps){const w=parseFloat(weight),r=parseInt(reps);if(isNaN(w)||isNaN(r)||r<1)return null;return Math.round(w*(1+r/30));}
const nextWeight=(cur,rating)=>{const w=parseFloat(cur); if(isNaN(w))return ""; const f=rating==="leicht"?1.025:rating==="schwer"?0.975:1; return (Math.round((w*f)/2.5)*2.5).toFixed(1);};


/* Musterplan: wählt automatisch die effektivsten Übungen passend zum Volumen-Budget */
function autoSelect(blend, equip, injuries, expKey){
  const ok=(e)=>(e.equip.some((q)=>equip[q])||e.equip.includes("kg"))&&!e.muscles.some((m)=>injuries[m]);
  const pick={};
  const target=blend.volTarget||14;
  const sets=EXP[expKey].sets+(blend.volBias>=0.7?1:0);
  const accSets=blend.volBias>=0.7?4:3;
  const vol={}; const addVol=(ms,n)=>ms.forEach((mm)=>{vol[mm]=(vol[mm]||0)+n;});
  const need=(e)=>e.muscles.some((mm)=>(vol[mm]||0)<target);
  const score=(e)=>blendEff(e,blend);
  // 1) Grundübungen: beste 3-4 nach Effektivität (decken Hauptmuster ab)
  const mains=EXERCISES.filter((e)=>e.cat==="main"&&ok(e)).map((e)=>({e,s:score(e)})).sort((a,b)=>b.s-a.s);
  const rec=recommendedDays(blend,expKey); const willSkill=blend.skillW>=0.3, willCond=blend.condW>=0.4;
  const wantMains=Math.max(2, rec.hi - (willSkill?1:0) - (willCond?1:0));
  // 1) Grundübungen: Druck & Zug je 2 verschiedene (für Variation an wiederholten Tagen), Knie & Hüfte je 1
  const moveK=(e)=>MOVE_KEY[e.id]||e.id;
  const pickPat=(pat,count)=>{ const seen=new Set(); let n=0; for(const {e} of mains){ if(n>=count)break; if(e.pattern!==pat||pick[e.id])continue; if(seen.has(moveK(e)))continue; pick[e.id]="main"; seen.add(moveK(e)); addVol(e.muscles,sets); n++; } };
  const rep = rec.hi>=5; // ab 5 Tagen wiederholen sich Druck/Zug-Tage -> 2 Varianten nötig
  pickPat("push", rep?2:1);
  pickPat("pull", rep?2:1);
  pickPat("squat", 1);
  pickPat("hinge", 1);
  // optional olympisch (für Weightlifting/CrossFit relevant)
  if((blend.skillW>=0.3||blend.condW>=0.4)){ const o=mains.find(({e})=>e.pattern==="olympic"&&!pick[e.id]); if(o)pick[o.e.id]="main"; }
  // 2) Assistenz: nach Effektivität, bis Volumen je Muskel gedeckt
  EXERCISES.filter((e)=>e.cat==="assist"&&ok(e)).map((e)=>({e,s:score(e)})).sort((a,b)=>b.s-a.s).forEach(({e})=>{ if(need(e)){pick[e.id]="assist";addVol(e.muscles,accSets);} });
  // 3) Isolation: füllt Restvolumen kleiner Muskeln
  EXERCISES.filter((e)=>e.cat==="isolation"&&ok(e)).map((e)=>({e,s:score(e)})).sort((a,b)=>b.s-a.s).forEach(({e})=>{ if(need(e)){pick[e.id]="iso";addVol(e.muscles,2);} });
  // 4) Skills, wenn Fokus es will
  if(blend.skillW>=0.3){ EXERCISES.filter((e)=>e.cat==="skill"&&ok(e)).slice(0,blend.skillW>=0.7?5:2).forEach((e)=>{pick[e.id]="skill";}); }
  // 5) Cardio/Kondition, wenn Fokus es will
  if(blend.condW>=0.4){ EXERCISES.filter((e)=>e.cat==="conditioning"&&ok(e)).map((e)=>({e,s:score(e)})).sort((a,b)=>b.s-a.s).slice(0,blend.condW>=0.8?3:1).forEach(({e})=>{pick[e.id]="cond";}); }
  const out={}; Object.keys(pick).forEach((id)=>out[id]=true); return out;
}

/* Assistenz-Gewicht wird vom ARBEITSGEWICHT des passenden Hauptlifts abgeleitet.
   factor = Anteil des Hauptlift-Arbeitsgewichts. Quelle: Trainingspraxis.        */
const ASSIST_FROM = {
  // von Bankdrücken
  cgbench:[["bench_lh","bench_kh"],0.85], incline_lh:[["bench_lh","bench_kh"],0.80], incline_kh:[["bench_lh","bench_kh"],0.40],
  incline_m:[["bench_lh","bench_kh"],0.85], dbbench:[["bench_lh","bench_kh"],0.42], chestpress_m:[["bench_lh","bench_kh"],0.90], chestpress_c:[["bench_lh","bench_kh"],0.55],
  // von Kniebeuge
  frontsquat:[["squat_lh"],0.60], pausesquat:[["squat_lh"],0.75], gobletsquat:[["squat_lh"],0.30], hacksquat:[["squat_lh"],0.90],
  legpress:[["squat_lh"],1.30], lunges:[["squat_lh"],0.30], bulgarian:[["squat_lh"],0.30], overheadsquat:[["squat_lh"],0.40],
  // von Kreuzheben
  rdl_lh:[["deadlift"],0.60], rdl_kh:[["deadlift"],0.30], goodmorning:[["deadlift"],0.40], hipthrust:[["deadlift"],0.80],
  // von OHP
  ohp_kh:[["ohp_lh"],0.40], ohp_m:[["ohp_lh"],0.90], pushpress:[["ohp_lh"],1.10], dbshoulderpress:[["ohp_lh"],0.40],
  // von Rudern
  row_kh:[["row_lh"],0.45], row_c:[["row_lh"],0.90], row_m:[["row_lh"],0.95], row_tbar:[["row_lh"],0.80],
};
/* berechnet Anzeige-Gewicht einer Assistenz aus Hauptlift-1RM × Phase-% × factor */
function assistWeight(exId, oneRM, pct){
  const map=ASSIST_FROM[exId]; if(!map) return null;
  const [parents,factor]=map;
  const pid=parents.find((p)=>oneRM[p]); if(!pid) return null;
  const work=oneRM[pid]*pct;                 // Arbeitsgewicht des Hauptlifts
  return (Math.round((work*factor)/2.5)*2.5).toFixed(1);
}

/* ---------- CROSSFIT / METCON WODs ---------------------------------------- */
const WODS = [
  { name:"Cindy", type:"AMRAP 20 min", work:"5 Klimmzüge · 10 Liegestütze · 15 Luftkniebeugen", foci:["crossfit"] },
  { name:"Fran", type:"For Time · 21-15-9", work:"Thruster (40/30 kg) · Klimmzüge", foci:["crossfit"] },
  { name:"Helen", type:"3 Runden auf Zeit", work:"400 m Lauf · 21 KB-Swings · 12 Klimmzüge", foci:["crossfit","hyrox"] },
  { name:"EMOM 14", type:"jede Minute im Wechsel", work:"min. ungerade: 12 Wall Balls · min. gerade: 10 Burpees", foci:["crossfit"] },
  { name:"DT", type:"5 Runden auf Zeit", work:"12 Kreuzheben · 9 Hang Power Clean · 6 Push Jerk (LH)", foci:["crossfit","weightlifting"] },
  { name:"Hyrox-Sim", type:"For Time", work:"1 km Lauf · 50 m Sled Push · 50 m Sled Pull · 80 m Farmers Carry · 100 Wall Balls", foci:["hyrox"] },
  { name:"Chipper", type:"For Time", work:"50 Double Unders · 40 Sit-ups · 30 KB-Swings · 20 Burpees · 5 Tauklettern", foci:["crossfit","hyrox"] },
  { name:"Strongman-Medley", type:"4 Runden auf Zeit", work:"3 Reifen-Flips · 20 m Yoke Walk · 3 Atlas Stones · 40 m Farmers Carry", foci:["crossfit"] },
];
function wodFor(prim, week){ const pool=WODS.filter((w)=>w.foci.includes(prim)); if(!pool.length) return null; return pool[(week-1)%pool.length]; }

/* RIR (Reps in Reserve) je Phase + Pausen je Blocktyp -------------------- */
const RIR_BY_PHASE = [3, 2, 1, 4];      // P1, P2, P3, Deload
function restFor(cat, blend){
  if(cat==="main") return (blend.mainPct>=0.8?"3–5 min":"2–3 min");
  if(cat==="assist") return "90–120 s";
  if(cat==="isolation") return "45–60 s";
  return "nach Bedarf";
}
/* Aufwärm-Rampe aus 1RM: 40/60/80 % bis zum Arbeitsgewicht ---------------- */
function warmupRamp(oneRM_, pct){
  if(!oneRM_) return null;
  const w=(f)=>Math.round((oneRM_*f)/2.5)*2.5;
  const steps=[[0.4,5],[0.6,3],[0.8,2]].filter(([f])=>f<pct-0.02);
  return steps.map(([f,r])=>`${w(f)}×${r}`).join(" · ");
}

/* Wissenschaftlich empfohlene Trainingstage je Fokus & Erfahrung ---------- */
function recommendedDays(blend, expL){
  let lo = expL==="beginner"?3:expL==="intermediate"?3:4;
  let hi = expL==="beginner"?3:expL==="intermediate"?4:5;
  if((blend.volBias||0)>=0.9) hi=Math.min(6,hi+1);          // hohe Hypertrophie-Last: mehr Splits sinnvoll
  if((blend.condW||0)>=0.8){ lo=Math.min(lo+1,6); hi=Math.min(hi+1,6); } // Kondition verträgt höhere Frequenz
  return {lo,hi};
}
/* Einheiten so anordnen, dass aufeinanderfolgende Tage möglichst andere
   Muskeln treffen (~48 h Erholung je Muskelgruppe). Greedy nach geringster Überschneidung. */
function reorderForRecovery(sessions){
  if(sessions.length<=2) return sessions.slice();
  const musc=(d)=>{const set=new Set();(d.blocks||[]).forEach((b)=>b.items.forEach((it)=>{const ex=EXERCISES.find((e)=>e.id===it.id);if(ex)ex.muscles.forEach((m)=>set.add(m));}));return set;};
  const rest=sessions.slice(); const out=[rest.shift()];
  while(rest.length){
    const prev=musc(out[out.length-1]);
    let bi=0,bestOverlap=Infinity;
    rest.forEach((d,i)=>{const m=musc(d);let ov=0;m.forEach((x)=>{if(prev.has(x))ov++;});if(ov<bestOverlap){bestOverlap=ov;bi=i;}});
    out.push(rest.splice(bi,1)[0]);
  }
  return out;
}

/* Aktive-Erholungs-Optionen für Tage über dem Trainings-Optimum ----------- */
const RECOVERY_OPTIONS = {
  cardio:   { label:"Lockeres Cardio (Zone 2)", desc:"20–40 min zügiges Gehen, lockeres Rad oder Schwimmen — fördert Durchblutung & Regeneration", color:"#0F766E" },
  mobility: { label:"Mobility & Dehnen",        desc:"15–25 min Beweglichkeit + Faszienrolle für die beanspruchten Muskeln", color:"#7A4A00" },
  skill:    { label:"Skill-Technik (locker)",   desc:"Technik ohne Ermüdung üben (z.B. Handstand-Balance, leichte Skills)", color:"#2A0F45" },
  rest:     { label:"Komplette Pause",          desc:"Echter Ruhetag — auch das ist Training, denn Erholung lässt wachsen", color:"#8A7E70" },
};
function recommendedRecovery(blend){
  if((blend.skillW||0)>=0.5) return "skill";
  if((blend.condW||0)>=0.6) return "cardio";
  if((blend.volBias||0)>=0.8) return "mobility"; // schwere Hypertrophie -> Regeneration schützen
  return "cardio";
}

/* Split-Vorlagen: gruppieren Grundübungen nach Muster auf die Tage -> sinnvolle
   Frequenz (~2x/Muskel) statt ein Tag pro Übung. Patterns je Trainingstag. */
/* Bewegungs-Familien: verhindert zwei fast identische Grundübungen mit vollem
   Volumen am selben Tag (z.B. zweimal Flachbankdrücken). */
const MOVE_KEY = {
  bench_lh:"flatpress", bench_kh:"flatpress", chestpress_m:"flatpress", chestpress_c:"flatpress",
  incline_lh:"inclinepress", incline_kh:"inclinepress", incline_m:"inclinepress", dips:"dippress",
  squat_lh:"backsquat", pausesquat:"backsquat", gobletsquat:"backsquat",
  frontsquat:"frontsquat", hacksquat:"frontsquat", overheadsquat:"ohsquat", legpress:"legpress",
  deadlift:"deadlift", rdl_lh:"rdl", rdl_kh:"rdl", goodmorning:"rdl", hipthrust:"hipthrust",
  ohp_lh:"ohp", ohp_kh:"ohp", ohp_m:"ohp", pushpress:"ohp",
  row_lh:"row", row_kh:"row", row_c:"row", row_m:"row", row_tbar:"row",
  pullup:"vertpull", weightedpull:"vertpull", chinup:"vertpull", pulldown_w:"vertpull", pulldown_c:"vertpull",
  snatch:"snatch", powersnatch:"snatch", cleanjerk:"cleanjerk", powerclean:"clean", hangclean:"clean", pushjerk:"jerk",
};
const moveKey=(e)=>MOVE_KEY[e.id]||e.id;

function sessionTemplates(mainDays){
  const U=["push","pull"], L=["squat","hinge","olympic"];
  switch(mainDays){
    case 1: return [["push","pull","squat","hinge","olympic"]];
    case 2: return [U, L];
    case 3: return [["push"], ["pull"], L];
    case 4: return [U, ["squat","olympic"], U, ["hinge"]];               // eigener Hinge-Tag (Kreuzheben)
    case 5: return [["push"], ["pull"], ["squat","olympic"], U, ["hinge"]]; // Beine durch Upper getrennt
    default: return [["push"], ["pull"], ["squat","olympic"], ["push"], ["pull"], ["hinge"]]; // 6: Hinge eigener Tag
  }
}
const SESSION_LABEL = (pats)=>{
  const has=(x)=>pats.includes(x);
  if(pats.length>=5) return "Ganzkörper";
  if(has("push")&&has("pull")) return "Oberkörper";
  if(has("squat")&&has("hinge")) return "Beine";
  if(has("push")) return "Druck (Brust/Schulter)";
  if(has("pull")) return "Zug (Rücken)";
  if(has("squat")||has("hinge")||has("olympic")) return "Beine";
  return "Training";
};

export default function App(){
  const [focuses,setFocuses]=useState([{key:"hypertrophy",weight:3},{key:"strength",weight:2}]);
  const [planWeeks,setPlanWeeks]=useState(10);
  const [daysPerWeek,setDaysPerWeek]=useState(5);
  const [recovery,setRecovery]=useState("auto"); // 'auto' folgt Empfehlung, sonst fester Schlüssel
  const [infoFor,setInfoFor]=useState(null); // Übungs-id deren Info offen ist
  const [customPlan,setCustomPlan]=useState(null); // {weeks, days:[{id,name,warmup:[],main:[],cooldown:[]}]}
  const [adding,setAdding]=useState(null);          // {dayId,section} – Übungs-Auswahl offen
  const [exQuery,setExQuery]=useState("");          // Suchfeld in der Übungsauswahl
  const [cWeek,setCWeek]=useState(1);               // aktuelle Woche im Tracking des eigenen Plans
  const [customLog,setCustomLog]=useState({});      // key `${dayId}:${exId}:${week}` -> {w,r}
  const [animFor,setAnimFor]=useState(null); // Übungs-id deren Animation offen ist
  const [expL,setExpL]=useState("advanced");
  const [budget,setBudget]=useState(75);
  const [week,setWeek]=useState(1);
  const [bw,setBw]=useState(105);
  const [weightLog,setWeightLog]=useState([]); // [{date:'YYYY-MM-DD', kg:Number}]
  const [wDate,setWDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [wKg,setWKg]=useState("");
  const [height,setHeight]=useState(178);
  const [bodyfat,setBodyfat]=useState(20);
  const [activity,setActivity]=useState(1.55);
  const [oneRM,setOneRM]=useState({});
  const [picked,setPicked]=useState({});
  const [planMode,setPlanMode]=useState(null); // 'auto' | 'manual'
  const [equip,setEquip]=useState(Object.fromEntries(ALL_EQUIP.map((k)=>[k,true])));
  const [injuries,setInjuries]=useState({});
  const [tab,setTab]=useState("build");
  const [collapsed,setCollapsed]=useState({}); // liftId -> true = zugeklappt
  const [showAll,setShowAll]=useState(false);
  const [track,setTrack]=useState({});
  const [history,setHistory]=useState({});
  const [ratings,setRatings]=useState({}); // dayTitle -> [{week,rating}]
  const [msg,setMsg]=useState("");
  const [hydrated,setHydrated]=useState(false);
  // beim Start aus IndexedDB laden
  useEffect(()=>{ (async()=>{ const d=await loadState(); if(d){ try{
    if(d.focuses)setFocuses(d.focuses); if(d.planWeeks)setPlanWeeks(d.planWeeks); if(d.daysPerWeek)setDaysPerWeek(d.daysPerWeek); if(d.recovery)setRecovery(d.recovery);
    if(d.expL)setExpL(d.expL); if(d.budget)setBudget(d.budget); if(d.week)setWeek(d.week); if(d.bw)setBw(d.bw);
    if(d.height)setHeight(d.height); if(d.bodyfat)setBodyfat(d.bodyfat); if(d.activity)setActivity(d.activity);
    if(d.oneRM)setOneRM(d.oneRM); if(d.picked){setPicked(d.picked); if(Object.keys(d.picked).length>0)setPlanMode('manual');} if(d.equip)setEquip(d.equip);
    if(d.injuries)setInjuries(d.injuries); if(d.track)setTrack(d.track); if(d.history)setHistory(d.history); if(d.ratings)setRatings(d.ratings); if(d.weightLog)setWeightLog(d.weightLog); if(d.customPlan)setCustomPlan(d.customPlan); if(d.customLog)setCustomLog(d.customLog);
  }catch(e){} } setHydrated(true); })(); },[]);
  // bei jeder Änderung speichern (erst nach dem Laden)
  useEffect(()=>{ if(!hydrated)return; saveState({focuses,planWeeks,daysPerWeek,recovery,expL,budget,week,bw,height,bodyfat,activity,oneRM,picked,equip,injuries,track,history,ratings,weightLog,customPlan,customLog}); },
    [hydrated,focuses,planWeeks,daysPerWeek,recovery,expL,budget,week,bw,height,bodyfat,activity,oneRM,picked,equip,injuries,track,history,ratings,weightLog,customPlan,customLog]);

  const phaseIdx=phaseForWeek(week,planWeeks);
  const sel=useMemo(()=>available(picked,equip,injuries),[picked,equip,injuries]);
  const blend=useMemo(()=>blendFocus(focuses),[focuses]);
  const recDays=useMemo(()=>recommendedDays(blend,expL),[blend,expL]);
  const recoRec=useMemo(()=>recommendedRecovery(blend),[blend]);
  const recoActive=recovery==="auto"?recoRec:recovery;
  const prim=primaryFocus(focuses);
  const {pct,reasons,perDay}=useMemo(()=>scoreSelection(sel,blend,budget),[sel,blend,budget]);
  const trainDays=Math.min(daysPerWeek,recDays.hi);
  const planObj=useMemo(()=>buildPlan(sel,blend,expL,budget,phaseIdx,oneRM,trainDays),[sel,blend,expL,budget,phaseIdx,oneRM,trainDays]);
  const plan=planObj.days;
  const reserve=useMemo(()=>sel.filter((e)=>!planObj.usedIds.has(e.id)&&e.cat!=="main"),[sel,planObj]);
  const schedule=useMemo(()=>weeklySchedule(plan,daysPerWeek,budget),[plan,daysPerWeek,budget]);
  const pickedMains=useMemo(()=>EXERCISES.filter((e)=>e.cat==="main"&&picked[e.id]),[picked]);
  const recMains=useMemo(()=>recommend(blend,"main",equip,injuries,5),[blend,equip,injuries]);
  const recCond=useMemo(()=>recommend(blend,"conditioning",equip,injuries,6),[blend,equip,injuries]);
  const recSkill=useMemo(()=>recommend(blend,"skill",equip,injuries,8),[blend,equip,injuries]);
  const scoreColor=pct>=80?"#15803D":pct>=55?"#B45309":"#9D174D";
  const toggle=(id)=>setPicked((p)=>({...p,[id]:!p[id]}));
  const trackItems=useMemo(()=>{const seen=new Set(),out=[];plan.forEach((d)=>d.blocks.forEach((b)=>b.items.forEach((it)=>{if(it.track&&!seen.has(it.id)){seen.add(it.id);out.push(it);}})));return out;},[plan]);
  const logWeight=(id,v,lo,hi)=>setTrack((t)=>{const c={...(t[id]||{})};c.weight=v;c.next=nextFromSets(c.weight,c.sets,lo,hi);return {...t,[id]:c};});
  const logSetRep=(id,idx,v,lo,hi)=>setTrack((t)=>{const c={...(t[id]||{})};const arr=[...(c.sets||[])];arr[idx]=v;c.sets=arr;c.next=nextFromSets(c.weight,arr,lo,hi);return {...t,[id]:c};});
  const saveWeek=(id)=>{const t=track[id];if(!t||!t.weight)return;const best=(t.sets||[]).map((x)=>parseInt(x)).filter((x)=>!isNaN(x)).sort((a,b)=>b-a)[0];const est=best?e1rm(t.weight,best):null;setHistory((h)=>{const arr=[...(h[id]||[])].filter((p)=>p.week!==week);arr.push({week,weight:parseFloat(t.weight),e1rm:est});arr.sort((a,b)=>a.week-b.week);return{...h,[id]:arr};});setMsg(`${byId(id).name}: Woche ${week} gespeichert`);setTimeout(()=>setMsg(""),1600);};
  const rateDay=(title,rating)=>setRatings((r)=>{const arr=[...(r[title]||[])].filter((x)=>x.week!==week);arr.push({week,rating});arr.sort((a,b)=>a.week-b.week);return {...r,[title]:arr};});
  const ratingForDay=(title)=>{const arr=ratings[title]||[];const f=arr.find((x)=>x.week===week);return f?f.rating:"";};
  // Negativ-Trend: letzte 2 Wochen überwiegend schlecht?
  const trendWarning=useMemo(()=>{const recent={};Object.values(ratings).forEach((arr)=>arr.forEach((x)=>{if(x.week>=week-1&&x.week<=week){recent[x.rating]=(recent[x.rating]||0)+1;}}));const bad=recent["schlecht"]||0,tot=(recent["gut"]||0)+(recent["okay"]||0)+bad;return tot>=3&&bad/tot>0.5;},[ratings,week]);
  // Frequenz je Muskelgruppe pro Woche + Erkennung zu enger Wiederholung
  const muscleInfo=useMemo(()=>{
    const dayMuscles=schedule.map((d)=>{const set=new Set();(d.trainings||[]).forEach((tr)=>tr.blocks.forEach((b)=>b.items.forEach((it)=>{const ex=EXERCISES.find((e)=>e.id===it.id);if(ex&&(ex.cat==="main"||ex.cat==="assist"||ex.cat==="isolation"))ex.muscles.forEach((m)=>set.add(m));})));return set;});
    const freq={}; dayMuscles.forEach((set)=>set.forEach((m)=>{freq[m]=(freq[m]||0)+1;}));
    const conflicts=[];
    for(let i=0;i<dayMuscles.length;i++){const a=dayMuscles[i],b=dayMuscles[(i+1)%dayMuscles.length];a.forEach((m)=>{if(b.has(m)&&["Brust","Rücken","Quadrizeps","Hamstrings","Glutes","Schulter"].includes(m)&&!conflicts.includes(m))conflicts.push(m);});}
    return {freq,conflicts};
  },[schedule]);
  const lbm=Math.round(bw*(1-bodyfat/100));               // fettfreie Masse
  const bmr=Math.round(370+21.6*lbm);                     // Katch-McArdle (nutzt KFA)
  const maintenance=Math.round(bmr*activity);             // TDEE
  const target=maintenance+blend.kcalAdj;
  const saveWeightEntry=()=>{const kg=parseFloat((wKg+"").replace(",","."));if(!wDate||isNaN(kg))return;setWeightLog((l)=>{const arr=[...l.filter((x)=>x.date!==wDate),{date:wDate,kg}];arr.sort((a,b)=>a.date.localeCompare(b.date));return arr;});setBw(Math.round(kg));setWKg("");setMsg("Gewicht gespeichert");setTimeout(()=>setMsg(""),1500);};
  const delWeightEntry=(date)=>setWeightLog((l)=>l.filter((x)=>x.date!==date));
  // ---- Eigener Plan: Baukasten ----
  const uid=()=>Math.random().toString(36).slice(2,9);
  const cpDefaults={warmup:{min:5},main:{sets:4,reps:8},cooldown:{min:5}};
  const startCustom=()=>setCustomPlan({weeks:8,days:[{id:uid(),name:"Tag 1",warmup:[],main:[],cooldown:[]}]});
  const addCustomDay=()=>setCustomPlan((c)=>({...c,days:[...c.days,{id:uid(),name:`Tag ${c.days.length+1}`,warmup:[],main:[],cooldown:[]}]}));
  const removeCustomDay=(dayId)=>setCustomPlan((c)=>({...c,days:c.days.filter((d)=>d.id!==dayId)}));
  const renameCustomDay=(dayId,name)=>setCustomPlan((c)=>({...c,days:c.days.map((d)=>d.id===dayId?{...d,name}:d)}));
  const setCustomWeeks=(w)=>setCustomPlan((c)=>({...c,weeks:Math.max(1,Math.min(16,w))}));
  const addCustomEx=(dayId,section,exId)=>{const entry=section==="main"?{id:exId,sets:4,reps:8,kg:""}:{id:exId,min:5};setCustomPlan((c)=>({...c,days:c.days.map((d)=>d.id===dayId?{...d,[section]:[...d[section],entry]}:d)}));setAdding(null);setExQuery("");};
  const updCustomEx=(dayId,section,idx,field,val)=>setCustomPlan((c)=>({...c,days:c.days.map((d)=>d.id===dayId?{...d,[section]:d[section].map((e,i)=>i===idx?{...e,[field]:val}:e)}:d)}));
  const delCustomEx=(dayId,section,idx)=>setCustomPlan((c)=>({...c,days:c.days.map((d)=>d.id===dayId?{...d,[section]:d[section].filter((_,i)=>i!==idx)}:d)}));
  const logCustom=(dayId,exId,field,val)=>setCustomLog((l)=>{const k=`${dayId}:${exId}:${cWeek}`;return {...l,[k]:{...(l[k]||{}),[field]:val}};});
  const deleteCustomPlan=()=>{if(confirm("Eigenen Plan wirklich löschen?")){setCustomPlan(null);setCustomLog({});}};
  const buildExamplePlan=()=>{
    const wu=()=>[
      {id:"Foam Rolling + Mobility",min:8},
      {id:"Scapular Prep: Push-ups / Pull-ups / Dips",min:5},
    ];
    return {weeks:8,days:[
      // Samstag – Bench (schwer) + Druck-Volumen
      {id:uid(),name:"Samstag · Bench (schwer)",warmup:wu(),main:[
        {id:"bench_lh",sets:4,reps:5,kg:117.5},
        {id:"incline_kh",sets:3,reps:8,kg:37.5},
        {id:"latraise_c",sets:3,reps:12,kg:12},
        {id:"facepull",sets:3,reps:18,kg:20}],cooldown:[{id:"speedrope",min:8}]},
      // Sonntag – Squat (schwer) + Quads
      {id:uid(),name:"Sonntag · Squat (schwer)",warmup:wu(),main:[
        {id:"squat_lh",sets:4,reps:5,kg:97.5},
        {id:"frontsquat",sets:3,reps:8,kg:65},
        {id:"bulgarian",sets:3,reps:10,kg:22.5},
        {id:"hipthrust",sets:3,reps:10,kg:100}],cooldown:[{id:"jogging",min:35}]},
      // Montag – Calisthenics-Skill-Tag (bewusst submaximal, unverändert im Fokus)
      {id:uid(),name:"Montag · Calisthenics (Skill)",warmup:wu(),main:[
        {id:"handstand",sets:1,reps:10,kg:0},
        {id:"planche",sets:5,reps:10,kg:0},
        {id:"frontlever",sets:4,reps:8,kg:0},
        {id:"backlever",sets:4,reps:8,kg:0},
        {id:"muscleup",sets:5,reps:5,kg:0},
        {id:"oap",sets:3,reps:4,kg:0},
        {id:"ringdips",sets:4,reps:10,kg:0},
        {id:"lsit",sets:3,reps:12,kg:0}],cooldown:[]},
      // Dienstag – Pull (Rücken/Bizeps) + Cardio
      {id:uid(),name:"Dienstag · Pull (Rücken)",warmup:wu(),main:[
        {id:"weightedpull",sets:4,reps:6,kg:10},
        {id:"row_lh",sets:4,reps:8,kg:80},
        {id:"row_c",sets:3,reps:11,kg:60},
        {id:"curl_kh",sets:3,reps:12,kg:15}],cooldown:[{id:"bike_erg",min:40}]},
      // Mittwoch – Push (OHP) + Arme
      {id:uid(),name:"Mittwoch · Push / OHP",warmup:wu(),main:[
        {id:"ohp_lh",sets:4,reps:5,kg:60},
        {id:"bench_kh",sets:3,reps:8,kg:37.5},
        {id:"dips",sets:4,reps:8,kg:0},
        {id:"triceps_c",sets:3,reps:12,kg:25}],cooldown:[]},
      // Donnerstag – Deadlift (schwer) + hintere Kette (direkt vor dem Ruhetag)
      {id:uid(),name:"Donnerstag · Deadlift (schwer)",warmup:wu(),main:[
        {id:"deadlift",sets:3,reps:3,kg:137.5},
        {id:"rdl_lh",sets:3,reps:8,kg:100},
        {id:"hyper",sets:3,reps:12,kg:0},
        {id:"calf_st",sets:3,reps:15,kg:60}],cooldown:[]},
      {id:uid(),name:"Freitag · PAUSE (komplette Regeneration)",warmup:[],main:[],cooldown:[]},
    ]};
  };
  const loadExample=()=>{ if(customPlan&&!confirm("Deinen aktuellen eigenen Plan durch den Beispielplan ersetzen?"))return; setCustomPlan(buildExamplePlan()); setCustomLog({}); setTab("custom"); };
  const adoptAutoPlan=()=>{
    if(!schedule||!schedule.some((sd)=>sd.trainings&&sd.trainings.length)){alert("Es gibt noch keinen Plan zum Übernehmen. Wähle zuerst Übungen im Aufbauen-Tab.");return;}
    if(customPlan&&!confirm("Deinen aktuellen eigenen Plan durch diesen übernommenen Plan ersetzen?"))return;
    const parseSR=(str)=>{const m=(str||"").match(/(\d+)\s*×\s*(\d+)/);return m?{sets:+m[1],reps:+m[2]}:{sets:1,reps:1};};
    const days=[];
    schedule.forEach((sd)=>{ if(!sd.trainings||!sd.trainings.length)return;
      sd.trainings.forEach((tr)=>{ const day={id:uid(),name:`${sd.day} · ${(tr.title||"Training").split(":")[0]}`,warmup:[],main:[],cooldown:[]};
        tr.blocks.forEach((b)=>{ b.items.forEach((it)=>{
          if(b.tag==="Warm-up"){const mm=(it.s||"").match(/(\d+)\s*min/);day.warmup.push({id:it.n,min:mm?+mm[1]:8});}
          else if(b.tag==="Cool-down"){const mm=(it.s||"").match(/(\d+)\s*min/);day.cooldown.push({id:it.n,min:mm?+mm[1]:6});}
          else {const sr=parseSR(it.s); const wm=(it.w||"").match(/([\d.]+)\s*kg/); day.main.push({id:it.id,sets:sr.sets,reps:sr.reps,kg:wm?+wm[1]:""});}
        });});
        days.push(day);
      });
    });
    setCustomPlan({weeks:planWeeks||8,days}); setCustomLog({}); setTab("custom");
  };
  const customActive=!!(customPlan&&customPlan.days.some((d)=>d.main.length||d.warmup.length||d.cooldown.length));
  const customSeries=(dayId,exId)=>{const arr=[];if(!customPlan)return arr;for(let w=1;w<=customPlan.weeks;w++){const e=customLog[`${dayId}:${exId}:${w}`];if(e&&e.w!==undefined&&e.w!==""){const wt=parseFloat((e.w+"").replace(",","."));const r=parseInt(e.r)||0;if(!isNaN(wt))arr.push({week:w,weight:wt,e1rm:r>0?Math.round(wt*(1+r/30)):wt});}}return arr;};
  const protein=Math.round(lbm*2.2);                      // 2,2 g pro kg fettfreier Masse
  const bmi=Math.round((bw/((height/100)**2))*10)/10;
  const exportData=()=>{const data={v:10,focuses,planWeeks,daysPerWeek,recovery,expL,budget,week,bw,height,bodyfat,activity,oneRM,picked,equip,injuries,track,history,ratings,weightLog,customPlan,customLog};const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="training-backup.json";a.click();URL.revokeObjectURL(u);};
  const importData=(e)=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);setFocuses(d.focuses??[{key:"hypertrophy",weight:3}]);setPlanWeeks(d.planWeeks??10);setDaysPerWeek(d.daysPerWeek??5);setRecovery(d.recovery??"auto");setExpL(d.expL??"advanced");setBudget(d.budget??75);setWeek(d.week??1);setBw(d.bw??105);setHeight(d.height??178);setBodyfat(d.bodyfat??20);setActivity(d.activity??1.55);setOneRM(d.oneRM??{});setPicked(d.picked??{});setEquip(d.equip??equip);setInjuries(d.injuries??{});setTrack(d.track??{});setHistory(d.history??{});setRatings(d.ratings??{});setWeightLog(d.weightLog??[]);setCustomPlan(d.customPlan??null);setCustomLog(d.customLog??{});setMsg("Backup geladen");setTimeout(()=>setMsg(""),1600);}catch{setMsg("Datei ungültig");setTimeout(()=>setMsg(""),1600);}};r.readAsText(f);};
  const toggleFocus=(k)=>setFocuses((fs)=>fs.find((f)=>f.key===k)?fs.filter((f)=>f.key!==k):fs.length>=3?fs:[...fs,{key:k,weight:2}]);
  const setFW=(k,w)=>setFocuses((fs)=>fs.map((f)=>f.key===k?{...f,weight:w}:f));
  const fpct=(k)=>{const tot=focuses.reduce((s,f)=>s+f.weight,0)||1;const f=focuses.find((x)=>x.key===k);return f?Math.round((f.weight/tot)*100):0;};

  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <header style={S.header}>
        <div style={S.kicker}>OFFLINE · 0 KOSTEN · {EXERCISES.length} ÜBUNGEN · WISSENSCHAFTLICH BEWERTET</div>
        <h1 style={S.h1}>Trainingsplan-<span style={{color:RUST}}>Werkstatt</span></h1>
      </header>
      <nav style={S.tabs}>{[["build","Aufbauen"],["plan","Plan"],["custom","Eigener Plan"],["track","Tracking"],["eval","Auswertung"],["nutri","Ernährung"],["data","Sicherung"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={tabBtn(tab===k)}>{l}</button>)}</nav>
      {msg&&<div style={S.toast}>{msg}</div>}

      {tab==="build"&&(<>
        <section style={S.card}>
          <div style={S.cardLabel}>01 · Fokusgruppen (bis 3 · priorisierbar)</div>
          <div style={S.chipWrap}>{FOCUS_KEYS.map((k)=>{const on=!!focuses.find((f)=>f.key===k);return <button key={k} onClick={()=>toggleFocus(k)} style={chip(on)}>{FOCUSES[k].label}{on?` · ${fpct(k)}%`:""}</button>;})}</div>
          <div style={{marginTop:10}}>{focuses.map((f)=>(<div key={f.key} style={S.focusRow}><span style={{fontSize:12.5,fontWeight:700,minWidth:120}}>{FOCUSES[f.key].label}</span><input type="range" min="1" max="5" value={f.weight} onChange={(e)=>setFW(f.key,+e.target.value)} style={{...S.slider,flex:1}}/><span style={S.focusPct}>{fpct(f.key)}%</span></div>))}</div>
          {focuses.length===0&&<div style={S.hint}>Wähle mindestens eine Fokusgruppe.</div>}
          <div style={S.blendBox}>
            <span style={S.blendTitle}>Daraus berechnet:</span>
            <span style={S.blendItem}>Hauptlifts <b>{EXP[expL].sets+(blend.volBias>=0.7?1:0)}×{blend.mainReps}</b> @ {Math.round(blend.mainPct*100)}%</span>
            <span style={S.blendItem}>Assistenz <b>×{blend.accReps}</b></span>
            <span style={S.blendItem}>Isolation <b>×{blend.isoReps}</b></span>
            {blend.condW>=0.4&&<span style={S.blendItem}>Cardio <b>{blend.condW>=0.8?"viel":"mäßig"}</b></span>}
            {blend.skillW>=0.3&&<span style={S.blendItem}>Skills <b>hoch</b></span>}
          </div>
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>Wie möchtest du den Plan erstellen?</div>
          <div style={S.modeWrap}>
            <button onClick={()=>{setPicked(autoSelect(blend,equip,injuries,expL));setPlanMode("auto");setTab("plan");}} style={S.modeBtn}>
              <div style={S.modeIcon}>✨</div>
              <div style={S.modeTitle}>Musterplan von der App</div>
              <div style={S.modeDesc}>Die App wählt automatisch die effektivsten Übungen — passend zu deinem Fokus, Equipment und Zeitbudget.</div>
            </button>
            <button onClick={()=>{setPlanMode("manual");}} style={{...S.modeBtn,...(planMode==="manual"?S.modeBtnActive:{})}}>
              <div style={S.modeIcon}>🛠️</div>
              <div style={S.modeTitle}>Eigener Plan</div>
              <div style={S.modeDesc}>Du wählst alle Übungen selbst aus. Die App baut daraus deinen Plan — zeitbudget- und volumengerecht.</div>
            </button>
          </div>
          <div style={S.hint}>Tipp: Setze zuerst Equipment und Einschränkungen unten — dann passt der Musterplan exakt zu deinen Möglichkeiten.</div>
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>02 · Erfahrung, Plandauer, Zeit & Woche</div>
          <Field l="Erfahrung"><div style={S.chipWrap}>{Object.entries(EXP).map(([k,v])=><button key={k} onClick={()=>setExpL(k)} style={chip(expL===k)}>{v.label}</button>)}</div></Field>
          <Field l={`Plandauer: ${planWeeks} Wochen`}><input type="range" min="4" max="16" value={planWeeks} onChange={(e)=>{const v=+e.target.value;setPlanWeeks(v);if(week>v)setWeek(v);}} style={S.slider}/></Field>
          <Field l={`Trainingstage pro Woche: ${daysPerWeek} (wie oft du kannst)`}><input type="range" min="2" max="7" value={daysPerWeek} onChange={(e)=>setDaysPerWeek(+e.target.value)} style={S.slider}/>
            <div style={S.recoBar}><span style={S.recoTag}>Wissenschaftlich empfohlen: {recDays.lo===recDays.hi?recDays.lo:`${recDays.lo}–${recDays.hi}`} Tage</span></div>
            {daysPerWeek>recDays.hi&&<div style={S.warnBox}>Du hast <b>{daysPerWeek} Tage</b> gewählt — mehr als die empfohlenen {recDays.hi}. Muskeln wachsen in der Erholung. Die App plant die optimalen Trainingstage als echte Einheiten und füllt die übrigen Tage mit <b>aktiver Erholung</b> (unten wählbar) statt hartem Training.</div>}
          </Field>
          <Field l="Aktive Erholung an Zusatztagen">
            <div style={S.chipWrap}>
              <button onClick={()=>setRecovery("auto")} style={chip(recovery==="auto")}>Empfehlung der App{recovery==="auto"?` · ${RECOVERY_OPTIONS[recoRec].label}`:""}</button>
              {Object.entries(RECOVERY_OPTIONS).map(([k,v])=><button key={k} onClick={()=>setRecovery(k)} style={chip(recovery===k)}>{v.label}</button>)}
            </div>
            <div style={S.hint}>{RECOVERY_OPTIONS[recoActive].desc}.{recovery==="auto"?" (Automatisch nach deinem Fokus gewählt.)":""}</div>
          </Field>
          <Field l={`Zeitbudget pro Einheit: ${budget} min`}><input type="range" min="40" max="120" step="5" value={budget} onChange={(e)=>setBudget(+e.target.value)} style={S.slider}/></Field>
          <Field l={`Trainingswoche: ${week} von ${planWeeks}`}><input type="range" min="1" max={planWeeks} value={week} onChange={(e)=>setWeek(+e.target.value)} style={S.slider}/></Field>
          <div style={S.phaseBanner}><span style={{...S.phaseBadge,background:PHASE_COLORS[phaseIdx]}}>{PHASES[phaseIdx].label}</span><span style={S.phaseNote}>{PHASES[phaseIdx].note}</span></div>
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>03 · Equipment (filtert Übungen)</div>
          <div style={S.chipWrap}>{ALL_EQUIP.map((k)=><button key={k} onClick={()=>setEquip((q)=>({...q,[k]:!q[k]}))} style={chip(equip[k])}>{EQUIP_LABELS[k]}</button>)}</div>
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>04 · Einschränkungen (blendet Übungen aus)</div>
          <div style={S.chipWrap}>{MUSCLE_LIST.map((m)=><button key={m} onClick={()=>setInjuries((q)=>({...q,[m]:!q[m]}))} style={chipInj(!!injuries[m])}>{injuries[m]?"🚫 ":""}{m}</button>)}</div>
        </section>

        {planMode==="manual"&&(<><section style={S.card}>
          <div style={S.cardLabel}>05 · Grundübung wählen → ideale Ergänzungen <span style={{color:RUST}}>★ top für deinen Fokus</span></div>
          <div style={S.exGrid}>{EXERCISES.filter((e)=>e.cat==="main").map((m)=>{const on=!!picked[m.id];const blocked=m.muscles.some((mm)=>injuries[mm])||!(m.equip.some((q)=>equip[q])||m.equip.includes("kg"));const rec=recMains.find((r)=>r.e.id===m.id);return <button key={m.id} disabled={blocked} onClick={()=>toggle(m.id)} style={exCard(on,blocked)}><div style={{display:"flex",justifyContent:"space-between",gap:6}}><span style={{fontWeight:700,fontSize:12.5}}>{rec?"★ ":""}{m.name}</span><span style={{display:"flex",alignItems:"center",gap:6}}>{hasAnim(m.id)&&<span onClick={(e)=>{e.stopPropagation();setAnimFor(animFor===m.id?null:m.id);}} style={S.animBtn} title="Bewegung ansehen">▶ Übung</span>}<InfoButton id={m.id} open={infoFor===m.id} onToggle={()=>setInfoFor(infoFor===m.id?null:m.id)}/><span>{blocked?"🚫":on?"●":"○"}</span></span></div><div style={S.exMeta}>{m.muscles.join(" · ")} · {Math.round(blendEff(m,blend))}/10</div>{animFor===m.id&&<div style={S.animBox} dangerouslySetInnerHTML={{__html:exerciseAnim(m.id)}}/>}{infoFor===m.id&&EXERCISE_INFO[m.id]&&<div style={S.infoBox}>{EXERCISE_INFO[m.id].t}{EXERCISE_INFO[m.id].c&&<div style={S.infoWarn}>⚠ Komplexe Technik – am besten mit Anleitung/Video lernen.</div>}</div>}</button>;})}</div>
          {pickedMains.length===0&&<div style={S.hint}>Wähle oben eine oder mehrere Grundübungen — darunter erscheinen je Lift die idealen Ergänzungen.</div>}
          {pickedMains.map((m)=>{const comps=complementsFor(m,blend,equip,injuries);const isC=!!collapsed[m.id];return (
            <div key={m.id} style={S.ecoBox}>
              <button onClick={()=>setCollapsed((c)=>({...c,[m.id]:!c[m.id]}))} style={S.ecoHead}>
                <span style={S.ecoTitle}>{isC?"▸":"▾"} Ergänzungen zu <b>{m.name}</b></span>
                <span style={{fontSize:11,color:"#8A7E70"}}>nach Effektivität</span>
              </button>
              {!isC&&(<>
                <div style={S.ecoSub}>Assistenz</div>
                {comps.assist.map(({e,score})=><Pool key={e.id} e={e} score={score} on={!!picked[e.id]} onToggle={()=>toggle(e.id)}/>)}
                <div style={{...S.ecoSub,marginTop:12}}>Isolation</div>
                {comps.isolation.map(({e,score})=><Pool key={e.id} e={e} score={score} on={!!picked[e.id]} onToggle={()=>toggle(e.id)}/>)}
              </>)}
            </div>);})}
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>06 · Cardio / Kondition <span style={{color:RUST}}>★ empfohlen für deinen Fokus</span></div>
          <div style={S.hint}>Wähle die Cardio-/Konditionsübungen, die du machen kannst und willst (z.B. Farmers Carry braucht Hanteln, Sled einen Schlitten).</div>
          <div style={S.exGrid}>{recCond.map(({e,score})=>{const blocked=!(e.equip.some((q)=>equip[q])||e.equip.includes("kg"));return <button key={e.id} disabled={blocked} onClick={()=>toggle(e.id)} style={exCard(!!picked[e.id],blocked)}><div style={{display:"flex",justifyContent:"space-between",gap:6}}><span style={{fontWeight:700,fontSize:12.5}}>★ {e.name}</span><span style={{display:"flex",alignItems:"center",gap:6}}>{hasAnim(e.id)&&<span onClick={(ev)=>{ev.stopPropagation();setAnimFor(animFor===e.id?null:e.id);}} style={S.animBtn} title="Bewegung ansehen">▶ Übung</span>}<InfoButton id={e.id} open={infoFor===e.id} onToggle={()=>setInfoFor(infoFor===e.id?null:e.id)}/><span>{blocked?"🚫":picked[e.id]?"●":"○"}</span></span></div><div style={S.exMeta}>{e.muscles.join(" · ")} · {Math.round(score)}/10</div>{animFor===e.id&&<div style={S.animBox} dangerouslySetInnerHTML={{__html:exerciseAnim(e.id)}}/>}{infoFor===e.id&&EXERCISE_INFO[e.id]&&<div style={S.infoBox}>{EXERCISE_INFO[e.id].t}{EXERCISE_INFO[e.id].c&&<div style={S.infoWarn}>⚠ Komplexe Technik – am besten mit Anleitung/Video lernen.</div>}</div>}</button>;})}</div>
        </section>

        <section style={S.card}>
          <div style={S.cardLabel}>07 · Calisthenics / Skills <span style={{color:RUST}}>★ empfohlen für deinen Fokus</span></div>
          <div style={S.hint}>Wähle die Skills, die du verfolgen willst — jeder hat eine eigene Effektivitäts-Bewertung für dein Ziel. Nicht jeder will dieselben Skills.</div>
          <div style={S.exGrid}>{recSkill.map(({e,score})=>{const blocked=!(e.equip.some((q)=>equip[q])||e.equip.includes("kg"))||e.muscles.some((m)=>injuries[m]);return <button key={e.id} disabled={blocked} onClick={()=>toggle(e.id)} style={exCard(!!picked[e.id],blocked)}><div style={{display:"flex",justifyContent:"space-between",gap:6}}><span style={{fontWeight:700,fontSize:12.5}}>★ {e.name}</span><span style={{display:"flex",alignItems:"center",gap:6}}>{hasAnim(e.id)&&<span onClick={(ev)=>{ev.stopPropagation();setAnimFor(animFor===e.id?null:e.id);}} style={S.animBtn} title="Bewegung ansehen">▶ Übung</span>}<InfoButton id={e.id} open={infoFor===e.id} onToggle={()=>setInfoFor(infoFor===e.id?null:e.id)}/><span>{blocked?"🚫":picked[e.id]?"●":"○"}</span></span></div><div style={S.exMeta}>{e.muscles.join(" · ")} · {Math.round(score)}/10</div>{animFor===e.id&&<div style={S.animBox} dangerouslySetInnerHTML={{__html:exerciseAnim(e.id)}}/>}{infoFor===e.id&&EXERCISE_INFO[e.id]&&<div style={S.infoBox}>{EXERCISE_INFO[e.id].t}{EXERCISE_INFO[e.id].c&&<div style={S.infoWarn}>⚠ Komplexe Technik – am besten mit Anleitung/Video lernen.</div>}</div>}</button>;})}</div>
        </section>

        <section style={S.card}>
          {pickedMains.length>0&&(<>
            <div style={S.cardLabel}>08 · Kraftwerte (1RM) — nur Grundübungen</div>
            <div style={S.hint}>Trag dein Maximum (1RM) der Grundübungen ein. Die App rechnet daraus alle Arbeitsgewichte — auch die der Assistenzübungen (z.B. enges Bankdrücken = 85 % vom Bankdrück-Arbeitsgewicht, Frontkniebeuge = 60 % von der Kniebeuge). Isolation & Cardio laufen nach Gefühl.</div>
            {pickedMains.map((m)=>(<div key={m.id} style={S.rmRow}><span style={{fontSize:13,fontWeight:700,flex:1}}>{m.name}</span><input type="number" placeholder="1RM kg" value={oneRM[m.id]||""} onChange={(e)=>setOneRM((o)=>({...o,[m.id]:e.target.value?+e.target.value:undefined}))} style={S.rmInput}/><span style={S.rmCalc}>{oneRM[m.id]?`~${(Math.round((oneRM[m.id]*blend.mainPct)/2.5)*2.5).toFixed(1)} kg`:"—"}</span></div>))}
          </>)}
        </section>

        <section style={S.card}>
          <button onClick={()=>setShowAll((v)=>!v)} style={S.toggleAll}>{showAll?"▾":"▸"} 09 · Alle {EXERCISES.length} Übungen frei wählen</button>
          {showAll&&["assist","isolation","skill","conditioning"].map((cat)=>(<div key={cat} style={{marginTop:12}}><div style={S.catHead}>{CAT_LABELS[cat]}</div><div style={S.exGrid}>{EXERCISES.filter((e)=>e.cat===cat).map((e)=>{const blocked=e.muscles.some((m)=>injuries[m])||!(e.equip.some((q)=>equip[q])||e.equip.includes("kg"));return <button key={e.id} disabled={blocked} onClick={()=>toggle(e.id)} style={exCard(!!picked[e.id],blocked)}><div style={{display:"flex",justifyContent:"space-between",gap:6}}><span style={{fontWeight:700,fontSize:12}}>{e.name}</span><span style={{display:"flex",alignItems:"center",gap:6}}>{hasAnim(e.id)&&<span onClick={(ev)=>{ev.stopPropagation();setAnimFor(animFor===e.id?null:e.id);}} style={S.animBtn} title="Bewegung ansehen">▶ Übung</span>}<InfoButton id={e.id} open={infoFor===e.id} onToggle={()=>setInfoFor(infoFor===e.id?null:e.id)}/><span>{blocked?"🚫":picked[e.id]?"●":"○"}</span></span></div><div style={S.exMeta}>{e.muscles.join(" · ")} · {Math.round(blendEff(e,blend))}/10</div>{animFor===e.id&&<div style={S.animBox} dangerouslySetInnerHTML={{__html:exerciseAnim(e.id)}}/>}{infoFor===e.id&&EXERCISE_INFO[e.id]&&<div style={S.infoBox}>{EXERCISE_INFO[e.id].t}{EXERCISE_INFO[e.id].c&&<div style={S.infoWarn}>⚠ Komplexe Technik – am besten mit Anleitung/Video lernen.</div>}</div>}</button>;})}</div></div>))}
        </section></>)}

        {(planMode==="manual"||sel.length>0)&&(<section style={{...S.card,position:"sticky",bottom:12,boxShadow:"0 -4px 24px rgba(0,0,0,.12)"}}>
          <div style={S.scoreRow}>
            <svg viewBox="0 0 120 120" width="84" height="84" style={{flexShrink:0}}><circle cx="60" cy="60" r="52" fill="none" stroke="#EADFD4" strokeWidth="12"/><circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="12" strokeDasharray={`${(pct/100)*326.7} 326.7`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dasharray .5s,stroke .3s"}}/><text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="800" fill={INK}>{pct}</text><text x="60" y="76" textAnchor="middle" fontSize="10" fill="#8A7E70">PASSUNG</text></svg>
            <div style={{flex:1,minWidth:180}}><ul style={S.reasonList}>{reasons.slice(0,6).map((r,i)=><li key={i} style={{...S.reason,color:r.ok?"#15803D":"#9D174D"}}><b>{r.ok?"\u2713":"!"}</b> {r.t}</li>)}</ul></div>
          </div>
          <button onClick={()=>setTab("plan")} disabled={sel.length===0||focuses.length===0} style={cta(sel.length===0||focuses.length===0)}>Wochenplan ansehen ({sel.length} Übungen)</button>
        </section>)}
      </>)}

      {tab==="plan"&&(<section style={S.card}>
        <div style={S.cardLabel}>Wochenplan · {FOCUSES[prim]?.label||"Mix"} · Woche {week}/{planWeeks} · ~{perDay||0} min/Tag</div>
        <div style={{...S.phaseBanner,marginBottom:14}}><span style={{...S.phaseBadge,background:PHASE_COLORS[phaseIdx]}}>{PHASES[phaseIdx].label}</span><span style={S.phaseNote}>{PHASES[phaseIdx].note}</span></div>
        {plan.length>0&&<div style={{marginBottom:14}}><button onClick={adoptAutoPlan} style={S.adoptBtn}>✎ Diesen Plan übernehmen &amp; bearbeiten</button><div style={{...S.hint,marginTop:6}}>Übernimmt den Plan als deinen eigenen – dort kannst du Übungen per + hinzufügen und per × entfernen; Tracking &amp; Auswertung folgen automatisch.</div></div>}
        {wodFor(prim,week)&&(<div style={S.wodBox}><div style={S.wodHead}>🔥 WOD der Woche · <b>{wodFor(prim,week).name}</b></div><div style={S.wodType}>{wodFor(prim,week).type}</div><div style={S.wodWork}>{wodFor(prim,week).work}</div><div style={S.wodNote}>Als Metcon-Finisher oder eigener Konditionstag. Rotiert wöchentlich.</div></div>)}
        {plan.length===0?<Empty msg="Noch keine Übungen gewählt."/>:(<>
          <div style={S.blendBox}><span style={S.blendTitle}>Kuratiert:</span><span style={S.blendItem}>Volumen-Ziel <b>{planObj.target} Sätze/Muskel/Woche</b> (aus Fokus)</span><span style={S.blendItem}>genutzt: <b>{planObj.usedIds.size}</b></span>{reserve.length>0&&<span style={S.blendItem}>Reserve: <b>{reserve.length}</b></span>}</div>
          {reserve.length>0&&<div style={S.hint}>Aus deiner Auswahl nutzt der Plan die effektivsten Übungen, bis das Wochenvolumen je Muskel gedeckt ist. Nicht eingeplant (Reserve, zum Tauschen): {reserve.map((e)=>e.name).join(", ")}.</div>}
          {Object.keys(muscleInfo.freq).length>0&&(<div style={S.freqBox}><div style={S.freqTitle}>Frequenz pro Muskelgruppe / Woche <span style={{fontWeight:400,color:"#8A7E70"}}>(ideal 2×)</span></div><div style={S.freqGrid}>{MUSCLE_LIST.filter((m)=>muscleInfo.freq[m]).map((m)=>{const f=muscleInfo.freq[m];const col=f===2?"#15803D":f===1?"#B45309":f>=3?"#9D174D":"#5C5247";return <span key={m} style={{...S.freqChip,color:col,borderColor:col}}>{m} {f}×</span>;})}</div>{muscleInfo.conflicts.length>0&&<div style={{...S.hint,color:"#9D174D",marginTop:8}}>An aufeinanderfolgenden Tagen mehrfach belastet (zu wenig Erholung): {muscleInfo.conflicts.join(", ")}. Mehr Pausentage oder andere Aufteilung hilft.</div>}</div>)}
          {plan.length>daysPerWeek&&<div style={S.warnBox}>Dein Plan hat <b>{plan.length} Einheiten</b>, du trainierst aber <b>{daysPerWeek}×/Woche</b> — manche Tage kombinieren zwei Einheiten (längere Trainingszeit). Mehr Tage wählen oder weniger Grundübungen entlastet.</div>}
          {schedule.map((s,i)=>{const has=s.trainings&&s.trainings.length>0;const totalTime=has?s.trainings.reduce((a,t)=>a+t.time,0):0;return (<div key={i} style={{...S.dayCard,opacity:has?1:0.6}}><div style={S.dayTitleRow}><span style={S.dayTitle}>{s.day} · {has?s.trainings.map((t)=>t.title).join(" + "):(recoActive==="rest"?"Ruhetag":"Aktive Erholung")}</span>{has&&<span style={S.dayTime}>~{totalTime} min</span>}</div>{has?s.trainings.map((tr,ti)=>(<div key={ti} style={ti>0?{marginTop:12,paddingTop:12,borderTop:`2px solid ${LINE}`}:{}}>{s.trainings.length>1&&<div style={{fontSize:12.5,fontWeight:800,marginBottom:8,color:RUST}}>{tr.title}</div>}{tr.blocks.map((b,j)=>(<div key={j} style={{marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}><span style={{...S.blockTag,background:b.color,marginBottom:0}}>{b.tag}</span>{(b.rir!==undefined||b.rest)&&<span style={S.blockMeta}>{b.rir!==undefined?`RIR ${b.rir}`:""}{b.rir!==undefined&&b.rest?" · ":""}{b.rest?`Pause ${b.rest}`:""}</span>}</div>{b.items.map((it,k)=><div key={k} style={S.planItem}><span style={{fontWeight:600}}>{it.n}</span><span style={S.planMeta}>{it.s}{it.w?" · "+it.w:""}</span></div>)}</div>))}<div style={S.rateRow}><span style={S.rateLabel}>Bewerten:</span>{[["gut","😀"],["okay","😐"],["schlecht","😖"]].map(([r,em])=><button key={r} onClick={()=>rateDay(tr.title,r)} style={rateBtn(ratingForDay(tr.title)===r,r)}>{em}</button>)}</div></div>)):(recoActive==="rest"?<div style={{fontSize:12,color:"#A8998A"}}>Komplette Pause · Erholung lässt wachsen</div>:<div><span style={{...S.blockTag,background:RECOVERY_OPTIONS[recoActive].color,marginBottom:6,display:"inline-block"}}>Aktive Erholung</span><div style={S.planItem}><span style={{fontWeight:600}}>{RECOVERY_OPTIONS[recoActive].label}</span></div><div style={{fontSize:11.5,color:"#8A7E70",marginTop:4}}>{RECOVERY_OPTIONS[recoActive].desc}</div></div>)}</div>);})}
        </>)}
        {plan.length>0&&<button onClick={()=>setTab("track")} style={{...cta(false),marginTop:6}}>Gewichte tracken →</button>}
      </section>)}

      {tab==="custom"&&(<section style={S.card}>
        {!customPlan?(<div style={{textAlign:"center",padding:"20px 0"}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:8}}>Eigenen Trainingsplan erstellen</div>
          <div style={{...S.hint,marginBottom:16}}>Lege selbst Tage an, wähle Übungen für Aufwärmen, Hauptteil und Abwärmen, und bestimme Sätze, Wiederholungen und die Dauer (1–16 Wochen) frei.</div>
          <button onClick={startCustom} style={cta(false)}>＋ Eigenen Plan erstellen</button>
          <div style={{marginTop:12}}><button onClick={loadExample} style={S.exampleBtn}>★ Beispielplan laden: Powerbuilding + Calisthenics (6 Tage)</button></div>
          <div style={{...S.hint,marginTop:8}}>Fertiger 6-Tage-Plan mit Grundübungen, Skills und Scapular-Warm-up – lädt direkt als dein Plan, den du dann frei anpassen kannst.</div>
        </div>):(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800}}>Mein Plan</div>
            <div style={{display:"flex",gap:12}}><button onClick={loadExample} style={S.linkPlain}>★ Beispielplan</button><button onClick={deleteCustomPlan} style={S.linkDanger}>Plan löschen</button></div>
          </div>
          <Field l={`Dauer: ${customPlan.weeks} Wochen`}><input type="range" min="1" max="16" value={customPlan.weeks} onChange={(e)=>setCustomWeeks(+e.target.value)} style={S.slider}/></Field>

          {customPlan.days.map((d)=>(<div key={d.id} style={S.cpDay}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8}}>
              <input value={d.name} onChange={(e)=>renameCustomDay(d.id,e.target.value)} style={S.cpDayName}/>
              <button onClick={()=>removeCustomDay(d.id)} style={S.delBtn}>×</button>
            </div>
            {[["warmup","Aufwärmen","#B45309"],["main","Hauptübungen","#8B0A0A"],["cooldown","Abwärmen","#0F766E"]].map(([sec,label,col])=>(
              <div key={sec} style={{marginBottom:10}}>
                <div style={{...S.blockTag,background:col,display:"inline-block",marginBottom:6}}>{label}</div>
                {d[sec].map((entry,idx)=>{const ex=EXERCISES.find((e)=>e.id===entry.id);return (
                  <div key={idx} style={{padding:"8px 0",borderBottom:`1px solid ${LINE}`}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{ex?ex.name:entry.id}</div>
                        {ex&&<div style={{fontSize:10.5,color:"#8A7E70",marginTop:2}}>{ex.muscles.join(" · ")}</div>}
                      </div>
                      <button onClick={()=>delCustomEx(d.id,sec,idx)} style={S.delBtn}>×</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6,flexWrap:"wrap"}}>
                      {sec==="main"?(<>
                        <input type="number" min="1" value={entry.sets} onChange={(e)=>updCustomEx(d.id,sec,idx,"sets",+e.target.value)} style={S.cpNum}/><span style={S.cpX}>×</span>
                        <input type="number" min="1" value={entry.reps} onChange={(e)=>updCustomEx(d.id,sec,idx,"reps",+e.target.value)} style={S.cpNum}/>
                        <span style={{...S.cpX,marginLeft:6}}>·</span>
                        <input type="number" placeholder="kg" value={entry.kg??""} onChange={(e)=>updCustomEx(d.id,sec,idx,"kg",e.target.value)} style={S.cpNum}/><span style={S.cpX}>kg</span>
                      </>):(<>
                        <input type="number" min="1" value={entry.min??5} onChange={(e)=>updCustomEx(d.id,sec,idx,"min",+e.target.value)} style={S.cpNum}/><span style={S.cpX}>Min</span>
                      </>)}
                    </div>
                  </div>);})}
                {adding&&adding.dayId===d.id&&adding.section===sec?(
                  <div style={S.cpPicker}>
                    <input autoFocus placeholder="Übung suchen…" value={exQuery} onChange={(e)=>setExQuery(e.target.value)} style={S.cpSearch}/>
                    <div style={{maxHeight:200,overflowY:"auto",marginTop:6}}>
                      {EXERCISES.filter((e)=>e.name.toLowerCase().includes(exQuery.toLowerCase())||e.muscles.some((mm)=>mm.toLowerCase().includes(exQuery.toLowerCase()))).slice(0,40).map((e)=>(
                        <button key={e.id} onClick={()=>addCustomEx(d.id,sec,e.id)} style={S.cpPick}>
                          <span style={{fontWeight:600,fontSize:12.5}}>{e.name}</span>
                          <span style={{fontSize:10,color:"#8A7E70"}}>{e.muscles.join(" · ")}</span>
                        </button>))}
                    </div>
                    <button onClick={()=>{setAdding(null);setExQuery("");}} style={{...S.linkDanger,marginTop:6}}>Abbrechen</button>
                  </div>
                ):(<button onClick={()=>{setAdding({dayId:d.id,section:sec});setExQuery("");}} style={S.cpAdd}>＋ Übung hinzufügen</button>)}
              </div>
            ))}
          </div>))}

          <button onClick={addCustomDay} style={{...cta(false),marginTop:4}}>＋ Tag hinzufügen</button>

          {customActive&&<div style={{...S.hint,marginTop:16,textAlign:"center"}}>Dein Tracking und die Auswertung für diesen Plan findest du in den Tabs <b>Tracking</b> und <b>Auswertung</b>.</div>}
        </div>)}
      </section>)}
      {tab==="track"&&(<section style={S.card}>
{customActive?(<>
          <div style={S.cardLabel}>Tracking · Eigener Plan · Woche {cWeek}</div>
          <Field l={`Woche ${cWeek} von ${customPlan.weeks}`}><input type="range" min="1" max={customPlan.weeks} value={cWeek} onChange={(e)=>setCWeek(+e.target.value)} style={S.slider}/></Field>
          {customPlan.days.map((d)=>(<div key={d.id} style={S.cpDay}>
            <div style={{fontWeight:800,fontSize:13,marginBottom:8}}>{d.name}</div>
            {["warmup","main","cooldown"].flatMap((sec)=>d[sec].map((entry,idx)=>{const ex=EXERCISES.find((e)=>e.id===entry.id);const k=`${d.id}:${entry.id}:${cWeek}`;const log=customLog[k]||{};const ser=customSeries(d.id,entry.id);
              if(sec!=="main")return (<div key={sec+idx} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${LINE}`}}><div style={{fontSize:12.5,color:"#5C5247"}}>{ex?ex.name:entry.id}</div><div style={{fontSize:12,fontWeight:700,color:"#8A7E70"}}>{entry.min??5} Min</div></div>);
              return (
              <div key={sec+idx} style={{borderBottom:`1px solid ${LINE}`,padding:"8px 0"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12.5}}>{ex?ex.name:entry.id}</div><div style={{fontSize:10,color:"#8A7E70"}}>Ziel {entry.sets}×{entry.reps}{entry.kg?` · ${entry.kg} kg`:""}{ex?" · "+ex.muscles.join(", "):""}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <input type="number" placeholder="kg" value={log.w??entry.kg??""} onChange={(e)=>logCustom(d.id,entry.id,"w",e.target.value)} style={S.cpNum}/><span style={S.cpX}>kg</span>
                    <input type="number" placeholder="Wdh" value={log.r??""} onChange={(e)=>logCustom(d.id,entry.id,"r",e.target.value)} style={S.cpNum}/>
                  </div>
                </div>
                {ser.length>1&&(<div style={{height:110,marginTop:8}}><ResponsiveContainer width="100%" height="100%"><LineChart data={ser} margin={{top:6,right:8,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#EADFD4"/><XAxis dataKey="week" tick={{fontSize:10,fill:"#8A7E70"}} tickFormatter={(w)=>`W${w}`}/><YAxis tick={{fontSize:10,fill:"#8A7E70"}} domain={["dataMin - 5","dataMax + 5"]}/><Tooltip formatter={(v,n)=>[`${v} kg`,n==="e1rm"?"e1RM":"Gewicht"]} labelFormatter={(w)=>`Woche ${w}`}/><Line type="monotone" dataKey="weight" stroke={RUST} strokeWidth={2.5} dot={{r:3}}/><Line type="monotone" dataKey="e1rm" stroke="#0F766E" strokeWidth={2} strokeDasharray="4 3" dot={{r:2}}/></LineChart></ResponsiveContainer></div>)}
              </div>);}))}
          </div>))}
          <div style={S.disclaimer}>Trag Gewicht und geschaffte Wiederholungen pro Woche ein. Die gestrichelte Linie ist dein geschätztes 1RM (Epley).</div>
        </>):(<>
        <div style={S.cardLabel}>Tracking · Woche {week} · automatische Progression</div>
        {trackItems.length===0?<Empty msg="Generiere zuerst einen Plan."/>:(<>{trackItems.map((it)=>{const t=track[it.id]||{};const hist=history[it.id]||[];const mm=(it.s||"3x10").match(/(\d+)\D+(\d+)(?:\D+(\d+))?/);const nSets=mm?parseInt(mm[1]):3;const lo=mm?parseInt(mm[2]):10;const hi=mm&&mm[3]?parseInt(mm[3]):lo;const st=setsStatus(t.sets,lo,hi);return (<div key={it.id} style={S.trackCard}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:700,fontSize:13.5}}>{it.n}</span><span style={S.targetBadge}>Ziel {it.s}{it.w&&it.w.includes("kg")?" · "+it.w:""}</span></div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input type="number" placeholder="Gewicht kg" value={t.weight||""} onChange={(e)=>logWeight(it.id,e.target.value,lo,hi)} style={{...S.trackInput,maxWidth:130}}/>{t.next&&<span style={S.nextBadge}>nächste: {t.next} kg</span>}</div><div style={{marginBottom:8}}><div style={{fontSize:11,color:"#8A7E70",marginBottom:4,fontWeight:700}}>Geschaffte Wdh. pro Satz (Ziel {lo}–{hi}):</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Array.from({length:nSets}).map((_,i)=>{const v=(t.sets||[])[i];const hit=v!==undefined&&v!==""&&parseInt(v)>=hi;return <input key={i} type="number" placeholder={`S${i+1}`} value={v||""} onChange={(e)=>logSetRep(it.id,i,e.target.value,lo,hi)} style={{...S.setInput,borderColor:v?(hit?"#15803D":"#B45309"):LINE,background:v?(hit?"#E8F5E9":"#FEF3E2"):"#fff"}}/>;})}</div></div>{st&&<div style={{fontSize:12,fontWeight:700,color:st.c,marginBottom:8}}>{st.t}</div>}<button onClick={()=>saveWeek(it.id)} style={{...S.saveBtn,width:"100%"}}>✓ Woche {week} speichern</button>{hist.length>1&&(<div style={{height:120,marginTop:12}}><ResponsiveContainer width="100%" height="100%"><LineChart data={hist} margin={{top:6,right:8,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#EADFD4"/><XAxis dataKey="week" tick={{fontSize:10,fill:"#8A7E70"}} tickFormatter={(w)=>`W${w}`}/><YAxis tick={{fontSize:10,fill:"#8A7E70"}} domain={["dataMin - 5","dataMax + 5"]}/><Tooltip formatter={(v,n)=>[`${v} kg`,n==="e1rm"?"e1RM":"Arbeitsgewicht"]} labelFormatter={(w)=>`Woche ${w}`}/><Line type="monotone" dataKey="weight" stroke={RUST} strokeWidth={2.5} dot={{r:3}}/><Line type="monotone" dataKey="e1rm" stroke="#0F766E" strokeWidth={2} strokeDasharray="4 3" dot={{r:2}}/></LineChart></ResponsiveContainer></div>)}</div>);})}<div style={S.disclaimer}>Double Progression: erst die Wiederholungen im Bereich (z.B. 3–5) bis zum Maximum steigern, dann Gewicht +2,5 % und zurück ans Bereichs-Minimum. Grün = oberes Ende erreicht. Die gestrichelte Linie im Diagramm ist dein geschätztes 1RM (Epley) — der eigentliche Kraft-Indikator.</div></>)}</>)}
      </section>)}

      {tab==="eval"&&(<section style={S.card}>
{customActive?(<>
          <div style={S.cardLabel}>Auswertung · Eigener Plan</div>
          {(()=>{const charts=[];customPlan.days.forEach((d)=>{[...d.main,...d.warmup,...d.cooldown].forEach((entry)=>{const ser=customSeries(d.id,entry.id);if(ser.length>=2){const ex=EXERCISES.find((e)=>e.id===entry.id);charts.push({key:d.id+entry.id,name:ex?ex.name:entry.id,day:d.name,ser});}});});
            if(charts.length===0)return <Empty msg="Noch keine Fortschrittsdaten. Trag im Tracking-Tab über mehrere Wochen Werte ein."/>;
            return (<>{charts.map((c)=>{const first=c.ser[0],last=c.ser[c.ser.length-1];const up=last.e1rm-first.e1rm;return (<div key={c.key} style={S.cpDay}>
              <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
              <div style={{fontSize:10.5,color:"#8A7E70",marginBottom:6}}>{c.day} · {first.weight}→{last.weight} kg · e1RM {first.e1rm}→{last.e1rm} ({up>=0?"+":""}{up})</div>
              <div style={{height:130}}><ResponsiveContainer width="100%" height="100%"><LineChart data={c.ser} margin={{top:6,right:8,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#EADFD4"/><XAxis dataKey="week" tick={{fontSize:10,fill:"#8A7E70"}} tickFormatter={(w)=>`W${w}`}/><YAxis tick={{fontSize:10,fill:"#8A7E70"}} domain={["dataMin - 5","dataMax + 5"]}/><Tooltip formatter={(v,nm)=>[`${v} kg`,nm==="e1rm"?"e1RM":"Gewicht"]} labelFormatter={(w)=>`Woche ${w}`}/><Line type="monotone" dataKey="weight" stroke={RUST} strokeWidth={2.5} dot={{r:3}}/><Line type="monotone" dataKey="e1rm" stroke="#0F766E" strokeWidth={2} strokeDasharray="4 3" dot={{r:2}}/></LineChart></ResponsiveContainer></div>
            </div>);})}<div style={S.disclaimer}>Durchgezogene Linie = Arbeitsgewicht, gestrichelt = geschätztes 1RM (Epley). Steigt das e1RM über die Wochen, wirst du stärker.</div></>);
          })()}
        </>):(<>
        <div style={S.cardLabel}>Auswertung · Trainingsqualität</div>
        {(()=>{const all=[];Object.entries(ratings).forEach(([title,arr])=>arr.forEach((x)=>all.push({title,...x})));
          if(all.length===0)return <Empty msg="Noch keine Einheiten bewertet. Bewerte sie im Plan-Tab."/>;
          const g=all.filter((x)=>x.rating==="gut").length,o=all.filter((x)=>x.rating==="okay").length,b=all.filter((x)=>x.rating==="schlecht").length,tot=all.length;
          const wks={};all.forEach((x)=>{wks[x.week]=wks[x.week]||{gut:0,okay:0,schlecht:0};wks[x.week][x.rating]++;});
          const weekData=Object.keys(wks).map(Number).sort((a,b)=>a-b).map((w)=>({week:w,score:Math.round(((wks[w].gut*2+wks[w].okay)/((wks[w].gut+wks[w].okay+wks[w].schlecht)*2))*100)}));
          return (<>
            <div style={S.nutriGrid}>
              <Stat label="Gute Einheiten" value={`${Math.round(g/tot*100)}%`} sub={`${g} von ${tot}`} color="#15803D"/>
              <Stat label="Okay" value={`${Math.round(o/tot*100)}%`} sub={`${o} von ${tot}`} color="#B45309"/>
              <Stat label="Schlecht" value={`${Math.round(b/tot*100)}%`} sub={`${b} von ${tot}`} color="#9D174D"/>
            </div>
            {weekData.length>1&&(<div style={{height:140,marginTop:16}}><ResponsiveContainer width="100%" height="100%"><LineChart data={weekData} margin={{top:6,right:8,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#EADFD4"/><XAxis dataKey="week" tick={{fontSize:10,fill:"#8A7E70"}} tickFormatter={(w)=>`W${w}`}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:"#8A7E70"}}/><Tooltip formatter={(v)=>`${v}% Qualität`} labelFormatter={(w)=>`Woche ${w}`}/><Line type="monotone" dataKey="score" stroke={RUST} strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer></div>)}
            {trendWarning&&(<div style={S.warnBox}><b>⚠ Negativ-Trend erkannt.</b> Mehrere schwache Einheiten zuletzt. Das ist oft ein Zeichen für unzureichende Erholung — erwäge einen Deload (eine leichte Woche bei ~60 %) oder reduziere kurzfristig das Volumen. <b>Die App ändert nichts automatisch — du entscheidest.</b></div>)}
            <div style={S.disclaimer}>Qualitäts-Score je Woche: gut = 100 %, okay = 50 %, schlecht = 0 %, gemittelt. Eine einzelne schwache Woche ist normal (Schlaf, Stress) — erst ein anhaltender Trend ist ein Signal.</div>
          </>);
        })()}
        </>)}
      </section>)}

      {tab==="nutri"&&(<section style={S.card}>
        <div style={S.cardLabel}>Ernährung · individuell berechnet</div>
        <Field l={`Körpergewicht: ${bw} kg`}><input type="range" min="45" max="160" value={bw} onChange={(e)=>setBw(+e.target.value)} style={S.slider}/></Field>
        <div style={S.weightLogBox}>
          <div style={S.weightLogTitle}>Körpergewicht-Verlauf</div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input type="date" value={wDate} max={new Date().toISOString().slice(0,10)} onChange={(e)=>setWDate(e.target.value)} style={S.dateInput}/>
            <input type="number" inputMode="decimal" placeholder="kg" value={wKg} onChange={(e)=>setWKg(e.target.value)} style={{...S.trackInput,maxWidth:90}}/>
            <button onClick={saveWeightEntry} style={S.saveBtn}>✓</button>
          </div>
          {weightLog.length>=2&&(<div style={{height:140,marginTop:12}}><ResponsiveContainer width="100%" height="100%"><LineChart data={weightLog} margin={{top:6,right:8,left:-18,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#EADFD4"/><XAxis dataKey="date" tick={{fontSize:9,fill:"#8A7E70"}} tickFormatter={(d)=>d.slice(5)}/><YAxis domain={["dataMin - 2","dataMax + 2"]} tick={{fontSize:10,fill:"#8A7E70"}}/><Tooltip formatter={(v)=>`${v} kg`} labelFormatter={(d)=>d}/><Line type="monotone" dataKey="kg" stroke={RUST} strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer></div>)}
          {weightLog.length>0&&(<div style={{marginTop:10}}>{[...weightLog].reverse().slice(0,6).map((w)=>(<div key={w.date} style={S.weightRow}><span style={{fontSize:12.5,color:"#5C5247"}}>{w.date}</span><span style={{fontSize:13,fontWeight:700}}>{w.kg} kg</span><button onClick={()=>delWeightEntry(w.date)} style={S.delBtn}>×</button></div>))}{weightLog.length>6&&<div style={S.hint}>… und {weightLog.length-6} weitere Einträge (im Diagramm sichtbar).</div>}</div>)}
          {weightLog.length===0&&<div style={S.hint}>Trag Datum und Gewicht ein und speichere mit ✓. Ab zwei Einträgen erscheint die Verlaufskurve.</div>}
        </div>
        <Field l={`Körpergröße: ${height} cm`}><input type="range" min="145" max="210" value={height} onChange={(e)=>setHeight(+e.target.value)} style={S.slider}/></Field>
        <Field l={`Körperfettanteil: ${bodyfat} %`}><input type="range" min="5" max="45" value={bodyfat} onChange={(e)=>setBodyfat(+e.target.value)} style={S.slider}/></Field>
        <Field l="Aktivitätslevel"><div style={S.chipWrap}>{[[1.375,"leicht aktiv"],[1.55,"moderat aktiv"],[1.725,"sehr aktiv"]].map(([v,l])=><button key={v} onClick={()=>setActivity(v)} style={chip(activity===v)}>{l}</button>)}</div></Field>
        <div style={S.nutriGrid}>
          <Stat label="Fettfreie Masse" value={`${lbm} kg`} sub={`KFA ${bodyfat}%`} color="#0F766E"/>
          <Stat label="Grundumsatz" value={`${bmr} kcal`} sub="Katch-McArdle" color="#7A4A00"/>
          <Stat label="Gesamtumsatz" value={`${maintenance} kcal`} sub="mit Aktivität" color="#B45309"/>
          <Stat label="Protein / Tag" value={`${protein} g`} sub="2,2 g/kg fettfrei" color="#8B0A0A"/>
          <Stat label="Ziel-Kalorien" value={`${target} kcal`} sub={blend.kcalAdj===0?"Erhalt":blend.kcalAdj>0?`+${blend.kcalAdj}`:`${blend.kcalAdj}`} color="#15803D"/>
          <Stat label="BMI" value={`${bmi}`} sub={bmi<18.5?"untergewichtig":bmi<25?"normal":bmi<30?"übergewichtig":"adipös"} color="#6B21A8"/>
        </div>
        <div style={S.disclaimer}>Berechnung über die fettfreie Masse (Katch-McArdle), die den Körperfettanteil berücksichtigt — genauer als reine Gewichtsformeln. Protein an der fettfreien Masse bemessen (schützt Muskulatur). BMI nur als grobe Einordnung (sagt bei viel Muskelmasse wenig aus). Feinjustierung nach 2–3 Wochen anhand der Waage.</div>
      </section>)}

      {tab==="data"&&(<section style={S.card}>
        <div style={S.cardLabel}>Datensicherung</div>
        <div style={S.disclaimer}>Daten liegen nur auf diesem Gerät (keine Cloud, keine Kosten). Daten werden dauerhaft auf diesem Gerät gespeichert (IndexedDB). Trotzdem regelmäßig als Datei sichern — schützt bei Gerätewechsel oder Datenverlust.</div>
        <button onClick={exportData} style={{...cta(false),marginTop:14}}>⬇ Backup exportieren (.json)</button>
        <label style={{...S.importBtn,marginTop:10}}>⬆ Backup importieren<input type="file" accept="application/json" onChange={importData} style={{display:"none"}}/></label>
      </section>)}

      <footer style={S.footer}>Alle Berechnungen lokal. Keine Daten verlassen dein Gerät. Keine laufenden Kosten.</footer>
    </div>
  );
}

function Field({l,children}){return <div style={{marginBottom:14}}><div style={S.fieldLabel}>{l}</div>{children}</div>;}
function Stat({label,value,sub,color}){return <div style={{...S.statCard,borderTop:`3px solid ${color}`}}><div style={S.statLabel}>{label}</div><div style={S.statValue}>{value}</div><div style={S.statSub}>{sub}</div></div>;}
function Pool({e,score,on,onToggle}){const c=score>=8?"#15803D":score>=6?"#B45309":"#A8998A";const [showInfo,setShowInfo]=useState(false);const info=EXERCISE_INFO[e.id];return <div style={{marginBottom:6}}><button onClick={onToggle} style={poolRow(on)}><div style={{flex:1,textAlign:"left"}}><div style={{fontWeight:700,fontSize:13}}>{e.name}</div><div style={{fontSize:10.5,color:"#8A7E70",marginTop:2}}>{e.muscles.join(" · ")}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}>{info&&<span onClick={(ev)=>{ev.stopPropagation();setShowInfo((v)=>!v);}} style={S.infoBtn} title="Ausführung">i</span>}<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}><span style={{fontSize:10,fontWeight:800,color:c}}>{score}/10</span><div style={{width:46,height:5,background:"#EADFD4",borderRadius:3,overflow:"hidden"}}><div style={{width:`${score*10}%`,height:"100%",background:c}}/></div></div><span style={{color:on?RUST:"#C8BBAA",fontWeight:800,fontSize:16}}>{on?"●":"＋"}</span></div></button>{showInfo&&info&&<div style={S.infoBox}>{info.t}{info.c&&<div style={S.infoWarn}>⚠ Komplexe Technik – am besten mit Anleitung/Video lernen.</div>}</div>}</div>;}

function InfoButton({ id, open, onToggle }){
  const info = EXERCISE_INFO[id];
  if(!info) return null;
  return (
    <span onClick={(e)=>{e.stopPropagation();onToggle();}} style={S.infoBtn} title="Ausführung">i</span>
  );
}

function Empty({msg}){return <div style={{padding:30,textAlign:"center",color:"#A8998A",fontSize:14}}>{msg}</div>;}

const INK="#1A1410",PAPER="#F7F2EA",CARD="#FFFFFF",LINE="#E5DACB",RUST="#C2410C";
const CSS=`*{box-sizing:border-box}button:focus-visible{outline:3px solid ${RUST};outline-offset:2px}input:focus-visible,select:focus-visible{outline:2px solid ${RUST}}`;
const S={
  page:{minHeight:"100vh",background:PAPER,color:INK,fontFamily:"'Inter',system-ui,sans-serif",padding:"20px 16px 60px",maxWidth:760,margin:"0 auto"},
  header:{padding:"12px 4px 14px"},kicker:{fontSize:10,letterSpacing:"0.12em",fontWeight:700,color:RUST,marginBottom:8},
  h1:{fontSize:34,lineHeight:1.02,margin:0,fontWeight:850,fontFamily:"Georgia,serif",letterSpacing:"-0.02em"},
  tabs:{display:"flex",gap:5,marginBottom:14,background:"#EDE4D7",padding:5,borderRadius:12,flexWrap:"wrap"},
  toast:{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:INK,color:"#fff",padding:"10px 18px",borderRadius:999,fontSize:13,fontWeight:700,zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,.2)"},
  card:{background:CARD,border:`1px solid ${LINE}`,borderRadius:14,padding:18,marginBottom:16},
  cardLabel:{fontSize:11,letterSpacing:"0.1em",fontWeight:700,color:"#A8998A",marginBottom:14},
  fieldLabel:{fontSize:12,fontWeight:700,color:"#5C5247",marginBottom:8},
  chipWrap:{display:"flex",gap:8,flexWrap:"wrap"},slider:{width:"100%",accentColor:RUST},
  catHead:{fontSize:13,fontWeight:800,marginBottom:10},
  exGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8},
  exMeta:{fontSize:10.5,color:"#8A7E70",marginTop:4},
  ecoBox:{marginTop:12,padding:14,background:PAPER,borderRadius:12,border:`1px solid ${LINE}`},
  ecoHead:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:10},
  ecoTitle:{fontSize:13.5,fontWeight:800,marginBottom:12},
  ecoSub:{fontSize:11,fontWeight:800,color:RUST,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8},
  hint:{marginTop:10,fontSize:12,color:"#8A7E70",fontStyle:"italic"},
  toggleAll:{width:"100%",textAlign:"left",background:"none",border:"none",fontSize:11,letterSpacing:"0.1em",fontWeight:700,color:"#A8998A",cursor:"pointer",padding:0},
  phaseBanner:{display:"flex",alignItems:"center",gap:10,marginTop:4,flexWrap:"wrap"},
  phaseBadge:{fontSize:11,fontWeight:800,color:"#fff",padding:"4px 10px",borderRadius:6,letterSpacing:"0.04em"},
  phaseNote:{fontSize:12,color:"#5C5247"},
  scoreRow:{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",marginBottom:12},
  reasonList:{listStyle:"none",margin:0,padding:0,display:"flex",flexDirection:"column",gap:4},
  reason:{fontSize:12,display:"flex",gap:6,alignItems:"baseline"},
  dayCard:{border:`1px solid ${LINE}`,borderRadius:10,padding:14,marginBottom:10,background:PAPER},
  dayTitleRow:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10},
  dayTitle:{fontSize:14.5,fontWeight:800},dayTime:{fontSize:12,color:"#A8998A",fontWeight:700},
  blockTag:{fontSize:10,fontWeight:800,color:"#fff",padding:"3px 8px",borderRadius:5,display:"inline-block",marginBottom:6},
  planItem:{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 2px",borderBottom:`1px solid ${LINE}`},
  planMeta:{color:"#8A7E70",fontSize:12},
  trackCard:{border:`1px solid ${LINE}`,borderRadius:10,padding:14,marginBottom:10,background:PAPER},
  trackInput:{width:"100%",padding:"8px",borderRadius:7,border:`1.5px solid ${LINE}`,fontSize:13},
  trackSelect:{width:"100%",padding:"8px 6px",borderRadius:7,border:`1.5px solid ${LINE}`,fontSize:12.5,background:"#fff"},
  saveBtn:{padding:"8px 14px",borderRadius:7,border:"none",background:"#15803D",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"},
  nextBadge:{fontSize:11,fontWeight:800,color:"#15803D",background:"#E8F5E9",padding:"3px 8px",borderRadius:6},
  targetBadge:{fontSize:11,fontWeight:700,color:"#5C5247",background:PAPER,padding:"3px 8px",borderRadius:6},
  setInput:{width:52,padding:"7px 4px",borderRadius:7,border:`1.5px solid ${LINE}`,fontSize:13,textAlign:"center"},
  nutriGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginTop:4},
  statCard:{background:PAPER,borderRadius:10,padding:"14px 12px",textAlign:"center"},
  statLabel:{fontSize:11,color:"#8A7E70",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"},
  statValue:{fontSize:24,fontWeight:850,margin:"4px 0"},statSub:{fontSize:11,color:"#8A7E70"},
  disclaimer:{fontSize:12,color:"#5C5247",lineHeight:1.5,marginTop:14,background:PAPER,padding:12,borderRadius:8},
  importBtn:{display:"block",width:"100%",padding:"14px",borderRadius:10,fontSize:15,fontWeight:800,cursor:"pointer",border:`1.5px solid ${INK}`,background:"#fff",color:INK,textAlign:"center"},
  rmRow:{display:"flex",alignItems:"center",gap:10,marginTop:8},
  rmInput:{width:90,padding:"7px 8px",borderRadius:7,border:`1.5px solid ${LINE}`,fontSize:13},
  rmCalc:{fontSize:11.5,color:"#15803D",fontWeight:700,minWidth:80,textAlign:"right"},
  focusRow:{display:"flex",alignItems:"center",gap:10,marginBottom:6},
  focusPct:{fontSize:12,fontWeight:800,color:RUST,minWidth:38,textAlign:"right"},
  blendBox:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",background:PAPER,borderRadius:10,padding:"10px 12px",marginTop:14,borderLeft:`3px solid ${RUST}`},
  blendTitle:{fontSize:11,fontWeight:800,color:"#8A7E70",textTransform:"uppercase",letterSpacing:"0.04em"},
  blendItem:{fontSize:12,color:"#5C5247"},
  rateRow:{display:"flex",alignItems:"center",gap:8,marginTop:10,paddingTop:10,borderTop:`1px dashed ${LINE}`},
  rateLabel:{fontSize:12,fontWeight:700,color:"#5C5247",marginRight:4},
  warnBox:{fontSize:12.5,color:"#7A2A0A",lineHeight:1.5,marginTop:16,background:"#FEF3E2",padding:14,borderRadius:10,border:"1px solid #F4A261"},
  modeWrap:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  modeBtn:{textAlign:"left",padding:16,borderRadius:12,border:`1.5px solid ${LINE}`,background:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",gap:6},
  modeBtnActive:{border:`2px solid ${RUST}`,background:"#FFF6F0"},
  modeIcon:{fontSize:26},
  modeTitle:{fontSize:14.5,fontWeight:800,color:INK},
  modeDesc:{fontSize:11.5,color:"#5C5247",lineHeight:1.45},
  recoBar:{marginTop:8},
  recoTag:{display:"inline-block",fontSize:11.5,fontWeight:800,color:"#0F766E",background:"#E6F4F1",padding:"4px 10px",borderRadius:999},
  freqBox:{background:PAPER,borderRadius:10,padding:12,marginBottom:12},
  freqTitle:{fontSize:12,fontWeight:800,marginBottom:8},
  freqGrid:{display:"flex",flexWrap:"wrap",gap:6},
  freqChip:{fontSize:11.5,fontWeight:700,padding:"3px 9px",borderRadius:999,border:"1.5px solid",background:"#fff"},
  animBtn:{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:999,background:"#0F766E",color:"#fff",fontSize:10,fontWeight:800,cursor:"pointer",lineHeight:1.4,flexShrink:0,whiteSpace:"nowrap"},
  animBox:{marginTop:8,background:"#FBF7F0",border:`1px solid ${LINE}`,borderRadius:8,padding:6,maxWidth:200},
  infoBtn:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",border:`1.5px solid ${RUST}`,color:RUST,fontSize:11,fontWeight:800,fontStyle:"italic",fontFamily:"Georgia,serif",cursor:"pointer",lineHeight:1,flexShrink:0},
  infoBox:{marginTop:8,padding:"8px 10px",background:"#FBF7F0",border:`1px solid ${LINE}`,borderRadius:8,fontSize:11.5,lineHeight:1.45,color:"#5C5247"},
  infoWarn:{marginTop:6,fontSize:11,fontWeight:700,color:"#9D174D"},
  cpDay:{background:PAPER,borderRadius:10,padding:12,marginBottom:12,marginTop:8},
  cpDayName:{flex:1,fontSize:14,fontWeight:800,border:"none",borderBottom:`2px solid ${LINE}`,background:"transparent",color:INK,padding:"4px 2px",fontFamily:"inherit"},
  cpRow:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"7px 0",borderBottom:`1px solid ${LINE}`},
  cpNum:{width:52,padding:"6px 4px",borderRadius:6,border:`1.5px solid ${LINE}`,fontSize:13,textAlign:"center",background:"#fff",color:INK,fontFamily:"inherit"},
  cpX:{fontSize:12,color:"#8A7E70",fontWeight:700},
  cpAdd:{marginTop:6,width:"100%",padding:"8px",borderRadius:7,border:`1.5px dashed ${RUST}`,background:"transparent",color:RUST,fontSize:12.5,fontWeight:700,cursor:"pointer"},
  cpPicker:{marginTop:6,background:"#fff",border:`1.5px solid ${RUST}`,borderRadius:8,padding:8},
  cpSearch:{width:"100%",padding:"8px",borderRadius:6,border:`1.5px solid ${LINE}`,fontSize:13,background:"#fff",color:INK,fontFamily:"inherit",boxSizing:"border-box"},
  cpPick:{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:1,width:"100%",textAlign:"left",padding:"7px 8px",borderRadius:6,border:"none",borderBottom:`1px solid ${LINE}`,background:"transparent",cursor:"pointer"},
  adoptBtn:{width:"100%",padding:"11px 14px",borderRadius:9,border:"none",background:RUST,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"},
  exampleBtn:{width:"100%",padding:"11px 14px",borderRadius:9,border:`2px solid ${RUST}`,background:"#FBEDE4",color:RUST,fontSize:13,fontWeight:800,cursor:"pointer"},
  linkPlain:{border:"none",background:"none",color:RUST,fontSize:12.5,fontWeight:700,cursor:"pointer",textDecoration:"underline"},
  linkDanger:{border:"none",background:"none",color:"#9D174D",fontSize:12.5,fontWeight:700,cursor:"pointer",textDecoration:"underline"},
  weightLogBox:{background:PAPER,borderRadius:10,padding:14,marginTop:4,marginBottom:14},
  weightLogTitle:{fontSize:12,fontWeight:800,marginBottom:10},
  dateInput:{padding:"8px",borderRadius:7,border:`1.5px solid ${LINE}`,fontSize:13,background:"#fff",color:INK,fontFamily:"inherit"},
  weightRow:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"6px 0",borderBottom:`1px solid ${LINE}`},
  delBtn:{border:"none",background:"none",color:"#9D174D",fontSize:18,fontWeight:800,cursor:"pointer",lineHeight:1,padding:"0 4px"},
  recBtn:{marginTop:14,width:"100%",padding:"12px",borderRadius:10,border:`1.5px solid ${RUST}`,background:"#FFF6F0",color:RUST,fontWeight:800,fontSize:13.5,cursor:"pointer"},
  wodBox:{background:"#1A1410",color:"#fff",borderRadius:12,padding:16,marginBottom:14},
  wodHead:{fontSize:14,fontWeight:800,marginBottom:4},
  wodType:{fontSize:11,fontWeight:700,color:"#F4A261",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8},
  wodWork:{fontSize:13.5,lineHeight:1.5,color:"#EDE4D7"},
  wodNote:{fontSize:11,color:"#A8998A",marginTop:8,fontStyle:"italic"},
  blockMeta:{fontSize:11,fontWeight:700,color:"#8A7E70"},
  footer:{fontSize:11.5,color:"#A8998A",textAlign:"center",marginTop:24,lineHeight:1.5},
};
function tabBtn(a){return {flex:"1 0 auto",padding:"9px 8px",borderRadius:8,border:"none",background:a?"#fff":"transparent",color:a?INK:"#8A7E70",fontWeight:800,fontSize:12.5,cursor:"pointer",boxShadow:a?"0 1px 4px rgba(0,0,0,.08)":"none"};}
function chip(a){return {padding:"8px 14px",borderRadius:999,fontSize:13,fontWeight:700,cursor:"pointer",border:`1.5px solid ${a?RUST:LINE}`,background:a?RUST:"#fff",color:a?"#fff":INK};}
function chipInj(a){return {padding:"8px 14px",borderRadius:999,fontSize:13,fontWeight:700,cursor:"pointer",border:`1.5px solid ${a?"#9D174D":LINE}`,background:a?"#9D174D":"#fff",color:a?"#fff":INK};}
function exCard(a,blocked){return {textAlign:"left",padding:"9px 11px",borderRadius:10,cursor:blocked?"not-allowed":"pointer",border:`1.5px solid ${a?RUST:LINE}`,background:blocked?"#F0EBE3":a?"#FFF6F0":"#fff",color:blocked?"#B5A998":INK,width:"100%",opacity:blocked?0.7:1};}
function poolRow(on){return {display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 11px",marginBottom:6,borderRadius:9,cursor:"pointer",border:`1.5px solid ${on?RUST:LINE}`,background:on?"#FFF6F0":"#fff",color:INK};}
function rateBtn(a,r){const col=r==="gut"?"#15803D":r==="okay"?"#B45309":"#9D174D";return {padding:"6px 12px",borderRadius:999,fontSize:16,cursor:"pointer",border:`1.5px solid ${a?col:LINE}`,background:a?col:"#fff",lineHeight:1};}
function cta(d){return {width:"100%",padding:"14px",borderRadius:10,fontSize:15,fontWeight:800,cursor:d?"not-allowed":"pointer",border:"none",background:d?"#D8CDBE":INK,color:"#fff"};}
