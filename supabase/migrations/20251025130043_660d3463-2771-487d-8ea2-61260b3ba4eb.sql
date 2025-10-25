-- Create enum for storage unit status
CREATE TYPE storage_status AS ENUM ('active', 'inactive', 'maintenance');

-- Create enum for produce types
CREATE TYPE produce_type AS ENUM ('vegetables', 'fruits', 'grains', 'dairy', 'other');

-- Create enum for alert severity
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- Create enum for batch status
CREATE TYPE batch_status AS ENUM ('in_storage', 'in_transit', 'delivered', 'spoiled');

-- Storage units table
CREATE TABLE storage_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity_kg NUMERIC NOT NULL,
  current_load_kg NUMERIC DEFAULT 0,
  status storage_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produce batches table
CREATE TABLE produce_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE CASCADE,
  produce_name TEXT NOT NULL,
  produce_type produce_type NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  harvest_date DATE NOT NULL,
  expected_shelf_life_days INTEGER NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  farmer_name TEXT NOT NULL,
  farmer_contact TEXT NOT NULL,
  status batch_status DEFAULT 'in_storage',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE CASCADE NOT NULL,
  temperature_celsius NUMERIC NOT NULL,
  humidity_percent NUMERIC NOT NULL,
  weight_kg NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Market prices table
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produce_name TEXT NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  market_name TEXT NOT NULL,
  location TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Transport requests table
CREATE TABLE transport_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES produce_batches(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  transport_date DATE NOT NULL,
  vehicle_type TEXT,
  driver_name TEXT,
  driver_contact TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES produce_batches(id) ON DELETE CASCADE,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for MVP - can be restricted later with auth)
CREATE POLICY "Allow public read access on storage_units" ON storage_units FOR SELECT USING (true);
CREATE POLICY "Allow public insert on storage_units" ON storage_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on storage_units" ON storage_units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on storage_units" ON storage_units FOR DELETE USING (true);

CREATE POLICY "Allow public read access on produce_batches" ON produce_batches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on produce_batches" ON produce_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on produce_batches" ON produce_batches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on produce_batches" ON produce_batches FOR DELETE USING (true);

CREATE POLICY "Allow public read access on sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sensor_readings" ON sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on sensor_readings" ON sensor_readings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on sensor_readings" ON sensor_readings FOR DELETE USING (true);

CREATE POLICY "Allow public read access on market_prices" ON market_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert on market_prices" ON market_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on market_prices" ON market_prices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on market_prices" ON market_prices FOR DELETE USING (true);

CREATE POLICY "Allow public read access on transport_requests" ON transport_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on transport_requests" ON transport_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on transport_requests" ON transport_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on transport_requests" ON transport_requests FOR DELETE USING (true);

CREATE POLICY "Allow public read access on alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on alerts" ON alerts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on alerts" ON alerts FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_storage_units_updated_at
  BEFORE UPDATE ON storage_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produce_batches_updated_at
  BEFORE UPDATE ON produce_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sensor_readings_storage_unit ON sensor_readings(storage_unit_id);
CREATE INDEX idx_sensor_readings_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX idx_produce_batches_storage_unit ON produce_batches(storage_unit_id);
CREATE INDEX idx_produce_batches_status ON produce_batches(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_read ON alerts(is_read);
CREATE INDEX idx_market_prices_recorded_at ON market_prices(recorded_at DESC);