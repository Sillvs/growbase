-- Row Level Security Policies for users table

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert their own data
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);