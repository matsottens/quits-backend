-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('price_increase', 'renewal_reminder')),
    provider TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB NOT NULL,
    CONSTRAINT valid_details CHECK (
        (type = 'price_increase' AND details ? 'oldPrice' AND details ? 'newPrice' AND details ? 'percentageChange') OR
        (type = 'renewal_reminder' AND details ? 'renewal_date' AND details ? 'days_until_renewal' AND details ? 'price' AND details ? 'frequency')
    )
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    price_change_threshold INTEGER DEFAULT 5 CHECK (price_change_threshold BETWEEN 1 AND 100),
    renewal_reminder_days INTEGER DEFAULT 7 CHECK (renewal_reminder_days BETWEEN 1 AND 30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_prices table
CREATE TABLE IF NOT EXISTS subscription_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('email', 'manual')),
    details JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_subscription_prices_subscription_id ON subscription_prices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_prices_detected_at ON subscription_prices(detected_at);

-- Create function to update notification_settings updated_at
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification_settings
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_settings_updated_at();

-- Create RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_prices ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view their own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON notification_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
    ON notification_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Subscription prices policies
CREATE POLICY "Users can view their own subscription prices"
    ON subscription_prices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM subscriptions
            WHERE subscriptions.id = subscription_prices.subscription_id
            AND subscriptions.user_id = auth.uid()
        )
    ); 