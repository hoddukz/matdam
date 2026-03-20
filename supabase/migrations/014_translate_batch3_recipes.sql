-- Tag: core
-- Path: supabase/migrations/014_translate_batch3_recipes.sql

-- ============================================================
-- MatDam — English translations for Batch 3 recipes (5 recipes)
-- Updates steps, tips, and ingredient notes with EN translations
-- ============================================================

-- ============================================================
-- r1: 참나물 들기름 막국수
-- ============================================================

UPDATE public.recipe_steps SET
  description = '{"ko": "끓는 물에 메밀면 150g을 넣고 삶은 뒤, 찬물(또는 얼음물)에 치대며 헹궈 물기를 꽉 짠다", "en": "Boil 150g buckwheat noodles, then rinse under cold (or ice) water while kneading, and squeeze out excess water"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND step_order = 1;

UPDATE public.recipe_steps SET
  description = '{"ko": "볼에 면을 담고 진간장 3, 들기름 3, 설탕 1, 매실청 1을 넣어 골고루 버무린 후 접시에 담는다", "en": "Place noodles in a bowl, add 3 tbsp soy sauce, 3 tbsp perilla oil, 1 tbsp sugar, and 1 tbsp plum syrup. Toss well and transfer to a plate"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND step_order = 2;

UPDATE public.recipe_steps SET
  description = '{"ko": "면 위에 김자반을 듬뿍 올리고, 참깨 2스푼을 절구에 곱게 갈아 넉넉히 뿌린다", "en": "Top the noodles generously with seasoned seaweed flakes, then grind 2 tbsp sesame seeds in a mortar and sprinkle liberally"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND step_order = 3;

UPDATE public.recipe_steps SET
  description = '{"ko": "참나물 100g을 먹기 좋은 크기로 썰어 볼에 담고, 진간장 1, 고춧가루 0.5, 설탕 0.5, 식초 0.5를 넣어 가볍게 버무린다", "en": "Cut 100g chamnamul into bite-sized pieces, place in a bowl, and lightly toss with 1 tbsp soy sauce, 0.5 tbsp gochugaru, 0.5 tbsp sugar, and 0.5 tbsp vinegar"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND step_order = 4;

UPDATE public.recipe_steps SET
  description = '{"ko": "양념한 참나물을 접시 한쪽에 곁들이면 완성", "en": "Serve the seasoned chamnamul on the side of the plate and enjoy"}',
  tip = '{"ko": "5인분 준비 시 위 계량에 5를 곱한다 (면 750~800g). 고기 요리와 함께 먹으면 참나물이 느끼함을 잘 잡아준다.", "en": "For 5 servings, multiply all measurements by 5 (750-800g noodles). The chamnamul cuts through the richness of meat dishes perfectly."}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND step_order = 5;

-- r1 ingredient notes
UPDATE public.recipe_ingredients SET note = '{"ko": "듬뿍", "en": "generously"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 3;

UPDATE public.recipe_ingredients SET note = '{"ko": "갈아서 사용", "en": "ground"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 4;

UPDATE public.recipe_ingredients SET note = '{"ko": "면 양념용", "en": "for noodle sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 5;

UPDATE public.recipe_ingredients SET note = '{"ko": "면 양념용", "en": "for noodle sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 7;

UPDATE public.recipe_ingredients SET note = '{"ko": "참나물 무침용", "en": "for chamnamul seasoning"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 9;

UPDATE public.recipe_ingredients SET note = '{"ko": "참나물 무침용", "en": "for chamnamul seasoning"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu') AND display_order = 11;


-- ============================================================
-- r2: 대패삼겹살 찜
-- ============================================================

UPDATE public.recipe_steps SET
  description = '{"ko": "깊은 팬이나 냄비 바닥에 숙주나물을 넉넉하게 깔고, 그 위에 양파채와 팽이버섯을 골고루 올린다", "en": "Line the bottom of a deep pan or pot generously with mung bean sprouts, then evenly layer sliced onions and enoki mushrooms on top"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND step_order = 1;

UPDATE public.recipe_steps SET
  description = '{"ko": "볼에 대패삼겹살을 담고 혼다시 1큰술과 후추를 넣어 가볍게 버무려 밑간한다", "en": "Place the thinly sliced pork belly in a bowl and lightly season with 1 tbsp hondashi and pepper"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND step_order = 2;

UPDATE public.recipe_steps SET
  description = '{"ko": "채소 위에 밑간한 고기를 펴서 올리고 쪽파를 뿌린다. 물 100ml를 팬 가장자리에 두른 뒤 뚜껑을 덮는다", "en": "Spread the seasoned pork over the vegetables and sprinkle with chives. Pour 100ml water along the edge of the pan and cover with a lid"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND step_order = 3;

UPDATE public.recipe_steps SET
  description = '{"ko": "중불에서 10분 이상 충분히 찐다. 고기가 다 익고 채소 숨이 죽으면 완성", "en": "Steam over medium heat for at least 10 minutes. It''s done when the pork is fully cooked and vegetables are wilted"}',
  tip = '{"ko": "5인분은 큰 냄비 두 개에 나눠서 준비하면 편하다. 풍자 쌈장과 함께 찍어 먹으면 금상첨화.", "en": "For 5 servings, split between two large pots. Dipping with tuna ssamjang makes it even better."}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND step_order = 4;

-- r2 ingredient notes
UPDATE public.recipe_ingredients SET note = '{"ko": "원하는 만큼", "en": "as much as desired"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 1;

UPDATE public.recipe_ingredients SET note = '{"ko": "넉넉히", "en": "generously"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 2;

UPDATE public.recipe_ingredients SET note = '{"ko": "채 썰기, 적당량", "en": "julienned, to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 3;

UPDATE public.recipe_ingredients SET note = '{"ko": "적당량", "en": "to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 4;

UPDATE public.recipe_ingredients SET note = '{"ko": "고명용", "en": "for garnish"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 5;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a pinch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 7;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "물", "en": "Water"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 8;

UPDATE public.recipe_ingredients SET note = '{"ko": "찍어 먹는 소스", "en": "for dipping sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 9;

UPDATE public.recipe_ingredients SET note = '{"ko": "찍어 먹는 소스", "en": "for dipping sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 10;

UPDATE public.recipe_ingredients SET note = '{"ko": "찍어 먹는 소스", "en": "for dipping sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 11;

UPDATE public.recipe_ingredients SET note = '{"ko": "취향껏, 찍어 먹는 소스", "en": "optional, for dipping sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim') AND display_order = 12;


-- ============================================================
-- r3: 풍자 쌈장 & 양배추 두부 쌈밥
-- ============================================================

UPDATE public.recipe_steps SET
  description = '{"ko": "양배추는 심지를 제거하고 씻은 뒤, 랩을 씌워 전자레인지에서 5분간 돌려 부드럽게 익힌다", "en": "Remove the core from cabbage leaves, wash, wrap in plastic wrap, and microwave for 5 minutes until soft"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 1;

UPDATE public.recipe_steps SET
  description = '{"ko": "두부 1/3모를 팬에 넣고 으깨면서 수분이 날아갈 때까지 포슬포슬하게 볶는다", "en": "Crumble 1/3 block of tofu into a pan and dry-fry, breaking it apart until the moisture evaporates and it becomes crumbly"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 2;

UPDATE public.recipe_steps SET
  description = '{"ko": "팬에 참치 기름을 두르고 다진 마늘 1, 다진 양파 1을 넣어 볶는다", "en": "Add tuna oil to a pan and sauté 1 tbsp minced garlic and 1 tbsp minced onion"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 3;

UPDATE public.recipe_steps SET
  description = '{"ko": "양파가 익으면 참치 1캔, 쌈장 2, 참치액 1, 다진 고추 1을 넣고 섞는다", "en": "Once onion is cooked, add 1 can tuna, 2 tbsp ssamjang, 1 tbsp fish sauce, and 1 tbsp minced chili. Mix well"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 4;

UPDATE public.recipe_steps SET
  description = '{"ko": "색감을 위해 고춧가루 1을 추가하고(선택), 불을 끈 뒤 참기름과 깨를 넣어 마무리한다", "en": "Optionally add 1 tbsp gochugaru for color, turn off heat, and finish with sesame oil and sesame seeds"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 5;

UPDATE public.recipe_steps SET
  description = '{"ko": "익힌 양배추를 겹쳐 깔고 볶은 두부를 올린 뒤 돌돌 말아 먹기 좋은 크기로 썬다", "en": "Layer the steamed cabbage leaves, place crumbled tofu on top, roll up tightly, and slice into bite-sized pieces"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 6;

UPDATE public.recipe_steps SET
  description = '{"ko": "접시에 담고 참치 쌈장을 듬뿍 올리면 완성", "en": "Arrange on a plate and top generously with the tuna ssamjang to serve"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND step_order = 7;

-- r3 ingredient notes
UPDATE public.recipe_ingredients SET custom_name = '{"ko": "양배추", "en": "Cabbage"}', note = '{"ko": "잎 6장", "en": "6 leaves"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 1;

UPDATE public.recipe_ingredients SET note = '{"ko": "1/3모", "en": "1/3 block"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 2;

UPDATE public.recipe_ingredients SET note = '{"ko": "다져서", "en": "minced"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 4;

UPDATE public.recipe_ingredients SET note = '{"ko": "다져서", "en": "minced"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 5;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "고추", "en": "Chili Pepper"}', note = '{"ko": "다져서", "en": "minced"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 6;

UPDATE public.recipe_ingredients SET note = '{"ko": "참치액", "en": "anchovy sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 8;

UPDATE public.recipe_ingredients SET note = '{"ko": "선택", "en": "optional"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 9;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a pinch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap') AND display_order = 11;


-- ============================================================
-- r4: 유린기
-- ============================================================

UPDATE public.recipe_steps SET
  description = '{"ko": "닭다리살을 앞뒤로 두드려 칼집을 내어 부드럽게 만든다", "en": "Pound the chicken thighs on both sides and score with a knife to tenderize"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 1;

UPDATE public.recipe_steps SET
  description = '{"ko": "소금, 후추, 굴소스를 넣어 조물조물 밑간한다", "en": "Season with salt, pepper, and oyster sauce, massaging it into the meat"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 2;

UPDATE public.recipe_steps SET
  description = '{"ko": "밑간한 고기에 계란 노른자와 전분 가루를 넣고 잘 버무린다", "en": "Add egg yolk and cornstarch to the seasoned chicken and mix thoroughly to coat"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 3;

UPDATE public.recipe_steps SET
  description = '{"ko": "팬에 기름을 3스푼 정도 두르고 닭다리살을 올린 뒤, 뚜껑을 덮어 속까지 촉촉하게 익힌다. 중간에 한 번씩 뒤집어 겉면을 바삭하게 굽는다", "en": "Add about 3 tbsp oil to a pan, place the chicken in, and cover with a lid to cook through while keeping it moist. Flip occasionally to crisp up the outside"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 4;

UPDATE public.recipe_steps SET
  description = '{"ko": "잘 익은 닭튀김을 꺼내 한입 크기로 썬다", "en": "Remove the cooked chicken and slice into bite-sized pieces"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 5;

UPDATE public.recipe_steps SET
  description = '{"ko": "접시에 채 썬 양상추를 넉넉히 깔고 그 위에 닭튀김을 올린다", "en": "Arrange a generous bed of shredded lettuce on a plate and place the chicken on top"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 6;

UPDATE public.recipe_steps SET
  description = '{"ko": "특제 소스 재료를 모두 섞어 골고루 뿌리면 완성", "en": "Mix all the sauce ingredients together and drizzle evenly over the chicken to serve"}',
  tip = '{"ko": "소스에 다진 파와 고추를 듬뿍 넣어야 식감이 살아난다", "en": "Be generous with chopped scallions and chili in the sauce for the best texture"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND step_order = 7;

-- r4 ingredient notes
UPDATE public.recipe_ingredients SET note = '{"ko": "5~6덩이", "en": "5-6 pieces"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 1;

UPDATE public.recipe_ingredients SET note = '{"ko": "넉넉히, 채 썰기", "en": "generous amount, shredded"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 2;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a pinch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 3;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a pinch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 4;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a dash"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 5;

UPDATE public.recipe_ingredients SET note = '{"ko": "노른자만 사용", "en": "yolk only"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 6;

UPDATE public.recipe_ingredients SET note = '{"ko": "적당량", "en": "as needed"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 7;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용, 적당량", "en": "for sauce, to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 8;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용, 적당량", "en": "for sauce, to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 9;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용, 적당량", "en": "for sauce, to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 10;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용, 다져서 듬뿍", "en": "for sauce, chopped generously"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 11;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "고추", "en": "Chili Pepper"}', note = '{"ko": "소스용, 다져서 듬뿍", "en": "for sauce, chopped generously"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'yuringi') AND display_order = 12;


-- ============================================================
-- r5: 이찬원 파닭전
-- ============================================================

UPDATE public.recipe_steps SET
  description = '{"ko": "손질한 닭다리살에 맛소금 0.5, 맛술 2, 후추, 다진 마늘 1을 넣고 잘 버무려 잠시 재워둔다", "en": "Season the prepared chicken thighs with 0.5 tbsp seasoned salt, 2 tbsp cooking wine, pepper, and 1 tbsp minced garlic. Mix well and let marinate briefly"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND step_order = 1;

UPDATE public.recipe_steps SET
  description = '{"ko": "재워둔 닭에 감자전분 6스푼, 물 4스푼, 송송 썬 청양고추를 넣고 골고루 버무린다", "en": "Add 6 tbsp potato starch, 4 tbsp water, and sliced cheongyang chili to the marinated chicken. Mix until evenly coated"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND step_order = 2;

UPDATE public.recipe_steps SET
  description = '{"ko": "팬에 기름을 넉넉히 두르고 반죽을 올려 꾹꾹 눌러가며 바삭하게 익힌다", "en": "Add a generous amount of oil to a pan, place the batter in, and press down firmly while cooking until crispy"}',
  tip = '{"ko": "꾹 눌러줘야 닭이 고르게 익고 더 바삭해진다", "en": "Press down firmly so the chicken cooks evenly and gets extra crispy"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND step_order = 3;

UPDATE public.recipe_steps SET
  description = '{"ko": "소스 재료를 모두 섞어 전자레인지에 1분 정도 돌린다", "en": "Mix all sauce ingredients together and microwave for about 1 minute"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND step_order = 4;

UPDATE public.recipe_steps SET
  description = '{"ko": "바삭하게 구워진 닭전 위에 파채를 듬뿍 올리고 소스를 부으면 완성", "en": "Top the crispy chicken pancake with a generous pile of scallion threads and pour the sauce over to serve"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND step_order = 5;

-- r5 ingredient notes
UPDATE public.recipe_ingredients SET note = '{"ko": "한입 크기로 손질", "en": "cut into bite-sized pieces"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 1;

UPDATE public.recipe_ingredients SET note = '{"ko": "파채, 듬뿍", "en": "scallion threads, generous"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 2;

UPDATE public.recipe_ingredients SET note = '{"ko": "감자전분", "en": "potato starch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 3;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "물", "en": "Water"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 4;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "청양고추", "en": "Cheongyang Chili"}', note = '{"ko": "취향껏", "en": "to taste"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 5;

UPDATE public.recipe_ingredients SET note = '{"ko": "밑간용 맛술", "en": "cooking wine for marinade"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 7;

UPDATE public.recipe_ingredients SET note = '{"ko": "약간", "en": "a pinch"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 8;

UPDATE public.recipe_ingredients SET note = '{"ko": "다져서", "en": "minced"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 9;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용, 다져서", "en": "for sauce, minced"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 10;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용", "en": "for sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 11;

UPDATE public.recipe_ingredients SET note = '{"ko": "소스용 맛술", "en": "cooking wine for sauce"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 12;

UPDATE public.recipe_ingredients SET custom_name = '{"ko": "알룰로스", "en": "Allulose"}', note = '{"ko": "또는 설탕", "en": "or sugar"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 13;

UPDATE public.recipe_ingredients SET note = '{"ko": "물엿", "en": "corn syrup"}'
WHERE recipe_id = (SELECT recipe_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon') AND display_order = 14;
