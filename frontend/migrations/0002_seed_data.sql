-- Migration number: 0002 	 2026-07-31T18:38:49.449Z
INSERT INTO categories (name, slug, image_url)
VALUES
('Silk Sarees','silk-sarees','/assets/categories/silk.jpg'),
('Cotton Sarees','cotton-sarees','/assets/categories/cotton.jpg'),
('Wedding Collection','wedding','/assets/categories/wedding.jpg');

INSERT INTO products
(category_id,name,slug,description,price,stock,featured)
VALUES
(1,'Banarasi Silk Saree','banarasi-silk-saree','Premium Banarasi Silk Saree',2999,20,1),

(1,'Kanchipuram Silk Saree','kanchipuram-silk-saree','Traditional Kanchipuram Silk Saree',4599,15,1),

(2,'Chettinad Cotton Saree','chettinad-cotton-saree','Pure Cotton Saree',1799,25,0),

(3,'Bridal Designer Saree','bridal-designer-saree','Wedding Collection',6999,8,1);

INSERT INTO product_images(product_id,image_url)
VALUES
(1,'/assets/products/product1.jpg'),
(2,'/assets/products/product2.jpg'),
(3,'/assets/products/product3.jpg'),
(4,'/assets/products/product4.jpg');