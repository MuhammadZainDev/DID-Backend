-- Create Database (Run this separately before the other commands)
-- CREATE DATABASE DuaonAIDB;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Duas Table
CREATE TABLE IF NOT EXISTS duas (
  id SERIAL PRIMARY KEY,
  subcategory_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  arabic_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  transliteration TEXT,
  urdu_translation TEXT,
  reference TEXT,
  benefit TEXT,
  favorited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  dua_id INTEGER NOT NULL,
  subcategory_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, dua_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dua_id) REFERENCES duas(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Insert Categories
INSERT INTO categories (name, description, icon) VALUES 
('Morning & Evening', 'Duas for morning and evening remembrance', 'sunrise'),
('Prayer', 'Duas related to salah (prayer)', 'prayer'),
('Quran', 'Duas from the Holy Quran', 'book'),
('Eating & Drinking', 'Duas for before and after meals', 'utensils'),
('Home', 'Duas related to home and family', 'home'),
('Travel', 'Duas for travel and journey', 'plane'),
('Protection', 'Duas for seeking protection', 'shield'),
('Forgiveness', 'Duas asking for forgiveness', 'handshake'),
('Hardship', 'Duas for times of difficulty', 'mountain');

-- Insert Subcategories
INSERT INTO subcategories (category_id, name, description, icon) VALUES 
(1, 'Morning Duas', 'Duas to recite in the morning', 'sun'),
(1, 'Evening Duas', 'Duas to recite in the evening', 'moon'),
(2, 'Before Prayer', 'Duas before performing salah', 'prayer-rug'),
(2, 'During Prayer', 'Duas recited during salah', 'praying'),
(2, 'After Prayer', 'Duas after completing salah', 'tasbih'),
(3, 'Quranic Supplications', 'Supplications from the Quran', 'quran'),
(4, 'Before Eating', 'Duas before meals', 'plate'),
(4, 'After Eating', 'Duas after meals', 'plate-check'),
(5, 'Entering Home', 'Duas when entering home', 'door-open'),
(5, 'Leaving Home', 'Duas when leaving home', 'door-closed'),
(6, 'Starting Journey', 'Duas for beginning travel', 'car'),
(6, 'During Journey', 'Duas while traveling', 'road'),
(7, 'General Protection', 'Duas for protection from harm', 'shield-check'),
(7, 'Protection from Evil', 'Duas seeking refuge from evil', 'eye-slash'),
(8, 'Seeking Forgiveness', 'Duas asking Allah for forgiveness', 'praying-hands'),
(9, 'Anxiety & Distress', 'Duas for relief from worry', 'heart-pulse');

-- Insert Sample Duas
INSERT INTO duas (subcategory_id, name, arabic_text, translation, transliteration, urdu_translation, reference, benefit) VALUES
-- Morning Duas
(1, 'Morning Remembrance', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner', 'Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallah wahdahu la shareeka lah', 'ہم نے صبح کی اور تمام بادشاہی اللہ کے لیے ہوگئی اور تمام تعریف اللہ کے لیے ہے۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں', 'Abu Dawud 4/317', 'Protection throughout the day'),

-- Evening Duas
(2, 'Evening Remembrance', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلاَّ اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner', 'Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallah wahdahu la shareeka lah', 'ہم نے شام کی اور تمام بادشاہی اللہ کے لیے ہوگئی اور تمام تعریف اللہ کے لیے ہے۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں', 'Muslim 4/2088', 'Protection throughout the night'),

-- Before Prayer
(3, 'Entering Mosque', 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', 'O Allah, open the gates of Your mercy for me', 'Allahumma iftah li abwaba rahmatika', 'اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے', 'Muslim 1/494', 'Receives mercy upon entering the mosque'),

-- During Prayer
(4, 'Opening Supplication', 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلاَ إِلَهَ غَيْرُكَ', 'Glory is to You, O Allah, and praise is to You. Blessed is Your name, and exalted is Your majesty. There is no god but You', 'Subhanakal-lahumma wa bihamdika, wa tabarakas-muka, wa ta''ala jadduka, wa la ilaha ghairuka', 'اے اللہ! تیری ذات پاک ہے اور تیری تعریف کے ساتھ، تیرا نام برکت والا ہے اور تیری شان بلند ہے، تیرے سوا کوئی معبود نہیں', 'Abu Dawud, Tirmidhi', 'The sins fall away like leaves from a tree'),

-- Before Eating
(7, 'Before Meal', 'بِسْمِ اللهِ', 'In the name of Allah', 'Bismillah', 'اللہ کے نام سے', 'Bukhari', 'Blessing in food and protection from harm'),

-- Entering Home
(9, 'Entering Home', 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا', 'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend', 'Bismillahi walajna, wa bismillahi kharajna, wa ''ala rabbina tawakkalna', 'اللہ کے نام سے ہم داخل ہوئے، اللہ کے نام سے ہم نکلے، اور اپنے رب پر ہم نے بھروسہ کیا', 'Abu Dawud 4/325', 'Protection for home and family'),

-- Seeking Forgiveness
(15, 'Master of Forgiveness', 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins but You', 'Allahumma anta rabbi, la ilaha illa anta, khalaqtani wa ana ''abduka, wa ana ''ala ''ahdika wa wa''dika mastata''tu, a''udhu bika min sharri ma sana''tu, abu''u laka bini''matika ''alayya, wa abu''u laka bidhanbi faghfir li, fa innahu la yaghfirudh-dhunuba illa anta', 'اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، اور میں اپنی طاقت کے مطابق تیرے عہد اور وعدے پر قائم ہوں، میں تیری پناہ چاہتا ہوں اپنے کیے ہوئے اعمال کی برائی سے، میں تیری نعمتوں کا اقرار کرتا ہوں جو تو نے مجھ پر کی ہیں اور اپنے گناہوں کا بھی اقرار کرتا ہوں، پس مجھے بخش دے کیونکہ تیرے سوا کوئی گناہوں کو نہیں بخشتا', 'Bukhari 7/150', 'If said with conviction during the day and one dies that day before evening, they will be among the people of Paradise');

-- Sample query to get all duas with their subcategory and category information
-- SELECT d.id, d.name, d.arabic_text, d.translation, d.urdu_translation, 
--        s.name as subcategory_name, c.name as category_name
-- FROM duas d
-- JOIN subcategories s ON d.subcategory_id = s.id
-- JOIN categories c ON s.category_id = c.id
-- ORDER BY c.id, s.id, d.id;

-- Sample query to get a user's favorite duas
-- SELECT d.id, d.name, d.arabic_text, d.translation, d.urdu_translation, 
--        s.name as subcategory_name, c.name as category_name
-- FROM favorites f
-- JOIN duas d ON f.dua_id = d.id
-- JOIN subcategories s ON d.subcategory_id = s.id
-- JOIN categories c ON s.category_id = c.id
-- WHERE f.user_id = 1
-- ORDER BY f.created_at DESC; 