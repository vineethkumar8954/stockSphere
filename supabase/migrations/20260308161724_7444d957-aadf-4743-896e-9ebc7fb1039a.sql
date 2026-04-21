
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);

-- Function to auto-update product quantity on transaction and create low stock notifications
CREATE OR REPLACE FUNCTION public.handle_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_qty INTEGER;
  product_name TEXT;
  product_reorder INTEGER;
  new_qty INTEGER;
BEGIN
  SELECT quantity, name, reorder_level INTO current_qty, product_name, product_reorder
  FROM public.products WHERE id = NEW.product_id;

  IF NEW.transaction_type = 'IN' THEN
    new_qty := current_qty + NEW.quantity;
  ELSIF NEW.transaction_type = 'OUT' THEN
    IF current_qty < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_qty, NEW.quantity;
    END IF;
    new_qty := current_qty - NEW.quantity;
  END IF;

  UPDATE public.products SET quantity = new_qty WHERE id = NEW.product_id;

  -- Create low stock notification
  IF new_qty <= product_reorder AND new_qty > 0 THEN
    INSERT INTO public.notifications (message, type)
    VALUES (product_name || ' stock is low (' || new_qty || ' remaining)', 'warning');
  ELSIF new_qty = 0 THEN
    INSERT INTO public.notifications (message, type)
    VALUES (product_name || ' is now out of stock!', 'danger');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction();

-- Indexes
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_transactions_product ON public.transactions(product_id);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_notifications_read ON public.notifications(read);
