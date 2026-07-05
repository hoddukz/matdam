-- Tag: core
-- Path: supabase/migrations/015_update_batch3_recipes.sql

-- ============================================================
-- MatDam — Batch 3 레시피 5개 최종 수정 (한글+영문 통합)
-- 기존 013/014 마이그레이션 데이터를 덮어씀
-- r1: 참나물 들기름 막국수 (1인분)
-- r2: 대패삼겹살 찜 (2인분)
-- r3: 풍자 쌈장 & 양배추 두부 쌈밥 (2인분)
-- r4: 유린기 (2인분)
-- r5: 바삭한 파닭전 (2인분)
-- ============================================================

-- ── 신규 재료 ───────────────────────────────────────────────
INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
('yuzu_syrup',  '{"ko": "유자청", "en": "Yuzu Syrup"}',   'sauce_paste', ARRAY['tbsp','ml'], 'tbsp', false, ARRAY['vegan','dairy_free'], ARRAY['honey','maesil_cheong'], '{"ko": "유자청 (유자 과육을 설탕에 절인 시럽)", "en": "Yuzu citron syrup, made by preserving yuzu pulp in sugar"}', ARRAY['korean','japanese'], 'recommended'),
('lemon_juice', '{"ko": "레몬즙", "en": "Lemon Juice"}',  'sauce_paste', ARRAY['tbsp','ml'], 'tbsp', false, ARRAY['vegan','dairy_free'], ARRAY['rice_vinegar'],          '{"ko": "레몬즙 (생레몬 또는 병)", "en": "Fresh or bottled lemon juice"}',                                         ARRAY['western','korean'],  'recommended')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- r1: 참나물 들기름 막국수 (1인분)
-- ============================================================

UPDATE public.recipes SET
  title = '{"ko": "참나물 들기름 막국수", "en": "Perilla Oil Buckwheat Noodles with Chamnamul"}',
  description = '{"ko": "들기름과 진간장으로 버무린 메밀면에 새콤달콤 참나물 무침을 곁들인 여름 별미", "en": "Buckwheat noodles tossed in perilla oil and dark soy sauce, served with a tangy-sweet chamnamul herb salad"}',
  servings = 1
WHERE slug = 'chamnamul-deulgireum-makguksu';

DELETE FROM public.recipe_steps WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu');
DELETE FROM public.recipe_ingredients WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu');

INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 1,
 '{"ko": "메밀면 150g을 삶아 얼음물에 헹궈 물기를 꽉 짭니다", "en": "Boil 150g buckwheat noodles, rinse in ice water, and squeeze out excess water"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 2,
 '{"ko": "볼에 면과 양념(진간장 3, 들기름 3, 설탕 1, 매실청 1)을 넣고 버무려 접시에 담습니다", "en": "Toss noodles with sauce (3 tbsp dark soy sauce, 3 tbsp perilla oil, 1 tbsp sugar, 1 tbsp plum syrup) and transfer to a plate"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 3,
 '{"ko": "김자반을 듬뿍 올리고, 참깨 2스푼을 곱게 빻아서 뿌립니다", "en": "Top generously with seasoned seaweed flakes and sprinkle with 2 tbsp freshly ground sesame seeds"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 4,
 '{"ko": "참나물을 양념(진간장 1, 고춧가루 0.5, 설탕 0.5, 식초 0.5)에 버무려 면 옆에 곁들입니다", "en": "Toss chamnamul with seasoning (1 tbsp dark soy sauce, 0.5 tbsp gochugaru, 0.5 tbsp sugar, 0.5 tbsp vinegar) and serve alongside the noodles"}', NULL,
 '{"ko": "참나물 미리 버무려두면 숨 죽어서 식감 망함. 먹기 직전 버무리는 게 포인트!", "en": "Don''t dress the chamnamul in advance — it wilts and loses its texture. Toss it right before eating!"}');

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'buckwheat_noodle', NULL, 150, 'g', NULL, NULL, 1, 1),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'chamnamul', NULL, 100, 'g', NULL, NULL, 4, 2),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'gim_jaban', NULL, NULL, NULL, NULL, '{"ko": "듬뿍", "en": "generous"}', 3, 3),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'sesame_seeds', NULL, 2, 'tbsp', NULL, '{"ko": "빻아서", "en": "ground"}', 3, 4),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'ganjang', NULL, 3, 'tbsp', NULL, '{"ko": "진간장, 면 양념용", "en": "dark soy sauce, for noodle sauce"}', 2, 5),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'perilla_oil', NULL, 3, 'tbsp', NULL, NULL, 2, 6),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'sugar', NULL, 1, 'tbsp', NULL, '{"ko": "면 양념용", "en": "for noodle sauce"}', 2, 7),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'maesil_cheong', NULL, 1, 'tbsp', NULL, NULL, 2, 8),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'ganjang', NULL, 1, 'tbsp', NULL, '{"ko": "진간장, 참나물 무침용", "en": "dark soy sauce, for chamnamul"}', 4, 9),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'gochugaru', NULL, 0.5, 'tbsp', NULL, NULL, 4, 10),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'sugar', NULL, 0.5, 'tbsp', NULL, '{"ko": "참나물 무침용", "en": "for chamnamul"}', 4, 11),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu'), 'rice_vinegar', NULL, 0.5, 'tbsp', NULL, NULL, 4, 12);


-- ============================================================
-- r2: 대패삼겹살 찜 (2인분)
-- ============================================================

UPDATE public.recipes SET
  title = '{"ko": "대패삼겹살 찜", "en": "Steamed Thinly Sliced Pork Belly"}',
  description = '{"ko": "숙주나물과 채소 위에 혼다시로 밑간한 대패삼겹살을 올려 찌는 간단 보양식. 유자청 소스가 핵심!", "en": "Thinly sliced pork belly steamed over mung bean sprouts and vegetables with hondashi. The yuzu dipping sauce is the star!"}',
  servings = 2
WHERE slug = 'daepae-samgyeopsal-jjim';

DELETE FROM public.recipe_steps WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim');
DELETE FROM public.recipe_ingredients WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim');

INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 1,
 '{"ko": "팬 바닥에 숙주, 양파채, 팽이버섯을 순서대로 깔아줍니다", "en": "Layer the pan bottom: mung bean sprouts → julienned onion → enoki mushrooms"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 2,
 '{"ko": "대패삼겹살에 혼다시 1스푼과 후추를 뿌려 버무립니다", "en": "Season pork belly with 1 tbsp hondashi and pepper"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 3,
 '{"ko": "채소 위에 고기를 올리고 물 100ml를 가장자리에 부은 뒤, 뚜껑 덮고 중불에서 10분 이상 찝니다", "en": "Place pork over vegetables, pour 100ml water along the edge, cover with lid, and steam over medium heat for at least 10 minutes"}', 600, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 4,
 '{"ko": "쪽파를 뿌려 완성합니다", "en": "Sprinkle with chives to finish"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 5,
 '{"ko": "끓이는 동안 소스를 만듭니다 (유자청 2, 간장 5, 미림 2, 식초 2, 물 적당량)", "en": "While steaming, mix the dipping sauce (2 tbsp yuzu syrup, 5 tbsp soy sauce, 2 tbsp mirin, 2 tbsp vinegar, water to taste)"}', NULL,
 '{"ko": "유자청이 소스에 들어가야 그 특유의 상큼한 감칠맛이 살아남. 꼭 챙기기! 먹고 나서 남은 국물에 라면스프+면을 넣거나, 밥+계란을 넣어 죽처럼 먹어도 맛있다.", "en": "Yuzu syrup in the sauce is what gives it that distinctive bright citrusy umami — don''t skip it! After eating, add ramen noodles+seasoning to the leftover broth, or rice+egg for a porridge-style finish."}');

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'pork_belly_thin', NULL, 400, 'g', NULL, NULL, 2, 1),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'mung_bean_sprouts', NULL, 150, 'g', NULL, NULL, 1, 2),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'onion', NULL, 1, 'piece', NULL, '{"ko": "채 썰기", "en": "julienned"}', 1, 3),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'enoki', NULL, 1, 'piece', NULL, '{"ko": "1봉", "en": "1 pack"}', 1, 4),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'chives', NULL, NULL, NULL, NULL, '{"ko": "고명용", "en": "for garnish"}', 4, 5),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), NULL, '{"ko": "물", "en": "Water"}', 100, 'ml', NULL, NULL, 3, 6),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'hondashi', NULL, 1, 'tbsp', NULL, NULL, 2, 7),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'black_pepper', NULL, NULL, NULL, NULL, '{"ko": "약간", "en": "a pinch"}', 2, 8),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'yuzu_syrup', NULL, 2, 'tbsp', NULL, '{"ko": "⭐ 소스 핵심", "en": "⭐ sauce essential"}', 5, 9),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'ganjang', NULL, 5, 'tbsp', NULL, '{"ko": "소스용", "en": "for dipping sauce"}', 5, 10),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'mirin', NULL, 2, 'tbsp', NULL, '{"ko": "소스용", "en": "for dipping sauce"}', 5, 11),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), 'rice_vinegar', NULL, 2, 'tbsp', NULL, '{"ko": "소스용", "en": "for dipping sauce"}', 5, 12),
((SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim'), NULL, '{"ko": "물", "en": "Water"}', NULL, NULL, NULL, '{"ko": "소스용, 적당량", "en": "for sauce, to taste"}', 5, 13);


-- ============================================================
-- r3: 풍자 쌈장 & 양배추 두부 쌈밥 (2인분)
-- ============================================================

UPDATE public.recipes SET
  title = '{"ko": "풍자 쌈장 & 양배추 두부 쌈밥", "en": "Tuna Ssamjang with Cabbage Tofu Wraps"}',
  description = '{"ko": "참치와 쌈장으로 만든 풍자 쌈장을 양배추 두부 쌈에 올려 먹는 건강 별미. 참치 기름이 풍미의 핵심!", "en": "Steamed cabbage wraps with crumbled tofu, topped with savory tuna ssamjang. The tuna can oil is the secret to rich flavor!"}',
  servings = 2
WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap';

DELETE FROM public.recipe_steps WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap');
DELETE FROM public.recipe_ingredients WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap');

INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 1,
 '{"ko": "심지 제거한 양배추 6장을 랩 씌워 전자레인지에 5분 돌립니다", "en": "Remove cores from 6 cabbage leaves, wrap in plastic, and microwave for 5 minutes"}', 300, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 2,
 '{"ko": "두부 1/3모를 팬에서 수분이 날아갈 때까지 으깨며 볶습니다", "en": "Crumble 1/3 block of tofu in a pan and dry-fry until all moisture is gone"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 3,
 '{"ko": "참치캔 기름에 마늘/양파 볶다가 참치, 쌈장 2, 참치액 1, 고추 넣고 볶은 뒤 고춧가루/참기름으로 마무리합니다", "en": "Sauté garlic and onion in tuna can oil, add tuna, 2 tbsp ssamjang, 1 tbsp anchovy sauce, and chili. Finish with gochugaru and sesame oil"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 4,
 '{"ko": "양배추에 볶은 두부를 넣고 돌돌 말아 썬 뒤, 위에 쌈장을 올립니다", "en": "Place crumbled tofu on cabbage leaves, roll up tightly, slice, and top with tuna ssamjang"}', NULL,
 '{"ko": "두부 수분 완전히 날리는 게 핵심! 축축하면 쌈장이 묽어짐. 참치 기름 버리지 말고 그대로 볶음에 써야 풍미 살아남.", "en": "Make sure to dry-fry the tofu completely — if it''s wet, the ssamjang gets watery. Don''t discard the tuna oil; using it for sautéing adds great flavor."}');

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), NULL, '{"ko": "양배추", "en": "Cabbage"}', 6, 'piece', NULL, '{"ko": "잎 6장", "en": "6 leaves"}', 1, 1),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'tofu', NULL, NULL, NULL, NULL, '{"ko": "1/3모", "en": "1/3 block"}', 2, 2),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'canned_tuna', NULL, 1, 'piece', NULL, '{"ko": "⭐ 기름째 사용", "en": "⭐ use the oil too"}', 3, 3),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'garlic', NULL, 1, 'tbsp', NULL, '{"ko": "다져서", "en": "minced"}', 3, 4),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'onion', NULL, 1, 'tbsp', NULL, '{"ko": "다져서", "en": "minced"}', 3, 5),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), NULL, '{"ko": "고추", "en": "Chili Pepper"}', 1, 'piece', NULL, '{"ko": "다져서", "en": "minced"}', 3, 6),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'ssamjang', NULL, 2, 'tbsp', NULL, NULL, 3, 7),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'fish_sauce', NULL, 1, 'tbsp', NULL, '{"ko": "참치액", "en": "anchovy sauce"}', 3, 8),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'gochugaru', NULL, 1, 'tbsp', NULL, '{"ko": "옵션", "en": "optional"}', 3, 9),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'sesame_oil', NULL, 1, 'tbsp', NULL, NULL, 3, 10),
((SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap'), 'sesame_seeds', NULL, NULL, NULL, NULL, '{"ko": "약간", "en": "a dash"}', 3, 11);


-- ============================================================
-- r4: 유린기 (2인분)
-- ============================================================

UPDATE public.recipes SET
  title = '{"ko": "유린기", "en": "Yuringi (Chinese-style Crispy Chicken)"}',
  description = '{"ko": "바삭하게 구운 닭다리살에 새콤달콤한 특제 소스를 뿌려 먹는 중화풍 치킨", "en": "Crispy pan-fried chicken thighs drizzled with a tangy sweet soy-lemon sauce over shredded lettuce"}',
  servings = 2
WHERE slug = 'yuringi';

DELETE FROM public.recipe_steps WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi');
DELETE FROM public.recipe_ingredients WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi');

INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 1,
 '{"ko": "닭다리살 끝에 칼집 내고 칼등으로 두드린 뒤, 소금 + 후추 + 굴소스 넣어 조물조물 밑간합니다", "en": "Score chicken thigh edges and pound with the back of a knife. Season with salt, pepper, and oyster sauce, massaging it in"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 2,
 '{"ko": "밑간한 닭에 전분가루 + 계란 노른자를 넣어 버무립니다", "en": "Add starch and egg yolk to the seasoned chicken and mix to coat"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 3,
 '{"ko": "팬에 기름 3스푼 둘러 굽듯 튀겨줍니다. 불을 줄이고 뚜껑 닫아 속까지 익힙니다", "en": "Add 3 tbsp oil to a pan and pan-fry the chicken. Reduce heat and cover with a lid to cook through"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 4,
 '{"ko": "소스 재료를 미리 섞어둡니다 (청양고추는 마지막에 넣기)", "en": "Mix sauce ingredients in advance (add cheongyang chili last to control spice level)"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 5,
 '{"ko": "양상추를 얇게 썰어 깔고 튀긴 닭다리살을 올린 뒤, 소스를 뿌려 완성합니다 (소스 양은 뿌리면서 조정)", "en": "Arrange shredded lettuce on a plate, top with the fried chicken, and drizzle sauce over to serve (adjust sauce amount to taste)"}', NULL,
 '{"ko": "칼등으로 두드리면 익으면서 덜 오그라든다 (급하면 생략 가능). 청양고추는 소스에 미리 넣으면 너무 매워지니 마지막에!", "en": "Pounding with the back of a knife prevents curling while cooking (skip if in a hurry). Add cheongyang chili last — it gets too spicy if added early!"}');

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'chicken_thigh', NULL, NULL, NULL, NULL, '{"ko": "5~6덩이, 칼집+두드리기", "en": "5-6 pieces, scored and pounded"}', 1, 1),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'lettuce', NULL, NULL, NULL, NULL, '{"ko": "넉넉히, 얇게 썰기", "en": "generous, thinly shredded"}', 5, 2),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'salt', NULL, NULL, NULL, NULL, '{"ko": "약간", "en": "a pinch"}', 1, 3),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'black_pepper', NULL, NULL, NULL, NULL, '{"ko": "약간", "en": "a pinch"}', 1, 4),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'oyster_sauce', NULL, NULL, NULL, NULL, '{"ko": "적당량", "en": "to taste"}', 1, 5),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'cornstarch', NULL, NULL, NULL, NULL, '{"ko": "적당량", "en": "as needed"}', 2, 6),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'egg', NULL, 1, 'piece', NULL, '{"ko": "노른자만", "en": "yolk only"}', 2, 7),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), NULL, '{"ko": "물", "en": "Water"}', 15, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 8),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'sugar', NULL, 5, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 9),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'ganjang', NULL, 4, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 10),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'rice_vinegar', NULL, 3, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 11),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'lemon_juice', NULL, 3, 'tbsp', NULL, '{"ko": "레몬청 있으면 1~2스푼", "en": "or 1-2 tbsp lemon syrup if available"}', 4, 12),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'sesame_oil', NULL, 3, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 13),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'salt', NULL, NULL, NULL, NULL, '{"ko": "소스용, 조금", "en": "for sauce, a little"}', 4, 14),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'green_onion', NULL, NULL, NULL, NULL, '{"ko": "소스용, 다져서 듬뿍", "en": "for sauce, chopped generously"}', 4, 15),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), 'parsley', NULL, NULL, NULL, NULL, '{"ko": "소스용, 다져서", "en": "for sauce, chopped"}', 4, 16),
((SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi'), NULL, '{"ko": "청양고추", "en": "Cheongyang Chili"}', NULL, NULL, NULL, '{"ko": "소스용, 슬라이스 (마지막에 넣기)", "en": "for sauce, sliced (add last)"}', 4, 17);


-- ============================================================
-- r5: 바삭한 파닭전 (2인분)
-- ============================================================

UPDATE public.recipes SET
  title = '{"ko": "바삭한 파닭전", "en": "Crispy Scallion Chicken Jeon"}',
  description = '{"ko": "바삭한 닭다리살 전 위에 싱싱한 파채와 달콤 간장 소스를 올린 파티용 안주", "en": "Crispy chicken thigh pancake topped with fresh scallion threads and sweet soy glaze — perfect party food"}',
  servings = 2
WHERE slug = 'chanwon-pa-dak-jeon';

DELETE FROM public.recipe_steps WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon');
DELETE FROM public.recipe_ingredients WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon');

INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 1,
 '{"ko": "닭다리살에 맛소금 0.5, 맛술 2, 후추, 다진 마늘 1을 넣고 재워둡니다", "en": "Season chicken thighs with 0.5 tbsp seasoned salt, 2 tbsp cooking wine, pepper, and 1 tbsp minced garlic. Let marinate"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 2,
 '{"ko": "재워둔 닭에 감자전분 6, 물 4, 청양고추를 넣고 버무립니다", "en": "Add 6 tbsp potato starch, 4 tbsp water, and sliced cheongyang chili to the marinated chicken. Mix into a batter"}', NULL, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 3,
 '{"ko": "팬에 기름 넉넉히 두르고 반죽을 올려 꾹꾹 눌러가며 노릇하게 부칩니다", "en": "Add generous oil to a pan, place the batter in, and press down firmly while cooking until golden and crispy"}', NULL,
 '{"ko": "맛술은 밑간 + 소스 두 군데 다 들어가니까 넉넉하게 준비! 꾹꾹 눌러야 겉이 바삭하게 익음. 뒤집개로 누를 때 팬 바닥의 기름을 살짝 묻혀주면 달라붙지 않는다.", "en": "Cooking wine goes in both the marinade and sauce, so prepare plenty! Press firmly for a crispy crust. Dip the spatula in the pan oil before pressing — it won''t stick."}'),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 4,
 '{"ko": "소스 재료 섞어 전자레인지 1분 돌립니다", "en": "Mix all sauce ingredients and microwave for 1 minute"}', 60, NULL),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 5,
 '{"ko": "닭전 위에 파채를 올리고 소스를 부어 완성합니다", "en": "Top with generous scallion threads and pour sauce over to serve"}', NULL, NULL);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order) VALUES
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'chicken_thigh', NULL, 350, 'g', NULL, '{"ko": "한입 크기", "en": "bite-sized pieces"}', 1, 1),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'green_onion', NULL, NULL, NULL, NULL, '{"ko": "파채, 듬뿍", "en": "scallion threads, generous"}', 5, 2),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'cornstarch', NULL, 6, 'tbsp', NULL, '{"ko": "감자전분", "en": "potato starch"}', 2, 3),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), NULL, '{"ko": "물", "en": "Water"}', 4, 'tbsp', NULL, NULL, 2, 4),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), NULL, '{"ko": "청양고추", "en": "Cheongyang Chili"}', 3, 'piece', NULL, '{"ko": "2~3개", "en": "2-3"}', 2, 5),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'seasoned_salt', NULL, 0.5, 'tbsp', NULL, NULL, 1, 6),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'mirin', NULL, 2, 'tbsp', NULL, '{"ko": "⭐ 밑간용 맛술", "en": "⭐ cooking wine for marinade"}', 1, 7),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'black_pepper', NULL, NULL, NULL, NULL, '{"ko": "넉넉히", "en": "generous"}', 1, 8),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'garlic', NULL, 1, 'tbsp', NULL, '{"ko": "다져서", "en": "minced"}', 1, 9),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'garlic', NULL, 0.5, 'tbsp', NULL, '{"ko": "소스용, 다져서", "en": "for sauce, minced"}', 4, 10),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'ganjang', NULL, 4, 'tbsp', NULL, '{"ko": "소스용", "en": "for sauce"}', 4, 11),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'mirin', NULL, 4, 'tbsp', NULL, '{"ko": "소스용 맛술", "en": "cooking wine for sauce"}', 4, 12),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), NULL, '{"ko": "알룰로스", "en": "Allulose"}', 2, 'tbsp', NULL, NULL, 4, 13),
((SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon'), 'corn_syrup', NULL, 2, 'tbsp', NULL, '{"ko": "물엿", "en": "corn syrup"}', 4, 14);
