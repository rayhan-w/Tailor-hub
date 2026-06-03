-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Portfolio bucket policies
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Tailors can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND 
    EXISTS (SELECT 1 FROM public.tailors WHERE user_id = auth.uid())
);
CREATE POLICY "Tailors can delete their portfolio images" ON storage.objects FOR DELETE USING (
    bucket_id = 'portfolio' AND 
    EXISTS (SELECT 1 FROM public.tailors WHERE user_id = auth.uid())
);

-- Design images bucket policies
CREATE POLICY "Design images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'designs');
CREATE POLICY "Users can upload design images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'designs' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their design images" ON storage.objects FOR DELETE USING (bucket_id = 'designs' AND auth.uid() IS NOT NULL);

-- Avatar bucket policies
CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);