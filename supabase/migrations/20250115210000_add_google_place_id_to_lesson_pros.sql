-- lesson_pros 테이블에 google_place_id 컬럼 추가 (중복 방지용)
ALTER TABLE lesson_pros
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_lesson_pros_google_place_id
ON lesson_pros(google_place_id)
WHERE google_place_id IS NOT NULL;
