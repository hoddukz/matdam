-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/009_cuisine_seed_expansion.sql

-- ============================================================
-- Migration 009: Cuisine Seed Expansion
-- 한식 추가 + 일식/양식 재료 시드 데이터
-- ============================================================


-- ============================================================
-- 1. 한식 추가 재료 (10개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'dashima',
  '{"en": "Kelp", "ko": "다시마"}',
  'other',
  ARRAY['g', 'piece', 'sheet'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Dried kelp (dashima). The foundation of Korean soup stock along with dried anchovy.", "ko": "다시마. 멸치와 함께 한식 육수의 기본 재료."}',
  ARRAY['korean'],
  'must_have'
),
(
  'miyeok',
  '{"en": "Dried Seaweed", "ko": "미역"}',
  'other',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Dried seaweed (miyeok). Used in miyeok-guk (birthday seaweed soup) and side dishes.", "ko": "미역. 미역국과 반찬에 사용. 생일에 미역국을 먹는 전통이 있음."}',
  ARRAY['korean'],
  'recommended'
),
(
  'perilla_oil',
  '{"en": "Perilla Oil", "ko": "들기름"}',
  'sauce_paste',
  ARRAY['tsp', 'tbsp', 'ml'],
  'tsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sesame_oil'],
  '{"en": "Perilla oil (deulgireum). Nuttier than sesame oil. Used in namul and bibimbap.", "ko": "들기름. 참기름보다 고소한 향. 나물과 비빔밥에 사용."}',
  ARRAY['korean'],
  'recommended'
),
(
  'perilla_leaves',
  '{"en": "Perilla Leaves", "ko": "깻잎"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Perilla leaves (kkaennip). Aromatic herb used in wraps, pickles, and stir-fries.", "ko": "깻잎. 쌈, 장아찌, 볶음에 사용하는 향긋한 허브."}',
  ARRAY['korean'],
  'recommended'
),
(
  'korean_chili_pepper',
  '{"en": "Korean Chili Pepper", "ko": "청양고추"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['gochugaru'],
  '{"en": "Korean green chili pepper (cheongyang). Very spicy. Used fresh in stews and side dishes.", "ko": "청양고추. 매운맛이 강하며 찌개와 반찬에 생으로 사용."}',
  ARRAY['korean'],
  'recommended'
),
(
  'dried_laver',
  '{"en": "Dried Laver", "ko": "김"}',
  'other',
  ARRAY['sheet', 'piece', 'g'],
  'sheet',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean dried laver (gim). Roasted with sesame oil and salt. Eaten with rice.", "ko": "김. 참기름과 소금으로 구워 밥과 함께 먹음."}',
  ARRAY['korean'],
  'recommended'
),
(
  'ssamjang',
  '{"en": "Ssamjang", "ko": "쌈장"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegetarian', 'dairy_free'],
  ARRAY['doenjang', 'gochujang'],
  '{"en": "Ssamjang. A thick dipping paste made from doenjang and gochujang. Essential for lettuce wraps.", "ko": "쌈장. 된장과 고추장을 섞어 만든 쌈 전용 장. 상추쌈의 필수 양념."}',
  ARRAY['korean'],
  'advanced'
),
(
  'corn_syrup',
  '{"en": "Corn Syrup", "ko": "물엿"}',
  'seasoning',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sugar'],
  '{"en": "Korean corn syrup (mulyeot). Adds gloss and mild sweetness to stir-fries and braised dishes.", "ko": "물엿. 볶음과 조림에 윤기와 은은한 단맛을 더함."}',
  ARRAY['korean'],
  'recommended'
),
(
  'rice_vinegar',
  '{"en": "Rice Vinegar", "ko": "식초"}',
  'seasoning',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Rice vinegar. Mild acidity. Used in Korean and Japanese dressings, pickles, and sushi rice.", "ko": "식초. 부드러운 산미. 한식/일식 양념장, 초절임, 초밥에 사용."}',
  ARRAY['korean', 'japanese'],
  'recommended'
),
(
  'potato',
  '{"en": "Potato", "ko": "감자"}',
  'vegetable',
  ARRAY['piece', 'g', 'kg'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Potato. Used in stews, stir-fries, and side dishes across many cuisines.", "ko": "감자. 찌개, 볶음, 반찬 등 다양한 요리에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. 일식 재료 (12개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'shoyu',
  '{"en": "Japanese Soy Sauce", "ko": "쇼유"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  true,
  ARRAY['vegan', 'dairy_free'],
  ARRAY['ganjang'],
  '{"en": "Japanese soy sauce (shoyu). Slightly sweeter and less salty than Korean ganjang.", "ko": "일본 간장(쇼유). 한국 간장보다 약간 달고 덜 짠 맛."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'mirin',
  '{"en": "Mirin", "ko": "미림"}',
  'seasoning',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sugar', 'sake_cooking'],
  '{"en": "Mirin. Sweet rice wine for cooking. Adds glaze and mild sweetness to teriyaki and simmered dishes.", "ko": "미림. 요리용 달콤한 청주. 데리야키와 조림에 윤기와 단맛을 더함."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'miso',
  '{"en": "Miso", "ko": "미소"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY['doenjang'],
  '{"en": "Miso paste. Japanese fermented soybean paste. Lighter and sweeter than Korean doenjang.", "ko": "미소 된장. 일본식 발효 콩 페이스트. 한국 된장보다 연하고 달콤함."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'sake_cooking',
  '{"en": "Cooking Sake", "ko": "요리술"}',
  'seasoning',
  ARRAY['tbsp', 'ml', 'cup'],
  'tbsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['mirin'],
  '{"en": "Cooking sake (ryorishu). Removes fishy odors and tenderizes proteins.", "ko": "요리술(료리슈). 비린내를 잡고 단백질을 부드럽게 함."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'dashi_powder',
  '{"en": "Dashi Powder", "ko": "다시 가루"}',
  'seasoning',
  ARRAY['tsp', 'tbsp', 'g'],
  'tsp',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY['katsuobushi', 'dashima'],
  '{"en": "Dashi powder. Instant Japanese soup stock base. Made from bonito and kelp.", "ko": "다시 가루. 일본 즉석 육수 베이스. 가쓰오부시와 다시마로 제조."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'katsuobushi',
  '{"en": "Bonito Flakes", "ko": "가쓰오부시"}',
  'other',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY['dashi_powder'],
  '{"en": "Katsuobushi. Dried, smoked, and shaved bonito (skipjack tuna). The soul of dashi stock.", "ko": "가쓰오부시. 건조 훈제 가다랑어포. 다시 육수의 핵심 재료."}',
  ARRAY['japanese'],
  'must_have'
),
(
  'nori',
  '{"en": "Nori", "ko": "노리"}',
  'other',
  ARRAY['sheet', 'piece', 'g'],
  'sheet',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['dried_laver'],
  '{"en": "Nori seaweed. Used for sushi rolls, onigiri, and as a garnish.", "ko": "노리. 초밥, 주먹밥, 고명에 사용하는 일본 김."}',
  ARRAY['japanese'],
  'recommended'
),
(
  'panko',
  '{"en": "Panko", "ko": "빵가루"}',
  'grain_noodle',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Panko breadcrumbs. Light and flaky. Essential for tonkatsu and korokke.", "ko": "빵가루(판코). 가볍고 바삭함. 돈카츠와 고로케의 필수 재료."}',
  ARRAY['japanese'],
  'recommended'
),
(
  'wasabi',
  '{"en": "Wasabi", "ko": "와사비"}',
  'seasoning',
  ARRAY['tsp', 'g'],
  'tsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Wasabi. Pungent Japanese horseradish. Served with sushi and soba.", "ko": "와사비. 톡 쏘는 일본 고추냉이. 초밥과 소바에 곁들임."}',
  ARRAY['japanese'],
  'recommended'
),
(
  'udon_noodle',
  '{"en": "Udon Noodles", "ko": "우동면"}',
  'grain_noodle',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Udon noodles. Thick and chewy wheat noodles. Served in hot broth or chilled.", "ko": "우동면. 두껍고 쫄깃한 밀면. 따뜻한 국물이나 차갑게 제공."}',
  ARRAY['japanese'],
  'recommended'
),
(
  'soba_noodle',
  '{"en": "Soba Noodles", "ko": "소바면"}',
  'grain_noodle',
  ARRAY['g'],
  'g',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY['udon_noodle'],
  '{"en": "Soba noodles. Thin buckwheat noodles. Served chilled with dipping sauce or in hot broth.", "ko": "소바면. 메밀로 만든 얇은 면. 차갑게 쯔유에 찍어 먹거나 따뜻한 국물에 제공."}',
  ARRAY['japanese'],
  'advanced'
),
(
  'mentsuyu',
  '{"en": "Mentsuyu", "ko": "멘쯔유"}',
  'sauce_paste',
  ARRAY['tbsp', 'ml', 'cup'],
  'tbsp',
  false,
  ARRAY['dairy_free'],
  ARRAY['shoyu', 'dashi_powder'],
  '{"en": "Mentsuyu. Concentrated noodle dipping sauce made from dashi, soy sauce, and mirin.", "ko": "멘쯔유. 다시, 간장, 미림으로 만든 농축 면 소스. 만능 조미료로도 사용."}',
  ARRAY['japanese'],
  'recommended'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. 양식 재료 (14개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'olive_oil',
  '{"en": "Olive Oil", "ko": "올리브 오일"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['butter'],
  '{"en": "Olive oil. The foundation of Mediterranean and Western cooking. Extra virgin for dressings, regular for cooking.", "ko": "올리브 오일. 서양 요리의 기본 유지류. 엑스트라 버진은 드레싱, 일반은 조리용."}',
  ARRAY['western'],
  'must_have'
),
(
  'butter',
  '{"en": "Butter", "ko": "버터"}',
  'dairy_egg',
  ARRAY['g', 'tbsp'],
  'g',
  true,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY['olive_oil'],
  '{"en": "Butter. Unsalted preferred for cooking. Essential for sauces, baking, and finishing dishes.", "ko": "버터. 조리에는 무염 버터 선호. 소스, 베이킹, 마무리에 필수."}',
  ARRAY['western'],
  'must_have'
),
(
  'black_pepper',
  '{"en": "Black Pepper", "ko": "후추"}',
  'seasoning',
  ARRAY['tsp', 'g'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Black pepper. Freshly ground preferred. The most universal spice in cooking.", "ko": "후추. 갓 갈아 사용하면 향이 좋음. 세계에서 가장 널리 쓰이는 향신료."}',
  ARRAY['korean', 'japanese', 'western'],
  'must_have'
),
(
  'all_purpose_flour',
  '{"en": "All-Purpose Flour", "ko": "밀가루"}',
  'grain_noodle',
  ARRAY['g', 'cup', 'tbsp'],
  'g',
  true,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "All-purpose flour. Used for thickening sauces, breading, baking, and pasta making.", "ko": "밀가루(중력분). 소스 농도 조절, 튀김옷, 베이킹, 면 만들기에 사용."}',
  ARRAY['western'],
  'must_have'
),
(
  'pasta',
  '{"en": "Pasta", "ko": "파스타"}',
  'grain_noodle',
  ARRAY['g'],
  'g',
  true,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Dried pasta. Spaghetti, penne, fusilli — keep a few shapes stocked.", "ko": "건파스타. 스파게티, 펜네, 푸실리 등 몇 가지 모양을 구비."}',
  ARRAY['western'],
  'must_have'
),
(
  'heavy_cream',
  '{"en": "Heavy Cream", "ko": "생크림"}',
  'dairy_egg',
  ARRAY['ml', 'cup', 'tbsp'],
  'ml',
  true,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY[]::text[],
  '{"en": "Heavy cream. Used in pasta sauces, soups, and desserts.", "ko": "생크림. 파스타 소스, 수프, 디저트에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'parmesan',
  '{"en": "Parmesan", "ko": "파마산"}',
  'dairy_egg',
  ARRAY['g', 'tbsp'],
  'g',
  false,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY['mozzarella'],
  '{"en": "Parmesan cheese (Parmigiano-Reggiano). Hard, aged cheese. Grated over pasta and salads.", "ko": "파마산 치즈(파르미지아노 레지아노). 파스타와 샐러드 위에 갈아서 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'chicken_broth',
  '{"en": "Chicken Broth", "ko": "치킨 브로스"}',
  'seasoning',
  ARRAY['ml', 'cup'],
  'ml',
  true,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Chicken broth/stock. Base for soups, risotto, and sauces.", "ko": "치킨 브로스/육수. 수프, 리조또, 소스의 베이스."}',
  ARRAY['western'],
  'recommended'
),
(
  'tomato_paste',
  '{"en": "Tomato Paste", "ko": "토마토 페이스트"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Tomato paste. Concentrated tomato flavor. Essential for Italian sauces and stews.", "ko": "토마토 페이스트. 농축 토마토. 이탈리아 소스와 스튜의 필수 재료."}',
  ARRAY['western'],
  'recommended'
),
(
  'lemon',
  '{"en": "Lemon", "ko": "레몬"}',
  'other',
  ARRAY['piece', 'tbsp', 'tsp'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['rice_vinegar'],
  '{"en": "Lemon. Juice and zest add brightness to dressings, sauces, and seafood.", "ko": "레몬. 즙과 껍질을 드레싱, 소스, 해산물 요리에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'white_wine_cooking',
  '{"en": "Cooking White Wine", "ko": "요리용 화이트 와인"}',
  'seasoning',
  ARRAY['ml', 'tbsp', 'cup'],
  'ml',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sake_cooking'],
  '{"en": "Dry white wine for cooking. Used in risotto, cream sauces, and deglazing.", "ko": "요리용 드라이 화이트 와인. 리조또, 크림 소스, 디글레이징에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'dried_oregano',
  '{"en": "Oregano", "ko": "오레가노"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['dried_thyme'],
  '{"en": "Dried oregano. Earthy and peppery. Essential for Italian and Greek cooking.", "ko": "건조 오레가노. 흙내음과 후추향. 이탈리아, 그리스 요리에 필수."}',
  ARRAY['western'],
  'advanced'
),
(
  'dried_thyme',
  '{"en": "Thyme", "ko": "타임"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['dried_oregano'],
  '{"en": "Dried thyme. Warm, slightly minty. Used in roasts, stews, and French cooking.", "ko": "건조 타임. 따뜻하고 약간 민트향. 로스트, 스튜, 프랑스 요리에 사용."}',
  ARRAY['western'],
  'advanced'
),
(
  'dried_rosemary',
  '{"en": "Rosemary", "ko": "로즈마리"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['dried_thyme'],
  '{"en": "Dried rosemary. Pine-like aroma. Perfect for roasted meats, potatoes, and bread.", "ko": "건조 로즈마리. 솔향 비슷한 향. 로스트 고기, 감자, 빵에 잘 어울림."}',
  ARRAY['western'],
  'advanced'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. 기존 재료 cuisines 확장 (공통 재료)
-- ============================================================

-- 한식 + 일식 + 양식 공통
UPDATE public.ingredients
SET cuisines = ARRAY['korean', 'japanese', 'western']
WHERE id IN ('garlic', 'salt', 'sugar', 'onion', 'carrot', 'egg');

-- 한식 + 일식 공통
UPDATE public.ingredients
SET cuisines = ARRAY['korean', 'japanese']
WHERE id IN ('tofu', 'sesame_oil', 'green_onion', 'sesame_seeds', 'short_grain_rice', 'ginger', 'pork_belly');

-- 한식 + 양식 공통
UPDATE public.ingredients
SET cuisines = ARRAY['korean', 'western']
WHERE id IN ('chicken_thigh');
