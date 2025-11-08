import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Category from '../models/Category';
import { connectDatabase, disconnectDatabase } from '../config/database';

dotenv.config();

const categories = [
  {
    name: 'Sữa hạt',
    slug: 'sua-hat',
    image: 'https://via.placeholder.com/200x120/0C8242/FFFFFF?text=Sua+Hat',
    order: 1,
    isActive: true
  },
  {
    name: 'Combo tiết kiệm',
    slug: 'combo-tiet-kiem',
    image: 'https://via.placeholder.com/200x120/8DC63F/FFFFFF?text=Combo',
    order: 2,
    isActive: true
  },
  {
    name: 'Sản phẩm mới',
    slug: 'san-pham-moi',
    image: 'https://via.placeholder.com/200x120/0C8242/FFFFFF?text=San+Pham+Moi',
    order: 3,
    isActive: true
  },
  {
    name: 'Khuyến mãi',
    slug: 'khuyen-mai',
    image: 'https://via.placeholder.com/200x120/DC2626/FFFFFF?text=Khuyen+Mai',
    order: 4,
    isActive: true
  }
];

const products = [
  {
    name: 'Sữa Hạt Điều Nguyên Chất',
    slug: 'sua-hat-dieu-nguyen-chat',
    categoryId: null, // Will be set after categories are created
    price: 50000,
    salePrice: 35000,
    image: 'https://via.placeholder.com/400x400/0C8242/FFFFFF?text=Sua+Hat+Dieu',
    stock: 100,
    isActive: true,
    isFeatured: true,
    details: [
      {
        title: 'Mô tả sản phẩm',
        content: 'Sữa hạt điều 100% tự nhiên, không chất bảo quản, không đường hóa học.\n\n✅ Nguyên liệu: Hạt điều cao cấp, nước lọc, muối biển\n✅ Giàu protein, vitamin E\n✅ Tốt cho tim mạch\n✅ Không lactose, phù hợp người ăn chay\n✅ Hương vị thơm ngon, béo ngậy tự nhiên'
      },
      {
        title: 'Thành phần dinh dưỡng (250ml)',
        content: '📊 Năng lượng: 150 kcal\n🥛 Protein: 5g\n🍚 Carbohydrate: 18g\n🥑 Chất béo: 6g\n🌾 Chất xơ: 2g\n🧂 Natri: 50mg\n\n💪 Vitamin E: 20% nhu cầu hàng ngày\n💪 Magie: 15% nhu cầu hàng ngày'
      },
      {
        title: 'Hướng dẫn sử dụng',
        content: '🔸 Lắc đều trước khi sử dụng\n🔸 Dùng ngay sau khi mở nắp\n🔸 Bảo quản nơi khô ráo, thoáng mát\n🔸 Sau khi mở, bảo quản trong tủ lạnh và sử dụng trong 2-3 ngày\n🔸 Uống lạnh hoặc làm nóng đều ngon\n\n⚠️ Lưu ý: Không dùng cho người dị ứng hạt điều'
      }
    ],
    sizes: ['250ml', '500ml', '1L'],
    variants: [
      { id: 1, size: '250ml', price: 50000, salePrice: 35000 },
      { id: 2, size: '500ml', price: 60000, salePrice: 55000 },
      { id: 3, size: '1L', price: 110000, salePrice: 100000 }
    ]
  },
  {
    name: 'Sữa Hạt Hạnh Nhân',
    slug: 'sua-hat-hanh-nhan',
    categoryId: null,
    price: 55000,
    salePrice: 40000,
    image: 'https://via.placeholder.com/400x400/0C8242/FFFFFF?text=Sua+Hat+Hanh+Nhan',
    stock: 100,
    isActive: true,
    isFeatured: true,
    details: [
      {
        title: 'Mô tả sản phẩm',
        content: 'Sữa hạt hạnh nhân thơm ngon, bổ dưỡng, giàu vitamin E và canxi.\n\n✅ Nguyên liệu: Hạt hạnh nhân Mỹ, nước lọc\n✅ Giàu vitamin E, tốt cho da\n✅ Canxi cao, tốt cho xương\n✅ Ít calo, phù hợp giảm cân\n✅ Hương vị nhẹ nhàng, dễ uống'
      }
    ],
    sizes: ['250ml', '500ml', '1L']
  },
  {
    name: 'Sữa Hạt Óc Chó',
    slug: 'sua-hat-oc-cho',
    categoryId: null,
    price: 60000,
    salePrice: 45000,
    image: 'https://via.placeholder.com/400x400/0C8242/FFFFFF?text=Sua+Hat+Oc+Cho',
    stock: 80,
    isActive: true,
    isFeatured: true,
    details: [
      {
        title: 'Mô tả sản phẩm',
        content: 'Sữa hạt óc chó giàu Omega-3, tốt cho não bộ và trí nhớ.\n\n✅ Hạt óc chó cao cấp\n✅ Giàu Omega-3, DHA\n✅ Tốt cho não bộ, trí nhớ\n✅ Chống lão hóa\n✅ Tăng cường sức khỏe tim mạch'
      }
    ],
    sizes: ['250ml', '500ml']
  },
  {
    name: 'Combo 5 Vị Hạt 250ml',
    slug: 'combo-5-vi-hat-250ml',
    categoryId: null, // categoryId 2 - Combo tiết kiệm
    price: 200000,
    salePrice: 160000,
    image: 'https://via.placeholder.com/400x400/8DC63F/FFFFFF?text=Combo+5+Vi',
    stock: 50,
    isActive: true,
    isFeatured: true,
    details: [
      {
        title: 'Mô tả combo',
        content: 'Combo 5 vị sữa hạt đa dạng, tiết kiệm 20%!\n\n📦 Gồm 5 chai 250ml:\n• 1 chai Sữa Hạt Điều\n• 1 chai Sữa Hạt Hạnh Nhân\n• 1 chai Sữa Hạt Óc Chó\n• 1 chai Sữa Hạt Mắc Ca\n• 1 chai Sữa Hạt Sen\n\n✅ Tiết kiệm 40.000đ so với mua lẻ\n✅ Đa dạng hương vị\n✅ Đủ dinh dưỡng cho cả tuần'
      }
    ],
    sizes: ['Combo 5 chai']
  }
];

async function seed() {
  try {
    console.log('🌱 Starting seed process...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Insert categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Map category names to IDs
    const categoryMap: any = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Update products with category IDs
    products.forEach(product => {
      if (product.name.includes('Combo')) {
        product.categoryId = categoryMap['Combo tiết kiệm'];
      } else {
        product.categoryId = categoryMap['Sữa hạt'];
      }
    });

    // Insert products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);

    // Disconnect
    await disconnectDatabase();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
