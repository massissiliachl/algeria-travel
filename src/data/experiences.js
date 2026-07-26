export const ACCOMMODATIONS = [
  { id: 1, name: 'El Aurassi', type: 'hotel', type_en: 'Hotel', type_ar: 'فندق', location: 'Alger', location_en: 'Algiers', location_ar: 'الجزائر', price: 18000, rating: 4.8, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', amenities: ['Wifi', 'Spa', 'Piscine'] },
  { id: 2, name: 'Dar M\'Zab', type: 'guesthouse', type_en: 'Guest House', type_ar: 'دار ضيافة', location: 'Ghardaïa', location_en: 'Ghardaïa', location_ar: 'غرداية', price: 8500, rating: 4.9, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', amenities: ['Petit-déj', 'Terrasse', 'Guide'] },
  { id: 3, name: 'Camp Sahara Premium', type: 'desert', type_en: 'Desert Camp', type_ar: 'مخيم صحراوي', location: 'Djanet', location_en: 'Djanet', location_ar: 'جانت', price: 22000, rating: 5.0, image: 'https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-560126657.jpg?c=original', amenities: ['Bivouac', '4x4', 'Repas'] },
  { id: 4, name: 'Villa Méditerranée', type: 'villa', type_en: 'Villa', type_ar: 'فيلا', location: 'Béjaïa', location_en: 'Béjaïa', location_ar: 'بجاية', price: 25000, rating: 4.7, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80', amenities: ['Vue mer', 'Piscine', 'Cuisine'] },
  { id: 5, name: 'Eco Lodge Kabylie', type: 'eco', type_en: 'Eco Lodge', type_ar: 'نُزل بيئي', location: 'Tizi Ouzou', location_en: 'Tizi Ouzou', location_ar: 'تيزي وزو', price: 12000, rating: 4.8, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', amenities: ['Nature', 'Randonnée', 'Bio'] },
  { id: 6, name: 'Résidence Oran Bay', type: 'apartment', type_en: 'Apartment', type_ar: 'شقة', location: 'Oran', location_en: 'Oran', location_ar: 'وهران', price: 9500, rating: 4.6, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', amenities: ['Wifi', 'Parking', 'Cuisine'] },
];

export const TRAVEL_STORIES = [
  { id: 1, title: 'Les trésors cachés du Tassili', title_en: 'Hidden treasures of Tassili', title_ar: 'كنوز تاسيلي المخفية', excerpt: 'Un voyage photographique au cœur des gravures millénaires.', excerpt_en: 'A photographic journey through millennia-old engravings.', excerpt_ar: 'رحلة تصويرية في قلب النقوش الأثرية.', category: 'Photographie', category_en: 'Photography', category_ar: 'تصوير', date: '12 Mars 2026', date_en: 'March 12, 2026', date_ar: '12 مارس 2026', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0zN9XuJEhMuuosMwDbWxfkCyikBakJBMIQ&s' },
  { id: 2, title: 'Guide des plages de Jijel', title_en: 'Guide to Jijel beaches', title_ar: 'دليل شواطئ جيجل', excerpt: 'Criques secrètes et eaux cristallines de la Petite Kabylie.', excerpt_en: 'Secret coves and crystal waters of Little Kabylia.', excerpt_ar: 'خلجان سرية ومياه صافية في القبائل الصغرى.', category: 'Conseils', category_en: 'Tips', category_ar: 'نصائح', date: '5 Mars 2026', date_en: 'March 5, 2026', date_ar: '5 مارس 2026', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { id: 3, title: 'La cuisine algérienne authentique', title_en: 'Authentic Algerian cuisine', title_ar: 'المطبخ الجزائري الأصيل', excerpt: 'Couscous, chorba, makroud — un voyage gustatif.', excerpt_en: 'Couscous, chorba, makroud — a culinary journey.', excerpt_ar: 'كسكس، شوربة، مقروض — رحلة ذوقية.', category: 'Culture', category_en: 'Culture', category_ar: 'ثقافة', date: '25 Fév 2026', date_en: 'Feb 25, 2026', date_ar: '25 فبراير 2026', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80' },
];

export const REVIEWS = [
  { id: 1, name: 'Sophie M.', country: 'France', country_en: 'France', country_ar: 'فرنسا', rating: 5, text: 'Le Tassili a dépassé toutes mes attentes. Une organisation parfaite du début à la fin.', text_en: 'Tassili exceeded all my expectations. Perfect organization from start to finish.', text_ar: 'تجاوز تاسيلي كل توقعاتي. تنظيم مثالي من البداية إلى النهاية.', photo: 'S', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0zN9XuJEhMuuosMwDbWxfkCyikBakJBMIQ&s' },
  { id: 2, name: 'James K.', country: 'Royaume-Uni', country_en: 'United Kingdom', country_ar: 'المملكة المتحدة', rating: 5, text: 'Constantine and its bridges are absolutely breathtaking. Algeria is underrated.', text_en: 'Constantine and its bridges are absolutely breathtaking. Algeria is underrated.', text_ar: 'قسنطينة وجسورها مذهلة. الجزائر بلد لا يُقدَّر بحقه.', photo: 'J', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80' },
  { id: 3, name: 'Amina B.', country: 'Algérie', country_en: 'Algeria', country_ar: 'الجزائر', rating: 5, text: 'Béjaïa m\'a rappelé pourquoi j\'aime mon pays. Des paysages à couper le souffle.', text_en: 'Béjaïa reminded me why I love my country. Breathtaking landscapes.', text_ar: 'بجاية ذكّرتني لماذا أحب بلدي. مناظر خلابة.', photo: 'A', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
];

export const GALLERY_IMAGES = [
  '/images/galery.jpg',
  '/images/sahara1.jpeg',
  '/images/quad.jpg',
  '/images/chameau.jpg',
  '/images/kayak.jpeg',
  '/images/quatre-quatre.jpg',
  '/images/visitekseurs.webp',
  '/images/sahara4.jpeg',
];
