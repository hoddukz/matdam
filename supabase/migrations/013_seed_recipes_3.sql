-- Tag: core
-- Path: supabase/migrations/013_seed_recipes_3.sql

-- ============================================================
-- MatDam — Recipe Seed Data Batch 3 (5 Recipes)
-- Recipes: r1~r5 (영상 기반 레시피)
--   r1: 참나물 들기름 막국수
--   r2: 대패삼겹살 찜
--   r3: 풍자 쌈장 & 양배추 두부 쌈밥
--   r4: 유린기
--   r5: 이찬원 파닭전
-- ============================================================

DO $$
DECLARE
  v_author UUID;
  r1 UUID;
  r2 UUID;
  r3 UUID;
  r4 UUID;
  r5 UUID;
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

  -- ── 신규 재료 INSERT ──────────────────────────────────────
  INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
  ('buckwheat_noodle',   '{"ko": "메밀면", "en": "Buckwheat Noodles"}',              'grain_starch', ARRAY['g','piece'],        'g',     false, ARRAY['vegan','dairy_free'],  ARRAY['soba_noodle'],               '{"ko": "메밀면 (막국수용)", "en": "Korean buckwheat noodles for makguksu"}',                    ARRAY['korean'],           'recommended'),
  ('chamnamul',          '{"ko": "참나물", "en": "Chamnamul"}',                       'vegetable',    ARRAY['g','cup'],          'g',     false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "참나물 (미나리과 산채)", "en": "Pimpinella brachycarpa, a wild mountain herb"}',        ARRAY['korean'],           'recommended'),
  ('gim_jaban',          '{"ko": "김자반", "en": "Seasoned Seaweed Flakes"}',         'other',        ARRAY['g','tbsp'],         'tbsp',  false, ARRAY['vegan','dairy_free'],  ARRAY['dried_laver'],               '{"ko": "볶은 김자반 (고명용)", "en": "Roasted seasoned seaweed flakes for topping"}',          ARRAY['korean'],           'recommended'),
  ('maesil_cheong',      '{"ko": "매실청", "en": "Plum Syrup"}',                      'sauce_paste',  ARRAY['tbsp','ml'],        'tbsp',  false, ARRAY['vegan','dairy_free'],  ARRAY['sugar','honey'],             '{"ko": "매실청 (매실액기스)", "en": "Korean green plum syrup, used as natural sweetener"}',    ARRAY['korean'],           'recommended'),
  ('pork_belly_thin',    '{"ko": "대패삼겹살", "en": "Thinly Sliced Pork Belly"}',    'protein',      ARRAY['g','kg'],           'g',     false, ARRAY['dairy_free'],          ARRAY['pork_belly'],                '{"ko": "대패삼겹살 (얇게 썬 삼겹살)", "en": "Paper-thin sliced pork belly for steaming"}',    ARRAY['korean'],           'recommended'),
  ('mung_bean_sprouts',  '{"ko": "숙주나물", "en": "Mung Bean Sprouts"}',             'vegetable',    ARRAY['g','cup'],          'g',     false, ARRAY['vegan','dairy_free'],  ARRAY['bean_sprouts'],              '{"ko": "숙주나물 (녹두나물)", "en": "Mung bean sprouts, thinner than soybean sprouts"}',      ARRAY['korean','chinese','thai'], 'recommended'),
  ('hondashi',           '{"ko": "혼다시", "en": "Hondashi"}',                        'sauce_paste',  ARRAY['tbsp','tsp'],       'tbsp',  false, ARRAY['dairy_free'],          ARRAY['dashi_powder'],              '{"ko": "혼다시 (가쓰오부시 다시 가루)", "en": "Hondashi bonito soup stock powder"}',           ARRAY['japanese','korean'],'recommended'),
  ('oyster_sauce',       '{"ko": "굴소스", "en": "Oyster Sauce"}',                    'sauce_paste',  ARRAY['tbsp','ml'],        'tbsp',  false, ARRAY['dairy_free'],          ARRAY['ganjang'],                 '{"ko": "굴소스", "en": "Oyster sauce for seasoning and marinating"}',                         ARRAY['korean','chinese'], 'recommended'),
  ('yellow_mustard',     '{"ko": "연겨자", "en": "Yellow Mustard"}',                  'sauce_paste',  ARRAY['tsp','tbsp'],       'tsp',   false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "연겨자 (머스타드)", "en": "Mild yellow mustard paste"}',                               ARRAY['korean','western'], 'recommended')
  ON CONFLICT (id) DO NOTHING;


  -- ============================================================
  -- Recipe r1: 참나물 들기름 막국수
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'chamnamul-deulgireum-makguksu';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r1,
      'chamnamul-deulgireum-makguksu',
      '{"ko": "참나물 들기름 막국수", "en": "Perilla Oil Buckwheat Noodles with Chamnamul"}',
      v_author,
      '{"ko": "들기름과 간장으로 버무린 메밀면에 새콤달콤 참나물 무침을 곁들인 여름 별미", "en": "Buckwheat noodles tossed in perilla oil and soy sauce, served with seasoned chamnamul herb salad"}',
      'beginner',
      10,
      10,
      1,
      true
    );
  ELSE
    r1 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r1, 1, '{"ko": "끓는 물에 메밀면 150g을 넣고 삶은 뒤, 찬물(또는 얼음물)에 치대며 헹궈 물기를 꽉 짠다"}',                            NULL, NULL),
    (r1, 2, '{"ko": "볼에 면을 담고 진간장 3, 들기름 3, 설탕 1, 매실청 1을 넣어 골고루 버무린 후 접시에 담는다"}',                          NULL, NULL),
    (r1, 3, '{"ko": "면 위에 김자반을 듬뿍 올리고, 참깨 2스푼을 절구에 곱게 갈아 넉넉히 뿌린다"}',                                          NULL, NULL),
    (r1, 4, '{"ko": "참나물 100g을 먹기 좋은 크기로 썰어 볼에 담고, 진간장 1, 고춧가루 0.5, 설탕 0.5, 식초 0.5를 넣어 가볍게 버무린다"}',   NULL, NULL),
    (r1, 5, '{"ko": "양념한 참나물을 접시 한쪽에 곁들이면 완성"}',                                                                            NULL, '{"ko": "5인분 준비 시 위 계량에 5를 곱한다 (면 750~800g). 고기 요리와 함께 먹으면 참나물이 느끼함을 잘 잡아준다."}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r1, 'buckwheat_noodle', NULL,             150,  'g',    NULL, NULL,                          1, 1),
    (r1, 'chamnamul',        NULL,             100,  'g',    NULL, NULL,                          4, 2),
    (r1, 'gim_jaban',        NULL,            NULL,  NULL,   NULL, '{"ko": "듬뿍"}',             3, 3),
    (r1, 'sesame_seeds',     NULL,               2,  'tbsp', NULL, '{"ko": "갈아서 사용"}',      3, 4),
    (r1, 'ganjang',        NULL,               3,  'tbsp', NULL, '{"ko": "면 양념용"}',        2, 5),
    (r1, 'perilla_oil',      NULL,               3,  'tbsp', NULL, NULL,                          2, 6),
    (r1, 'sugar',            NULL,               1,  'tbsp', NULL, '{"ko": "면 양념용"}',        2, 7),
    (r1, 'maesil_cheong',    NULL,               1,  'tbsp', NULL, NULL,                          2, 8),
    (r1, 'ganjang',        NULL,               1,  'tbsp', NULL, '{"ko": "참나물 무침용"}',    4, 9),
    (r1, 'gochugaru',        NULL,             0.5,  'tbsp', NULL, NULL,                          4, 10),
    (r1, 'sugar',            NULL,             0.5,  'tbsp', NULL, '{"ko": "참나물 무침용"}',    4, 11),
    (r1, 'rice_vinegar',     NULL,             0.5,  'tbsp', NULL, NULL,                          4, 12);
  END IF;


  -- ============================================================
  -- Recipe r2: 대패삼겹살 찜
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'daepae-samgyeopsal-jjim';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r2,
      'daepae-samgyeopsal-jjim',
      '{"ko": "대패삼겹살 찜", "en": "Steamed Thinly Sliced Pork Belly"}',
      v_author,
      '{"ko": "숙주나물과 채소 위에 혼다시로 밑간한 대패삼겹살을 올려 찌는 간단 보양식", "en": "Thinly sliced pork belly steamed over mung bean sprouts and vegetables, seasoned with hondashi"}',
      'beginner',
      10,
      15,
      2,
      true
    );
  ELSE
    r2 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r2, 1, '{"ko": "깊은 팬이나 냄비 바닥에 숙주나물을 넉넉하게 깔고, 그 위에 양파채와 팽이버섯을 골고루 올린다"}',                        NULL, NULL),
    (r2, 2, '{"ko": "볼에 대패삼겹살을 담고 혼다시 1큰술과 후추를 넣어 가볍게 버무려 밑간한다"}',                                              NULL, NULL),
    (r2, 3, '{"ko": "채소 위에 밑간한 고기를 펴서 올리고 쪽파를 뿌린다. 물 100ml를 팬 가장자리에 두른 뒤 뚜껑을 덮는다"}',                    NULL, NULL),
    (r2, 4, '{"ko": "중불에서 10분 이상 충분히 찐다. 고기가 다 익고 채소 숨이 죽으면 완성"}',                                                  600,  '{"ko": "5인분은 큰 냄비 두 개에 나눠서 준비하면 편하다. 풍자 쌈장과 함께 찍어 먹으면 금상첨화."}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r2, 'pork_belly_thin',  NULL,            NULL,  NULL,   NULL, '{"ko": "원하는 만큼"}',       2, 1),
    (r2, 'mung_bean_sprouts',NULL,            NULL,  NULL,   NULL, '{"ko": "넉넉히"}',            1, 2),
    (r2, 'onion',            NULL,            NULL,  NULL,   NULL, '{"ko": "채 썰기, 적당량"}',   1, 3),
    (r2, 'enoki',            NULL,            NULL,  NULL,   NULL, '{"ko": "적당량"}',            1, 4),
    (r2, 'chives',           NULL,            NULL,  NULL,   NULL, '{"ko": "고명용"}',            3, 5),
    (r2, 'hondashi',         NULL,               1,  'tbsp', NULL, NULL,                           2, 6),
    (r2, 'black_pepper',     NULL,            NULL,  NULL,   NULL, '{"ko": "약간"}',              2, 7),
    (r2, NULL,               '{"ko": "물"}',  100,  'ml',   NULL, NULL,                           3, 8),
    (r2, 'ganjang',        NULL,               2,  'tbsp', NULL, '{"ko": "찍어 먹는 소스"}',    NULL, 9),
    (r2, 'rice_vinegar',     NULL,               1,  'tbsp', NULL, '{"ko": "찍어 먹는 소스"}',    NULL, 10),
    (r2, 'sugar',            NULL,               1,  'tbsp', NULL, '{"ko": "찍어 먹는 소스"}',    NULL, 11),
    (r2, 'yellow_mustard',   NULL,            NULL,  NULL,   NULL, '{"ko": "취향껏, 찍어 먹는 소스"}', NULL, 12);
  END IF;


  -- ============================================================
  -- Recipe r3: 풍자 쌈장 & 양배추 두부 쌈밥
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'pungja-ssamjang-yangbaechu-dubu-ssambap';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r3,
      'pungja-ssamjang-yangbaechu-dubu-ssambap',
      '{"ko": "풍자 쌈장 & 양배추 두부 쌈밥", "en": "Tuna Ssamjang with Cabbage Tofu Wraps"}',
      v_author,
      '{"ko": "참치와 쌈장으로 만든 풍자 쌈장을 양배추 두부 쌈에 올려 먹는 건강 별미", "en": "Steamed cabbage wraps with crumbled tofu, topped with savory tuna ssamjang"}',
      'beginner',
      10,
      10,
      2,
      true
    );
  ELSE
    r3 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r3, 1, '{"ko": "양배추는 심지를 제거하고 씻은 뒤, 랩을 씌워 전자레인지에서 5분간 돌려 부드럽게 익힌다"}',                               300, NULL),
    (r3, 2, '{"ko": "두부 1/3모를 팬에 넣고 으깨면서 수분이 날아갈 때까지 포슬포슬하게 볶는다"}',                                               NULL, NULL),
    (r3, 3, '{"ko": "팬에 참치 기름을 두르고 다진 마늘 1, 다진 양파 1을 넣어 볶는다"}',                                                         NULL, NULL),
    (r3, 4, '{"ko": "양파가 익으면 참치 1캔, 쌈장 2, 참치액 1, 다진 고추 1을 넣고 섞는다"}',                                                    NULL, NULL),
    (r3, 5, '{"ko": "색감을 위해 고춧가루 1을 추가하고(선택), 불을 끈 뒤 참기름과 깨를 넣어 마무리한다"}',                                       NULL, NULL),
    (r3, 6, '{"ko": "익힌 양배추를 겹쳐 깔고 볶은 두부를 올린 뒤 돌돌 말아 먹기 좋은 크기로 썬다"}',                                             NULL, NULL),
    (r3, 7, '{"ko": "접시에 담고 참치 쌈장을 듬뿍 올리면 완성"}',                                                                                 NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r3, NULL,             '{"ko": "양배추"}',   6,  'piece', NULL, '{"ko": "잎 6장"}',           1, 1),
    (r3, 'tofu',           NULL,              NULL,  NULL,    NULL, '{"ko": "1/3모"}',             2, 2),
    (r3, 'canned_tuna',    NULL,                 1,  'piece', NULL, NULL,                           4, 3),
    (r3, 'garlic',         NULL,                 1,  'tbsp',  NULL, '{"ko": "다져서"}',            3, 4),
    (r3, 'onion',          NULL,                 1,  'tbsp',  NULL, '{"ko": "다져서"}',            3, 5),
    (r3, NULL,             '{"ko": "고추"}',     1,  'tbsp',  NULL, '{"ko": "다져서"}',            4, 6),
    (r3, 'ssamjang',       NULL,                 2,  'tbsp',  NULL, NULL,                           4, 7),
    (r3, 'fish_sauce',     NULL,                 1,  'tbsp',  NULL, '{"ko": "참치액"}',            4, 8),
    (r3, 'gochugaru',      NULL,                 1,  'tbsp',  NULL, '{"ko": "선택"}',              5, 9),
    (r3, 'sesame_oil',     NULL,                 1,  'tbsp',  NULL, NULL,                           5, 10),
    (r3, 'sesame_seeds',   NULL,              NULL,  NULL,    NULL, '{"ko": "약간"}',              5, 11);
  END IF;


  -- ============================================================
  -- Recipe r4: 유린기
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'yuringi';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r4,
      'yuringi',
      '{"ko": "유린기", "en": "Yuringi (Chinese-style Crispy Chicken)"}',
      v_author,
      '{"ko": "바삭하게 구운 닭다리살에 새콤달콤한 특제 소스를 뿌려 먹는 중화풍 치킨", "en": "Crispy pan-fried chicken thighs drizzled with tangy sweet soy-vinegar sauce over shredded lettuce"}',
      'intermediate',
      15,
      20,
      2,
      true
    );
  ELSE
    r4 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r4, 1, '{"ko": "닭다리살을 앞뒤로 두드려 칼집을 내어 부드럽게 만든다"}',                                                                   NULL, NULL),
    (r4, 2, '{"ko": "소금, 후추, 굴소스를 넣어 조물조물 밑간한다"}',                                                                             NULL, NULL),
    (r4, 3, '{"ko": "밑간한 고기에 계란 노른자와 전분 가루를 넣고 잘 버무린다"}',                                                                NULL, NULL),
    (r4, 4, '{"ko": "팬에 기름을 3스푼 정도 두르고 닭다리살을 올린 뒤, 뚜껑을 덮어 속까지 촉촉하게 익힌다. 중간에 한 번씩 뒤집어 겉면을 바삭하게 굽는다"}', NULL, NULL),
    (r4, 5, '{"ko": "잘 익은 닭튀김을 꺼내 한입 크기로 썬다"}',                                                                                   NULL, NULL),
    (r4, 6, '{"ko": "접시에 채 썬 양상추를 넉넉히 깔고 그 위에 닭튀김을 올린다"}',                                                               NULL, NULL),
    (r4, 7, '{"ko": "특제 소스 재료를 모두 섞어 골고루 뿌리면 완성"}',                                                                            NULL, '{"ko": "소스에 다진 파와 고추를 듬뿍 넣어야 식감이 살아난다"}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r4, 'chicken_thigh',  NULL,             NULL,  NULL,    NULL, '{"ko": "5~6덩이"}',          1, 1),
    (r4, 'lettuce',        NULL,             NULL,  NULL,    NULL, '{"ko": "넉넉히, 채 썰기"}',  6, 2),
    (r4, 'salt',           NULL,             NULL,  NULL,    NULL, '{"ko": "약간"}',              2, 3),
    (r4, 'black_pepper',   NULL,             NULL,  NULL,    NULL, '{"ko": "약간"}',              2, 4),
    (r4, 'oyster_sauce',   NULL,             NULL,  NULL,    NULL, '{"ko": "약간"}',              2, 5),
    (r4, 'egg',            NULL,                1,  'piece', NULL, '{"ko": "노른자만 사용"}',     3, 6),
    (r4, 'cornstarch',     NULL,             NULL,  NULL,    NULL, '{"ko": "적당량"}',            3, 7),
    (r4, 'ganjang',      NULL,             NULL,  NULL,    NULL, '{"ko": "소스용, 적당량"}',    7, 8),
    (r4, 'rice_vinegar',   NULL,             NULL,  NULL,    NULL, '{"ko": "소스용, 적당량"}',    7, 9),
    (r4, 'sugar',          NULL,             NULL,  NULL,    NULL, '{"ko": "소스용, 적당량"}',    7, 10),
    (r4, 'green_onion',    NULL,             NULL,  NULL,    NULL, '{"ko": "소스용, 다져서 듬뿍"}', 7, 11),
    (r4, NULL,             '{"ko": "고추"}', NULL,  NULL,    NULL, '{"ko": "소스용, 다져서 듬뿍"}', 7, 12);
  END IF;


  -- ============================================================
  -- Recipe r5: 이찬원 파닭전
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'chanwon-pa-dak-jeon';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      r5,
      'chanwon-pa-dak-jeon',
      '{"ko": "이찬원 파닭전", "en": "Chanwon''s Scallion Chicken Pancake"}',
      v_author,
      '{"ko": "바삭한 닭다리살 전 위에 싱싱한 파채와 달콤 간장 소스를 올린 파티용 안주", "en": "Crispy chicken thigh pancake topped with fresh scallion threads and sweet soy glaze"}',
      'beginner',
      15,
      15,
      2,
      true
    );
  ELSE
    r5 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (r5, 1, '{"ko": "손질한 닭다리살에 맛소금 0.5, 맛술 2, 후추, 다진 마늘 1을 넣고 잘 버무려 잠시 재워둔다"}',                                NULL, NULL),
    (r5, 2, '{"ko": "재워둔 닭에 감자전분 6스푼, 물 4스푼, 송송 썬 청양고추를 넣고 골고루 버무린다"}',                                           NULL, NULL),
    (r5, 3, '{"ko": "팬에 기름을 넉넉히 두르고 반죽을 올려 꾹꾹 눌러가며 바삭하게 익힌다"}',                                                    NULL, '{"ko": "꾹 눌러줘야 닭이 고르게 익고 더 바삭해진다"}'),
    (r5, 4, '{"ko": "소스 재료를 모두 섞어 전자레인지에 1분 정도 돌린다"}',                                                                       60,  NULL),
    (r5, 5, '{"ko": "바삭하게 구워진 닭전 위에 파채를 듬뿍 올리고 소스를 부으면 완성"}',                                                          NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (r5, 'chicken_thigh',  NULL,             350,  'g',    NULL, '{"ko": "한입 크기로 손질"}',  1, 1),
    (r5, 'green_onion',    NULL,             NULL,  NULL,   NULL, '{"ko": "파채, 듬뿍"}',       5, 2),
    (r5, 'cornstarch',     NULL,               6,  'tbsp', NULL, '{"ko": "감자전분"}',          2, 3),
    (r5, NULL,             '{"ko": "물"}',     4,  'tbsp', NULL, NULL,                          2, 4),
    (r5, NULL,             '{"ko": "청양고추"}', NULL, NULL, NULL, '{"ko": "취향껏"}',          2, 5),
    (r5, 'seasoned_salt',  NULL,             0.5,  'tbsp', NULL, NULL,                          1, 6),
    (r5, 'mirin',          NULL,               2,  'tbsp', NULL, '{"ko": "밑간용 맛술"}',      1, 7),
    (r5, 'black_pepper',   NULL,             NULL,  NULL,   NULL, '{"ko": "약간"}',             1, 8),
    (r5, 'garlic',         NULL,               1,  'tbsp', NULL, '{"ko": "다져서"}',            1, 9),
    (r5, 'garlic',         NULL,             0.5,  'tbsp', NULL, '{"ko": "소스용, 다져서"}',   4, 10),
    (r5, 'ganjang',      NULL,               4,  'tbsp', NULL, '{"ko": "소스용"}',            4, 11),
    (r5, 'mirin',          NULL,               4,  'tbsp', NULL, '{"ko": "소스용 맛술"}',      4, 12),
    (r5, NULL,             '{"ko": "알룰로스"}', 2, 'tbsp', NULL, '{"ko": "또는 설탕"}',       4, 13),
    (r5, 'corn_syrup',     NULL,               2,  'tbsp', NULL, '{"ko": "물엿"}',              4, 14);
  END IF;

END $$;
