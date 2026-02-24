-- Tag: core
-- Path: /Users/hodduk/Documents/git/mat_dam/supabase/migrations/011_expanded_ingredient_seeds.sql

-- ============================================================
-- Migration 011: Expanded Ingredient Seeds
-- Western/Japanese/Baking/Common 재료 확장
-- ============================================================


-- ============================================================
-- 1. Western 재료 (18개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'cheddar',
  '{"en": "Cheddar Cheese", "ko": "체다 치즈"}',
  'dairy_egg',
  ARRAY['g', 'slice'],
  'g',
  false,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY['parmesan', 'mozzarella'],
  '{"en": "Cheddar cheese. Sharp, versatile cheese for sandwiches, burgers, and mac & cheese.", "ko": "체다 치즈. 샌드위치, 버거, 맥앤치즈에 사용하는 만능 치즈."}',
  ARRAY['western'],
  'recommended'
),
(
  'cream_cheese',
  '{"en": "Cream Cheese", "ko": "크림치즈"}',
  'dairy_egg',
  ARRAY['g', 'tbsp'],
  'g',
  false,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY[]::text[],
  '{"en": "Cream cheese. Soft and spreadable. Used in cheesecakes, bagels, and frostings.", "ko": "크림치즈. 부드럽고 발라먹기 좋음. 치즈케이크, 베이글, 프로스팅에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'milk',
  '{"en": "Milk", "ko": "우유"}',
  'dairy_egg',
  ARRAY['ml', 'cup'],
  'ml',
  true,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY['soy_milk'],
  '{"en": "Whole milk. Essential for baking, sauces, and beverages.", "ko": "우유. 베이킹, 소스, 음료에 필수."}',
  ARRAY['korean', 'japanese', 'western'],
  'must_have'
),
(
  'bacon',
  '{"en": "Bacon", "ko": "베이컨"}',
  'protein',
  ARRAY['piece', 'g'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Bacon. Smoky cured pork belly strips. Adds flavor to salads, pasta, and sandwiches.", "ko": "베이컨. 훈제 돼지고기 스트립. 샐러드, 파스타, 샌드위치에 풍미를 더함."}',
  ARRAY['western'],
  'recommended'
),
(
  'ground_beef',
  '{"en": "Ground Beef", "ko": "소고기 다짐육"}',
  'protein',
  ARRAY['g', 'kg'],
  'g',
  true,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Ground beef. Used in burgers, bolognese, tacos, and meatballs.", "ko": "소고기 다짐육. 버거, 볼로네제, 타코, 미트볼에 사용."}',
  ARRAY['western'],
  'must_have'
),
(
  'chicken_breast',
  '{"en": "Chicken Breast", "ko": "닭가슴살"}',
  'protein',
  ARRAY['g', 'piece'],
  'g',
  true,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY['chicken_thigh'],
  '{"en": "Chicken breast. Lean protein. Grilled, baked, or stir-fried.", "ko": "닭가슴살. 저지방 단백질. 구이, 오븐, 볶음 요리에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'must_have'
),
(
  'shrimp',
  '{"en": "Shrimp", "ko": "새우"}',
  'protein',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Shrimp. Versatile shellfish for stir-fries, pasta, and tempura.", "ko": "새우. 볶음, 파스타, 튀김에 사용하는 만능 해산물."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
),
(
  'salmon',
  '{"en": "Salmon", "ko": "연어"}',
  'protein',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Salmon fillet. Rich in omega-3. Grilled, baked, or served raw as sashimi.", "ko": "연어. 오메가-3 풍부. 구이, 오븐, 사시미로 제공."}',
  ARRAY['japanese', 'western'],
  'recommended'
),
(
  'mushroom',
  '{"en": "Mushroom", "ko": "양송이버섯"}',
  'vegetable',
  ARRAY['g', 'piece'],
  'g',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['shiitake', 'enoki'],
  '{"en": "White button mushroom. Mild flavor. Sautéed, in soups, or on pizza.", "ko": "양송이버섯. 부드러운 맛. 볶음, 수프, 피자에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'bell_pepper',
  '{"en": "Bell Pepper", "ko": "파프리카"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Bell pepper. Sweet and crunchy. Red, yellow, or green. Salads, stir-fries, and fajitas.", "ko": "파프리카. 달콤하고 아삭함. 샐러드, 볶음, 파히타에 사용."}',
  ARRAY['korean', 'western'],
  'recommended'
),
(
  'tomato',
  '{"en": "Tomato", "ko": "토마토"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['tomato_paste'],
  '{"en": "Fresh tomato. Salads, sandwiches, sauces, and garnish.", "ko": "토마토. 샐러드, 샌드위치, 소스, 고명에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'broccoli',
  '{"en": "Broccoli", "ko": "브로콜리"}',
  'vegetable',
  ARRAY['g', 'piece'],
  'g',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Broccoli. Steamed, stir-fried, or roasted. Nutritious green vegetable.", "ko": "브로콜리. 찜, 볶음, 오븐 구이. 영양 풍부한 녹색 채소."}',
  ARRAY['korean', 'western'],
  'recommended'
),
(
  'lettuce',
  '{"en": "Lettuce", "ko": "양상추"}',
  'vegetable',
  ARRAY['g', 'piece'],
  'g',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Lettuce. Base for salads and sandwiches. Also used for Korean ssam wraps.", "ko": "양상추. 샐러드와 샌드위치의 기본. 한식 쌈에도 사용."}',
  ARRAY['korean', 'western'],
  'recommended'
),
(
  'cucumber',
  '{"en": "Cucumber", "ko": "오이"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Cucumber. Fresh in salads, pickles, and Korean oi-muchim.", "ko": "오이. 샐러드, 피클, 오이무침에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
),
(
  'garlic_powder',
  '{"en": "Garlic Powder", "ko": "마늘 가루"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['garlic'],
  '{"en": "Garlic powder. Convenient dried garlic. Use when fresh garlic is unavailable.", "ko": "마늘 가루. 건조 마늘. 생마늘이 없을 때 대체 사용."}',
  ARRAY['western'],
  'advanced'
),
(
  'paprika',
  '{"en": "Paprika", "ko": "파프리카 가루"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['gochugaru'],
  '{"en": "Paprika. Sweet to smoky red pepper powder. Adds color and mild heat.", "ko": "파프리카 가루. 달콤~훈제 붉은 고춧가루. 색감과 은은한 매운맛."}',
  ARRAY['western'],
  'advanced'
),
(
  'sour_cream',
  '{"en": "Sour Cream", "ko": "사워크림"}',
  'dairy_egg',
  ARRAY['tbsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegetarian', 'gluten_free'],
  ARRAY['heavy_cream'],
  '{"en": "Sour cream. Tangy cultured cream. Topping for baked potatoes, tacos, and soups.", "ko": "사워크림. 새콤한 발효 크림. 감자, 타코, 수프 토핑."}',
  ARRAY['western'],
  'advanced'
),
(
  'celery',
  '{"en": "Celery", "ko": "셀러리"}',
  'vegetable',
  ARRAY['piece', 'g'],
  'piece',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Celery. Crunchy aromatic vegetable. Base of mirepoix with onion and carrot.", "ko": "셀러리. 아삭한 향채소. 양파, 당근과 함께 미르포아의 기본."}',
  ARRAY['western'],
  'advanced'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. Japanese 재료 (7개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'tofu_silken',
  '{"en": "Silken Tofu", "ko": "순두부"}',
  'protein',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['tofu'],
  '{"en": "Silken tofu (sundubu). Very soft and custard-like. Used in Korean stews and Japanese cold tofu.", "ko": "순두부. 매우 부드러운 두부. 순두부찌개와 일본식 히야얏코에 사용."}',
  ARRAY['korean', 'japanese'],
  'recommended'
),
(
  'shiitake',
  '{"en": "Shiitake Mushroom", "ko": "표고버섯"}',
  'vegetable',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['mushroom', 'enoki'],
  '{"en": "Shiitake mushroom. Rich umami flavor. Used dried or fresh in soups, stir-fries, and dashi.", "ko": "표고버섯. 풍부한 감칠맛. 건조 또는 생으로 국, 볶음, 다시에 사용."}',
  ARRAY['korean', 'japanese'],
  'recommended'
),
(
  'enoki',
  '{"en": "Enoki Mushroom", "ko": "팽이버섯"}',
  'vegetable',
  ARRAY['g', 'piece'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['shiitake', 'mushroom'],
  '{"en": "Enoki mushroom. Thin, long white mushroom. Used in hot pots, soups, and stir-fries.", "ko": "팽이버섯. 얇고 긴 흰색 버섯. 전골, 국, 볶음에 사용."}',
  ARRAY['korean', 'japanese'],
  'recommended'
),
(
  'edamame',
  '{"en": "Edamame", "ko": "에다마메"}',
  'vegetable',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Edamame. Young soybeans in pods. Boiled with salt as a snack or appetizer.", "ko": "에다마메. 풋콩. 소금에 삶아 간식이나 안주로 제공."}',
  ARRAY['japanese'],
  'advanced'
),
(
  'pickled_ginger',
  '{"en": "Pickled Ginger", "ko": "초생강"}',
  'other',
  ARRAY['g', 'tbsp'],
  'g',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['ginger'],
  '{"en": "Pickled ginger (gari). Palate cleanser served with sushi.", "ko": "초생강(가리). 초밥과 함께 제공하는 입가심용."}',
  ARRAY['japanese'],
  'advanced'
),
(
  'tempura_flour',
  '{"en": "Tempura Flour", "ko": "튀김가루"}',
  'grain_noodle',
  ARRAY['g', 'cup'],
  'g',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY['all_purpose_flour'],
  '{"en": "Tempura flour mix. Pre-seasoned for light, crispy batter.", "ko": "튀김가루. 가볍고 바삭한 튀김옷용 믹스."}',
  ARRAY['korean', 'japanese'],
  'recommended'
),
(
  'sushi_vinegar',
  '{"en": "Sushi Vinegar", "ko": "스시식초"}',
  'seasoning',
  ARRAY['tbsp', 'ml'],
  'tbsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['rice_vinegar'],
  '{"en": "Seasoned rice wine vinegar for sushi. Pre-mixed with sugar and salt.", "ko": "스시식초. 설탕과 소금이 미리 배합된 초밥용 식초."}',
  ARRAY['japanese'],
  'recommended'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. Baking 재료 (10개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'baking_powder',
  '{"en": "Baking Powder", "ko": "베이킹파우더"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['baking_soda'],
  '{"en": "Baking powder. Chemical leavening agent. Makes cakes and muffins rise.", "ko": "베이킹파우더. 화학 팽창제. 케이크와 머핀을 부풀게 함."}',
  ARRAY['western'],
  'must_have'
),
(
  'baking_soda',
  '{"en": "Baking Soda", "ko": "베이킹소다"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['baking_powder'],
  '{"en": "Baking soda (sodium bicarbonate). Needs acid to activate. Used in cookies and quick breads.", "ko": "베이킹소다. 산성 재료와 반응하여 팽창. 쿠키와 퀵브레드에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'vanilla_extract',
  '{"en": "Vanilla Extract", "ko": "바닐라 추출액"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Vanilla extract. Warm, sweet aroma. Essential for cakes, cookies, and custards.", "ko": "바닐라 추출액. 따뜻하고 달콤한 향. 케이크, 쿠키, 커스터드에 필수."}',
  ARRAY['western'],
  'must_have'
),
(
  'cocoa_powder',
  '{"en": "Cocoa Powder", "ko": "코코아 파우더"}',
  'seasoning',
  ARRAY['tbsp', 'g'],
  'tbsp',
  false,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Unsweetened cocoa powder. Base for chocolate cakes, brownies, and hot cocoa.", "ko": "무가당 코코아 파우더. 초콜릿 케이크, 브라우니, 핫초코의 기본."}',
  ARRAY['western'],
  'recommended'
),
(
  'brown_sugar',
  '{"en": "Brown Sugar", "ko": "흑설탕"}',
  'seasoning',
  ARRAY['g', 'tbsp', 'cup'],
  'g',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sugar', 'honey'],
  '{"en": "Brown sugar. Moist with molasses flavor. Used in cookies, BBQ sauce, and marinades.", "ko": "흑설탕. 당밀 풍미의 촉촉한 설탕. 쿠키, BBQ 소스, 양념장에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'honey',
  '{"en": "Honey", "ko": "꿀"}',
  'seasoning',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  true,
  ARRAY['vegetarian', 'gluten_free', 'dairy_free'],
  ARRAY['sugar', 'corn_syrup'],
  '{"en": "Honey. Natural sweetener. Used in dressings, marinades, baking, and teas.", "ko": "꿀. 천연 감미료. 드레싱, 양념, 베이킹, 차에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
),
(
  'powdered_sugar',
  '{"en": "Powdered Sugar", "ko": "슈가파우더"}',
  'seasoning',
  ARRAY['g', 'cup', 'tbsp'],
  'g',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['sugar'],
  '{"en": "Powdered sugar (confectioners'' sugar). Fine sugar for frostings, glazes, and dusting.", "ko": "슈가파우더. 프로스팅, 글레이즈, 장식용 미세 설탕."}',
  ARRAY['western'],
  'advanced'
),
(
  'yeast',
  '{"en": "Yeast", "ko": "이스트"}',
  'other',
  ARRAY['tsp', 'g'],
  'tsp',
  false,
  ARRAY['vegan', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Active dry or instant yeast. Biological leavening for bread, pizza dough, and buns.", "ko": "이스트. 빵, 피자 도우, 번의 생물학적 팽창제."}',
  ARRAY['western'],
  'recommended'
),
(
  'bread_flour',
  '{"en": "Bread Flour", "ko": "강력분"}',
  'grain_noodle',
  ARRAY['g', 'cup'],
  'g',
  true,
  ARRAY['vegan', 'dairy_free'],
  ARRAY['all_purpose_flour'],
  '{"en": "Bread flour. High-protein flour for chewy bread, pizza dough, and bagels.", "ko": "강력분. 고단백 밀가루. 쫄깃한 빵, 피자 도우, 베이글에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'cornstarch',
  '{"en": "Cornstarch", "ko": "전분"}',
  'grain_noodle',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['all_purpose_flour'],
  '{"en": "Cornstarch. Thickening agent for sauces, soups, and gravies. Also used in Korean frying.", "ko": "전분(옥수수 전분). 소스, 수프 농도 조절제. 한식 튀김에도 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. Common 재료 (6개)
-- ============================================================

INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
(
  'vegetable_oil',
  '{"en": "Vegetable Oil", "ko": "식용유"}',
  'sauce_paste',
  ARRAY['tbsp', 'ml', 'cup'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['olive_oil'],
  '{"en": "Neutral vegetable oil. High smoke point for frying and sautéing.", "ko": "식용유. 높은 발연점. 튀김과 볶음에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'must_have'
),
(
  'soy_milk',
  '{"en": "Soy Milk", "ko": "두유"}',
  'dairy_egg',
  ARRAY['ml', 'cup'],
  'ml',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['milk'],
  '{"en": "Soy milk. Plant-based milk alternative. Used in baking and beverages.", "ko": "두유. 식물성 우유 대체재. 베이킹과 음료에 사용."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
),
(
  'cinnamon',
  '{"en": "Cinnamon", "ko": "시나몬"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY[]::text[],
  '{"en": "Ground cinnamon. Warm, sweet spice. Used in baking, oatmeal, and drinks.", "ko": "시나몬. 따뜻하고 달콤한 향신료. 베이킹, 오트밀, 음료에 사용."}',
  ARRAY['western'],
  'recommended'
),
(
  'mayonnaise',
  '{"en": "Mayonnaise", "ko": "마요네즈"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp', 'g'],
  'tbsp',
  true,
  ARRAY['gluten_free'],
  ARRAY[]::text[],
  '{"en": "Mayonnaise. Creamy condiment for sandwiches, salads, and Japanese okonomiyaki.", "ko": "마요네즈. 샌드위치, 샐러드, 일본식 오코노미야키에 사용하는 크리미한 소스."}',
  ARRAY['korean', 'japanese', 'western'],
  'recommended'
),
(
  'ketchup',
  '{"en": "Ketchup", "ko": "케첩"}',
  'sauce_paste',
  ARRAY['tbsp', 'tsp'],
  'tbsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['tomato_paste'],
  '{"en": "Ketchup. Sweet tomato condiment. Used with fries, burgers, and in Korean stir-fries.", "ko": "케첩. 달콤한 토마토 소스. 감자튀김, 버거, 한식 볶음에 사용."}',
  ARRAY['korean', 'western'],
  'recommended'
),
(
  'red_pepper_flakes',
  '{"en": "Red Pepper Flakes", "ko": "칠리 플레이크"}',
  'seasoning',
  ARRAY['tsp', 'tbsp'],
  'tsp',
  true,
  ARRAY['vegan', 'gluten_free', 'dairy_free'],
  ARRAY['gochugaru'],
  '{"en": "Red pepper flakes (crushed red pepper). Adds heat to pizza, pasta, and stir-fries.", "ko": "칠리 플레이크. 피자, 파스타, 볶음에 매운맛을 더함."}',
  ARRAY['western'],
  'recommended'
)
ON CONFLICT DO NOTHING;
