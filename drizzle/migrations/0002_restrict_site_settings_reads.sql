-- Restrict site_settings reads to admins. The app does not read this table
-- from the client, and it stores contact details that should not be public.
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Admins can view site settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
