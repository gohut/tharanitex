-- Existing orders receive the safe COD default while new checkout orders
-- persist the payment method selected by the customer.
ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'COD';
