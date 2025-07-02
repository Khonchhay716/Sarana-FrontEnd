// src/utils/data.ts

// Import your local images here. Adjust paths if your assets folder is structured differently.
// import espressoImage from '../assets/espresso.jpg';
// import cappuccinoImage from '../assets/cappuccino.jpg';
// import latteImage from '../assets/latte.jpg';
// import mochaImage from '../assets/mocha.jpg';
// import americanoImage from '../assets/americano.jpg';
// import macchiatoImage from '../assets/macchiato.jpg';
// import coldBrewImage from '../assets/cold-brew.jpg';
// import icedLatteImage from '../assets/iced-latte.jpg';
// import flatWhiteImage from '../assets/flat-white.jpg';
// import turkishCoffeeImage from '../assets/turkish-coffee.jpg';
// import croissantImage from '../assets/croissant.jpg';
// import muffinImage from '../assets/muffin.jpg';
// import cookieImage from '../assets/cookie.jpg';

import image from '../../assets/image.png';


// TypeScript Interfaces (moved here for shared access)
export interface MenuItem {
  id: number;
  title: string;
  price: number;
  image: string; // This will now hold the imported image path
}

// Mock Datas (Coffee Menu)
// export const coffeeMenus: MenuItem[] = [
//   { id: '101', name: 'Espresso', price: 2.5, image: espressoImage },
//   { id: '102', name: 'Cappuccino', price: 3.0, image: cappuccinoImage },
//   { id: '103', name: 'Latte', price: 3.5, image: latteImage },
//   { id: '104', name: 'Mocha', price: 4.0, image: mochaImage },
//   { id: '105', name: 'Americano', price: 2.75, image: americanoImage },
//   { id: '106', name: 'Macchiato', price: 3.25, image: macchiatoImage },
//   { id: '107', name: 'Cold Brew', price: 4.5, image: coldBrewImage },
//   { id: '108', name: 'Iced Latte', price: 4.0, image: icedLatteImage },
//   { id: '109', name: 'Flat White', price: 3.75, image: flatWhiteImage },
//   { id: '110', name: 'Turkish Coffee', price: 3.0, image: turkishCoffeeImage },
//   { id: '201', name: 'Croissant', price: 2.5, image: croissantImage },
//   { id: '202', name: 'Blueberry Muffin', price: 3.0, image: muffinImage },
//   { id: '203', name: 'Chocolate Chip Cookie', price: 2.0, image: cookieImage },
// ];

// export const coffeeMenu: MenuItem[] = [
//   { id: 11, name: 'Espresso', price: 2.5, image: image },
//   { id: 111, name: 'Cappuccino', price: 3.0, image: image },
// //   { id: '103', name: 'Latte', price: 3.5, image: image },
// //   { id: '104', name: 'Mocha', price: 4.0, image: image },
// //   { id: '105', name: 'Americano', price: 2.75, image: image },
// //   { id: '106', name: 'Macchiato', price: 3.25, image: image },
// //   { id: '107', name: 'Cold Brew', price: 4.5, image: image },
// //   { id: '108', name: 'Iced Latte', price: 4.0, image: image },
// //   { id: '109', name: 'Flat White', price: 3.75, image: image },
// //   { id: '110', name: 'Turkish Coffee', price: 3.0, image: image },
// //   { id: '201', name: 'Croissant', price: 2.5, image: image },
// //   { id: '202', name: 'Blueberry Muffin', price: 3.0, image: image },
// //   { id: '203', name: 'Chocolate Chip Cookie', price: 2.0, image: image },
// ];