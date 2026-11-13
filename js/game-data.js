/* ฐานข้อมูลการ์ด — แก้ไขได้ที่ไฟล์ game-data.json แล้วคัดลอกมาวางที่นี่ หรือแก้ตรงนี้โดยตรง */
window.GD = {
 "project": "SAMAS CODEBREAKERS: FUSION DUEL",
 "version": "prototype-data-2026-11-11",
 "language": "th",
 "sourceNotes": [
  "Core 15 complete-word cards from prototype manual",
  "10 expansion sandhi cards from later conversation with boosted effects",
  "All linguistic analyses require verification before graded play",
  "Earlier 20-card art set is archived separately; not interchangeable with current 20 roots"
 ],
 "rules": {
  "players": 4,
  "teams": 2,
  "playersPerTeam": 2,
  "turnMinutesEstimate": [
   20,
   30
  ],
  "mainDeckSizePerTeam": 22,
  "openingHandSize": 5,
  "drawPerTurn": 1,
  "firstTeamSkipsFirstDraw": true,
  "fusionSlotsPerTeam": 2,
  "completedSlotsPerTeam": 4,
  "summonsPerTurn": 1,
  "questionsPerSummon": 2,
  "questionsPerEffect": 1,
  "winAtCompletedCards": 4,
  "timeLimitMinutes": 30,
  "timeLimitTie": "draw_or_teacher_tiebreak",
  "failedSummon": "roots_stay_fusion_right_lost_for_turn",
  "rootCardsConsumedToDiscard": true,
  "sandhiMagicReturnedToSharedPool": true,
  "completedCardsPermanent": true,
  "completedCardsImmuneToRemoval": true,
  "teamExtraDeckSeparate": true,
  "sharedExtraDeck": false,
  "sharedSandhiMagic": true,
  "phases": [
   "DRAW",
   "PREPARATION",
   "FUSION",
   "KNOWLEDGE_CHECK",
   "EFFECT",
   "END"
  ],
  "effectsRequireSuccessfulExtraQuestion": true,
  "effectUseLimitPerSummon": 1,
  "effectReactionsExpire": "end_of_next_turn_or_next_round_as_specified",
  "deckEmptyDraw": "skip",
  "handSharing": "team_shared",
  "duplicatesAllowedInMainDeck": true,
  "sameCompletedWordAcrossTeamsAllowed": true,
  "duplicateSummonWithinSameTeam": "unspecified_disallow_until_teacher_confirms"
 },
 "layout": {
  "orientation": "landscape",
  "teamA": "top_blue",
  "teamB": "bottom_red",
  "perTeamOrderTopToBottom": [
   "completed_word_zone_4",
   "root_fusion_zone_2"
  ],
  "extraDeck": "upper_left_of_each_team",
  "mainDeck": "right_of_each_team",
  "discard": "separate_slot_right_of_each_team",
  "sandhiMagic": "shared_center",
  "brand": "Thai fantasy gold purple ornate SAMAS CODEBREAKERS FUSION DUEL logo"
 },
 "roots": [
  {
   "id": "R01",
   "name": "อุทก",
   "meaning": "น้ำ",
   "image": "assets/roots/R01.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R01"
  },
  {
   "id": "R02",
   "name": "ภัย",
   "meaning": "อันตราย",
   "image": "assets/roots/R02.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R02"
  },
  {
   "id": "R03",
   "name": "อัคคี",
   "meaning": "ไฟ",
   "image": "assets/roots/R03.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R03"
  },
  {
   "id": "R04",
   "name": "วาต",
   "meaning": "ลม",
   "image": "assets/roots/R04.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R04"
  },
  {
   "id": "R05",
   "name": "วิทยา",
   "meaning": "ความรู้",
   "image": "assets/roots/R05.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R05"
  },
  {
   "id": "R06",
   "name": "ศาสตร์",
   "meaning": "วิชา, ระบบความรู้",
   "image": "assets/roots/R06.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R06"
  },
  {
   "id": "R07",
   "name": "ชีว",
   "meaning": "ชีวิต",
   "image": "assets/roots/R07.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R07"
  },
  {
   "id": "R08",
   "name": "จิต",
   "meaning": "ใจ",
   "image": "assets/roots/R08.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R08"
  },
  {
   "id": "R09",
   "name": "ภูมิ",
   "meaning": "แผ่นดิน, พื้นที่",
   "image": "assets/roots/R09.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R09"
  },
  {
   "id": "R10",
   "name": "ธรรม",
   "meaning": "ความดี, หลักความประพฤติ",
   "image": "assets/roots/R10.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R10"
  },
  {
   "id": "R11",
   "name": "คุณ",
   "meaning": "ความดีงาม",
   "image": "assets/roots/R11.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R11"
  },
  {
   "id": "R12",
   "name": "จริย",
   "meaning": "ความประพฤติ",
   "image": "assets/roots/R12.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R12"
  },
  {
   "id": "R13",
   "name": "มหา",
   "meaning": "ใหญ่, ยิ่งใหญ่",
   "image": "assets/roots/R13.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R13"
  },
  {
   "id": "R14",
   "name": "อรรณพ",
   "meaning": "ทะเล, มหาสมุทร",
   "image": "assets/roots/R14.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R14"
  },
  {
   "id": "R15",
   "name": "นร",
   "meaning": "คน, มนุษย์",
   "image": "assets/roots/R15.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R15"
  },
  {
   "id": "R16",
   "name": "อินทร์",
   "meaning": "ผู้เป็นใหญ่",
   "image": "assets/roots/R16.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R16"
  },
  {
   "id": "R17",
   "name": "เทว",
   "meaning": "เทวดา",
   "image": "assets/roots/R17.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R17"
  },
  {
   "id": "R18",
   "name": "คช",
   "meaning": "ช้าง",
   "image": "assets/roots/R18.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R18"
  },
  {
   "id": "R19",
   "name": "สุริย",
   "meaning": "ดวงอาทิตย์",
   "image": "assets/roots/R19.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R19"
  },
  {
   "id": "R20",
   "name": "อุปราคา",
   "meaning": "การบดบัง",
   "image": "assets/roots/R20.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "imgClass": "img-R20"
  },
  {
   "id": "R21",
   "name": "ราม",
   "meaning": "พระราม",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R22",
   "name": "อีศวร",
   "meaning": "ผู้เป็นเจ้า",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R23",
   "name": "อุทัย",
   "meaning": "การขึ้น",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R24",
   "name": "จันทร",
   "meaning": "ดวงจันทร์",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R25",
   "name": "อัศจรรย์",
   "meaning": "น่าพิศวง",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R26",
   "name": "โอฬาร",
   "meaning": "ใหญ่โต",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R27",
   "name": "นิร",
   "meaning": "ปราศจาก",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R28",
   "name": "สํ",
   "meaning": "ร่วมกัน",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  },
  {
   "id": "R29",
   "name": "คม",
   "meaning": "การไป",
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review"
  }
 ],
 "completedCards": [
  {
   "id": "C01",
   "name": "อุทกภัย",
   "type": "samas",
   "rootNames": [
    "อุทก",
    "ภัย"
   ],
   "magic": null,
   "effect": {
    "name": "กระแสน้ำกวาดล้าง",
    "description": "สุ่มรากศัพท์จากมือฝ่ายตรงข้าม 1 ใบส่งลงกองทิ้ง",
    "op": "random_opponent_discard",
    "params": {},
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C01.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "อุทกภัย",
   "imgClass": "img-C01"
  },
  {
   "id": "C02",
   "name": "อัคคีภัย",
   "type": "samas",
   "rootNames": [
    "อัคคี",
    "ภัย"
   ],
   "magic": null,
   "effect": {
    "name": "เพลิงผลาญ",
    "description": "ทำลายรากศัพท์ที่ฝ่ายตรงข้ามวางเตรียมไว้ 1 ใบ",
    "op": "destroy_opponent_staged",
    "params": {},
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C02.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "อัคคีภัย",
   "imgClass": "img-C02"
  },
  {
   "id": "C03",
   "name": "วาตภัย",
   "type": "samas",
   "rootNames": [
    "วาต",
    "ภัย"
   ],
   "magic": null,
   "effect": {
    "name": "พายุพัดพา",
    "description": "เลือกการ์ดในมือฝ่ายตรงข้าม 1 ใบแบบไม่เห็นหน้า สับกลับสำรับ แล้วฝ่ายตรงข้ามจั่ว 1 ใบ",
    "op": "opponent_hand_shuffle_redraw",
    "params": {},
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C03.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "วาตภัย",
   "imgClass": "img-C03"
  },
  {
   "id": "C04",
   "name": "วิทยาศาสตร์",
   "type": "samas",
   "rootNames": [
    "วิทยา",
    "ศาสตร์"
   ],
   "magic": null,
   "effect": {
    "name": "แสวงความรู้",
    "description": "ดูการ์ด 3 ใบบนสุด เลือกขึ้นมือ 1 ใบ สับที่เหลือกลับ",
    "op": "look_top_take_one",
    "params": {
     "look": 3
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C04.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "วิทยาศาสตร์",
   "imgClass": "img-C04"
  },
  {
   "id": "C05",
   "name": "ชีววิทยา",
   "type": "samas",
   "rootNames": [
    "ชีว",
    "วิทยา"
   ],
   "magic": null,
   "effect": {
    "name": "ฟื้นคืนชีวิต",
    "description": "นำรากศัพท์ 1 ใบจากกองทิ้งตนเองกลับขึ้นมือ",
    "op": "recover_discard",
    "params": {
     "count": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C05.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "ชีววิทยา",
   "imgClass": "img-C05"
  },
  {
   "id": "C06",
   "name": "จิตวิทยา",
   "type": "samas",
   "rootNames": [
    "จิต",
    "วิทยา"
   ],
   "magic": null,
   "effect": {
    "name": "อ่านใจ",
    "description": "สุ่มดูการ์ดในมือฝ่ายตรงข้าม 2 ใบ เลือก 1 ใบเปิดเผยถึงจบเทิร์นถัดไป",
    "op": "reveal_opponent_hand",
    "params": {
     "look": 2,
     "reveal": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C06.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "จิตวิทยา",
   "imgClass": "img-C06"
  },
  {
   "id": "C07",
   "name": "ภูมิศาสตร์",
   "type": "samas",
   "rootNames": [
    "ภูมิ",
    "ศาสตร์"
   ],
   "magic": null,
   "effect": {
    "name": "สำรวจแผ่นดิน",
    "description": "ดู 5 ใบบนสุด เลือกขึ้นมือ 1 ใบ สับที่เหลือกลับ",
    "op": "look_top_take_one",
    "params": {
     "look": 5
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C07.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "ภูมิศาสตร์",
   "imgClass": "img-C07"
  },
  {
   "id": "C08",
   "name": "คุณธรรม",
   "type": "samas",
   "rootNames": [
    "คุณ",
    "ธรรม"
   ],
   "magic": null,
   "effect": {
    "name": "เกราะแห่งคุณธรรม",
    "description": "ป้องกันรากศัพท์ฝ่ายตนจากเอฟเฟคฝ่ายตรงข้าม 1 ครั้งในรอบถัดไป",
    "op": "shield_roots",
    "params": {
     "charges": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C08.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "คุณธรรม",
   "imgClass": "img-C08"
  },
  {
   "id": "C09",
   "name": "จริยธรรม",
   "type": "samas",
   "rootNames": [
    "จริย",
    "ธรรม"
   ],
   "magic": null,
   "effect": {
    "name": "หลักแห่งความถูกต้อง",
    "description": "ยกเลิกเอฟเฟคทำลายหรือบังคับทิ้ง 1 ครั้งในรอบถัดไป",
    "op": "counter_destroy_discard",
    "params": {
     "charges": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C09.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "จริยธรรม",
   "imgClass": "img-C09"
  },
  {
   "id": "C10",
   "name": "มหาภัย",
   "type": "samas",
   "rootNames": [
    "มหา",
    "ภัย"
   ],
   "magic": null,
   "effect": {
    "name": "มหาวิบัติ",
    "description": "ฝ่ายตรงข้ามเลือกรากศัพท์ในมือตนเอง 1 ใบส่งลงกองทิ้ง",
    "op": "opponent_choice_discard",
    "params": {},
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C10.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "มหาภัย",
   "imgClass": "img-C10"
  },
  {
   "id": "C11",
   "name": "มหาคช",
   "type": "samas",
   "rootNames": [
    "มหา",
    "คช"
   ],
   "magic": null,
   "effect": {
    "name": "ปราการคชสาร",
    "description": "ป้องกันรากศัพท์ที่วางเตรียมไว้ 1 ใบจากการทำลาย 1 ครั้งในรอบถัดไป",
    "op": "shield_staged",
    "params": {
     "charges": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C11.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "มหาคช",
   "imgClass": "img-C11"
  },
  {
   "id": "C12",
   "name": "มหรรณพ",
   "type": "sandhi",
   "rootNames": [
    "มหา",
    "อรรณพ"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "คลื่นมหาสมุทร",
    "description": "ส่งรากศัพท์ที่ฝ่ายตรงข้ามเตรียมไว้ 1 ใบกลับขึ้นมือเจ้าของ",
    "op": "bounce_opponent_staged",
    "params": {},
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C12.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "มหรรณพ",
   "imgClass": "img-C12"
  },
  {
   "id": "C13",
   "name": "นรินทร์",
   "type": "sandhi",
   "rootNames": [
    "นร",
    "อินทร์"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "อำนาจมนุษยราช",
    "description": "นำรากศัพท์จากกองทิ้งตนเอง 1 ใบกลับขึ้นมือ",
    "op": "recover_discard",
    "params": {
     "count": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C13.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "นรินทร์",
   "imgClass": "img-C13"
  },
  {
   "id": "C14",
   "name": "เทวินทร์",
   "type": "sandhi",
   "rootNames": [
    "เทว",
    "อินทร์"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "บัญชาเทวราช",
    "description": "ยกเลิกเอฟเฟคฝ่ายตรงข้าม 1 ครั้งในรอบถัดไป",
    "op": "counter_effect",
    "params": {
     "charges": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C14.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "เทวินทร์",
   "imgClass": "img-C14"
  },
  {
   "id": "C15",
   "name": "คชินทร์",
   "type": "sandhi",
   "rootNames": [
    "คช",
    "อินทร์"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "เกราะราชาคชสาร",
    "description": "ป้องกันรากศัพท์ในมือ 1 ใบและบนสนาม 1 ใบจนจบเทิร์นถัดไป",
    "op": "shield_hand_and_staged",
    "params": {
     "hand": 1,
     "staged": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C15.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "คเชนทร์",
   "imgClass": "img-C15"
  },
  {
   "id": "C16",
   "name": "มหินทร์",
   "type": "sandhi",
   "rootNames": [
    "มหา",
    "อินทร์"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "ราชโองการสูงสุด",
    "description": "เลือกรากศัพท์ที่ฝ่ายตรงข้ามวางไว้ 1 ใบส่งกลับสำรับแล้วสับ จากนั้นดูการ์ดบนสุดของสำรับตนเอง 1 ใบ",
    "op": "return_staged_to_deck_and_peek",
    "params": {
     "peek": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C17",
   "name": "ราเมศวร",
   "type": "sandhi",
   "rootNames": [
    "ราม",
    "อีศวร"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "ศาสตราแห่งวีรบุรุษ",
    "description": "ป้องกันรากศัพท์ฝ่ายตนจากเอฟเฟค 1 ครั้ง เมื่อป้องกันสำเร็จจั่ว 1 ใบ",
    "op": "shield_then_draw",
    "params": {
     "charges": 1,
     "draw": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C18",
   "name": "นเรศวร",
   "type": "sandhi",
   "rootNames": [
    "นร",
    "อีศวร"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "บัญชาจักรพรรดิ",
    "description": "ดูการ์ด 4 ใบบนสุด เลือกขึ้นมือ 1 ใบ และเลือกอีก 1 ใบวางไว้บนสุดของสำรับ",
    "op": "look_take_and_stack",
    "params": {
     "look": 4,
     "take": 1,
     "stack": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C19",
   "name": "สุริโยทัย",
   "type": "sandhi",
   "rootNames": [
    "สุริย",
    "อุทัย"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "รุ่งอรุณแห่งความหวัง",
    "description": "จั่ว 2 ใบ แล้วเลือกการ์ดในมือ 1 ใบวางไว้ใต้สำรับ",
    "op": "draw_then_bottom",
    "params": {
     "draw": 2,
     "bottom": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C20",
   "name": "จันทรุปราคา",
   "type": "sandhi",
   "rootNames": [
    "จันทร",
    "อุปราคา"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "ม่านรัตติกาล",
    "description": "ยกเลิกเอฟเฟคฝ่ายตรงข้าม 1 ครั้ง และสุ่มเปิดเผยรากศัพท์ในมือฝ่ายตรงข้าม 1 ใบ",
    "op": "counter_and_reveal",
    "params": {
     "charges": 1,
     "reveal": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C21",
   "name": "สุริยุปราคา",
   "type": "sandhi",
   "rootNames": [
    "สุริย",
    "อุปราคา"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "สุริยคราสผนึกเวท",
    "description": "ยกเลิกเอฟเฟคคำสมบูรณ์ที่ฝ่ายตรงข้ามเพิ่งอัญเชิญ 1 ครั้ง แล้วจั่ว 1 ใบ",
    "op": "counter_new_summon_effect_and_draw",
    "params": {
     "charges": 1,
     "draw": 1
    },
    "requiresExtraQuestion": true
   },
   "image": "assets/extra/C21.jpg",
   "release": "core",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false,
   "artName": "สุริยุปราคา",
   "imgClass": "img-C21"
  },
  {
   "id": "C22",
   "name": "มหัศจรรย์",
   "type": "sandhi",
   "rootNames": [
    "มหา",
    "อัศจรรย์"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "ปาฏิหาริย์พลิกชะตา",
    "description": "เปิด 3 ใบบนสุด เลือกขึ้นมือ 1 ใบ ส่งกองทิ้ง 1 ใบ อีกใบวางใต้สำรับ",
    "op": "look_take_discard_bottom",
    "params": {
     "look": 3
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C23",
   "name": "มโหฬาร",
   "type": "sandhi",
   "rootNames": [
    "มหา",
    "โอฬาร"
   ],
   "magic": "vowel_sandhi",
   "effect": {
    "name": "มหาปราการ",
    "description": "ป้องกันรากศัพท์ที่วางเตรียมไว้ทั้ง 2 ช่องจนจบเทิร์นถัดไป แล้วจั่ว 1 ใบ",
    "op": "shield_both_staged_and_draw",
    "params": {
     "draw": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C24",
   "name": "นิรภัย",
   "type": "sandhi",
   "rootNames": [
    "นิร",
    "ภัย"
   ],
   "magic": "consonant_sandhi",
   "effect": {
    "name": "เขตศักดิ์สิทธิ์",
    "description": "ยกเลิกการทำลายหรือบังคับทิ้งรากศัพท์ 1 ครั้ง แล้วนำรากศัพท์จากกองทิ้ง 1 ใบขึ้นมือ",
    "op": "counter_and_recover",
    "params": {
     "charges": 1,
     "recover": 1
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  },
  {
   "id": "C25",
   "name": "สังคม",
   "type": "sandhi",
   "rootNames": [
    "สํ",
    "คม"
   ],
   "magic": "niggahit_sandhi",
   "effect": {
    "name": "พันธสัญญาแห่งหมู่ชน",
    "description": "นำรากศัพท์จากกองทิ้ง 1 ใบขึ้นมือ แล้วให้เพื่อนร่วมทีมดูการ์ดบนสุด 2 ใบเพื่อจัดลำดับ",
    "op": "recover_and_reorder",
    "params": {
     "recover": 1,
     "look": 2
    },
    "requiresExtraQuestion": true
   },
   "image": null,
   "release": "expansion",
   "reviewStatus": "needs_linguistic_review",
   "enabledForGradedPlay": false
  }
 ],
 "magicCards": [
  {
   "id": "M01",
   "name": "สระสนธิ",
   "type": "vowel_sandhi",
   "description": "เวทแห่งการเชื่อมและเปลี่ยนรูปสระ",
   "shared": true,
   "consumed": false,
   "returnsToPool": true,
   "copies": 3,
   "image": "assets/magic/M01.jpg",
   "imgClass": "img-M01"
  },
  {
   "id": "M02",
   "name": "พยัญชนะสนธิ",
   "type": "consonant_sandhi",
   "description": "เวทแห่งการเปลี่ยนรูปพยัญชนะ",
   "shared": true,
   "consumed": false,
   "returnsToPool": true,
   "copies": 3,
   "image": "assets/magic/M02.jpg",
   "imgClass": "img-M02"
  },
  {
   "id": "M03",
   "name": "นิคหิตสนธิ",
   "type": "niggahit_sandhi",
   "description": "เวทแห่งการแปลงนิคหิตตามเสียงที่ตามมา",
   "shared": true,
   "consumed": false,
   "returnsToPool": true,
   "copies": 3,
   "image": "assets/magic/M03.jpg",
   "imgClass": "img-M03"
  }
 ],
 "artwork": {
  "boards": [
   {
    "version": "latest",
    "path": "assets/boards/a_vibrant_ornate_game_board_ui_for_samas_codebrea.png",
    "note": "reference artwork; do not use as fixed interactive background"
   },
   {
    "version": "previous",
    "path": "assets/boards/a_highly_detailed_colorful_fantasy_card_game_board.png",
    "note": "reference artwork; do not use as fixed interactive background"
   }
  ],
  "legacyRootArtwork": [
   "assets/legacy_roots/01_อุทก.png",
   "assets/legacy_roots/02_อัคคี.png",
   "assets/legacy_roots/03_วาต.png",
   "assets/legacy_roots/04_ธรณี.png",
   "assets/legacy_roots/05_ดารา.png",
   "assets/legacy_roots/06_พฤกษ.png",
   "assets/legacy_roots/07_วิทยา.png",
   "assets/legacy_roots/08_ศาสตร์.png",
   "assets/legacy_roots/09_จิต.png",
   "assets/legacy_roots/10_ชีว.png",
   "assets/legacy_roots/11_มนุษย.png",
   "assets/legacy_roots/12_รัฐ.png",
   "assets/legacy_roots/13_นิติ.png",
   "assets/legacy_roots/14_เศรษฐ.png",
   "assets/legacy_roots/15_เกษตร.png",
   "assets/legacy_roots/16_หัตถ.png",
   "assets/legacy_roots/17_ศิลป.png",
   "assets/legacy_roots/18_วรรณ.png",
   "assets/legacy_roots/19_คุณ.png",
   "assets/legacy_roots/20_จริย.png"
  ],
  "note": "Extra Deck artwork mapped by card name on 2026-11-11 (art 'คเชนทร์' → C15 'คชินทร์'; needs teacher confirmation)."
 },
 "unresolved": [
  "22-card deck exact duplicates and distribution not previously fixed",
  "10 expansion formulas and linguistic classification not verified",
  "Question bank with vetted answers not yet supplied",
  "Some reactive effect timing needs teacher approval",
  "Individual Extra Deck artwork cannot be confidently matched from filename alone"
 ]
};
