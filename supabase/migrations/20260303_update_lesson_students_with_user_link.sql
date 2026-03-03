-- lesson_students 테이블에 user_id 컬럼 추가 (기존 회원과 연결)
ALTER TABLE lesson_students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_lesson_students_user_id ON lesson_students(user_id);

-- 학생 뷰 생성 (회원 정보와 조인)
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
  ls.*,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  au.email as user_email
FROM lesson_students ls
LEFT JOIN profiles p ON ls.user_id = p.id
LEFT JOIN auth.users au ON ls.user_id = au.id;

-- 학생이 자신의 레슨 정보를 볼 수 있도록 RLS 정책 추가
CREATE POLICY "Students can view their own lesson info"
  ON lesson_students FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Students can view their own schedules"
  ON lesson_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_students
      WHERE lesson_students.id = lesson_schedules.student_id
      AND lesson_students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own packages"
  ON lesson_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_students
      WHERE lesson_students.id = lesson_packages.student_id
      AND lesson_students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own lesson notes"
  ON lesson_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lesson_schedules
      JOIN lesson_students ON lesson_students.id = lesson_schedules.student_id
      WHERE lesson_schedules.id = lesson_notes.schedule_id
      AND lesson_students.user_id = auth.uid()
    )
  );

-- 프로필에 학생 역할 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT FALSE;

-- 학생으로 등록되면 자동으로 is_student 플래그 설정하는 트리거
CREATE OR REPLACE FUNCTION update_student_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles 
    SET is_student = TRUE 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_flag_on_insert
  AFTER INSERT ON lesson_students
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_student_flag();

CREATE TRIGGER update_student_flag_on_update
  AFTER UPDATE OF user_id ON lesson_students
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_student_flag();