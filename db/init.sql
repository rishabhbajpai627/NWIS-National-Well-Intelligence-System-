-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wells Table
CREATE TABLE wells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id VARCHAR(50) UNIQUE NOT NULL,
    well_name VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    field VARCHAR(100),
    operator VARCHAR(100),
    status VARCHAR(50),
    spud_date DATE,
    total_depth DOUBLE PRECISION,
    current_depth DOUBLE PRECISION,
    formation VARCHAR(100),
    well_type VARCHAR(50),
    trajectory_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX wells_geom_idx ON wells USING GIST (geom);

-- Well Trajectories
CREATE TABLE well_trajectories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    measured_depth DOUBLE PRECISION NOT NULL,
    true_vertical_depth DOUBLE PRECISION NOT NULL,
    inclination DOUBLE PRECISION,
    azimuth DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX trajectory_geom_idx ON well_trajectories USING GIST (geom);
CREATE INDEX trajectory_well_depth_idx ON well_trajectories(well_id, measured_depth);

-- Formations
CREATE TABLE formations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_name VARCHAR(100) NOT NULL,
    top_depth DOUBLE PRECISION NOT NULL,
    bottom_depth DOUBLE PRECISION NOT NULL,
    lithology VARCHAR(100),
    risk_profile TEXT
);

-- Drilling Events
CREATE TABLE drilling_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20),
    depth_start DOUBLE PRECISION NOT NULL,
    depth_end DOUBLE PRECISION NOT NULL,
    formation VARCHAR(100),
    description TEXT,
    cause TEXT,
    impact TEXT,
    mitigation TEXT,
    npt_hours DOUBLE PRECISION,
    source_document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX events_well_depth_idx ON drilling_events(well_id, depth_start, depth_end);
CREATE INDEX events_type_idx ON drilling_events(event_type);

-- Drilling Parameters
CREATE TABLE drilling_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    depth DOUBLE PRECISION NOT NULL,
    rop DOUBLE PRECISION,
    wob DOUBLE PRECISION,
    rpm DOUBLE PRECISION,
    torque DOUBLE PRECISION,
    standpipe_pressure DOUBLE PRECISION,
    flow_rate DOUBLE PRECISION,
    mud_weight DOUBLE PRECISION,
    pump_pressure DOUBLE PRECISION,
    hook_load DOUBLE PRECISION
);

-- Note: In production, drilling_parameters would be a hypertable in TimescaleDB
CREATE INDEX params_well_time_idx ON drilling_parameters(well_id, timestamp DESC);
CREATE INDEX params_well_depth_idx ON drilling_parameters(well_id, depth DESC);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    filename VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_status VARCHAR(50) DEFAULT 'PENDING',
    source VARCHAR(100),
    storage_path VARCHAR(255)
);

-- Document Chunks (for RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INTEGER,
    embedding VECTOR(384), -- Assuming SentenceTransformers all-MiniLM-L6-v2 which is 384d
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX chunks_embedding_idx ON document_chunks USING HNSW (embedding vector_cosine_ops);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    depth DOUBLE PRECISION NOT NULL,
    risk_score DOUBLE PRECISION,
    message TEXT NOT NULL,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE
);

CREATE INDEX alerts_well_time_idx ON alerts(well_id, created_at DESC);
CREATE INDEX alerts_unack_idx ON alerts(well_id) WHERE acknowledged = FALSE;

-- Risk Predictions
CREATE TABLE risk_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    depth DOUBLE PRECISION NOT NULL,
    risk_type VARCHAR(50) NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    severity VARCHAR(20) NOT NULL,
    top_contributing_factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX risk_well_depth_idx ON risk_predictions(well_id, depth DESC);

-- Create trigger to automatically update wells.geom based on latitude/longitude
CREATE OR REPLACE FUNCTION update_well_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_well_geom_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude ON wells
FOR EACH ROW
EXECUTE FUNCTION update_well_geom();
