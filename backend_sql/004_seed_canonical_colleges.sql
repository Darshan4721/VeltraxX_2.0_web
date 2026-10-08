-- ==============================================================================
-- VELTRAXX 2.0 - CANONICAL COLLEGES SEED DATA
-- Migration: 004_seed_canonical_colleges.sql
-- Description: Pre-populates the canonical colleges directory with host institute
--              (SIET) and prominent Tamil Nadu / Coimbatore institutions to eliminate
--              spelling fragmentation.
-- ==============================================================================

INSERT INTO colleges (canonical_name, city, state) VALUES
-- Host Institution
('Sri Shakthi Institute of Engineering and Technology (SIET)', 'Coimbatore', 'Tamil Nadu'),

-- Coimbatore Regional Institutions
('PSG College of Technology', 'Coimbatore', 'Tamil Nadu'),
('PSG Institute of Technology and Applied Research (PSG iTech)', 'Coimbatore', 'Tamil Nadu'),
('Coimbatore Institute of Technology (CIT)', 'Coimbatore', 'Tamil Nadu'),
('Government College of Technology (GCT)', 'Coimbatore', 'Tamil Nadu'),
('Kumaraguru College of Technology (KCT)', 'Coimbatore', 'Tamil Nadu'),
('Sri Krishna College of Engineering and Technology (SKCET)', 'Coimbatore', 'Tamil Nadu'),
('Sri Krishna College of Technology (SKCT)', 'Coimbatore', 'Tamil Nadu'),
('Amrita Vishwa Vidyapeetham', 'Coimbatore', 'Tamil Nadu'),
('Karunya Institute of Technology and Sciences', 'Coimbatore', 'Tamil Nadu'),
('Dr. Mahalingam College of Engineering and Technology (MCET)', 'Pollachi', 'Tamil Nadu'),
('Bannari Amman Institute of Technology (BIT)', 'Sathyamangalam', 'Tamil Nadu'),
('Kongu Engineering College', 'Perundurai', 'Tamil Nadu'),
('KPR Institute of Engineering and Technology', 'Coimbatore', 'Tamil Nadu'),
('SNS College of Technology', 'Coimbatore', 'Tamil Nadu'),
('Hindusthan College of Engineering and Technology', 'Coimbatore', 'Tamil Nadu'),
('Karpagam College of Engineering', 'Coimbatore', 'Tamil Nadu'),

-- Key State & National Engineering Premier Institutes
('Indian Institute of Technology Madras (IIT Madras)', 'Chennai', 'Tamil Nadu'),
('National Institute of Technology Tiruchirappalli (NIT Trichy)', 'Tiruchirappalli', 'Tamil Nadu'),
('College of Engineering Guindy (Anna University CEG)', 'Chennai', 'Tamil Nadu'),
('Madras Institute of Technology (Anna University MIT)', 'Chennai', 'Tamil Nadu'),
('Vellore Institute of Technology (VIT)', 'Vellore', 'Tamil Nadu'),
('SRM Institute of Science and Technology', 'Chennai', 'Tamil Nadu'),
('SSN College of Engineering', 'Chennai', 'Tamil Nadu'),
('Thiagarajar College of Engineering (TCE)', 'Madurai', 'Tamil Nadu'),
('SASTRA Deemed University', 'Thanjavur', 'Tamil Nadu'),
('Government College of Engineering Salem', 'Salem', 'Tamil Nadu'),
('Government College of Engineering Bargur', 'Bargur', 'Tamil Nadu')

ON CONFLICT (canonical_name) DO NOTHING;
