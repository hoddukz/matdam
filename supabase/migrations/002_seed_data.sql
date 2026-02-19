-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/002_seed_data.sql

-- ============================================================
-- Migration 002: Seed Data — Units (15) + Ingredients (30)
-- ============================================================
-- Idempotent: uses ON CONFLICT DO NOTHING
-- ============================================================


-- ============================================================
-- 1. UNITS (15)
-- ============================================================

INSERT INTO public.units (unit_id, names, ml_equivalent) VALUES
  ('tsp',    '{"en": ["teaspoon", "tsp"], "ko": ["작은술", "t"]}',       5),
  ('tbsp',   '{"en": ["tablespoon", "tbsp"], "ko": ["큰술", "T"]}',     15),
  ('cup',    '{"en": ["cup"], "ko": ["컵"]}',                           240),
  ('ml',     '{"en": ["milliliter", "ml", "mL"], "ko": ["밀리리터", "ml"]}', 1),
  ('l',      '{"en": ["liter", "L"], "ko": ["리터", "L"]}',             1000),
  ('fl_oz',  '{"en": ["fluid ounce", "fl oz"], "ko": ["액량 온스"]}',   29.5735),
  ('g',      '{"en": ["gram", "g"], "ko": ["그램", "g"]}',              NULL),
  ('kg',     '{"en": ["kilogram", "kg"], "ko": ["킬로그램", "kg"]}',    NULL),
  ('oz',     '{"en": ["ounce", "oz"], "ko": ["온스", "oz"]}',           NULL),
  ('lb',     '{"en": ["pound", "lb"], "ko": ["파운드", "lb"]}',         NULL),
  ('piece',  '{"en": ["piece", "pc"], "ko": ["개", "조각"]}',           NULL),
  ('bunch',  '{"en": ["bunch"], "ko": ["단", "묶음"]}',                 NULL),
  ('clove',  '{"en": ["clove"], "ko": ["쪽"]}',                         NULL),
  ('stalk',  '{"en": ["stalk"], "ko": ["대", "줄기"]}',                 NULL),
  ('sheet',  '{"en": ["sheet"], "ko": ["장"]}',                         NULL)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. INGREDIENTS (30)
-- ============================================================

-- ---- Sauces & Pastes (6) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'gochujang',
  '{"en": "Gochujang", "ko": "고추장"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegetarian', 'dairy_free'],
  ARRAY['gochugaru'],
  '{"en": "Korean fermented red chili paste. Sweet, spicy, and savory — the backbone of many Korean dishes.", "ko": "한국의 발효 고추장. 달고 맵고 감칠맛 나는 한식의 기본 양념."}'
),
(
  'doenjang',
  '{"en": "Doenjang", "ko": "된장"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean fermented soybean paste. Deeper and earthier than Japanese miso.", "ko": "한국의 발효 된장. 일본 미소보다 깊고 구수한 맛."}'
),
(
  'ganjang',
  '{"en": "Soy Sauce", "ko": "간장"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'ml'],
  'tbsp',
  true,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean soy sauce (ganjang). Slightly lighter and saltier than Japanese soy sauce.", "ko": "한국 간장. 일본 간장보다 약간 연하고 짠맛이 강함."}'
),
(
  'sesame_oil',
  '{"en": "Sesame Oil", "ko": "참기름"}',
  'sauce_paste',
  ARRAY['tsp', 'tbsp', 'ml'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Toasted sesame oil. Adds a nutty, rich aroma. Used as a finishing oil in most Korean dishes.", "ko": "참깨로 만든 참기름. 고소한 향을 더하며 한식 마무리에 주로 사용."}'
),
(
  'gochugaru',
  '{"en": "Gochugaru", "ko": "고춧가루"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g', 'cup'],
  'tbsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['gochujang'],
  '{"en": "Korean red chili flakes. Coarsely ground, slightly sweet and smoky. Essential for kimchi.", "ko": "한국 고춧가루. 굵게 빻은 형태로, 약간 달고 훈제향이 남. 김치의 필수 재료."}'
),
(
  'fish_sauce',
  '{"en": "Fish Sauce", "ko": "액젓"}',
  'sauce_paste',
  ARRAY['tsp', 'tbsp', 'ml'],
  'tsp',
  true,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY['ganjang'],
  '{"en": "Korean fish sauce (aekjeot). Adds deep umami. Common in kimchi and stews.", "ko": "한국 액젓. 깊은 감칠맛을 더함. 김치와 찌개에 주로 사용."}'
)
ON CONFLICT DO NOTHING;

-- ---- Seasonings (5) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'garlic',
  '{"en": "Garlic", "ko": "마늘"}',
  'seasoning',
  ARRAY['clove', 'tsp', 'tbsp', 'g'],
  'clove',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Fresh garlic. Used generously in almost every Korean dish.", "ko": "생마늘. 거의 모든 한식에 듬뿍 사용."}'
),
(
  'ginger',
  '{"en": "Ginger", "ko": "생강"}',
  'seasoning',
  ARRAY['tsp', 'tbsp', 'g', 'piece'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Fresh ginger. Adds warmth and brightness to marinades and soups.", "ko": "생강. 양념과 국물에 따뜻하고 상쾌한 맛을 더함."}'
),
(
  'green_onion',
  '{"en": "Green Onion", "ko": "파"}',
  'seasoning',
  ARRAY['stalk', 'g', 'bunch'],
  'stalk',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['onion'],
  '{"en": "Green onion (scallion). Used as both a seasoning and a garnish in Korean cooking.", "ko": "대파. 한식에서 양념과 고명으로 모두 사용."}'
),
(
  'sugar',
  '{"en": "Sugar", "ko": "설탕"}',
  'seasoning',
  ARRAY['tsp', 'tbsp', 'g', 'cup'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "White sugar. Used to balance spicy and savory flavors in Korean sauces.", "ko": "백설탕. 한식 양념에서 맵고 짠맛의 균형을 맞추는 데 사용."}'
),
(
  'salt',
  '{"en": "Salt", "ko": "소금"}',
  'seasoning',
  ARRAY['tsp', 'tbsp', 'g'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Salt. Coarse sea salt is preferred for kimchi; fine salt for seasoning.", "ko": "소금. 김치에는 굵은소금, 양념에는 꽃소금 사용."}'
)
ON CONFLICT DO NOTHING;

-- ---- Vegetables (7) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'napa_cabbage',
  '{"en": "Napa Cabbage", "ko": "배추"}',
  'vegetable',
  ARRAY['g', 'kg', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Napa cabbage (baechu). The primary ingredient for traditional kimchi.", "ko": "배추. 전통 김치의 주재료."}'
),
(
  'korean_radish',
  '{"en": "Korean Radish", "ko": "무"}',
  'vegetable',
  ARRAY['g', 'kg', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean radish (mu). Denser and sweeter than daikon. Used in soups, kimchi, and side dishes.", "ko": "무. 일본 다이콘보다 단단하고 달다. 국, 김치, 반찬에 사용."}'
),
(
  'zucchini',
  '{"en": "Korean Zucchini", "ko": "애호박"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean zucchini (aehobak). Slightly sweeter and thinner-skinned than Western zucchini.", "ko": "애호박. 서양 호박보다 달고 껍질이 얇음."}'
),
(
  'spinach',
  '{"en": "Spinach", "ko": "시금치"}',
  'vegetable',
  ARRAY['g', 'bunch'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Spinach. Commonly blanched and seasoned as a side dish (sigeumchi-namul).", "ko": "시금치. 데쳐서 양념한 시금치나물이 대표적."}'
),
(
  'bean_sprouts',
  '{"en": "Bean Sprouts", "ko": "콩나물"}',
  'vegetable',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Soybean sprouts (kongnamul). A staple in Korean soups and side dishes.", "ko": "콩나물. 한식 국과 반찬의 기본 재료."}'
),
(
  'onion',
  '{"en": "Onion", "ko": "양파"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['green_onion'],
  '{"en": "Yellow onion. Adds sweetness when cooked. Used in stews, stir-fries, and marinades.", "ko": "양파. 조리 시 단맛이 남. 찌개, 볶음, 양념에 사용."}'
),
(
  'carrot',
  '{"en": "Carrot", "ko": "당근"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Carrot. Adds color and slight sweetness to stir-fries and rice dishes.", "ko": "당근. 볶음과 밥 요리에 색과 단맛을 더함."}'
)
ON CONFLICT DO NOTHING;

-- ---- Proteins (5) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'tofu',
  '{"en": "Tofu", "ko": "두부"}',
  'protein',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Tofu (dubu). Used in stews (sundubu-jjigae), stir-fries, and side dishes.", "ko": "두부. 찌개(순두부찌개), 볶음, 반찬에 사용."}'
),
(
  'beef_brisket',
  '{"en": "Beef Brisket", "ko": "소고기 양지"}',
  'protein',
  ARRAY['g', 'kg'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free', 'halal'],
  ARRAY['chicken_thigh'],
  '{"en": "Beef brisket. Used for soups (seolleongtang) and slow-braised dishes.", "ko": "소고기 양지. 설렁탕과 조림에 사용."}'
),
(
  'pork_belly',
  '{"en": "Pork Belly", "ko": "삼겹살"}',
  'protein',
  ARRAY['g', 'kg'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Pork belly (samgyeopsal). The king of Korean BBQ.", "ko": "삼겹살. 한국 바비큐의 대표 고기."}'
),
(
  'chicken_thigh',
  '{"en": "Chicken Thigh", "ko": "닭다리살"}',
  'protein',
  ARRAY['g', 'kg', 'piece'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free', 'halal'],
  ARRAY['beef_brisket'],
  '{"en": "Chicken thigh. Used in dakgalbi, chicken stew (dakdoritang), and fried chicken.", "ko": "닭다리살. 닭갈비, 닭도리탕, 치킨에 사용."}'
),
(
  'dried_anchovy',
  '{"en": "Dried Anchovy", "ko": "멸치"}',
  'protein',
  ARRAY['g', 'piece', 'cup'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Dried anchovy (myeolchi). Large ones for stock, small ones for side dishes.", "ko": "멸치. 큰 것은 육수, 작은 것은 볶음 반찬에 사용."}'
)
ON CONFLICT DO NOTHING;

-- ---- Grains & Noodles (4) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'short_grain_rice',
  '{"en": "Short Grain Rice", "ko": "쌀"}',
  'grain_noodle',
  ARRAY['cup', 'g', 'kg'],
  'cup',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean short grain rice. Sticky and slightly sweet when cooked.", "ko": "한국 쌀. 찰지고 약간 달다."}'
),
(
  'sweet_potato_noodle',
  '{"en": "Sweet Potato Noodles", "ko": "당면"}',
  'grain_noodle',
  ARRAY['g'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Sweet potato glass noodles (dangmyeon). Chewy and translucent. Used in japchae.", "ko": "당면. 쫄깃하고 투명한 면. 잡채에 사용."}'
),
(
  'rice_cake',
  '{"en": "Rice Cake", "ko": "떡"}',
  'grain_noodle',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean rice cake (tteok). Cylinder or sliced form for tteokbokki and soups.", "ko": "떡. 떡볶이와 국에 사용하는 원통형 또는 슬라이스 형태."}'
),
(
  'ramyeon_noodle',
  '{"en": "Ramyeon Noodles", "ko": "라면"}',
  'grain_noodle',
  ARRAY['piece', 'g'],
  'piece',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Korean instant ramyeon noodles. Often added to stews like budae-jjigae.", "ko": "한국 라면. 부대찌개 등 찌개에 넣어 먹기도 함."}'
)
ON CONFLICT DO NOTHING;

-- ---- Dairy & Eggs (2) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'egg',
  '{"en": "Egg", "ko": "달걀"}',
  'dairy_egg',
  ARRAY['piece'],
  'piece',
  true,
  ARRAY['vegetarian', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Egg. Used in gyeran-jjim (steamed egg), bibimbap, and many side dishes.", "ko": "달걀. 계란찜, 비빔밥, 다양한 반찬에 사용."}'
),
(
  'mozzarella',
  '{"en": "Mozzarella", "ko": "모짜렐라"}',
  'dairy_egg',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY[]::text[],
  '{"en": "Mozzarella cheese. Popular in Korean fusion dishes like cheese tteokbokki and corn cheese.", "ko": "모짜렐라 치즈. 치즈떡볶이, 콘치즈 등 퓨전 한식에 인기."}'
)
ON CONFLICT DO NOTHING;

-- ---- Other (1) ----

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description) VALUES
(
  'sesame_seeds',
  '{"en": "Sesame Seeds", "ko": "깨"}',
  'other',
  ARRAY['tsp', 'tbsp', 'g'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Toasted sesame seeds. Sprinkled on top of almost everything in Korean cuisine.", "ko": "볶은 깨. 한식 거의 모든 요리 위에 뿌려 먹음."}'
)
ON CONFLICT DO NOTHING;
