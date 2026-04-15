-- 1. Create the TRIPS table
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  imageUrl TEXT,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  budget NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  travelerType TEXT,
  travelerCount INTEGER DEFAULT 1,
  status TEXT DEFAULT 'planning',
  expenses JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies
-- Users can only see their own trips
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own trips
CREATE POLICY "Users can create their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own trips
CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own trips
CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable realtime for the trips table (optional but helpful)
-- ALTER PUBLICATION supabase_realtime ADD TABLE trips;
