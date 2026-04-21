
-- Allow anonymous access to all tables so the app works before auth is implemented
CREATE POLICY "Anon can view categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert categories" ON public.categories FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update categories" ON public.categories FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete categories" ON public.categories FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can view suppliers" ON public.suppliers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert suppliers" ON public.suppliers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update suppliers" ON public.suppliers FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete suppliers" ON public.suppliers FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can view products" ON public.products FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert products" ON public.products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update products" ON public.products FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can delete products" ON public.products FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can view transactions" ON public.transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert transactions" ON public.transactions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can view notifications" ON public.notifications FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert notifications" ON public.notifications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update notifications" ON public.notifications FOR UPDATE TO anon USING (true);
