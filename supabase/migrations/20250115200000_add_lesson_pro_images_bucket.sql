-- 레슨프로 이미지 저장을 위한 Storage 버킷 생성
-- Supabase Dashboard에서 실행하거나 CLI로 적용

-- Storage 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-pro-images', 'lesson-pro-images', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 읽기 가능
CREATE POLICY "Lesson pro images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-pro-images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload lesson pro images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lesson-pro-images');

-- 본인이 업로드한 이미지만 삭제 가능
CREATE POLICY "Users can delete own lesson pro images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-pro-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
