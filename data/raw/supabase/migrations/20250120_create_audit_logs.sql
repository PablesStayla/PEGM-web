-- Create audit_logs table for security event tracking
-- SOTA implementation with RLS policies

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45), -- IPv6 max length
  user_agent TEXT,
  resource VARCHAR(255),
  action VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address) WHERE ip_address IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX idx_audit_logs_user_event ON audit_logs(user_id, event_type, created_at DESC) WHERE user_id IS NOT NULL;

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Partition table by month for better performance (optional, for high-volume)
-- This can be enabled later if audit logs grow significantly

-- Create function to auto-delete old audit logs (retention policy)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete audit logs older than 2 years (adjust as needed)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$;

-- Schedule deletion (requires pg_cron extension - enable in Supabase dashboard)
-- SELECT cron.schedule('delete-old-audit-logs', '0 2 * * 0', 'SELECT delete_old_audit_logs()');

COMMENT ON TABLE audit_logs IS 'Security audit log for tracking all security-related events';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of security event (login_success, login_failed, etc.)';
COMMENT ON COLUMN audit_logs.severity IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional event-specific data stored as JSON';
