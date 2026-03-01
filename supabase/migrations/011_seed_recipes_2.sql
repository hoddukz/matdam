-- Tag: core
-- Path: supabase/migrations/011_seed_recipes_2.sql

-- ============================================================
-- MatDam — Recipe Seed Data Batch 2 (20 Recipes)
-- Recipes: s1~s20 (엄마표 피자빵 ~ 스테이크 솥밥)
-- ============================================================

DO $$
DECLARE
  v_author UUID;
  s1  UUID;
  s2  UUID;
  s3  UUID;
  s4  UUID;
  s5  UUID;
  s6  UUID;
  s7  UUID;
  s8  UUID;
  s9  UUID;
  s10 UUID;
  s11 UUID;
  s12 UUID;
  s13 UUID;
  s14 UUID;
  s15 UUID;
  s16 UUID;
  s17 UUID;
  s18 UUID;
  s19 UUID;
  s20 UUID;
  existing_id UUID;
BEGIN

  -- ── Author 선택 ───────────────────────────────────────────
  SELECT user_id INTO v_author FROM public.users LIMIT 1;

  IF v_author IS NULL THEN
    RAISE EXCEPTION 'No user found. Insert a user first.';
  END IF;

  -- ── UUID 생성 ─────────────────────────────────────────────
  s1  := gen_random_uuid();
  s2  := gen_random_uuid();
  s3  := gen_random_uuid();
  s4  := gen_random_uuid();
  s5  := gen_random_uuid();
  s6  := gen_random_uuid();
  s7  := gen_random_uuid();
  s8  := gen_random_uuid();
  s9  := gen_random_uuid();
  s10 := gen_random_uuid();
  s11 := gen_random_uuid();
  s12 := gen_random_uuid();
  s13 := gen_random_uuid();
  s14 := gen_random_uuid();
  s15 := gen_random_uuid();
  s16 := gen_random_uuid();
  s17 := gen_random_uuid();
  s18 := gen_random_uuid();
  s19 := gen_random_uuid();
  s20 := gen_random_uuid();

  -- ── 신규 재료 INSERT ──────────────────────────────────────
  INSERT INTO public.ingredients (id, names, category, common_units, default_unit, is_commodity, dietary_flags, substitutes, description, cuisines, importance) VALUES
  ('sandwich_bread',              '{"ko": "식빵", "en": "Sandwich Bread"}',                   'grain_starch', ARRAY['piece','sheet'],      'piece', true,  ARRAY['vegetarian'],          ARRAY[]::text[],                    '{"ko": "일반 식빵", "en": "Plain white sandwich bread"}',                                       ARRAY['korean','western'],          'recommended'),
  ('sausage',            '{"ko": "소시지", "en": "Sausage"}',                      'protein',      ARRAY['piece','g'],           'piece', false, ARRAY[]::text[],              ARRAY['bacon'],                     '{"ko": "비엔나 또는 프랑크소시지", "en": "Vienna or frankfurter sausage"}',                      ARRAY['korean','western'],          'recommended'),
  ('spam',               '{"ko": "스팸", "en": "Spam"}',                           'protein',      ARRAY['piece','g'],           'g',     false, ARRAY[]::text[],              ARRAY['bacon','sausage'],           '{"ko": "스팸 런천미트", "en": "Spam luncheon meat"}',                                           ARRAY['korean'],                    'recommended'),
  ('pancake_mix',        '{"ko": "부침가루", "en": "Korean Pancake Mix"}',          'grain_starch', ARRAY['tbsp','cup','g'],      'tbsp',  false, ARRAY[]::text[],              ARRAY['all_purpose_flour'],         '{"ko": "한국식 부침가루", "en": "Korean-style pancake batter mix"}',                            ARRAY['korean'],                    'recommended'),
  ('fish_cake',          '{"ko": "어묵", "en": "Fish Cake"}',                      'protein',      ARRAY['piece','sheet','g'],   'g',     false, ARRAY[]::text[],              ARRAY[]::text[],                    '{"ko": "한국식 어묵 (사각/막대)", "en": "Korean fish cake (sheet or stick type)"}',             ARRAY['korean','japanese'],         'recommended'),
  ('kimchi',             '{"ko": "김치", "en": "Kimchi"}',                         'vegetable',    ARRAY['cup','g'],             'cup',   false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "배추김치", "en": "Napa cabbage kimchi"}',                                               ARRAY['korean'],                    'must_have'),
  ('canned_tuna',        '{"ko": "참치캔", "en": "Canned Tuna"}',                  'protein',      ARRAY['piece','g'],           'piece', false, ARRAY['dairy_free'],          ARRAY[]::text[],                    '{"ko": "참치 통조림", "en": "Canned tuna in oil or water"}',                                    ARRAY['korean','western','japanese'],'recommended'),
  ('parsley',            '{"ko": "파슬리", "en": "Parsley"}',                       'herb_spice',   ARRAY['tbsp','g'],            'tbsp',  false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "파슬리 (생 또는 건조)", "en": "Parsley, fresh or dried"}',                              ARRAY['western'],                   'recommended'),
  ('king_oyster_mushroom','{"ko": "새송이버섯", "en": "King Oyster Mushroom"}',    'vegetable',    ARRAY['piece','g'],           'piece', false, ARRAY['vegan','dairy_free'],  ARRAY['mushroom','shiitake'],       '{"ko": "새송이버섯", "en": "King oyster mushroom with thick stem"}',                            ARRAY['korean','japanese'],         'recommended'),
  ('sweet_corn',         '{"ko": "스위트콘", "en": "Sweet Corn"}',                  'vegetable',    ARRAY['cup','g'],             'cup',   false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "스위트콘 (통조림 또는 냉동)", "en": "Sweet corn, canned or frozen"}',                   ARRAY['korean','western'],          'recommended'),
  ('soju',               '{"ko": "소주", "en": "Soju"}',                            'sauce_paste',  ARRAY['tbsp','ml'],           'tbsp',  false, ARRAY['vegan','dairy_free'],  ARRAY['sake_cooking','mirin'],      '{"ko": "소주 (요리용)", "en": "Soju, used for cooking to tenderize meat and remove odor"}',     ARRAY['korean'],                    'recommended'),
  ('red_chili_pepper',   '{"ko": "홍고추", "en": "Red Chili Pepper"}',              'vegetable',    ARRAY['piece'],               'piece', false, ARRAY['vegan','dairy_free'],  ARRAY['korean_chili_pepper'],       '{"ko": "홍고추 (고명/장식용)", "en": "Red chili pepper for garnish"}',                          ARRAY['korean'],                    'recommended'),
  ('oyster_mushroom',    '{"ko": "느타리버섯", "en": "Oyster Mushroom"}',           'vegetable',    ARRAY['g','cup'],             'g',     false, ARRAY['vegan','dairy_free'],  ARRAY['mushroom','shiitake'],       '{"ko": "느타리버섯", "en": "Oyster mushroom"}',                                                 ARRAY['korean','japanese'],         'recommended'),
  ('beef_bone_broth',    '{"ko": "사골곰탕", "en": "Beef Bone Broth"}',             'sauce_paste',  ARRAY['ml','cup','piece'],    'piece', false, ARRAY['dairy_free'],          ARRAY['chicken_broth'],             '{"ko": "시판 사골곰탕 팩", "en": "Pre-packaged beef bone broth"}',                              ARRAY['korean'],                    'recommended'),
  ('baked_beans',        '{"ko": "베이크드 빈스", "en": "Baked Beans"}',             'protein',      ARRAY['cup','g'],             'cup',   false, ARRAY['vegan','dairy_free'],  ARRAY[]::text[],                    '{"ko": "강낭콩 통조림 (토마토소스)", "en": "Canned baked beans in tomato sauce"}',               ARRAY['western'],                   'recommended'),
  ('kelp_concentrate',   '{"ko": "다시마 농축액", "en": "Kelp Concentrate"}',       'sauce_paste',  ARRAY['tbsp','ml'],           'tbsp',  false, ARRAY['vegan','dairy_free'],  ARRAY['dashima'],                   '{"ko": "다시마 3배 농축액", "en": "Concentrated kelp extract (3x)"}',                           ARRAY['korean','japanese'],         'recommended'),
  ('chives',             '{"ko": "쪽파", "en": "Chives"}',                          'vegetable',    ARRAY['stalk','g'],           'stalk', false, ARRAY['vegan','dairy_free'],  ARRAY['green_onion'],               '{"ko": "쪽파 (실파)", "en": "Korean chives / thin green onions"}',                              ARRAY['korean'],                    'recommended'),
  ('pork_shoulder',      '{"ko": "돼지 앞다리살", "en": "Pork Shoulder"}',          'protein',      ARRAY['g','kg'],              'g',     false, ARRAY['dairy_free'],          ARRAY['pork_belly'],                '{"ko": "돼지 앞다리살/목살", "en": "Pork shoulder or Boston butt"}',                             ARRAY['korean','western'],          'recommended'),
  ('chicken_stock',      '{"ko": "치킨스톡", "en": "Chicken Stock Cube"}',          'sauce_paste',  ARRAY['tbsp','piece'],        'tbsp',  false, ARRAY['dairy_free'],          ARRAY['chicken_broth','dashi_powder'],'{"ko": "치킨스톡 큐브/파우더", "en": "Chicken stock cube or powder"}',                         ARRAY['korean','western'],          'recommended'),
  ('seasoned_salt',      '{"ko": "맛소금", "en": "Seasoned Salt"}',                 'herb_spice',   ARRAY['tsp','tbsp'],          'tsp',   false, ARRAY['vegan','dairy_free'],  ARRAY['salt'],                      '{"ko": "MSG가 들어간 맛소금", "en": "Salt seasoned with MSG"}',                                 ARRAY['korean'],                    'recommended'),
  ('pork_neck',          '{"ko": "돼지목살", "en": "Pork Neck"}',                   'protein',      ARRAY['g','kg','piece'],      'g',     false, ARRAY['dairy_free'],          ARRAY['pork_shoulder','pork_belly'],'{"ko": "돼지목살 (스테이크용)", "en": "Pork neck/collar steaks"}',                              ARRAY['korean'],                    'recommended'),
  ('flank_steak',        '{"ko": "부채살", "en": "Flank Steak"}',                   'protein',      ARRAY['g','kg'],              'g',     false, ARRAY['dairy_free'],          ARRAY['beef_brisket'],              '{"ko": "부채살 (소고기 스테이크용)", "en": "Beef flank steak for grilling"}',                   ARRAY['korean','western'],          'recommended')
  ON CONFLICT (id) DO NOTHING;


  -- ============================================================
  -- Recipe s1: 엄마표 피자빵
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'eomma-pizza-ppang';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s1,
      'eomma-pizza-ppang',
      '{"ko": "엄마표 피자빵"}',
      v_author,
      '{"ko": "식빵 위에 볶은 고기와 야채, 치즈를 올려 간편하게 만드는 피자빵"}',
      'beginner',
      10,
      15,
      2,
      true
    );
  ELSE
    s1 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s1, 1, '{"ko": "다진 고기를 팬에 볶으면서 소금, 후추로 밑간한다"}',              NULL, NULL),
    (s1, 2, '{"ko": "고기가 어느 정도 익으면 케찹을 넣고 함께 볶는다"}',              NULL, NULL),
    (s1, 3, '{"ko": "식빵 위에 볶은 고기를 올린다"}',                                 NULL, NULL),
    (s1, 4, '{"ko": "썬 피망, 소시지, 치즈를 올리고 케찹을 뿌린다"}',                 NULL, NULL),
    (s1, 5, '{"ko": "전자레인지 혹은 오븐에 넣고 치즈가 녹을 때까지 익힌다"}',        NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s1, 'sandwich_bread',       NULL,                    2,    'piece', NULL,             NULL,                                  1, 1),
    (s1, 'ground_beef', NULL,                  100,    'g',     NULL,             '{"ko": "돼지고기 또는 소고기"}',       1, 2),
    (s1, 'ketchup',     NULL,                    2,    'tbsp',  NULL,             NULL,                                  2, 3),
    (s1, 'bell_pepper', NULL,                    0.5,  'piece', NULL,             NULL,                                  4, 4),
    (s1, 'sausage',     NULL,                    2,    'piece', NULL,             NULL,                                  4, 5),
    (s1, 'mozzarella',  NULL,                   NULL,  NULL,    NULL,             '{"ko": "또는 슬라이스 치즈, 적당량"}', 4, 6),
    (s1, 'salt',        NULL,                   NULL,  NULL,    NULL,             '{"ko": "약간"}',                      1, 7),
    (s1, 'black_pepper',NULL,                   NULL,  NULL,    NULL,             '{"ko": "약간"}',                      1, 8);
  END IF;


  -- ============================================================
  -- Recipe s2: 엄마표 동그랑땡
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'eomma-dongeurangtaeng';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s2,
      'eomma-dongeurangtaeng',
      '{"ko": "엄마표 동그랑땡"}',
      v_author,
      '{"ko": "남는 야채와 햄으로 만드는 동그란 부침. 간식이나 반찬으로 딱"}',
      'beginner',
      15,
      15,
      3,
      true
    );
  ELSE
    s2 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s2, 1, '{"ko": "집에 있는 야채를 최대한 작게 다진다"}',                                                                                                          NULL, NULL),
    (s2, 2, '{"ko": "햄이나 스팸도 잘게 다진 뒤 야채와 함께 섞는다(참치를 사용할 경우 기름/물을 최대한 빼준다)"}',                                                   NULL, NULL),
    (s2, 3, '{"ko": "계란을 깨서 넣고 부침가루를 넣어 되직하게 만든다 (소금, 후추로 간은 선택)"}',                                                                   NULL, NULL),
    (s2, 4, '{"ko": "프라이팬에 식용유를 두르고 적당한 크기로 동그랗게 부친다"}',                                                                                      NULL, '{"ko": "식빵 위에 올리고 슬라이스 체다치즈를 넣으면 샌드위치로도 먹을 수 있다"}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s2, 'carrot',       NULL,                  NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    1, 1),
    (s2, 'onion',        NULL,                  NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    1, 2),
    (s2, NULL,           '{"ko": "대파"}',       NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    1, 3),
    (s2, 'spam',         NULL,                  100,   'g',     NULL,             '{"ko": "햄 또는 스팸 (참치도 가능)"}'  ,2, 4),
    (s2, 'egg',          NULL,                    2,   'piece', NULL,             NULL,                                  3, 5),
    (s2, 'pancake_mix',  NULL,                    3,   'tbsp',  NULL,             NULL,                                  3, 6),
    (s2, 'salt',         NULL,                  NULL,  NULL,    NULL,             '{"ko": "선택, 약간"}',                3, 7),
    (s2, 'black_pepper', NULL,                  NULL,  NULL,    NULL,             '{"ko": "선택, 약간"}',                3, 8),
    (s2, 'vegetable_oil',NULL,                  NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    4, 9);
  END IF;


  -- ============================================================
  -- Recipe s3: 계란말이
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'gyeranmari';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s3,
      'gyeranmari',
      '{"ko": "계란말이"}',
      v_author,
      '{"ko": "당근, 대파를 넣고 돌돌 말아 만드는 기본 계란말이"}',
      'beginner',
      5,
      10,
      2,
      true
    );
  ELSE
    s3 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s3, 1, '{"ko": "당근, 대파를 잘게 다진다"}',                                     NULL, NULL),
    (s3, 2, '{"ko": "계란을 풀고 다진 야채, 소금을 넣어 섞는다"}',                    NULL, NULL),
    (s3, 3, '{"ko": "팬에 식용유를 얇게 두르고 약불로 줄인다"}',                       NULL, NULL),
    (s3, 4, '{"ko": "계란물을 얇게 부어 반쯤 익으면 한쪽에서 말아준다"}',              NULL, NULL),
    (s3, 5, '{"ko": "말아놓은 쪽으로 밀고 다시 계란물을 부어 반복한다"}',              NULL, NULL),
    (s3, 6, '{"ko": "다 말았으면 한 김 식힌 후 먹기 좋게 자른다"}',                   NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s3, 'egg',          NULL,                    4,   'piece', NULL,             NULL,                                  2, 1),
    (s3, 'carrot',       NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      1, 2),
    (s3, 'green_onion',  NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      1, 3),
    (s3, 'salt',         NULL,                  0.33,  'tsp',   NULL,             NULL,                                  2, 4),
    (s3, 'vegetable_oil',NULL,                  NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    3, 5);
  END IF;


  -- ============================================================
  -- Recipe s4: 감자조림
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'gamja-jorim';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s4,
      'gamja-jorim',
      '{"ko": "감자조림"}',
      v_author,
      '{"ko": "간장 양념에 자작하게 졸인 달콤짭조름한 감자조림"}',
      'beginner',
      5,
      20,
      2,
      true
    );
  ELSE
    s4 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s4, 1, '{"ko": "감자를 한입 크기로 깍둑썰기 한다"}',                             NULL, NULL),
    (s4, 2, '{"ko": "냄비에 감자, 간장, 설탕, 물엿, 다진 마늘, 물을 넣는다"}',       NULL, NULL),
    (s4, 3, '{"ko": "센불에서 끓이다가 끓어오르면 중불로 줄인다"}',                    NULL, NULL),
    (s4, 4, '{"ko": "국물이 자작해질 때까지 졸인다"}',                                 NULL, NULL),
    (s4, 5, '{"ko": "참기름, 통깨를 뿌려 마무리한다"}',                                NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s4, 'potato',       NULL,                    2,   'piece', NULL,             NULL,                                  1, 1),
    (s4, 'ganjang',      NULL,                    2,   'tbsp',  NULL,             NULL,                                  2, 2),
    (s4, 'sugar',        NULL,                    1,   'tbsp',  NULL,             NULL,                                  2, 3),
    (s4, 'corn_syrup',   NULL,                    1,   'tbsp',  NULL,             '{"ko": "물엿 또는 올리고당"}',         2, 4),
    (s4, 'garlic',       NULL,                   0.5,  'tsp',   '{"ko": "다진"}', '{"ko": "다진마늘"}',                  2, 5),
    (s4, 'sesame_oil',   NULL,                    1,   'tsp',   NULL,             NULL,                                  5, 6),
    (s4, 'sesame_seeds', NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      5, 7);
  END IF;


  -- ============================================================
  -- Recipe s5: 시금치나물
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'sigeumchi-namul';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s5,
      'sigeumchi-namul',
      '{"ko": "시금치나물"}',
      v_author,
      '{"ko": "데쳐서 참기름에 조물조물 무친 기본 시금치나물"}',
      'beginner',
      5,
      5,
      2,
      true
    );
  ELSE
    s5 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s5, 1, '{"ko": "끓는 물에 소금을 넣고 시금치를 30초 데친다"}',                   30,   NULL),
    (s5, 2, '{"ko": "찬물에 헹궈 물기를 꽉 짠다"}',                                   NULL, NULL),
    (s5, 3, '{"ko": "먹기 좋은 크기로 자른다"}',                                       NULL, NULL),
    (s5, 4, '{"ko": "국간장, 참기름, 다진 마늘을 넣고 조물조물 무친다"}',              NULL, NULL),
    (s5, 5, '{"ko": "통깨를 뿌려 마무리한다"}',                                        NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s5, 'spinach',      NULL,                    1,   'bunch', NULL,             '{"ko": "1단"}',                       1, 1),
    (s5, 'ganjang',      NULL,                    1,   'tsp',   NULL,             '{"ko": "국간장"}',                    4, 2),
    (s5, 'sesame_oil',   NULL,                    1,   'tbsp',  NULL,             NULL,                                  4, 3),
    (s5, 'garlic',       NULL,                   0.5,  'tsp',   '{"ko": "다진"}', '{"ko": "다진마늘"}',                  4, 4),
    (s5, 'sesame_seeds', NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      5, 5),
    (s5, 'salt',         NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      1, 6);
  END IF;


  -- ============================================================
  -- Recipe s6: 멸치볶음
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'myeolchi-bokkeum';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s6,
      'myeolchi-bokkeum',
      '{"ko": "멸치볶음"}',
      v_author,
      '{"ko": "바삭하게 볶은 잔멸치에 달달한 간장 양념을 입힌 밑반찬"}',
      'beginner',
      5,
      10,
      3,
      true
    );
  ELSE
    s6 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s6, 1, '{"ko": "팬에 멸치를 넣고 약불에서 바삭하게 볶는다"}',                    NULL, NULL),
    (s6, 2, '{"ko": "멸치를 한쪽에 밀고 식용유, 간장, 설탕, 물엿, 다진 마늘을 넣어 소스를 만든다"}', NULL, NULL),
    (s6, 3, '{"ko": "소스가 보글보글 끓으면 멸치와 섞는다"}',                          NULL, NULL),
    (s6, 4, '{"ko": "불을 끄고 통깨를 뿌린다"}',                                       NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s6, 'dried_anchovy',NULL,                   1,    'cup',   NULL,             '{"ko": "잔멸치"}',                    1, 1),
    (s6, 'ganjang',      NULL,                   1,    'tbsp',  NULL,             NULL,                                  2, 2),
    (s6, 'sugar',        NULL,                  0.5,   'tbsp',  NULL,             NULL,                                  2, 3),
    (s6, 'corn_syrup',   NULL,                   1,    'tbsp',  NULL,             '{"ko": "물엿"}',                      2, 4),
    (s6, 'garlic',       NULL,                  0.5,   'tsp',   '{"ko": "다진"}', '{"ko": "다진마늘"}',                  2, 5),
    (s6, 'vegetable_oil',NULL,                   1,    'tbsp',  NULL,             NULL,                                  2, 6),
    (s6, 'sesame_seeds', NULL,                  NULL,  NULL,    NULL,             '{"ko": "약간"}',                      4, 7);
  END IF;


  -- ============================================================
  -- Recipe s7: 어묵볶음
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'eomuk-bokkeum';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s7,
      'eomuk-bokkeum',
      '{"ko": "어묵볶음"}',
      v_author,
      '{"ko": "간장 양념에 매콤하게 볶은 어묵과 야채"}',
      'beginner',
      10,
      10,
      2,
      true
    );
  ELSE
    s7 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s7, 1, '{"ko": "어묵을 먹기 좋은 크기로 자른다"}',                               NULL, NULL),
    (s7, 2, '{"ko": "양파, 대파, 고추를 채 썬다"}',                                    NULL, NULL),
    (s7, 3, '{"ko": "팬에 식용유를 두르고 어묵을 볶는다"}',                             NULL, NULL),
    (s7, 4, '{"ko": "양파를 넣고 간장, 고춧가루, 설탕, 물엿, 다진 마늘을 넣는다"}',   NULL, NULL),
    (s7, 5, '{"ko": "대파, 고추를 넣고 볶다가 참기름으로 마무리한다"}',                NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s7, 'fish_cake',          NULL,               200,   'g',     NULL,             NULL,                                  1,  1),
    (s7, 'onion',              NULL,                0.5,   'piece', NULL,             NULL,                                  2,  2),
    (s7, 'green_onion',        NULL,                0.5,   'stalk', NULL,             NULL,                                  2,  3),
    (s7, 'korean_chili_pepper',NULL,                  1,   'piece', NULL,             NULL,                                  2,  4),
    (s7, 'ganjang',            NULL,                1.5,   'tbsp',  NULL,             NULL,                                  4,  5),
    (s7, 'gochugaru',          NULL,                0.5,   'tbsp',  NULL,             NULL,                                  4,  6),
    (s7, 'sugar',              NULL,                  1,   'tsp',   NULL,             NULL,                                  4,  7),
    (s7, 'corn_syrup',         NULL,                  1,   'tbsp',  NULL,             '{"ko": "물엿"}',                      4,  8),
    (s7, 'garlic',             NULL,                0.5,   'tsp',   '{"ko": "다진"}', '{"ko": "다진마늘"}',                  4,  9),
    (s7, 'sesame_oil',         NULL,                  1,   'tsp',   NULL,             NULL,                                  5, 10),
    (s7, 'vegetable_oil',      NULL,                  1,   'tbsp',  NULL,             NULL,                                  3, 11);
  END IF;


  -- ============================================================
  -- Recipe s8: 김치볶음밥
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'kimchi-bokkeumbap';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s8,
      'kimchi-bokkeumbap',
      '{"ko": "김치볶음밥"}',
      v_author,
      '{"ko": "김치와 스팸을 볶아 만드는 간단한 한 그릇 볶음밥"}',
      'beginner',
      5,
      10,
      1,
      true
    );
  ELSE
    s8 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s8, 1, '{"ko": "김치와 스팸을 잘게 썬다"}',                                       NULL, NULL),
    (s8, 2, '{"ko": "팬에 식용유를 두르고 스팸을 볶는다"}',                             NULL, NULL),
    (s8, 3, '{"ko": "김치를 넣고 같이 볶는다"}',                                        NULL, NULL),
    (s8, 4, '{"ko": "밥을 넣고 고추장을 넣어 볶는다"}',                                 NULL, NULL),
    (s8, 5, '{"ko": "참기름을 둘러 마무리한다"}',                                        NULL, NULL),
    (s8, 6, '{"ko": "계란 프라이와 김가루를 올려 먹는다"}',                              NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s8, 'short_grain_rice',NULL,                  1,   'cup',   NULL,             '{"ko": "밥 1공기"}',                  4, 1),
    (s8, 'kimchi',          NULL,                  1,   'cup',   NULL,             '{"ko": "잘게 썬 것"}',                1, 2),
    (s8, 'spam',            NULL,                 50,   'g',     NULL,             '{"ko": "스팸 또는 햄"}',               1, 3),
    (s8, 'egg',             NULL,                  1,   'piece', NULL,             NULL,                                  6, 4),
    (s8, 'gochujang',       NULL,                0.5,   'tbsp',  NULL,             '{"ko": "선택"}',                      4, 5),
    (s8, 'sesame_oil',      NULL,                  1,   'tsp',   NULL,             NULL,                                  5, 6),
    (s8, 'vegetable_oil',   NULL,                  1,   'tbsp',  NULL,             NULL,                                  2, 7),
    (s8, 'dried_laver',     NULL,                NULL,  NULL,    NULL,             '{"ko": "김가루, 약간"}',               6, 8);
  END IF;


  -- ============================================================
  -- Recipe s9: 라면땅
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'ramyeon-ttang';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s9,
      'ramyeon-ttang',
      '{"ko": "라면땅"}',
      v_author,
      '{"ko": "부순 라면을 바삭하게 볶아 스프를 뿌려 먹는 추억의 간식"}',
      'beginner',
      5,
      10,
      2,
      true
    );
  ELSE
    s9 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s9, 1, '{"ko": "라면을 봉지에서 꺼내 잘게 부순다"}',                              NULL, NULL),
    (s9, 2, '{"ko": "팬에 식용유를 넉넉히 두르고 부순 라면을 넣는다"}',                NULL, NULL),
    (s9, 3, '{"ko": "약불~중불에서 바삭하게 볶는다"}',                                  NULL, NULL),
    (s9, 4, '{"ko": "라면 스프를 뿌리고 골고루 섞는다"}',                               NULL, NULL),
    (s9, 5, '{"ko": "기호에 따라 설탕을 살짝 뿌려도 좋다"}',                            NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s9, 'ramyeon_noodle',NULL,                   1,   'piece', NULL,             '{"ko": "라면 사리"}',                  1, 1),
    (s9, 'vegetable_oil', NULL,                  NULL,  NULL,    NULL,             '{"ko": "적당량, 튀김용"}',              2, 2),
    (s9, NULL,            '{"ko": "라면 스프"}',  0.5,  'piece', NULL,             NULL,                                  4, 3),
    (s9, 'sugar',         NULL,                    1,   'tsp',   NULL,             '{"ko": "선택"}',                      5, 4);
  END IF;


  -- ============================================================
  -- Recipe s10: 설탕 토스트
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'seoltang-toseuteu';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s10,
      'seoltang-toseuteu',
      '{"ko": "설탕 토스트"}',
      v_author,
      '{"ko": "버터에 구운 식빵에 설탕을 뿌려 먹는 심플 토스트"}',
      'beginner',
      2,
      5,
      1,
      true
    );
  ELSE
    s10 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s10, 1, '{"ko": "팬에 버터를 녹인다"}',                                           NULL, NULL),
    (s10, 2, '{"ko": "식빵을 넣고 한쪽 면을 노릇하게 굽는다"}',                        NULL, NULL),
    (s10, 3, '{"ko": "뒤집어서 반대쪽도 굽는다"}',                                     NULL, NULL),
    (s10, 4, '{"ko": "구운 면에 설탕을 뿌려 먹는다"}',                                  NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s10, 'sandwich_bread',  NULL,    2,    'piece', NULL, NULL,  2, 1),
    (s10, 'butter', NULL,    1,    'tbsp',  NULL, NULL,  1, 2),
    (s10, 'sugar',  NULL,    1,    'tbsp',  NULL, NULL,  4, 3);
  END IF;


  -- ============================================================
  -- Recipe s11: 소세지 야채볶음
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'sosiji-yachae-bokkeum';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s11,
      'sosiji-yachae-bokkeum',
      '{"ko": "소세지 야채볶음"}',
      v_author,
      '{"ko": "소시지와 야채를 케찹에 볶은 간단한 반찬"}',
      'beginner',
      10,
      10,
      2,
      true
    );
  ELSE
    s11 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s11, 1, '{"ko": "소시지에 칼집을 내고 야채는 먹기 좋게 썬다"}',                   NULL, NULL),
    (s11, 2, '{"ko": "팬에 식용유를 두르고 소시지를 볶는다"}',                          NULL, NULL),
    (s11, 3, '{"ko": "양파, 당근을 넣고 볶는다"}',                                      NULL, NULL),
    (s11, 4, '{"ko": "피망을 넣고 케찹, 간장, 설탕을 넣어 볶는다"}',                   NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s11, 'sausage',      NULL,                200,   'g',     NULL,             '{"ko": "비엔나 또는 프랑크"}',          1, 1),
    (s11, 'onion',        NULL,                0.5,   'piece', NULL,             NULL,                                  1, 2),
    (s11, 'bell_pepper',  NULL,                0.5,   'piece', NULL,             NULL,                                  1, 3),
    (s11, 'carrot',       NULL,               0.25,   'piece', NULL,             NULL,                                  1, 4),
    (s11, 'ketchup',      NULL,                  2,   'tbsp',  NULL,             NULL,                                  4, 5),
    (s11, 'ganjang',      NULL,                0.5,   'tbsp',  NULL,             NULL,                                  4, 6),
    (s11, 'sugar',        NULL,                0.5,   'tbsp',  NULL,             NULL,                                  4, 7),
    (s11, 'vegetable_oil',NULL,                  1,   'tbsp',  NULL,             NULL,                                  2, 8);
  END IF;


  -- ============================================================
  -- Recipe s12: 주먹밥
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'jumeokbap';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s12,
      'jumeokbap',
      '{"ko": "주먹밥"}',
      v_author,
      '{"ko": "참치마요를 넣고 동그랗게 쥔 한입 크기 주먹밥"}',
      'beginner',
      10,
      0,
      2,
      true
    );
  ELSE
    s12 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s12, 1, '{"ko": "참치캔의 기름을 빼고 마요네즈와 섞는다"}',                       NULL, NULL),
    (s12, 2, '{"ko": "밥에 참기름, 소금, 깨를 넣어 섞는다"}',                          NULL, NULL),
    (s12, 3, '{"ko": "밥을 손에 놓고 참치마요를 가운데 넣어 동그랗게 쥔다"}',          NULL, NULL),
    (s12, 4, '{"ko": "김가루를 묻혀 완성"}',                                             NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s12, 'short_grain_rice',NULL,               1,   'cup',   NULL,             '{"ko": "밥 1공기"}',                  2, 1),
    (s12, 'canned_tuna',     NULL,              0.5,  'piece', NULL,             NULL,                                  1, 2),
    (s12, 'mayonnaise',      NULL,               1,   'tbsp',  NULL,             NULL,                                  1, 3),
    (s12, 'sesame_seeds',    NULL,             NULL,  NULL,    NULL,             '{"ko": "약간"}',                      2, 4),
    (s12, 'sesame_oil',      NULL,               1,   'tsp',   NULL,             NULL,                                  2, 5),
    (s12, 'salt',            NULL,             NULL,  NULL,    NULL,             '{"ko": "약간"}',                      2, 6),
    (s12, 'dried_laver',     NULL,             NULL,  NULL,    NULL,             '{"ko": "김가루, 약간"}',               4, 7);
  END IF;


  -- ============================================================
  -- Recipe s13: 간장계란장
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'ganjang-gyeranjang';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s13,
      'ganjang-gyeranjang',
      '{"ko": "간장계란장"}',
      v_author,
      '{"ko": "반숙 계란을 간장 양념에 재워 먹는 밥도둑 반찬"}',
      'beginner',
      10,
      10,
      3,
      true
    );
  ELSE
    s13 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s13, 1, '{"ko": "계란을 냄비에 넣고 찬물부터 끓여 반숙으로 삶는다 (끓기 시작하고 6분 30초)"}',  390,  NULL),
    (s13, 2, '{"ko": "찬물에 바로 식힌 뒤 껍질을 벗긴다"}',                            NULL, NULL),
    (s13, 3, '{"ko": "간장, 물, 설탕, 다진 마늘, 송송 썬 대파, 청양고추를 섞어 양념장을 만든다"}',   NULL, NULL),
    (s13, 4, '{"ko": "밀폐용기에 계란을 넣고 양념장을 부어 냉장고에서 최소 3시간 이상 재운다"}',      NULL, '{"ko": "하루 지나면 더 맛있고, 노른자가 졸깃해짐"}'),
    (s13, 5, '{"ko": "밥 위에 올리고 양념장 끼얹어 먹는다"}',                           NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s13, 'egg',               NULL,                 6,   'piece', NULL,             NULL,                                  1, 1),
    (s13, 'ganjang',           NULL,                 5,   'tbsp',  NULL,             NULL,                                  3, 2),
    (s13, 'sugar',             NULL,                 1,   'tbsp',  NULL,             NULL,                                  3, 3),
    (s13, 'garlic',            NULL,                 1,   'tsp',   '{"ko": "다진"}', '{"ko": "다진마늘"}',                  3, 4),
    (s13, 'green_onion',       NULL,                0.5,  'stalk', NULL,             '{"ko": "송송 썬 것"}',                3, 5),
    (s13, 'korean_chili_pepper',NULL,                1,   'piece', NULL,             '{"ko": "선택"}',                      3, 6),
    (s13, 'sesame_seeds',      NULL,               NULL,  NULL,    NULL,             '{"ko": "약간"}',                      5, 7),
    (s13, 'sesame_oil',        NULL,               NULL,  NULL,    NULL,             '{"ko": "약간"}',                      5, 8);
  END IF;


  -- ============================================================
  -- Recipe s14: 베이컨 크림파스타
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'bacon-cream-pasta';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s14,
      'bacon-cream-pasta',
      '{"ko": "베이컨 크림파스타"}',
      v_author,
      '{"ko": "양파와 마늘로 만든 크림 소스에 구운 베이컨을 올린 파스타"}',
      'intermediate',
      10,
      20,
      2,
      true
    );
  ELSE
    s14 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s14, 1, '{"ko": "팬에 식용유를 두르고 양파와 다진 마늘을 넣은 다음 뚜껑을 덮고 양파의 숨이 죽을 때까지 쪄준다"}',                                NULL, NULL),
    (s14, 2, '{"ko": "양파가 투명해지면 우유, 휘핑크림, 파마산 치즈, 치킨 스톡, 맛소금을 넣고 끓기 시작하면 청양고추와 함께 갈아준다"}',             NULL, '{"ko": "베이컨 대신 우삼겹을 구워서 올리면 우삼겹 크림파스타로도 즐길 수 있다"}'),
    (s14, 3, '{"ko": "물 1L에 소금 한 숟가락을 넣고 파스타면을 5분 삶는다"}',           300,  NULL),
    (s14, 4, '{"ko": "삶은 파스타면에 면수와 크림 소스를 넣고 원하는 농도가 나올 때까지 끓인다"}',                                                      NULL, NULL),
    (s14, 5, '{"ko": "구운 베이컨을 올리고 후추, 파슬리를 뿌려 완성"}',                 NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s14, 'pasta',          NULL,                NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    3,  1),
    (s14, 'onion',          NULL,                NULL,  NULL,    NULL,             NULL,                                  1,  2),
    (s14, 'garlic',         NULL,                NULL,  NULL,    '{"ko": "다진"}', NULL,                                  1,  3),
    (s14, 'milk',           NULL,                NULL,  NULL,    NULL,             NULL,                                  2,  4),
    (s14, 'heavy_cream',    NULL,                NULL,  NULL,    NULL,             NULL,                                  2,  5),
    (s14, 'parmesan',       NULL,                NULL,  NULL,    NULL,             NULL,                                  2,  6),
    (s14, 'chicken_stock',  NULL,                NULL,  NULL,    NULL,             NULL,                                  2,  7),
    (s14, 'seasoned_salt',  NULL,                NULL,  NULL,    NULL,             NULL,                                  2,  8),
    (s14, 'korean_chili_pepper',NULL,            NULL,  NULL,    NULL,             NULL,                                  2,  9),
    (s14, 'bacon',          NULL,                NULL,  NULL,    NULL,             NULL,                                  5, 10),
    (s14, 'black_pepper',   NULL,                NULL,  NULL,    NULL,             NULL,                                  5, 11),
    (s14, 'parsley',        NULL,                NULL,  NULL,    NULL,             NULL,                                  5, 12),
    (s14, 'vegetable_oil',  NULL,                NULL,  NULL,    NULL,             NULL,                                  1, 13),
    (s14, 'salt',           NULL,                NULL,  NULL,    NULL,             NULL,                                  3, 14);
  END IF;


  -- ============================================================
  -- Recipe s15: 누룽지 피자
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'nurungji-pizza';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s15,
      'nurungji-pizza',
      '{"ko": "누룽지 피자"}',
      v_author,
      '{"ko": "바삭한 누룽지 위에 고추장 소스와 치즈를 올린 한식 퓨전 피자"}',
      'beginner',
      10,
      20,
      2,
      true
    );
  ELSE
    s15 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s15, 1, '{"ko": "밥과 물을 섞어 팬 위에 얇게 편 다음 약불에 천천히 구워 누룽지를 만든다"}',                                    NULL, NULL),
    (s15, 2, '{"ko": "누룽지 위에 올리브오일을 살짝 뿌리고 계란을 올려 골고루 펴준 뒤 뚜껑을 덮어 익힌다"}',                        NULL, NULL),
    (s15, 3, '{"ko": "케찹, 고추장, 올리고당, 참기름을 섞어 만든 소스를 계란 위에 발라준다"}',                                       NULL, '{"ko": "소스에 고추장이 들어가는 게 포인트. 한식 퓨전 느낌이 여기서 나온다"}'),
    (s15, 4, '{"ko": "피망, 양파, 새송이버섯, 소시지, 스위트콘, 모짜렐라 치즈를 올린다"}',                                           NULL, NULL),
    (s15, 5, '{"ko": "뚜껑을 덮고 치즈가 녹을 때까지 익힌다"}',                         NULL, NULL),
    (s15, 6, '{"ko": "파슬리를 뿌리면 완성"}',                                           NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s15, 'short_grain_rice',    NULL,           NULL,  NULL,    NULL,             '{"ko": "밥"}',                        1,  1),
    (s15, 'egg',                 NULL,              1,  'piece', NULL,             NULL,                                  2,  2),
    (s15, 'olive_oil',           NULL,           NULL,  NULL,    NULL,             '{"ko": "약간"}',                      2,  3),
    (s15, 'bell_pepper',         NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  4),
    (s15, 'onion',               NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  5),
    (s15, 'king_oyster_mushroom',NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  6),
    (s15, 'sausage',             NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  7),
    (s15, 'sweet_corn',          NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  8),
    (s15, 'mozzarella',          NULL,           NULL,  NULL,    NULL,             NULL,                                  4,  9),
    (s15, 'parsley',             NULL,           NULL,  NULL,    NULL,             NULL,                                  6, 10),
    (s15, 'ketchup',             NULL,           NULL,  NULL,    NULL,             '{"ko": "소스"}',                      3, 11),
    (s15, 'gochujang',           NULL,           NULL,  NULL,    NULL,             '{"ko": "소스"}',                      3, 12),
    (s15, 'corn_syrup',          NULL,           NULL,  NULL,    NULL,             '{"ko": "소스, 올리고당"}',              3, 13),
    (s15, 'sesame_oil',          NULL,           NULL,  NULL,    NULL,             '{"ko": "소스"}',                      3, 14);
  END IF;


  -- ============================================================
  -- Recipe s16: 탕수육
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'tangsuyuk';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s16,
      'tangsuyuk',
      '{"ko": "탕수육"}',
      v_author,
      '{"ko": "감자전분 앙금으로 바삭하게 튀기고 고추장 소스에 버무린 집 탕수육"}',
      'intermediate',
      15,
      20,
      3,
      true
    );
  ELSE
    s16 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s16, 1, '{"ko": "감자전분에 물을 조심히 부어 2~3분 기다린 뒤 윗물을 따라버려 앙금만 남긴다"}',                                   NULL, NULL),
    (s16, 2, '{"ko": "돼지고기를 한입 크기로 썰고 핏물을 손으로 꽉 짠다"}',             NULL, NULL),
    (s16, 3, '{"ko": "고기에 다진 마늘, 소금, 후추로 밑간한 뒤 전분 앙금에 버무린다"}', NULL, '{"ko": "마늘을 좀 큼직하게 다져서 전분 앙금에 같이 넣으면 마늘맛 나는 고기 튀김이 돼서 소스 없이 그것만 먹어도 충분히 맛있다. 다진 마늘 대신 마늘가루(코스트코에서 판매)를 써도 된다."}'),
    (s16, 4, '{"ko": "프라이팬에 식용유를 넉넉히 두르고 고기를 노릇하게 튀긴다 (한번 건져서 잠깐 식힌 뒤 한번 더 튀기면 더 바삭)"}',  NULL, NULL),
    (s16, 5, '{"ko": "팬에 고추장, 케찹, 진간장, 소주, 식초, 물엿, 다진 마늘, 물을 넣고 중불에 끓인다"}',                             NULL, NULL),
    (s16, 6, '{"ko": "2분 정도 바글바글 졸인다"}',                                       120,  NULL),
    (s16, 7, '{"ko": "소스가 적당한 농도가 되면 튀긴 고기를 넣고 섞어가며 볶으면 완성"}',NULL, '{"ko": "전분 앙금 방식이라 반죽이 간단하고, 고추장 소스라 일반 탕수육보다 한식 느낌이 강하다"}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s16, 'pork_neck',    NULL,               500,   'g',     NULL,             '{"ko": "목살"}',                      2,  1),
    (s16, 'cornstarch',   NULL,                 8,   'tbsp',  NULL,             '{"ko": "감자전분"}',                   1,  2),
    (s16, 'garlic',       NULL,                 1,   'tbsp',  '{"ko": "다진"}', '{"ko": "다진마늘, 튀김용"}',           3,  3),
    (s16, 'salt',         NULL,              NULL,   NULL,    NULL,             '{"ko": "약간, 밑간"}',                 3,  4),
    (s16, 'black_pepper', NULL,              NULL,   NULL,    NULL,             '{"ko": "약간, 밑간"}',                 3,  5),
    (s16, 'vegetable_oil',NULL,              NULL,   NULL,    NULL,             '{"ko": "넉넉히, 튀김용"}',              4,  6),
    (s16, 'gochujang',    NULL,                 1,   'tbsp',  NULL,             '{"ko": "소스"}',                      5,  7),
    (s16, 'ketchup',      NULL,                 1,   'tbsp',  NULL,             '{"ko": "소스"}',                      5,  8),
    (s16, 'ganjang',      NULL,                 1,   'tbsp',  NULL,             '{"ko": "소스, 진간장"}',               5,  9),
    (s16, 'soju',         NULL,                 1,   'tbsp',  NULL,             '{"ko": "소스"}',                      5, 10),
    (s16, 'rice_vinegar', NULL,                 2,   'tbsp',  NULL,             '{"ko": "소스, 식초"}',                 5, 11),
    (s16, 'corn_syrup',   NULL,                 3,   'tbsp',  NULL,             '{"ko": "소스, 물엿"}',                 5, 12),
    (s16, 'garlic',       NULL,                0.5,  'tbsp',  '{"ko": "다진"}', '{"ko": "소스, 다진마늘"}',             5, 13);
  END IF;


  -- ============================================================
  -- Recipe s17: 스팸 쌈장
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'spam-ssamjang';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s17,
      'spam-ssamjang',
      '{"ko": "스팸 쌈장"}',
      v_author,
      '{"ko": "노릇하게 볶은 스팸에 고추장 된장 양념을 더한 쌈장"}',
      'beginner',
      10,
      15,
      3,
      true
    );
  ELSE
    s17 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s17, 1, '{"ko": "양파와 대파를 잘게 다진다"}',                                     NULL, NULL),
    (s17, 2, '{"ko": "스팸은 키친타월로 기름기를 제거한 후 깍둑썰기 한다"}',            NULL, NULL),
    (s17, 3, '{"ko": "달궈진 프라이팬에 아무것도 두르지 않고 스팸을 노릇노릇하고 바삭해질 때까지 볶는다"}', NULL, NULL),
    (s17, 4, '{"ko": "볶아진 스팸에 다진 양파와 대파를 넣고 양파가 투명해질 때까지 볶는다"}',               NULL, NULL),
    (s17, 5, '{"ko": "물 150ml, 다진 마늘, 고추장, 된장을 넣고 잘 풀어가며 중불에서 끓인다"}',              NULL, NULL),
    (s17, 6, '{"ko": "물엿을 넣어 단짠 밸런스를 맞춘다 (단맛은 취향에 따라 조절)"}',   NULL, NULL),
    (s17, 7, '{"ko": "참기름을 두르고, 매콤함을 원하면 다진 청양고추와 홍고추를 추가한다"}',               NULL, NULL),
    (s17, 8, '{"ko": "삶은 양배추 등과 함께 쌈 싸먹으면 완성"}',                        NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s17, 'spam',              NULL,               200,  'g',     NULL,             NULL,                                  2,  1),
    (s17, 'onion',             NULL,                 1,  'piece', NULL,             NULL,                                  1,  2),
    (s17, 'green_onion',       NULL,                0.5, 'stalk', NULL,             '{"ko": "대파"}',                      1,  3),
    (s17, 'garlic',            NULL,                 1,  'tbsp',  '{"ko": "다진"}', '{"ko": "다진마늘"}',                  5,  4),
    (s17, 'gochujang',         NULL,                 3,  'tbsp',  NULL,             NULL,                                  5,  5),
    (s17, 'doenjang',          NULL,                 2,  'tbsp',  NULL,             NULL,                                  5,  6),
    (s17, 'corn_syrup',        NULL,                 2,  'tbsp',  NULL,             '{"ko": "물엿"}',                      6,  7),
    (s17, 'sesame_oil',        NULL,                 1,  'tbsp',  NULL,             NULL,                                  7,  8),
    (s17, 'korean_chili_pepper',NULL,              NULL,  NULL,    NULL,             '{"ko": "선택"}',                      7,  9),
    (s17, 'red_chili_pepper',  NULL,               NULL,  NULL,    NULL,             '{"ko": "선택"}',                      7, 10);
  END IF;


  -- ============================================================
  -- Recipe s18: 부대찌개
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'budae-jjigae';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s18,
      'budae-jjigae',
      '{"ko": "부대찌개"}',
      v_author,
      '{"ko": "소시지와 스팸, 각종 야채를 사골곰탕에 끓인 얼큰한 찌개"}',
      'intermediate',
      15,
      15,
      3,
      true
    );
  ELSE
    s18 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s18, 1, '{"ko": "소시지를 다양한 모양으로 썰어 준비한다"}',                         NULL, NULL),
    (s18, 2, '{"ko": "스팸을 으깨서 돼지고기 민찌처럼 만든다"}',                         NULL, NULL),
    (s18, 3, '{"ko": "비닐봉지에 갈은 양파, 다진 마늘, 된장, 고추장, 고춧가루, 국간장, 미림, 소고기 다시다를 넣고 봉지째 잘 섞어 양념장을 만든다"}', NULL, '{"ko": "양념장을 봉지째 냉장고에서 3시간 정도 숙성하면 맛이 훨씬 깊어진다"}'),
    (s18, 4, '{"ko": "대파, 느타리버섯, 팽이버섯, 신김치, 청양고추, 두부를 먹기 좋게 손질한다"}',                                                      NULL, NULL),
    (s18, 5, '{"ko": "냄비에 손질한 재료를 모두 넣고 양념장을 올린다"}',                 NULL, NULL),
    (s18, 6, '{"ko": "사골곰탕 한 팩과 물을 부어준다"}',                                  NULL, NULL),
    (s18, 7, '{"ko": "라면사리를 넣고 5~10분 끓이면 완성"}',                              600,  '{"ko": "베이크드 빈스(강낭콩 통조림)를 넣으면 미군 부대 느낌이 나지만 호불호가 갈릴 수 있다"}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s18, 'sausage',          NULL,               NULL,  NULL,    NULL,             '{"ko": "큰 것"}',                     1,  1),
    (s18, 'spam',             NULL,                  1,  'piece', NULL,             '{"ko": "작은 것 1통"}',                2,  2),
    (s18, 'kimchi',           NULL,               NULL,  NULL,    NULL,             '{"ko": "신김치, 약간"}',               4,  3),
    (s18, 'green_onion',      NULL,                  1,  'stalk', NULL,             '{"ko": "대파"}',                      4,  4),
    (s18, 'oyster_mushroom',  NULL,               NULL,  NULL,    NULL,             '{"ko": "적당량"}',                    4,  5),
    (s18, 'enoki',            NULL,                  1,  'piece', NULL,             '{"ko": "1봉"}',                       4,  6),
    (s18, 'tofu',             NULL,                  1,  'piece', NULL,             '{"ko": "1모"}',                       4,  7),
    (s18, 'korean_chili_pepper',NULL,             NULL,  NULL,    NULL,             '{"ko": "취향껏"}',                    4,  8),
    (s18, 'beef_bone_broth',  NULL,                  1,  'piece', NULL,             '{"ko": "시판용 1팩"}',                 6,  9),
    (s18, 'ramyeon_noodle',   NULL,                  1,  'piece', NULL,             '{"ko": "라면사리"}',                   7, 10),
    (s18, 'baked_beans',      NULL,               NULL,  NULL,    NULL,             '{"ko": "선택"}',                      7, 11),
    (s18, 'onion',            NULL,                0.5,  'piece', NULL,             '{"ko": "양념장, 갈아서"}',              3, 12),
    (s18, 'garlic',           NULL,               NULL,  NULL,    '{"ko": "다진"}', '{"ko": "양념장"}',                    3, 13),
    (s18, 'doenjang',         NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장"}',                    3, 14),
    (s18, 'gochujang',        NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장"}',                    3, 15),
    (s18, 'gochugaru',        NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장"}',                    3, 16),
    (s18, 'ganjang',          NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장, 국간장"}',              3, 17),
    (s18, 'mirin',            NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장"}',                    3, 18),
    (s18, 'dashi_powder',     NULL,               NULL,  NULL,    NULL,             '{"ko": "양념장, 소고기 다시다"}',       3, 19);
  END IF;


  -- ============================================================
  -- Recipe s19: 7분 김치찌개
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = '7bun-kimchi-jjigae';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s19,
      '7bun-kimchi-jjigae',
      '{"ko": "7분 김치찌개"}',
      v_author,
      '{"ko": "고기를 먼저 볶고 7분만 끓이면 완성되는 빠른 김치찌개"}',
      'beginner',
      10,
      10,
      2,
      true
    );
  ELSE
    s19 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s19, 1, '{"ko": "냄비에 식용유를 두르고 대파 1컵과 돼지고기를 넣고 볶는다"}',      NULL, NULL),
    (s19, 2, '{"ko": "살짝 볶다가 고춧가루, 설탕, 국간장을 넣는다"}',                   NULL, NULL),
    (s19, 3, '{"ko": "약불에서 타지 않게 고기가 완전히 익을 때까지 볶는다"}',            NULL, NULL),
    (s19, 4, '{"ko": "고기와 같은 양의 김치와 김치 국물을 같이 넣는다"}',                NULL, NULL),
    (s19, 5, '{"ko": "양파 반 개를 잘라서 넣는다"}',                                     NULL, NULL),
    (s19, 6, '{"ko": "물 1컵과 다진 마늘을 넣고 잘 섞는다"}',                            NULL, NULL),
    (s19, 7, '{"ko": "뚜껑을 덮고 센 불로 딱 7분간 끓인다"}',                            420,  NULL),
    (s19, 8, '{"ko": "대파를 올리고 불을 끄면 완성"}',                                    NULL, '{"ko": "밥에 계란후라이와 김가루를 올려 비벼 먹으면 더 맛있다"}');

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s19, 'vegetable_oil',  NULL,                 1,   'tbsp',  NULL,             NULL,                                  1,  1),
    (s19, 'green_onion',    NULL,                 1,   'cup',   NULL,             '{"ko": "대파"}',                      1,  2),
    (s19, 'pork_shoulder',  NULL,               200,   'g',     NULL,             '{"ko": "돼지고기"}',                   1,  3),
    (s19, 'gochugaru',      NULL,                 1,   'tbsp',  NULL,             NULL,                                  2,  4),
    (s19, 'sugar',          NULL,                0.5,  'tbsp',  NULL,             NULL,                                  2,  5),
    (s19, 'ganjang',        NULL,                 2,   'tbsp',  NULL,             '{"ko": "국간장"}',                    2,  6),
    (s19, 'kimchi',         NULL,              NULL,   NULL,    NULL,             '{"ko": "돼지고기와 같은 양"}',          4,  7),
    (s19, 'onion',          NULL,                0.5,  'piece', NULL,             NULL,                                  5,  8),
    (s19, 'garlic',         NULL,                 1,   'tbsp',  '{"ko": "다진"}', '{"ko": "다진마늘"}',                  6,  9),
    (s19, 'green_onion',    NULL,              NULL,   NULL,    NULL,             '{"ko": "대파, 고명용"}',               8, 10);
  END IF;


  -- ============================================================
  -- Recipe s20: 스테이크 솥밥
  -- ============================================================

  SELECT recipe_id INTO existing_id FROM public.recipes WHERE slug = 'steak-sotbap';
  IF existing_id IS NULL THEN
    INSERT INTO public.recipes (
      recipe_id, slug, title, author_id, description,
      difficulty_level, prep_time_minutes, cook_time_minutes, servings, published
    ) VALUES (
      s20,
      'steak-sotbap',
      '{"ko": "스테이크 솥밥"}',
      v_author,
      '{"ko": "스테이크를 구운 냄비에 그대로 밥을 지어 풍미를 살린 솥밥"}',
      'intermediate',
      10,
      30,
      2,
      true
    );
  ELSE
    s20 := existing_id;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.recipe_steps (recipe_id, step_order, description, timer_seconds, tip) VALUES
    (s20, 1, '{"ko": "쌀에 물 2컵, 다시마 농축액 3숟가락, 멸치액젓 1숟가락을 넣고 불려둔다"}',                                        NULL, NULL),
    (s20, 2, '{"ko": "냄비에 통마늘과 부채살을 넣고 겉면을 바짝 익힌 후 소금, 후추로 간하고 쿠킹 오일을 덮어 꺼내둔다"}',              NULL, '{"ko": "고기 굽던 냄비를 그대로 쓰는 게 핵심. 고기 기름과 풍미가 밥에 배어든다. 솥이 없어도 두꺼운 냄비면 충분하다."}'),
    (s20, 3, '{"ko": "고기를 굽던 냄비에 불린 쌀을 그대로 붓고 밑이 타지 않게 계속 저어준다"}',                                        NULL, NULL),
    (s20, 4, '{"ko": "물이 끓기 시작하면 뚜껑을 덮고 약불로 15분 끓인다"}',             900,  NULL),
    (s20, 5, '{"ko": "불을 끄고 뚜껑을 절대 열지 말고 10분간 뜸을 들인다"}',            600,  NULL),
    (s20, 6, '{"ko": "쪽파를 잔뜩 썰어 넣고 잘 섞은 다음 부채살을 썰어 올린다"}',       NULL, NULL),
    (s20, 7, '{"ko": "노른자를 올리면 완성"}',                                            NULL, NULL);

    INSERT INTO public.recipe_ingredients
      (recipe_id, ingredient_id, custom_name, amount, unit, qualifier, note, step_number, display_order)
    VALUES
    (s20, 'short_grain_rice', NULL,             NULL,  NULL,    NULL,             '{"ko": "쌀"}',                        1,  1),
    (s20, 'kelp_concentrate', NULL,                3,  'tbsp',  NULL,             '{"ko": "다시마 3배 농축액"}',           1,  2),
    (s20, 'fish_sauce',       NULL,                1,  'tbsp',  NULL,             '{"ko": "멸치액젓"}',                   1,  3),
    (s20, 'flank_steak',      NULL,             NULL,  NULL,    NULL,             '{"ko": "부채살 또는 다른 스테이크용 부위"}', 2, 4),
    (s20, 'garlic',           NULL,             NULL,  NULL,    NULL,             '{"ko": "통마늘"}',                    2,  5),
    (s20, 'salt',             NULL,             NULL,  NULL,    NULL,             NULL,                                  2,  6),
    (s20, 'black_pepper',     NULL,             NULL,  NULL,    NULL,             NULL,                                  2,  7),
    (s20, 'vegetable_oil',    NULL,             NULL,  NULL,    NULL,             '{"ko": "쿠킹 오일"}',                  2,  8),
    (s20, 'chives',           NULL,             NULL,  NULL,    NULL,             '{"ko": "쪽파"}',                      6,  9),
    (s20, 'egg',              NULL,             NULL,  NULL,    NULL,             '{"ko": "노른자"}',                    7, 10);
  END IF;

END $$;
