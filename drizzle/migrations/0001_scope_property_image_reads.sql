DROP POLICY IF EXISTS "Anyone can read property images" ON storage.objects;
CREATE POLICY "Anyone can read published property images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'property-images'
  AND EXISTS (
    SELECT 1
    FROM public.property_images AS pi
    JOIN public.properties AS p ON p.id = pi.property_id
    WHERE pi.path = name
      AND p.published = true
  )
);