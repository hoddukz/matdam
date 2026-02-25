-- Tag: core
-- Path: supabase/migrations/013_recipe_seeds.sql

-- ============================================================
-- Migration 013: Recipe Seed Data — 9 Korean Recipes
-- ============================================================
-- Idempotent: recipes use ON CONFLICT DO NOTHING (slug is unique)
-- Steps and ingredients are inserted only when the recipe was
-- newly created (recipe UUID check via variable assignment).
-- ============================================================

DO $$
DECLARE
  v_author UUID;
  r1 UUID;
  r2 UUID;
  r3 UUID;
  r4 UUID;
  r5 UUID;
  r6 UUID;
  r7 UUID;
  r8 UUID;
  r9 UUID;
  existing_id UUID;
BEGIN

  -- ── Author 선택 ───────────────────────────────────────────
  SELECT user_id INTO v_author FROM public.users LIMIT 1;

  IF v_author IS NULL THEN
    RAISE EXCEPTION 'No user found. Insert a user first.';
  END IF;

  -- ── UUID 생성 ─────────────────────────────────────────────
  r1 := gen_random_uuid();
  r2 := gen_random_uuid();
  r3 := gen_random_uuid();
  r4 := gen_random_uuid();
  r5 := gen_random_uuid();
  r6 := gen_random_uuid();
  r7 := gen_random_uuid();
  r8 := gen_random_uuid();
  r9 := gen_random_uuid();


  -- ============================================================
  -- Recipe 1: 빨간오댕 (Spicy Red Fish Cake Stew)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'bbalgan-odeng';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r1,
      'bbalgan-odeng',
      '{"ko": "빨간오댕", "en": "Spicy Red Fish Cake Stew"}',
      v_author,
      '{"ko": "진한 고추 양념 국물에 어묵을 끼워 끓인 매콤한 오댕 찌개", "en": "Fish cakes simmered in a rich, spicy gochujang broth"}',
      'beginner',
      10,
      15,
      2,
      true
    );
    r1 := r1;
  ELSE
    r1 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r1, 1, '양파를 썰고, 마늘을 다지고, 청양고추를 썰고, 어묵을 삼각형으로 접어줍니다.', NULL, NULL),
    (r1, 2, '냄비에 대파, 양파, 다진마늘을 깔고 물 500ml를 넣어줍니다.', NULL, NULL),
    (r1, 3, '다시다 반 스푼, 고추가루 2스푼, 간장 3스푼, 설탕 2스푼, 고추장 1스푼을 넣고 잘 섞어 끓여줍니다.', NULL, NULL),
    (r1, 4, '물이 끓으면 떡(옵션)과 계란(옵션)을 넣어줍니다. 어묵은 담그지 말고 옆에 끼워서 국물을 끼얹어주면 됩니다.',
      NULL, '어묵을 국물에 완전히 담그면 식감이 물러질 수 있으니 옆에 끼워서 국물만 끼얹어 주세요.');

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r1, NULL,         '사각어묵',   6,    'sheet',  NULL,       'Square fish cake', 1, 1),
    (r1, 'onion',      NULL,         1,    'piece',  NULL,       NULL,               2, 2),
    (r1, 'korean_chili_pepper', NULL, 2,   'piece',  NULL,       NULL,               1, 3),
    (r1, 'rice_cake',  NULL,         NULL, NULL,     NULL,       '옵션',             4, 4),
    (r1, 'garlic',     NULL,         1,    'tbsp',   '다진',     '다진마늘',         2, 5),
    (r1, NULL,         '대파',       NULL, NULL,     NULL,       NULL,               2, 6),
    (r1, 'egg',        NULL,         NULL, NULL,     NULL,       '옵션',             4, 7),
    (r1, 'dashi_powder', NULL,       0.5,  'tbsp',   NULL,       NULL,               3, 8),
    (r1, 'sugar',      NULL,         2,    'tbsp',   NULL,       NULL,               3, 9),
    (r1, 'gochugaru',  NULL,         2,    'tbsp',   NULL,       NULL,               3, 10),
    (r1, 'ganjang',    NULL,         3,    'tbsp',   NULL,       NULL,               3, 11),
    (r1, 'gochujang',  NULL,         1,    'tbsp',   NULL,       NULL,               3, 12);
  END IF;


  -- ============================================================
  -- Recipe 2: 신라면 알리오올리오 (Shin Ramyun Aglio e Olio)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'shin-ramyun-aglio-olio';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r2,
      'shin-ramyun-aglio-olio',
      '{"ko": "신라면 알리오올리오", "en": "Shin Ramyun Aglio e Olio"}',
      v_author,
      '{"ko": "신라면 사리와 올리브유, 마늘로 만드는 간단한 알리오올리오 스타일 라면", "en": "A quick aglio e olio-style dish made with Shin Ramyun noodles, olive oil, and garlic"}',
      'beginner',
      5,
      7,
      1,
      true
    );
    r2 := r2;
  ELSE
    r2 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r2, 1, '그릇에 다진 마늘, 슬라이스 마늘, 청양고추, 올리브유를 넣고 전자레인지 2분 돌려줍니다.', 120, NULL),
    (r2, 2, '라면 사리 한 개에 뜨거운 물 180ml를 넣고 전자레인지 3분 돌립니다.', 180, NULL),
    (r2, 3, '라면 사리를 뒤집고 2분 더 돌린 뒤 스프와 후추를 뿌려주면 완성입니다.', 120, NULL);

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r2, 'ramyeon_noodle',        NULL, 1,    'piece', NULL,     '신라면',   2, 1),
    (r2, 'olive_oil',             NULL, 2,    'tbsp',  NULL,     NULL,       1, 2),
    (r2, 'korean_chili_pepper',   NULL, 2,    'piece', NULL,     NULL,       1, 3),
    (r2, 'garlic',                NULL, 3,    'clove', '슬라이스', NULL,     1, 4),
    (r2, 'garlic',                NULL, 1,    'tbsp',  '다진',   '다진마늘', 1, 5),
    (r2, 'black_pepper',          NULL, NULL, NULL,    NULL,     '약간',     3, 6);
  END IF;


  -- ============================================================
  -- Recipe 3: 평생 떡볶이 (Lifetime Tteokbokki)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'pyeongsaeng-tteokbokki';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r3,
      'pyeongsaeng-tteokbokki',
      '{"ko": "평생 떡볶이", "en": "Lifetime Tteokbokki"}',
      v_author,
      '{"ko": "한번 맛보면 평생 이 레시피만 쓰게 되는 떡볶이", "en": "The only tteokbokki recipe you will ever need — rich fish cake broth meets the ultimate sauce"}',
      'beginner',
      10,
      15,
      2,
      true
    );
    r3 := r3;
  ELSE
    r3 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r3, 1, '달군 팬에 대파를 깝니다. (강불)', NULL, NULL),
    (r3, 2, '파 위에 어묵을 올립니다.', NULL, NULL),
    (r3, 3, '물 550~600ml를 넣어줍니다.', NULL, NULL),
    (r3, 4, '설탕 1T, 소금 1/3T, 다진 마늘 1/2T을 넣습니다.', NULL, NULL),
    (r3, 5, '뚜껑을 덮고 끓입니다.', NULL, NULL),
    (r3, 6, '어묵 육수가 끓으면 중불로 낮춥니다.', NULL, NULL),
    (r3, 7, '밀떡을 넣은 뒤 뚜껑을 닫고 1~2분 끓입니다.', 90, NULL),
    (r3, 8, '평생 양념장을 넣습니다.', NULL, '양념장은 한 숟갈 남겨두었다가 마지막에 맛을 보고 추가하세요.'),
    (r3, 9, '뚜껑을 열고 약불에서 4분간 끓입니다.', 240, NULL);

    -- Ingredients
    -- 주재료
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r3, 'rice_cake',  NULL,       NULL, NULL,   NULL,  NULL, 7, 1),
    (r3, NULL,         '어묵',     NULL, NULL,   NULL,  NULL, 2, 2),
    (r3, NULL,         '대파',     NULL, NULL,   NULL,  NULL, 1, 3),
    -- 육수 양념 (step 4)
    (r3, 'sugar',      NULL,       1,    'tbsp', NULL,  NULL, 4, 4),
    (r3, 'salt',       NULL,       0.33, 'tbsp', NULL,  NULL, 4, 5),
    (r3, 'garlic',     NULL,       0.5,  'tbsp', '다진', '다진마늘', 4, 6),
    -- 양념장 (step 8)
    (r3, 'gochugaru',  NULL,       4,    'tbsp', NULL,  '양념장', 8, 7),
    (r3, 'sugar',      NULL,       3,    'tbsp', NULL,  '양념장', 8, 8),
    (r3, 'gochujang',  NULL,       2,    'tbsp', NULL,  '양념장', 8, 9),
    (r3, 'ganjang',    NULL,       2,    'tbsp', NULL,  '양념장', 8, 10),
    (r3, NULL,         '굴소스',   2,    'tbsp', NULL,  '양념장', 8, 11),
    (r3, 'vegetable_oil', NULL,    1,    'tbsp', NULL,  '양념장', 8, 12),
    (r3, 'black_pepper', NULL,     1,    'tbsp', NULL,  '양념장', 8, 13);
  END IF;


  -- ============================================================
  -- Recipe 4: 제육 (Spicy Stir-fried Pork)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'jeyuk';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r4,
      'jeyuk',
      '{"ko": "제육", "en": "Spicy Stir-fried Pork"}',
      v_author,
      '{"ko": "간장과 설탕으로 숙성 후 매콤한 양념에 볶아내는 제육볶음", "en": "Pork marinated in soy sauce and sugar, then stir-fried in a spicy gochujang sauce"}',
      'beginner',
      35,
      15,
      3,
      true
    );
    r4 := r4;
  ELSE
    r4 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r4, 1, '고기에 설탕 2스푼, 간장 2스푼을 넣고 잘 버무린 뒤 30분 정도 숙성시킵니다.', 1800, NULL),
    (r4, 2, '고기가 숙성되는 동안 소스를 만들고 야채를 썰어줍니다. 소스: 고추장 2, 고추가루 2, 물엿 2, 맛술 3, 굴소스 1, 다진마늘 1스푼을 섞어줍니다.', NULL, NULL),
    (r4, 3, '팬을 달구고 기름을 두른 뒤 고기를 익힙니다.', NULL, NULL),
    (r4, 4, '고기가 익기 시작하면 소스를 넣고 같이 익힙니다.', NULL, NULL),
    (r4, 5, '고기가 거의 다 익어가면 야채를 넣고 마무리합니다.', NULL, NULL);

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r4, NULL,         '돼지고기',  600,  'g',    NULL,   NULL,       1, 1),
    (r4, 'sugar',      NULL,        2,    'tbsp', NULL,   '마리네이드', 1, 2),
    (r4, 'ganjang',    NULL,        2,    'tbsp', NULL,   '마리네이드', 1, 3),
    (r4, NULL,         '대파',      NULL, NULL,   NULL,   NULL,       5, 4),
    (r4, 'onion',      NULL,        1,    'piece', NULL,  NULL,       5, 5),
    (r4, 'korean_chili_pepper', NULL, 2,  'piece', NULL,  NULL,       5, 6),
    (r4, 'gochujang',  NULL,        2,    'tbsp', NULL,   '소스',     2, 7),
    (r4, 'gochugaru',  NULL,        2,    'tbsp', NULL,   '소스',     2, 8),
    (r4, 'corn_syrup', NULL,        2,    'tbsp', NULL,   '물엿',     2, 9),
    (r4, 'mirin',      NULL,        3,    'tbsp', NULL,   '맛술',     2, 10),
    (r4, NULL,         '굴소스',    1,    'tbsp', NULL,   '소스',     2, 11),
    (r4, 'garlic',     NULL,        1,    'tbsp', '다진', '다진마늘', 2, 12);
  END IF;


  -- ============================================================
  -- Recipe 5: 오므라이스 (Omurice)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'omurice';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r5,
      'omurice',
      '{"ko": "오므라이스", "en": "Omurice"}',
      v_author,
      '{"ko": "부드러운 계란으로 감싼 케첩 볶음밥에 특제 소스를 곁들인 오므라이스", "en": "Ketchup fried rice wrapped in a soft omelette, topped with a rich homemade sauce"}',
      'intermediate',
      15,
      25,
      2,
      true
    );
    r5 := r5;
  ELSE
    r5 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r5, 1, '[소스] 버터를 아주 약한 불에 녹입니다.', NULL, NULL),
    (r5, 2, '[소스] 버터가 모두 녹으면 밀가루 1스푼을 넣고 갈색이 될 때까지 약불에서 볶습니다.', NULL, NULL),
    (r5, 3, '[소스] 물 200ml를 넣어 잘 풀어준 뒤 케첩 2스푼, 돈까스소스 1스푼, 설탕 1스푼을 넣고 잘 풀어줍니다. 마지막에 식초를 넣고 마무리합니다.', NULL, NULL),
    (r5, 4, '[볶음밥] 달군 팬에 기름을 두르고 대파로 파기름을 내줍니다.', NULL, NULL),
    (r5, 5, '[볶음밥] 양파와 다진 스팸/베이컨을 넣고 노릇해질 때까지 볶습니다.', NULL, NULL),
    (r5, 6, '[볶음밥] 케첩 1~2스푼, 돈까스소스 1~2스푼을 넣고 볶은 뒤 찬밥을 넣어 잘 풀어줍니다. 소금으로 마무리 간합니다.', NULL, NULL),
    (r5, 7, '[계란] 계란 3개를 풀어 소금, 후추를 약간 넣습니다. 시간 여유가 있으면 체에 한번 걸러줍니다.', NULL, NULL),
    (r5, 8, '[계란] 기름 두른 작은 팬을 중간불에 달군 뒤 계란을 넣어줍니다. 계란 중간에 기포가 크게 올라오면 젓가락을 크게 벌려 양쪽 끝에서 가운데로 모아 회오리 모양을 만들어줍니다.',
      NULL, '계란을 넣었을 때 ''치익'' 하는 소리가 나야 팬 온도가 적절합니다. 70~80% 익으면 밥 위에 올립니다.'),
    (r5, 9, '[조립] 볶음밥을 그릇에 눌러 담아 모양을 낸 뒤 접시에 뒤집어 올립니다. 계란을 밥 위에 올리고 데운 소스를 뿌려줍니다.', NULL, NULL);

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r5, 'short_grain_rice', NULL,  2,    'cup',  NULL,  '밥',             4, 1),
    (r5, NULL,         '대파',      NULL, NULL,   NULL,  NULL,             4, 2),
    (r5, 'onion',      NULL,        1,    'piece', NULL, NULL,             5, 3),
    (r5, 'bacon',      NULL,        100,  'g',    NULL,  '스팸 또는 베이컨', 5, 4),
    (r5, 'egg',        NULL,        6,    'piece', NULL, '인당 3개',       7, 5),
    (r5, NULL,         '파슬리',    NULL, NULL,   NULL,  '데코용',         9, 6),
    (r5, 'butter',     NULL,        1.5,  'tbsp', NULL,  '소스',           1, 7),
    (r5, 'all_purpose_flour', NULL, 1,    'tbsp', NULL,  '소스',           2, 8),
    (r5, 'ketchup',    NULL,        4,    'tbsp', NULL,  '소스 2 + 볶음밥 2', 3, 9),
    (r5, NULL,         '돈까스소스', 2,   'tbsp', NULL,  '없으면 간장',    3, 10),
    (r5, 'sugar',      NULL,        1,    'tbsp', NULL,  '소스',           3, 11),
    (r5, 'rice_vinegar', NULL,      0.33, 'tbsp', NULL,  '소스',           3, 12),
    (r5, 'vegetable_oil', NULL,     2,    'tbsp', NULL,  NULL,             4, 13),
    (r5, 'salt',       NULL,        NULL, NULL,   NULL,  '약간',           6, 14),
    (r5, 'black_pepper', NULL,      NULL, NULL,   NULL,  '약간',           7, 15);
  END IF;


  -- ============================================================
  -- Recipe 6: 동파육 (Dongpo Pork)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'dongpo-yuk';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r6,
      'dongpo-yuk',
      '{"ko": "동파육", "en": "Dongpo Pork"}',
      v_author,
      '{"ko": "간장과 미림에 오래 졸여 부드럽고 깊은 맛의 삼겹살 요리", "en": "Pork belly slow-braised in soy sauce and mirin until meltingly tender with deep, complex flavor"}',
      'master',
      15,
      130,
      4,
      true
    );
    r6 := r6;
  ELSE
    r6 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r6, 1, '삼겹살을 적당한 크기로 썰어서 프라이팬에 지방 부분부터 구워줍니다. 팬이 달궈지기 전에 올려줍니다.', NULL, NULL),
    (r6, 2, '여섯 면이 다 구워지면 고기를 빼주고, 양파, 생강, 마늘, 대파를 넣어 색이 날 정도로 구워줍니다.', NULL, NULL),
    (r6, 3, '미림 200ml를 넣어 알코올을 날려주고, 간장 200ml를 넣어 살짝 졸여줍니다. 설탕 100g과 꿀 50g을 넣어줍니다.', NULL, NULL),
    (r6, 4, '삼겹살을 깊은 냄비에 먼저 깔고 소스를 부은 뒤, 계피, 팔각, 고추를 넣고 물을 고기가 잠길 정도로 넣어줍니다.', NULL, NULL),
    (r6, 5, '두 시간 정도 중불로 끓여줍니다.', 7200, NULL),
    (r6, 6, '고기를 빼고 소스를 졸인 뒤 체에 걸러줍니다.', NULL, NULL),
    (r6, 7, '청경채는 소금간을 한 뒤 1분 정도 데칩니다.', 60, NULL);

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r6, 'pork_belly',  NULL,       1,    'kg',    NULL, NULL,         1, 1),
    (r6, 'garlic',      NULL,       7,    'clove', NULL, NULL,         2, 2),
    (r6, NULL,          '대파',     1,    'stalk', NULL, NULL,         2, 3),
    (r6, 'onion',       NULL,       1,    'piece', NULL, NULL,         2, 4),
    (r6, 'ginger',      NULL,       1,    'piece', NULL, '큰 것',      2, 5),
    (r6, NULL,          '홍고추',   1,    'piece', NULL, NULL,         4, 6),
    (r6, NULL,          '청경채',   NULL, NULL,    NULL, NULL,         7, 7),
    (r6, 'mirin',       NULL,       200,  'ml',    NULL, NULL,         3, 8),
    (r6, 'ganjang',     NULL,       200,  'ml',    NULL, NULL,         3, 9),
    (r6, 'sugar',       NULL,       100,  'g',     NULL, NULL,         3, 10),
    (r6, 'honey',       NULL,       50,   'g',     NULL, NULL,         3, 11),
    (r6, 'cinnamon',    NULL,       NULL, NULL,    NULL, '약간',       4, 12),
    (r6, NULL,          '팔각',     NULL, NULL,    NULL, 'star anise', 4, 13);
  END IF;


  -- ============================================================
  -- Recipe 7: 돼지 불백 (Pork Bulgogi)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'dwaeji-bulbaek';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r7,
      'dwaeji-bulbaek',
      '{"ko": "돼지 불백", "en": "Pork Bulgogi"}',
      v_author,
      '{"ko": "배 양념에 숙성한 돼지 앞다리살을 강불에 구운 불백", "en": "Pork shoulder marinated in a pear-based sauce and seared over high heat"}',
      'intermediate',
      40,
      10,
      3,
      true
    );
    r7 := r7;
  ELSE
    r7 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r7, 1, '고기는 한입 크기로 자르고 서로 붙어있지 않게 잘 펴줍니다.', NULL, NULL),
    (r7, 2, '갈아만든 배 250ml에 설탕 3스푼, 식초 2스푼, 다진마늘 2스푼, 간장 6스푼, 파를 순서대로 넣고 잘 섞어줍니다.', NULL, NULL),
    (r7, 3, '고기를 넣고 잘 버무린 뒤, 참기름을 넣고 섞은 후 30분 이상 숙성시킵니다.', 1800, NULL),
    (r7, 4, '팬에 기름을 한 바퀴만 두르고 뜨겁게 달군 뒤, 양념을 최대한 뺀 고기를 팬에 올립니다.', NULL, NULL),
    (r7, 5, '남은 양념에서 파와 마늘을 건져 고기 위에 올린 뒤, 고기를 최대한 얇게 펴줍니다. 5분간 강불에서 건드리지 않고 냅둡니다.', 300, NULL),
    (r7, 6, '팬에 어둡게 변한 부분을 고기로 닦듯이 비벼주고, 남은 양념의 절반 정도를 넣어줍니다.',
      NULL, '양념을 다 넣으면 짤 수 있으니 절반만 넣고 맛을 보세요.');

    -- Ingredients
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r7, NULL,         '돼지고기 앞다리살', 600, 'g', NULL, '3~4mm 두께', 1, 1),
    (r7, NULL,         '대파',      NULL, NULL,   NULL,  NULL,       2, 2),
    (r7, 'garlic',     NULL,        2,    'tbsp', '다진', '다진마늘', 2, 3),
    (r7, NULL,         '갈아만든 배', 250, 'ml',  NULL,  NULL,       2, 4),
    (r7, 'sugar',      NULL,        3,    'tbsp', NULL,  NULL,       2, 5),
    (r7, 'rice_vinegar', NULL,      2,    'tbsp', NULL,  NULL,       2, 6),
    (r7, 'ganjang',    NULL,        6,    'tbsp', NULL,  '진간장',   2, 7),
    (r7, 'sesame_oil', NULL,        1,    'tbsp', NULL,  NULL,       3, 8);
  END IF;


  -- ============================================================
  -- Recipe 8: 제육볶음 (Spicy Pork Stir-fry)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'jeyuk-bokkeum';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r8,
      'jeyuk-bokkeum',
      '{"ko": "제육볶음", "en": "Spicy Pork Stir-fry"}',
      v_author,
      '{"ko": "감자전분으로 소스를 잡아 윤기 나는 제육볶음", "en": "Glossy spicy stir-fried pork with sauce thickened by potato starch"}',
      'intermediate',
      10,
      20,
      3,
      true
    );
    r8 := r8;
  ELSE
    r8 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r8, 1, '기름을 두르고 강불에 팬을 충분히 달궈줍니다.', NULL, NULL),
    (r8, 2, '달궈진 팬에 고기를 넣어 볶아줍니다. 소금, 후추, 미림을 넣어 일차적으로 간을 합니다.', NULL, NULL),
    (r8, 3, '고기가 어느 정도 익으면 간장을 팬 가장자리에 뿌려 태우듯이 같이 볶아주고, 설탕도 넣어줍니다.',
      NULL, '간장을 직접 고기에 넣지 말고 팬 가장자리에 뿌려서 태우면 감칠맛이 올라갑니다.'),
    (r8, 4, '불을 중간으로 낮추고 야채를 넣어 볶아줍니다. 물이 적당히 나오도록 합니다.', NULL, NULL),
    (r8, 5, '야채가 어느 정도 볶아지면 고추장을 풀어줍니다.', NULL, NULL),
    (r8, 6, '고춧가루를 뿌려서 매운맛을 추가합니다.', NULL, NULL),
    (r8, 7, '감자전분을 찬물에 푼 뒤 넣어서 물기를 잡아줍니다.', NULL, NULL);

    -- Ingredients (gram-precise measurements)
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r8, NULL,          '돼지고기',  600,  'g',    NULL, NULL, 2, 1),
    (r8, 'gochugaru',   NULL,        11,   'g',    NULL, NULL, 6, 2),
    (r8, 'black_pepper', NULL,       0.5,  'g',    NULL, NULL, 2, 3),
    (r8, 'sugar',       NULL,        13,   'g',    NULL, NULL, 3, 4),
    (r8, 'ganjang',     NULL,        5,    'g',    NULL, NULL, 3, 5),
    (r8, 'gochujang',   NULL,        64,   'g',    NULL, NULL, 5, 6),
    (r8, 'sesame_oil',  NULL,        9,    'g',    NULL, NULL, 7, 7),
    (r8, 'sesame_seeds', NULL,       3,    'g',    NULL, NULL, 7, 8),
    (r8, 'vegetable_oil', NULL,      17,   'g',    NULL, NULL, 1, 9),
    (r8, NULL,          '감자전분',  13,   'g',    NULL, NULL, 7, 10),
    (r8, 'salt',        NULL,        9,    'g',    NULL, NULL, 2, 11),
    (r8, 'mirin',       NULL,        1,    'tbsp', NULL, NULL, 2, 12);
  END IF;


  -- ============================================================
  -- Recipe 9: 열탄불고기 (Hot Charcoal Bulgogi)
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'yeoltan-bulgogi';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r9,
      'yeoltan-bulgogi',
      '{"ko": "열탄불고기", "en": "Hot Charcoal Bulgogi"}',
      v_author,
      '{"ko": "특제 양념에 24시간 이상 숙성 후 토치로 마무리하는 불고기", "en": "Beef bulgogi marinated in a special sauce for 24 hours or more, finished with a blowtorch for a charcoal-like sear"}',
      'intermediate',
      30,
      10,
      3,
      true
    );
    r9 := r9;
  ELSE
    r9 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    -- Steps
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r9, 1, '소스 재료를 모두 섞은 뒤 가루 재료들이 남지 않도록 잘 저어줍니다.', NULL, NULL),
    (r9, 2, '소스를 최소 24시간 이상 숙성시킵니다.', NULL, '숙성 시간이 길수록 맛이 깊어집니다.'),
    (r9, 3, '고기 1인분당 소스 2스푼씩 넣어 버무려줍니다.', NULL, NULL),
    (r9, 4, '고기를 구우면서 중간중간 토치로 지져줍니다.', NULL, '토치가 없으면 강불로 달군 팬에서 구워도 됩니다.');

    -- Ingredients (sauce)
    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r9, NULL,          '미원',         1,    'tbsp', NULL, NULL,                      1, 1),
    (r9, 'dashi_powder', NULL,          1.5,  'tbsp', NULL, '쇠고기 다시다',           1, 2),
    (r9, 'sugar',       NULL,           4,    'tbsp', NULL, NULL,                      1, 3),
    (r9, NULL,          '갈아만든 배',  1.5,  'tbsp', NULL, NULL,                      1, 4),
    (r9, 'ganjang',     NULL,           1,    'tbsp', NULL, NULL,                      1, 5),
    (r9, 'gochujang',   NULL,           2,    'tbsp', NULL, NULL,                      1, 6),
    (r9, 'garlic',      NULL,           1,    'tbsp', '다진', '다진마늘',              1, 7),
    (r9, 'black_pepper', NULL,          0.5,  'tsp',  NULL, NULL,                      1, 8),
    (r9, 'mirin',       NULL,           1,    'tbsp', NULL, NULL,                      1, 9),
    (r9, 'vegetable_oil', NULL,         0.5,  'tbsp', NULL, NULL,                      1, 10),
    (r9, 'gochugaru',   NULL,           1,    'tbsp', NULL, NULL,                      1, 11),
    (r9, 'corn_syrup',  NULL,           5,    'tbsp', NULL, '물엿',                    1, 12),
    (r9, NULL,          '화유',         0.25, 'tbsp', NULL, 'Sichuan peppercorn oil',  1, 13),
    (r9, NULL,          '소고기',       NULL, NULL,   NULL, NULL,                      3, 14);
  END IF;

END $$;
