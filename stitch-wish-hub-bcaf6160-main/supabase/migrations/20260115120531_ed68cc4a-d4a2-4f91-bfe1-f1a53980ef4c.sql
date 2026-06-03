-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'tailor', 'customer');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'in_progress', 'ready', 'delivered', 'cancelled');

-- Create enum for garment types
CREATE TYPE public.garment_type AS ENUM ('traditional', 'western_formal', 'bridal_wedding', 'alterations');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tailors table
CREATE TABLE public.tailors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    shop_name TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    specialties garment_type[] DEFAULT '{}',
    rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tailor_pricing table
CREATE TABLE public.tailor_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID REFERENCES public.tailors(id) ON DELETE CASCADE NOT NULL,
    garment_type garment_type NOT NULL,
    garment_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tailor_portfolio table
CREATE TABLE public.tailor_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID REFERENCES public.tailors(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    garment_type garment_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tailor_deals table
CREATE TABLE public.tailor_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id UUID REFERENCES public.tailors(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create customer_measurements table
CREATE TABLE public.customer_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    measurement_name TEXT DEFAULT 'Default' NOT NULL,
    chest DECIMAL(5, 2),
    waist DECIMAL(5, 2),
    hips DECIMAL(5, 2),
    shoulder_width DECIMAL(5, 2),
    arm_length DECIMAL(5, 2),
    inseam DECIMAL(5, 2),
    neck DECIMAL(5, 2),
    thigh DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tailor_id UUID REFERENCES public.tailors(id) ON DELETE CASCADE NOT NULL,
    garment_type garment_type NOT NULL,
    garment_name TEXT NOT NULL,
    description TEXT,
    design_images TEXT[] DEFAULT '{}',
    measurement_id UUID REFERENCES public.customer_measurements(id),
    status order_status DEFAULT 'pending' NOT NULL,
    price DECIMAL(10, 2),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tailor_id UUID REFERENCES public.tailors(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailor_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update tailor rating
CREATE OR REPLACE FUNCTION public.update_tailor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.tailors
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.reviews
        WHERE tailor_id = NEW.tailor_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE tailor_id = NEW.tailor_id
    )
    WHERE id = NEW.tailor_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for review updates
CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_tailor_rating();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tailors_updated_at BEFORE UPDATE ON public.tailors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tailor_pricing_updated_at BEFORE UPDATE ON public.tailor_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_measurements_updated_at BEFORE UPDATE ON public.customer_measurements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tailors policies
CREATE POLICY "Anyone can view tailors" ON public.tailors FOR SELECT USING (true);
CREATE POLICY "Tailors can update their own shop" ON public.tailors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tailors can insert their own shop" ON public.tailors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tailors" ON public.tailors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tailor pricing policies
CREATE POLICY "Anyone can view pricing" ON public.tailor_pricing FOR SELECT USING (true);
CREATE POLICY "Tailors can manage their pricing" ON public.tailor_pricing FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tailors WHERE id = tailor_id AND user_id = auth.uid())
);

-- Tailor portfolio policies
CREATE POLICY "Anyone can view portfolios" ON public.tailor_portfolio FOR SELECT USING (true);
CREATE POLICY "Tailors can manage their portfolio" ON public.tailor_portfolio FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tailors WHERE id = tailor_id AND user_id = auth.uid())
);

-- Tailor deals policies
CREATE POLICY "Anyone can view active deals" ON public.tailor_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Tailors can manage their deals" ON public.tailor_deals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tailors WHERE id = tailor_id AND user_id = auth.uid())
);

-- Customer measurements policies
CREATE POLICY "Users can view their own measurements" ON public.customer_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own measurements" ON public.customer_measurements FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Tailors can view their orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tailors WHERE id = tailor_id AND user_id = auth.uid())
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Tailors can update their orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tailors WHERE id = tailor_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews for their orders" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid() AND status = 'delivered')
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;